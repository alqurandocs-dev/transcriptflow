import type { VercelRequest, VercelResponse } from '@vercel/node'
import { YoutubeTranscript } from 'youtube-transcript'
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
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8_000) }
  )
  if (res.status === 404 || res.status === 400) {
    throw Object.assign(new Error('Video not found'), { code: 'VIDEO_NOT_FOUND' })
  }
  if (!res.ok) throw Object.assign(new Error(`oEmbed ${res.status}`), { code: 'INTERNAL_ERROR' })
  const d = await res.json() as { title: string; author_name: string; thumbnail_url: string }
  return { title: d.title, channel: d.author_name, thumbnail: d.thumbnail_url }
}

// Primary: youtube-transcript (free, no rate limit)
async function fetchViaYoutubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const raw = await Promise.race([
    YoutubeTranscript.fetchTranscript(videoId),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 15_000)
    ),
  ])
  return raw.map(s => ({ text: s.text.trim(), offset: Math.round(s.offset), duration: Math.round(s.duration) }))
}

// Fallback: Supadata API (100 req/month free — only used when primary fails)
async function fetchViaSupadata(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.SUPADATA_API_KEY
  if (!apiKey) throw Object.assign(new Error('No Supadata key'), { code: 'INTERNAL_ERROR' })

  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
    {
      headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(20_000),
    }
  )
  if (res.status === 404) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  if (!res.ok) throw Object.assign(new Error(`Supadata ${res.status}`), { code: 'INTERNAL_ERROR' })

  const data = await res.json() as { content?: Array<{ text: string; offset: number; duration: number }> }
  if (!data.content?.length) throw Object.assign(new Error('Empty'), { code: 'NO_TRANSCRIPT' })

  return data.content.map(s => ({ text: s.text.trim(), offset: Math.round(s.offset), duration: Math.round(s.duration) }))
}

async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  // Try primary first
  try {
    const segments = await fetchViaYoutubeTranscript(videoId)
    if (segments.length > 0) {
      console.log('[transcript] fetched via youtube-transcript')
      return segments
    }
  } catch (err) {
    console.log('[transcript] youtube-transcript failed, trying Supadata:', (err as Error).message)
  }

  // Fall back to Supadata
  console.log('[transcript] using Supadata fallback')
  return fetchViaSupadata(videoId)
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

  let segments: TranscriptSegment[]
  try {
    segments = await fetchTranscript(videoId)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    console.error('[transcript] all methods failed:', e.message)
    if (e.code === 'NO_TRANSCRIPT') return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    if (e.code === 'RATE_LIMITED') return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait and try again.')
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch transcript. Please try again.')
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({ title: meta.title, channel: meta.channel, thumbnail: meta.thumbnail, transcript: segments })
}
