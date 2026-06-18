import type { VercelRequest, VercelResponse } from '@vercel/node'
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

// Headers that mimic a real browser — needed to get captions from datacenter IPs
const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': '*/*',
  'Cookie': 'SOCS=CAESEwgDEgk0OTI5MzA1NjUaAmVuIAEaBgiAo_CmBg==; CONSENT=YES+cb; PREF=hl=en&gl=US',
}

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    { headers: { 'User-Agent': BASE_HEADERS['User-Agent'] }, signal: AbortSignal.timeout(8_000) }
  )
  if (res.status === 404 || res.status === 400) {
    throw Object.assign(new Error('Video not found'), { code: 'VIDEO_NOT_FOUND' })
  }
  if (!res.ok) throw Object.assign(new Error(`oEmbed ${res.status}`), { code: 'INTERNAL_ERROR' })
  const d = await res.json() as { title: string; author_name: string; thumbnail_url: string }
  return { title: d.title, channel: d.author_name, thumbnail: d.thumbnail_url }
}

// Use YouTube's internal player API to get caption tracks
// iOS client context bypasses datacenter IP restrictions that block the WEB client
async function fetchCaptionTracks(videoId: string): Promise<Array<{ baseUrl: string; languageCode: string; kind?: string }>> {
  const res = await fetch(
    'https://www.youtube.com/youtubei/v1/player?key=AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUA',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.ios.youtube/17.33.2 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
        'X-YouTube-Client-Name': '5',
        'X-YouTube-Client-Version': '17.33.2',
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: 'IOS',
            clientVersion: '17.33.2',
            deviceMake: 'Apple',
            deviceModel: 'iPhone14,3',
            osName: 'iPhone',
            osVersion: '15.6.0.19G71',
            hl: 'en',
            gl: 'US',
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    }
  )

  if (!res.ok) throw Object.assign(new Error(`player API ${res.status}`), { code: 'INTERNAL_ERROR' })

  const data = await res.json() as {
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: Array<{ baseUrl: string; languageCode: string; kind?: string }>
      }
    }
    playabilityStatus?: { status: string }
  }

  const status = data.playabilityStatus?.status
  if (status === 'LOGIN_REQUIRED' || status === 'UNPLAYABLE') {
    throw Object.assign(new Error('Video not playable'), { code: 'VIDEO_NOT_FOUND' })
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks
  if (!tracks || tracks.length === 0) {
    throw Object.assign(new Error('No caption tracks'), { code: 'NO_TRANSCRIPT' })
  }

  return tracks
}

function pickBestTrack(tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }>) {
  return (
    tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr') ||   // manual English
    tracks.find(t => t.languageCode === 'en') ||                        // auto English
    tracks.find(t => t.languageCode.startsWith('en')) ||               // any English variant
    tracks[0]                                                           // first available
  )
}

async function fetchSegmentsFromUrl(captionUrl: string): Promise<TranscriptSegment[]> {
  const res = await fetch(captionUrl, {
    headers: BASE_HEADERS,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw Object.assign(new Error(`caption fetch ${res.status}`), { code: 'INTERNAL_ERROR' })

  const xml = await res.text()
  const segments: TranscriptSegment[] = []
  const re = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  let m: RegExpExecArray | null

  while ((m = re.exec(xml)) !== null) {
    const text = m[3]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, '')
      .trim()
    if (text) {
      segments.push({
        text,
        offset: Math.round(parseFloat(m[1]) * 1000),
        duration: Math.round(parseFloat(m[2]) * 1000),
      })
    }
  }

  if (segments.length === 0) throw Object.assign(new Error('Empty captions'), { code: 'NO_TRANSCRIPT' })
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
    const tracks = await fetchCaptionTracks(videoId)
    const track = pickBestTrack(tracks)
    segments = await fetchSegmentsFromUrl(track.baseUrl)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    console.error('[transcript] error:', e.message)
    if (e.code === 'NO_TRANSCRIPT') return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    if (e.code === 'VIDEO_NOT_FOUND') return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
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
