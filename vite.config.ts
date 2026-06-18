import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

function transcriptApiPlugin(): Plugin {
  return {
    name: 'transcript-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/transcript\/([^?#]+)/)
        if (!match) return next()

        const videoId = match[1]
        res.setHeader('Content-Type', 'application/json')

        if (!VIDEO_ID_RE.test(videoId)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: { code: 'INVALID_VIDEO_ID', message: 'Invalid video ID.' } }))
          return
        }

        try {
          const { YoutubeTranscript } = await import('youtube-transcript')
          const segments = await YoutubeTranscript.fetchTranscript(videoId)

          let title = videoId
          let channel = 'Unknown'
          let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          try {
            const oRes = await fetch(
              `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            )
            if (oRes.ok) {
              const meta = await oRes.json() as { title?: string; author_name?: string; thumbnail_url?: string }
              title = meta.title ?? videoId
              channel = meta.author_name ?? 'Unknown'
              thumbnail = meta.thumbnail_url ?? thumbnail
            }
          } catch { /* non-fatal */ }

          res.statusCode = 200
          res.end(JSON.stringify({
            title, channel, thumbnail,
            transcript: segments.map(s => ({ text: s.text, offset: s.offset, duration: s.duration })),
          }))
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          if (/no captions|transcript is disabled|could not find/i.test(msg)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: { code: 'NO_TRANSCRIPT', message: 'No transcript available for this video.' } }))
          } else if (/not found|unavailable/i.test(msg)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: { code: 'VIDEO_NOT_FOUND', message: 'Video not found.' } }))
          } else if (/429|rate.?limit/i.test(msg)) {
            res.statusCode = 429
            res.end(JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Rate limited by YouTube. Try again shortly.' } }))
          } else {
            console.error('[transcript api]', msg)
            res.statusCode = 500
            res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), transcriptApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
