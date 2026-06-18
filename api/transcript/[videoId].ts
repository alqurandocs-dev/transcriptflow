import type { VercelRequest, VercelResponse } from '@vercel/node'
import { YoutubeTranscript, YoutubeTranscriptError } from 'youtube-transcript'
import { sendError, setCors } from '../_lib/errors'

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

// Transcript fetch timeout — prevents hanging on slow/broken videos
const TRANSCRIPT_TIMEOUT_MS = 15_000

interface TranscriptSegment {
  text: string
  offset: number  // milliseconds
  duration: number
}

interface VideoMeta {
  title: string
  channel: string
  thumbnail: string
}

interface SuccessResponse {
  title: string
  channel: string
  thumbnail: string
  transcript: TranscriptSegment[]
}

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const oembedUrl =
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

  const res = await fetch(oembedUrl, {
    headers: { 'User-Agent': 'TranscriptFlow/1.0' },
    signal: AbortSignal.timeout(8_000),
  })

  if (res.status === 404 || res.status === 400) {
    throw Object.assign(new Error('Video not found'), { code: 'VIDEO_NOT_FOUND' })
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(`oEmbed request failed: ${res.status}`),
      { code: 'INTERNAL_ERROR' }
    )
  }

  const data = await res.json() as {
    title: string
    author_name: string
    thumbnail_url: string
  }

  return {
    title: data.title,
    channel: data.author_name,
    thumbnail: data.thumbnail_url,
  }
}

// FIX #3: Wrap fetchTranscript with a hard timeout
function fetchTranscriptWithTimeout(videoId: string) {
  return Promise.race([
    YoutubeTranscript.fetchTranscript(videoId),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(Object.assign(new Error('Transcript fetch timed out'), { code: 'INTERNAL_ERROR' })),
        TRANSCRIPT_TIMEOUT_MS
      )
    ),
  ])
}

function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('429') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  )
}

// FIX #1: Distinguish "no transcript" from "video not found/invalid"
// youtube-transcript throws YoutubeTranscriptError for both cases,
// but the messages are different — check the message to disambiguate.
function classifyYoutubeError(err: unknown): 'NO_TRANSCRIPT' | 'VIDEO_NOT_FOUND' | null {
  if (!(err instanceof YoutubeTranscriptError)) return null

  const msg = err.message.toLowerCase()

  // "Impossible to retrieve Youtube video ID" → the video doesn't exist
  if (msg.includes('impossible to retrieve') || msg.includes('video id')) {
    return 'VIDEO_NOT_FOUND'
  }

  // "Transcript is disabled on this video" → video exists, no captions
  if (
    msg.includes('transcript is disabled') ||
    msg.includes('no transcript') ||
    msg.includes('subtitles are disabled') ||
    msg.includes('could not find')
  ) {
    return 'NO_TRANSCRIPT'
  }

  // Unknown YoutubeTranscriptError — treat as no transcript (safe default)
  return 'NO_TRANSCRIPT'
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // FIX #4: Set CORS headers in the handler (not only in vercel.json)
  setCors(res)

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported' },
    })
  }

  const { videoId } = req.query

  // Validate video ID format
  if (typeof videoId !== 'string' || !VIDEO_ID_RE.test(videoId)) {
    return sendError(
      res,
      'INVALID_VIDEO_ID',
      'Invalid video ID. Must be an 11-character YouTube video ID.'
    )
  }

  // FIX #2: Fetch metadata FIRST to distinguish "video not found" from
  // "video exists but has no transcript". Running in parallel was a race
  // condition — the wrong error could win depending on response time.
  let meta: VideoMeta
  try {
    meta = await fetchVideoMeta(videoId)
  } catch (err: unknown) {
    if (isRateLimitError(err)) {
      return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait a moment and try again.')
    }
    const asError = err as { code?: string }
    if (asError.code === 'VIDEO_NOT_FOUND') {
      return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    }
    console.error('[transcript] metadata error:', err)
    return sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again later.')
  }

  // Video confirmed to exist — now fetch transcript
  let rawTranscript: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>>
  try {
    rawTranscript = await fetchTranscriptWithTimeout(videoId)
  } catch (err: unknown) {
    if (isRateLimitError(err)) {
      return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait a moment and try again.')
    }

    const ytErrorType = classifyYoutubeError(err)
    if (ytErrorType === 'NO_TRANSCRIPT') {
      return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    }
    if (ytErrorType === 'VIDEO_NOT_FOUND') {
      return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    }

    const asError = err as { code?: string }
    if (asError.code === 'INTERNAL_ERROR') {
      return sendError(res, 'INTERNAL_ERROR', 'Transcript fetch timed out. Please try again.')
    }

    console.error('[transcript] unexpected error:', err)
    return sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again later.')
  }

  // Normalise transcript segments
  const transcript: TranscriptSegment[] = rawTranscript.map((seg) => ({
    text: seg.text.trim(),
    offset: Math.round(seg.offset),
    duration: Math.round(seg.duration),
  }))

  const payload: SuccessResponse = {
    title: meta.title,
    channel: meta.channel,
    thumbnail: meta.thumbnail,
    transcript,
  }

  // Cache for 1 hour at CDN, 24 hours stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('Content-Type', 'application/json')

  return res.status(200).json(payload)
}
