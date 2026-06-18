import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from 'docx'
import type { TranscriptSegment } from '@/lib/api'
import { buildScriptParagraphs } from '@/lib/format'

export type ViewMode = 'script' | 'timestamps'

function sanitizeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 120)
    || 'transcript'
}

function msToSrtTimestamp(ms: number): string {
  const totalMs = Math.round(ms)
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const millis = totalMs % 1000
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

function msToReadable(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  // Small delay before revoking so Safari can pick it up
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportTxt(
  segments: TranscriptSegment[],
  title: string,
  videoId: string,
  mode: ViewMode = 'timestamps',
) {
  const header = [title, `https://www.youtube.com/watch?v=${videoId}`, '']

  let body: string
  if (mode === 'script') {
    body = buildScriptParagraphs(segments).join('\n\n')
  } else {
    body = segments.map((s) => `${msToReadable(s.offset)}\n${s.text}`).join('\n\n')
  }

  const blob = new Blob([[...header, body].join('\n')], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${sanitizeFilename(title)}.txt`)
}

export function exportSrt(segments: TranscriptSegment[], title: string) {
  const entries = segments.map((seg, i) => {
    const start = msToSrtTimestamp(seg.offset)
    const end = msToSrtTimestamp(seg.offset + Math.max(seg.duration, 100))
    return `${i + 1}\n${start} --> ${end}\n${seg.text}`
  })
  const blob = new Blob([entries.join('\n\n') + '\n'], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${sanitizeFilename(title)}.srt`)
}

export async function exportDocx(
  segments: TranscriptSegment[],
  title: string,
  channel: string,
  videoId: string,
  mode: ViewMode = 'timestamps',
) {
  const CHUNK = 500

  const transcriptParagraphs: Paragraph[] = []

  if (mode === 'script') {
    const scriptParas = buildScriptParagraphs(segments)
    for (let i = 0; i < scriptParas.length; i += CHUNK) {
      for (const para of scriptParas.slice(i, i + CHUNK)) {
        transcriptParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: 22 })],
            spacing: { after: 160 },
          })
        )
      }
      if (i + CHUNK < scriptParas.length) {
        await new Promise<void>((r) => setTimeout(r, 0))
      }
    }
  } else {
    for (let i = 0; i < segments.length; i += CHUNK) {
      for (const seg of segments.slice(i, i + CHUNK)) {
        transcriptParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${msToReadable(seg.offset)}  `, bold: true, color: '6366F1', size: 20 }),
              new TextRun({ text: seg.text, size: 20 }),
            ],
            spacing: { after: 80 },
          })
        )
      }
      if (i + CHUNK < segments.length) {
        await new Promise<void>((r) => setTimeout(r, 0))
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Channel: `, bold: true, size: 20 }),
              new TextRun({ text: channel, size: 20 }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Source: `, bold: true, size: 20 }),
              new TextRun({
                text: `https://www.youtube.com/watch?v=${videoId}`,
                size: 20,
                color: '6366F1',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...transcriptParagraphs,
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  triggerDownload(buffer, `${sanitizeFilename(title)}.docx`)
}
