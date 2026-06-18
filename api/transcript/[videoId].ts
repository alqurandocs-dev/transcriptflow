import type { VercelRequest, VercelResponse } from '@vercel/node'
import { YoutubeTranscript, YoutubeTranscriptError } from 'youtube-transcript'
import { sendError, setCors } from '../_lib/errors'

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

interface TranscriptSegment {
  text: string
  offset: number
  duration: number
}

interface VideoMeta {
  title: string
  channel: string
  thumbnail: string
}

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    signal: AbortSignal.timeout(8_000),
  })
  if (res.status === 404 || res.status === 400) {
    throw Object.assign(new Error('Video not found'), { code: 'VIDEO_NOT_FOUND' })
  }
  if (!res.ok) {
    throw Object.assign(new Error(`oEmbed failed: ${res.status}`), { code: 'INTERNAL_ERROR' })
  }
  const data = await res.json() as { title: string; author_name: string; thumbnail_url: string }
  return { title: data.title, channel: data.author_name, thumbnail: data.thumbnail_url }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported' } })
  }

  const { videoId } = req.query
  if (typeof videoId !== 'string' || !VIDEO_ID_RE.test(videoId)) {
    return sendError(res, 'INVALID_VIDEO_ID', 'Invalid video ID.')
  }

  let meta: VideoMeta
  try {
    meta = await fetchVideoMeta(videoId)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'VIDEO_NOT_FOUND') return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    console.error('[transcript] meta error:', e.message)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch video info.')
  }

  let rawSegments: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>>
  try {
    rawSegments = await Promise.race([
      YoutubeTranscript.fetchTranscript(videoId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(Object.assign(new Error('Timeout'), { code: 'TIMEOUT' })), 20_000)
      ),
    ])
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    const msg = (e.message ?? '').toLowerCase()

    if (e instanceof YoutubeTranscriptError || e.code === undefined) {
      if (msg.includes('disabled') || msg.includes('no transcript') || msg.includes('could not find')) {
        return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
      }
      if (msg.includes('not found') || msg.includes('private') || msg.includes('impossible')) {
        return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
      }
      if (msg.includes('429') || msg.includes('too many')) {
        return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait and try again.')
      }
    }

    console.error('[transcript] transcript error:', e.message ?? err)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch transcript. Please try again.')
  }

  const transcript: TranscriptSegment[] = rawSegments.map(seg => ({
    text: seg.text.trim(),
    offset: Math.round(seg.offset),
    duration: Math.round(seg.duration),
  }))

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({
    title: meta.title,
    channel: meta.channel,
    thumbnail: meta.thumbnail,
    transcript,
  })
}
