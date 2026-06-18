import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  PlayCircle, Wand2, Clock, Globe, FileText, AlertCircle, Lock, ArrowRight, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { extractVideoId } from '@/lib/youtube'
import { useAuth } from '@/contexts/AuthContext'
import { useUserUsage, FREE_LIMIT } from '@/hooks/useUserUsage'

export default function TranscriptPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { count, loading: usageLoading, canGenerate, recordUsage } = useUserUsage()

  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const limitReached = !canGenerate
  const loading = authLoading || usageLoading

  function handleChange(value: string) {
    setUrl(value)
    if (error) setError('')
  }

  async function handleGenerate() {
    if (!user || limitReached) return

    const trimmed = url.trim()
    if (!trimmed) { setError('Please enter a YouTube URL.'); return }

    const videoId = extractVideoId(trimmed)
    if (!videoId) {
      setError('Invalid YouTube URL. Supported formats: youtube.com/watch?v=… or youtu.be/…')
      return
    }

    await recordUsage()
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

        {/* Main card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">

            {/* Loading state */}
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-3 text-[hsl(var(--muted-foreground))]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : !user ? (
              /* ── Not logged in gate ── */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--primary))]/10 mb-4">
                  <Lock className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sign in to generate transcripts</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-xs mx-auto">
                  Create a free account and get <strong>3 transcripts every month</strong> — no credit card needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="gap-2">
                    <Link to="/login">
                      Get started free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            ) : limitReached ? (
              /* ── Monthly limit reached ── */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
                  <Lock className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Monthly limit reached</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2 max-w-xs mx-auto">
                  You've used all {FREE_LIMIT} free transcripts for this month.
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">
                  Resets on the 1st of next month.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="gap-2">
                    <Link to="/pricing">
                      Upgrade to Pro
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:sendtomicrovex@gmail.com?subject=TranscriptFlow Pro Upgrade">
                      Contact us
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Normal generate UI ── */
              <>
                {/* Usage counter */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[hsl(var(--border))]">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    Free transcripts this month
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-5 h-2 rounded-full transition-colors ${
                            i < count
                              ? 'bg-[hsl(var(--primary))]'
                              : 'bg-[hsl(var(--muted))] border border-[hsl(var(--border))]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {count}/{FREE_LIMIT}
                    </span>
                  </div>
                </div>

                <Label htmlFor="youtube-url" className="text-sm font-medium mb-2 block">
                  YouTube URL
                </Label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <PlayCircle className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isInvalid ? 'text-red-500' : 'text-red-400'}`} />
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => handleChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      className={`pl-10 transition-colors ${isInvalid ? 'border-red-400 focus-visible:ring-red-400 bg-red-50' : ''}`}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? 'url-error' : undefined}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <Button onClick={handleGenerate} disabled={!url.trim()} className="gap-2 shrink-0">
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </Button>
                </div>

                {isInvalid && (
                  <div id="url-error" role="alert" className="flex items-start gap-2 mt-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {!isInvalid && (
                  <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                    Supports:{' '}
                    <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-[10px]">youtube.com/watch?v=</code>{' '}
                    <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-[10px]">youtu.be/</code>
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Globe className="h-4 w-4" /><span>Auto-detect language</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Clock className="h-4 w-4" /><span>Include timestamps</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <FileText className="h-4 w-4" /><span>Paragraph mode</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!loading && user && !limitReached && (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your transcript will appear here after generation</p>
          </div>
        )}
      </div>
    </div>
  )
}
