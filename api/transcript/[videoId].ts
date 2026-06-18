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

const CLIENT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'SOCS=CAESEwgDEgk0OTI5MzA1NjUaAmVuIAEaBgiAo_CmBg==; CONSENT=YES+cb',
}

async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': CLIENT_HEADERS['User-Agent'] },
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

// Build nested protobuf params for the get_transcript endpoint
// Structure: outer(field1 → middle(field2 → inner(field1 → videoId)))
function buildTranscriptParams(videoId: string): string {
  const idBuf = Buffer.from(videoId, 'utf8')
  const inner  = Buffer.concat([Buffer.from([0x0a, idBuf.length]),   idBuf])
  const middle = Buffer.concat([Buffer.from([0x12, inner.length]),   inner])
  const outer  = Buffer.concat([Buffer.from([0x0a, middle.length]),  middle])
  return outer.toString('base64')
}

// Use YouTube's internal get_transcript API (same endpoint the web player uses)
async function fetchTranscriptViaApi(videoId: string): Promise<TranscriptSegment[]> {
  const params = buildTranscriptParams(videoId)

  const res = await fetch('https://www.youtube.com/youtubei/v1/get_transcript', {
    method: 'POST',
    headers: {
      ...CLIENT_HEADERS,
      'Content-Type': 'application/json',
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': '2.9999099',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.9999099',
          hl: 'en',
          gl: 'US',
        },
      },
      params,
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (res.status === 429) {
    throw Object.assign(new Error('Rate limited'), { code: 'RATE_LIMITED' })
  }
  if (!res.ok) {
    throw Object.assign(
      new Error(`get_transcript API returned ${res.status}`),
      { code: 'INTERNAL_ERROR' }
    )
  }

  const data = await res.json() as Record<string, unknown>

  // Navigate the response structure
  type Action = {
    updateEngagementPanelAction?: {
      content?: {
        transcriptRenderer?: {
          content?: {
            transcriptSearchPanelRenderer?: {
              body?: {
                transcriptSegmentListRenderer?: {
                  initialSegments?: Array<{
                    transcriptSegmentRenderer?: {
                      snippet?: { runs?: Array<{ text: string }> }
                      startMs?: string
                      endMs?: string
                    }
                  }>
                }
              }
            }
          }
        }
      }
    }
  }

  const actions = data.actions as Action[] | undefined
  const initialSegments =
    actions?.[0]
      ?.updateEngagementPanelAction
      ?.content
      ?.transcriptRenderer
      ?.content
      ?.transcriptSearchPanelRenderer
      ?.body
      ?.transcriptSegmentListRenderer
      ?.initialSegments

  if (!initialSegments || initialSegments.length === 0) {
    throw Object.assign(new Error('No transcript in response'), { code: 'NO_TRANSCRIPT' })
  }

  const segments: TranscriptSegment[] = []
  for (const seg of initialSegments) {
    const r = seg.transcriptSegmentRenderer
    if (!r) continue
    const text = (r.snippet?.runs ?? []).map(run => run.text).join('').trim()
    if (!text) continue
    const startMs = parseInt(r.startMs ?? '0', 10)
    const endMs = parseInt(r.endMs ?? '0', 10)
    segments.push({ text, offset: startMs, duration: endMs - startMs })
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

  let meta: VideoMeta
  try {
    meta = await fetchVideoMeta(videoId)
  } catch (err: unknown) {
    const asError = err as { code?: string; message?: string }
    if (asError.code === 'VIDEO_NOT_FOUND') {
      return sendError(res, 'VIDEO_NOT_FOUND', 'Video not found or is private.')
    }
    console.error('[transcript] metadata error:', asError.message ?? err)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch video metadata.')
  }

  let segments: TranscriptSegment[]
  try {
    segments = await fetchTranscriptViaApi(videoId)
  } catch (err: unknown) {
    const asError = err as { code?: string; message?: string }
    console.error('[transcript] transcript error:', asError.message ?? err)
    if (asError.code === 'NO_TRANSCRIPT') {
      return sendError(res, 'NO_TRANSCRIPT', 'This video does not have a transcript available.')
    }
    if (asError.code === 'RATE_LIMITED') {
      return sendError(res, 'RATE_LIMITED', 'Too many requests. Please wait and try again.')
    }
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
