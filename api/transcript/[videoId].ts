import type { VercelRequest, VercelResponse } from '@vercel/node'
import { YoutubeTranscript } from 'youtube-transcript'
import { sendError, setCors } from '../_lib/errors'
import { checkLimit, recordUsage } from '../_lib/rateLimit'

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

// ─── Method 4: RapidAPI YouTube Captions (WEBVTT format) ─────────────────────

function parseWebvtt(vtt: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  const blocks = vtt.replace(/\r\n/g, '\n').split(/\n\n+/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const timeLine = lines.find(l => l.includes('-->'))
    if (!timeLine) continue
    const [startStr, endStr] = timeLine.split('-->')
    const toMs = (t: string) => {
      const parts = t.trim().replace(',', '.').split(':')
      const secs = parts.length === 3
        ? +parts[0] * 3600 + +parts[1] * 60 + +parts[2]
        : +parts[0] * 60 + +parts[1]
      return Math.round(secs * 1000)
    }
    const start = toMs(startStr)
    const end = toMs(endStr)
    const text = lines.slice(lines.indexOf(timeLine) + 1).join(' ')
      .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
    if (text) segments.push({ text, offset: start, duration: end - start })
  }
  return segments
}

async function method4_captionsApi(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('No RapidAPI key')

  const res = await fetch(
    `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-webvtt/${videoId}?language=en&response_mode=default`,
    {
      headers: {
        'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    }
  )
  if (res.status === 404) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  if (!res.ok) throw new Error(`CaptionsAPI ${res.status}`)

  const text = await res.text()
  const segments = parseWebvtt(text)
  if (!segments.length) throw Object.assign(new Error('Empty'), { code: 'NO_TRANSCRIPT' })
  return segments
}

// ─── Method 5: RapidAPI YouTube Video Summarizer (transcript endpoint) ───────

async function method5_summarizer(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('No RapidAPI key')

  const res = await fetch(
    `https://youtube-video-summarizer-gpt-ai.p.rapidapi.com/api/v1/get-transcript-v2?video_id=${videoId}&platform=youtube`,
    {
      headers: {
        'x-rapidapi-host': 'youtube-video-summarizer-gpt-ai.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    }
  )
  if (res.status === 404) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  if (!res.ok) throw new Error(`Summarizer ${res.status}`)

  const data = await res.json()
  const items: Array<{ text?: string; start?: number; offset?: number; duration?: number }> =
    Array.isArray(data) ? data : (data.transcript ?? data.content ?? data.segments ?? [])

  if (!items.length) throw Object.assign(new Error('Empty'), { code: 'NO_TRANSCRIPT' })
  return items.map(s => ({
    text: (s.text ?? '').trim(),
    offset: Math.round((s.start ?? s.offset ?? 0) * (typeof s.start === 'number' && s.start < 10000 ? 1000 : 1)),
    duration: Math.round(s.duration ?? 0),
  })).filter(s => s.text)
}

// ─── Method 6: RapidAPI Youtube Transcriptor ─────────────────────────────────

async function method6_transcriptor(videoId: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('No RapidAPI key')

  const res = await fetch(
    `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}&lang=en`,
    {
      headers: {
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    }
  )
  if (res.status === 404) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  if (!res.ok) throw new Error(`Transcriptor ${res.status}`)

  const data = await res.json()
  const items: Array<{ text?: string; start?: number; offset?: number; duration?: number }> =
    Array.isArray(data) ? data : (data.transcript ?? data.content ?? data.segments ?? [])

  if (!items.length) throw Object.assign(new Error('Empty'), { code: 'NO_TRANSCRIPT' })
  return items.map(s => ({
    text: (s.text ?? '').trim(),
    offset: Math.round((s.start ?? s.offset ?? 0) * (typeof s.start === 'number' && s.start < 10000 ? 1000 : 1)),
    duration: Math.round(s.duration ?? 0),
  })).filter(s => s.text)
}

// ─── Method 7: Supadata (100 req/month free — last resort) ───────────────────

async function method7_supadata(videoId: string): Promise<TranscriptSegment[]> {
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
  // Step 1: Free methods in parallel — fastest wins
  try {
    const result = await Promise.any([
      method1_youtubeTranscript(videoId),
      method2_timedtext(videoId),
    ])
    console.log('[transcript] free method succeeded')
    return result
  } catch {
    console.log('[transcript] free methods failed, trying RapidAPI (parallel)')
  }

  // Step 2: All RapidAPI methods in parallel — fastest wins
  try {
    const result = await Promise.any([
      method3_rapidapi(videoId),
      method4_captionsApi(videoId),
      method5_summarizer(videoId),
      method6_transcriptor(videoId),
    ])
    console.log('[transcript] RapidAPI method succeeded')
    return result
  } catch (err) {
    // If ALL threw NO_TRANSCRIPT, propagate that
    const agg = err as { errors?: Array<{ code?: string }> }
    const allNoTranscript = agg.errors?.every(e => e.code === 'NO_TRANSCRIPT')
    if (allNoTranscript) throw Object.assign(new Error('No transcript'), { code: 'NO_TRANSCRIPT' })
    console.log('[transcript] all RapidAPI failed, trying Supadata')
  }

  // Step 3: Supadata (100/month — last resort)
  return method7_supadata(videoId)
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

  // Check IP-based rate limit
  const { allowed, remaining } = await checkLimit(req)
  if (!allowed) {
    return sendError(res, 'USAGE_LIMIT', `You have reached the free limit of 3 transcripts per month. Upgrade to Pro for more.`)
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

  // Record successful usage against the IP
  await recordUsage(req)

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('X-RateLimit-Remaining', String(remaining - 1))
  return res.status(200).json({
    title: metaResult.value.title,
    channel: metaResult.value.channel,
    thumbnail: metaResult.value.thumbnail,
    transcript: transcriptResult.value,
  })
}
