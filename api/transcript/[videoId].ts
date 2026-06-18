import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendError, setCors } from '../_lib/errors'

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/
const TRANSCRIPT_TIMEOUT_MS = 20_000

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

// Cookies to bypass YouTube consent/bot detection on datacenter IPs
const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'SOCS=CAESEwgDEgk0OTI5MzA1NjUaAmVuIAEaBgiAo_CmBg==; CONSENT=YES+cb',
}

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': YT_HEADERS['User-Agent'] },
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

// Fetch the YouTube watch page and extract the captions track URL
async function fetchCaptionsUrl(videoId: string): Promise<string> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: YT_HEADERS,
    signal: AbortSignal.timeout(TRANSCRIPT_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw Object.assign(new Error(`YouTube page fetch failed: ${res.status}`), { code: 'INTERNAL_ERROR' })
  }

  const html = await res.text()

  // Extract ytInitialPlayerResponse JSON
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var |const |let |\w)/s)
  if (!match) {
    // Try alternate pattern
    const match2 = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\});/)
    if (!match2) {
      throw Object.assign(new Error('Could not parse YouTube page'), { code: 'INTERNAL_ERROR' })
    }
  }

  let playerResponse: Record<string, unknown>
  try {
    // Use a more lenient extraction - find the JSON by counting braces
    const start = html.indexOf('ytInitialPlayerResponse = {')
    if (start === -1) {
      throw new Error('ytInitialPlayerResponse not found')
    }
    const jsonStart = html.indexOf('{', start)
    let depth = 0
    let jsonEnd = jsonStart
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === '{') depth++
      else if (html[i] === '}') {
        depth--
        if (depth === 0) { jsonEnd = i; break }
      }
    }
    playerResponse = JSON.parse(html.slice(jsonStart, jsonEnd + 1))
  } catch {
    throw Object.assign(new Error('Failed to parse ytInitialPlayerResponse'), { code: 'INTERNAL_ERROR' })
  }

  // Navigate to captions data
  const captions = (playerResponse as {
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: Array<{ baseUrl: string; languageCode: string; kind?: string }>
      }
    }
  }).captions?.playerCaptionsTracklistRenderer?.captionTracks

  if (!captions || captions.length === 0) {
    throw Object.assign(new Error('No captions available'), { code: 'NO_TRANSCRIPT' })
  }

  // Prefer English, then auto-generated English, then first available
  const preferred =
    captions.find(t => t.languageCode === 'en' && t.kind !== 'asr') ||
    captions.find(t => t.languageCode === 'en') ||
    captions.find(t => t.languageCode.startsWith('en')) ||
    captions[0]

  return preferred.baseUrl
}

// Fetch and parse the XML captions file
async function fetchTranscriptFromUrl(captionsUrl: string): Promise<TranscriptSegment[]> {
  const res = await fetch(captionsUrl, {
    headers: YT_HEADERS,
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    throw Object.assign(new Error(`Captions fetch failed: ${res.status}`), { code: 'INTERNAL_ERROR' })
  }

  const xml = await res.text()

  // Parse <text start="..." dur="...">...</text> elements
  const segments: TranscriptSegment[] = []
  const tagRe = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  let m: RegExpExecArray | null

  while ((m = tagRe.exec(xml)) !== null) {
    const text = m[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '')
      .trim()

    if (text) {
      segments.push({
        text,
        offset: Math.round(parseFloat(m[1]) * 1000),
        duration: Math.round(parseFloat(m[2]) * 1000),
      })
    }
  }

  if (segments.length === 0) {
    throw Object.assign(new Error('Empty transcript'), { code: 'NO_TRANSCRIPT' })
  }

  return segments
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported' } })
  }

  const { videoId } = req.query
  if (typeof videoId !== 'string' || !VIDEO_ID_RE.test(videoId)) {
    return sendError(res, 'INVALID_VIDEO_ID', 'Invalid video ID. Must be an 11-character YouTube video ID.')
  }

  // Fetch metadata first to verify video exists
  let meta: VideoMeta
  try {
    meta = await fetchVideoMeta(videoId)
  } catch (err: unknown) {
    const asError = err as { code?: string }
    if (asError.code === 'VIDEO_NOT_FOUND') {
      return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    }
    console.error('[transcript] metadata error:', err)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch video metadata.')
  }

  // Fetch transcript
  let segments: TranscriptSegment[]
  try {
    const captionsUrl = await fetchCaptionsUrl(videoId)
    segments = await fetchTranscriptFromUrl(captionsUrl)
  } catch (err: unknown) {
    const asError = err as { code?: string }
    if (asError.code === 'NO_TRANSCRIPT') {
      return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    }
    if (asError.code === 'VIDEO_NOT_FOUND') {
      return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    }
    console.error('[transcript] transcript error:', err)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch transcript. Please try again.')
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({
    title: meta.title,
    channel: meta.channel,
    thumbnail: meta.thumbnail,
    transcript: segments,
  })
}
