import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlayCircle,
  Wand2,
  Clock,
  Globe,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { extractVideoId } from '@/lib/youtube'

export default function TranscriptPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function handleChange(value: string) {
    setUrl(value)
    // Clear error as soon as user starts editing
    if (error) setError('')
  }

  function handleGenerate() {
    const trimmed = url.trim()

    if (!trimmed) {
      setError('Please enter a YouTube URL.')
      return
    }

    const videoId = extractVideoId(trimmed)

    if (!videoId) {
      setError(
        'Invalid YouTube URL. Supported formats: youtube.com/watch?v=… or youtu.be/…'
      )
      return
    }

    navigate(`/transcript/${videoId}`)
  }

  const isInvalid = error !== ''

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            AI-Powered Transcription
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Generate Your Transcript
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
            Paste any YouTube URL below and get a clean, timestamped transcript in seconds.
          </p>
        </div>

        {/* Input card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <Label
              htmlFor="youtube-url"
              className="text-sm font-medium mb-2 block"
            >
              YouTube URL
            </Label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <PlayCircle
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                    isInvalid ? 'text-red-500' : 'text-red-400'
                  }`}
                />
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  className={`pl-10 transition-colors ${
                    isInvalid
                      ? 'border-red-400 focus-visible:ring-red-400 bg-red-50'
                      : ''
                  }`}
                  aria-invalid={isInvalid}
                  aria-describedby={isInvalid ? 'url-error' : undefined}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!url.trim()}
                className="gap-2 shrink-0"
              >
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>
            </div>

            {/* Error message */}
            {isInvalid && (
              <div
                id="url-error"
                role="alert"
                className="flex items-start gap-2 mt-3 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Supported formats hint */}
            {!isInvalid && (
              <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                Supports:{' '}
                <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-[10px]">
                  youtube.com/watch?v=
                </code>{' '}
                <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-[10px]">
                  youtu.be/
                </code>
              </p>
            )}

            {/* Options row */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Globe className="h-4 w-4" />
                <span>Auto-detect language</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Clock className="h-4 w-4" />
                <span>Include timestamps</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <FileText className="h-4 w-4" />
                <span>Paragraph mode</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Idle hint */}
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your transcript will appear here after generation</p>
        </div>
      </div>
    </div>
  )
}
