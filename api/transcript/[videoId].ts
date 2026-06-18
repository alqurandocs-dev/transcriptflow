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

// ─── Video metadata ───────────────────────────────────────────────────────────

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8_000) }
  )
  if (res.status === 404 || res.status === 400)
    throw Object.assign(new Error('Video not found'), { code: 'VIDEO_NOT_FOUND' })
  if (!res.ok)
    throw Object.assign(new Error(`oEmbed ${res.status}`), { code: 'INTERNAL_ERROR' })
  const d = await res.json() as { title: string; author_name: string; thumbnail_url: string }
  return { title: d.title, channel: d.author_name, thumbnail: d.thumbnail_url }
}

// ─── Method 1: youtube-transcript package ────────────────────────────────────

async function method1_youtubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const raw = await Promise.race([
    YoutubeTranscript.fetchTranscript(videoId),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12_000)),
  ])
  if (!raw?.length) throw new Error('empty')
  return raw.map(s => ({ text: s.text.trim(), offset: Math.round(s.offset), duration: Math.round(s.duration) }))
}

// ─── Method 2: YouTube timedtext CDN (direct, no player API needed) ───────────

function parseTimedtextJson3(data: unknown): TranscriptSegment[] {
  const events = (data as { events?: Array<{ tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> }).events ?? []
  const segments: TranscriptSegment[] = []
  for (const ev of events) {
    if (!ev.segs) continue
    const text = ev.segs.map(s => s.utf8 ?? '').join('').replace(/\n/g, ' ').trim()
    if (text) segments.push({ text, offset: ev.tStartMs ?? 0, duration: ev.dDurationMs ?? 0 })
  }
  return segments
}

async function method2_timedtext(videoId: string): Promise<TranscriptSegment[]> {
  // Try multiple lang/kind combos in parallel, take the first that returns data
  const combos = [
    `lang=en&fmt=json3`,
    `lang=en&kind=asr&fmt=json3`,
    `lang=en-US&fmt=json3`,
    `lang=en-GB&fmt=json3`,
  ]

  const attempts = combos.map(async (params) => {
    const res = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&${params}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9' },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    const segments = parseTimedtextJson3(data)
    if (!segments.length) throw new Error('empty')
    return segments
  })

  // Return first successful result
  return Promise.any(attempts)
}

// ─── Method 3: RapidAPI YouTube Transcript (500 req/month free) ──────────────

async function method3_rapidapi(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('No RapidAPI key')

  const res = await fetch(
    `https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}`,
    {
      headers: {
        'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    }
  )
  if (res.status === 404) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  if (!res.ok) throw new Error(`RapidAPI ${res.status}`)

  const data = await res.json()

  // Response can be array or object with transcript field
  const items: Array<{ text?: string; start?: number; offset?: number; duration?: number }> =
    Array.isArray(data) ? data : (data.transcript ?? data.content ?? [])

  if (!items.length) throw Object.assign(new Error('Empty'), { code: 'NO_TRANSCRIPT' })

  return items.map(s => ({
    text: (s.text ?? '').trim(),
    offset: Math.round((s.start ?? s.offset ?? 0) * (s.start !== undefined ? 1000 : 1)),
    duration: Math.round(s.duration ?? 0),
  })).filter(s => s.text)
}

// ─── Method 4: Supadata (100 req/month free — last resort) ───────────────────

async function method4_supadata(videoId: string): Promise<TranscriptSegment[]> {
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

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  // Step 1: Free methods in parallel (unlimited)
  try {
    const result = await Promise.any([
      method1_youtubeTranscript(videoId),
      method2_timedtext(videoId),
    ])
    console.log('[transcript] free method succeeded')
    return result
  } catch {
    console.log('[transcript] free methods failed, trying RapidAPI')
  }

  // Step 2: RapidAPI (500/month)
  try {
    const result = await method3_rapidapi(videoId)
    console.log('[transcript] RapidAPI succeeded')
    return result
  } catch (err) {
    const e = err as { code?: string }
    if (e.code === 'NO_TRANSCRIPT') throw err
    console.log('[transcript] RapidAPI failed, trying Supadata')
  }

  // Step 3: Supadata (100/month — last resort)
  return method4_supadata(videoId)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

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

  // Fetch meta and transcript in parallel to save time
  const [metaResult, transcriptResult] = await Promise.allSettled([
    fetchVideoMeta(videoId),
    fetchTranscript(videoId),
  ])

  if (metaResult.status === 'rejected') {
    const e = metaResult.reason as { code?: string }
    if (e.code === 'VIDEO_NOT_FOUND') return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch video info.')
  }

  if (transcriptResult.status === 'rejected') {
    const e = transcriptResult.reason as { code?: string; message?: string }
    console.error('[transcript] all methods failed:', e.message)
    if (e.code === 'NO_TRANSCRIPT') return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    if (e.code === 'RATE_LIMITED') return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait and try again.')
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch transcript. Please try again.')
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({
    title: metaResult.value.title,
    channel: metaResult.value.channel,
    thumbnail: metaResult.value.thumbnail,
    transcript: transcriptResult.value,
  })
}
