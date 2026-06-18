import type { TranscriptSegment } from '@/lib/api'

/** Convert milliseconds to a readable timestamp: 0:04 / 1:23 / 1:02:45 */
export function msToTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const ss = String(seconds).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Always zero-pads minutes: 00:04 / 01:23 / 1:02:45 */
export function msToClockStamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Rough word count → reading duration label */
export function segmentsToMinutes(wordCount: number): string {
  const minutes = Math.round(wordCount / 130)
  if (minutes < 1) return '< 1 min'
  return `${minutes} min`
}

/**
 * Combine transcript segments into clean readable paragraphs.
 * Breaks at sentence boundaries once enough words accumulate, or on long pauses.
 */
export function buildScriptParagraphs(segments: TranscriptSegment[]): string[] {
  if (segments.length === 0) return []

  const paragraphs: string[] = []
  let buffer: string[] = []
  let wordCount = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const text = seg.text.trim()
    if (!text) continue

    buffer.push(text)
    wordCount += text.split(/\s+/).length

    const endsWithSentence = /[.?!](\s*)$/.test(text)
    const isLast = i === segments.length - 1
    const nextGap = !isLast
      ? segments[i + 1].offset - (seg.offset + seg.duration)
      : Infinity

    // Flush when: last segment, or sentence ended and (enough words, or long pause)
    if (isLast || (endsWithSentence && (wordCount >= 55 || nextGap > 1800))) {
      paragraphs.push(buffer.join(' '))
      buffer = []
      wordCount = 0
    }
  }

  if (buffer.length > 0) paragraphs.push(buffer.join(' '))

  return paragraphs
}
