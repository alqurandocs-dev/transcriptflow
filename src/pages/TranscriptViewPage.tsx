import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Copy, Search, Loader2, ArrowLeft, FileText, AlertCircle,
  WifiOff, VideoOff, MessageSquareOff, RefreshCw, FileDown,
  Clock, Sparkles, BookOpen, Brain, GraduationCap, PenLine,
  Star, ChevronDown, AlignLeft, Scissors, Languages, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranscript } from '@/hooks/useTranscript'
import { msToClockStamp, segmentsToMinutes, buildScriptParagraphs } from '@/lib/format'
import { toast } from '@/hooks/useToast'
import { exportTxt, exportSrt, exportDocx } from '@/lib/export'
import type { ViewMode } from '@/lib/export'
import type { ApiError } from '@/lib/api'

// ── Error config ──────────────────────────────────────────────────────────────

const ERROR_CONFIG: Record<
  ApiError['code'],
  { icon: React.ElementType; title: string; hint: string; retryable: boolean }
> = {
  NO_TRANSCRIPT: {
    icon: MessageSquareOff,
    title: 'No transcript available',
    hint: 'This video does not have captions or auto-generated subtitles enabled.',
    retryable: false,
  },
  VIDEO_NOT_FOUND: {
    icon: VideoOff,
    title: 'Video not found',
    hint: 'The video may be private, deleted, or the ID is incorrect.',
    retryable: false,
  },
  INVALID_VIDEO_ID: {
    icon: AlertCircle,
    title: 'Invalid video ID',
    hint: 'The video ID in the URL is malformed.',
    retryable: false,
  },
  RATE_LIMITED: {
    icon: RefreshCw,
    title: 'Too many requests',
    hint: 'YouTube is temporarily rate-limiting requests. Please wait a moment and try again.',
    retryable: true,
  },
  INTERNAL_ERROR: {
    icon: AlertCircle,
    title: 'Something went wrong',
    hint: 'An unexpected server error occurred. Please try again.',
    retryable: true,
  },
  NETWORK_ERROR: {
    icon: WifiOff,
    title: 'Connection error',
    hint: 'Could not reach the server. Check your internet connection and try again.',
    retryable: true,
  },
  METHOD_NOT_ALLOWED: {
    icon: AlertCircle,
    title: 'Request not allowed',
    hint: 'An invalid request was made. Please try again.',
    retryable: false,
  },
}

// ── AI sidebar data ───────────────────────────────────────────────────────────

const POPULAR_FEATURES = [
  {
    icon: AlignLeft,
    title: 'Summary',
    desc: 'Comprehensive overview',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'Key Insights',
    desc: 'Main takeaways',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Scissors,
    title: 'Clean Transcript',
    desc: 'Remove the filler',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: BookOpen,
    title: 'Proper Notes',
    desc: 'Structured notes',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
]

const AI_SECTIONS = [
  { icon: FileText, title: 'Basic Content' },
  { icon: Brain, title: 'Analyze' },
  { icon: GraduationCap, title: 'Study & Education' },
  { icon: PenLine, title: 'Content Creation' },
  { icon: Star, title: 'Specialist' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingCard({ videoId }: { videoId: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[hsl(var(--primary))] animate-spin" />
          </div>
          <div>
            <p className="font-semibold mb-1">Fetching transcript…</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Retrieving captions for video</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">{videoId}</p>
          </div>
          <div className="w-full max-w-xs h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(var(--primary))] rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ error, videoId }: { error: ApiError; videoId: string }) {
  const cfg = ERROR_CONFIG[error.code] ?? ERROR_CONFIG.INTERNAL_ERROR
  const Icon = cfg.icon
  return (
    <Card className="shadow-sm border-red-200">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Icon className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-base mb-1">{cfg.title}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{cfg.hint}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {cfg.retryable && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            )}
            <Button size="sm" variant="default" asChild className="gap-1.5">
              <Link to="/transcript">
                <ArrowLeft className="h-3.5 w-3.5" /> Try another video
              </Link>
            </Button>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono opacity-60">
            {videoId} · {error.code}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function AIFeaturesPanel() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">AI Features</CardTitle>
          <Badge
            variant="secondary"
            className="text-[10px] cursor-default hover:bg-[hsl(var(--secondary))]"
          >
            Feedback
          </Badge>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          Transform your transcript with AI-powered insights
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search AI features…"
            className="pl-8 h-8 text-xs bg-[hsl(var(--muted))] border-transparent focus-visible:border-[hsl(var(--input))] focus-visible:bg-[hsl(var(--background))]"
            disabled
          />
        </div>

        {/* Output Language */}
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[hsl(var(--muted))]">
          <div className="flex items-center gap-2">
            <Languages className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Output Language</span>
          </div>
          <span className="text-xs font-medium">English</span>
        </div>

        {/* Most Used */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
            Most Used
          </p>
          <div className="flex flex-col items-center gap-2 py-5 text-center">
            <Star className="h-8 w-8 text-[hsl(var(--muted-foreground))]/20" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[190px] leading-relaxed">
              No favorites yet. Start using features and your top 5 will appear here automatically.
            </p>
            <Button size="sm" variant="outline" className="text-xs h-7 mt-1 gap-1.5" disabled>
              <Sparkles className="h-3 w-3" />
              Try a Summary
            </Button>
          </div>
        </div>

        <Separator />

        {/* Popular Features 2×2 grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
            Popular Features
          </p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_FEATURES.map(({ icon: Icon, title, desc, bg, iconColor }) => (
              <button
                key={title}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-colors text-center group"
                disabled
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <span className="text-xs font-medium leading-tight">{title}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Accordion sections */}
        <div className="space-y-0.5">
          {AI_SECTIONS.map(({ icon: Icon, title }) => (
            <div key={title}>
              <button
                onClick={() => setOpenSection(openSection === title ? null : title)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-sm font-medium">{title}</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] transition-transform ${
                    openSection === title ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSection === title && (
                <div className="mx-3 mb-1.5 px-3 py-2.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-1">
                    ✨ Coming soon
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Generated Content */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
            Generated Content
          </p>
          <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-5 text-center">
            <MessageSquare className="h-7 w-7 mx-auto mb-2 text-[hsl(var(--muted-foreground))]/25" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              AI-powered output from your transcript
            </p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-1">
              Click any AI tool above to generate content here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TranscriptViewPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const state = useTranscript(videoId)

  const [timestampsOn, setTimestampsOn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [exportingDocx, setExportingDocx] = useState(false)

  // Reset on every new video
  useEffect(() => {
    setTimestampsOn(false)
    setSearchQuery('')
  }, [videoId])

  const mode: ViewMode = timestampsOn ? 'timestamps' : 'script'
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

  const transcript = state.status === 'success' ? state.data.transcript : []
  const wordCount = transcript.reduce((acc, s) => acc + s.text.split(' ').length, 0)
  const paragraphs = useMemo(() => buildScriptParagraphs(transcript), [transcript])

  const filteredParagraphs = useMemo(() => {
    if (!searchQuery) return paragraphs
    const q = searchQuery.toLowerCase()
    return paragraphs.filter((p) => p.toLowerCase().includes(q))
  }, [paragraphs, searchQuery])

  const filteredSegments = useMemo(() => {
    if (!searchQuery) return transcript
    const q = searchQuery.toLowerCase()
    return transcript.filter((s) => s.text.toLowerCase().includes(q))
  }, [transcript, searchQuery])

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleCopy() {
    if (state.status !== 'success') return
    const text = timestampsOn
      ? transcript.map((s) => `${msToClockStamp(s.offset)}\n${s.text}`).join('\n\n')
      : paragraphs.join('\n\n')

    navigator.clipboard.writeText(text).then(() => {
      toast({
        variant: 'success',
        title: 'Copied to clipboard!',
        description: timestampsOn
          ? `${transcript.length} segments copied.`
          : `${paragraphs.length} paragraphs copied.`,
        duration: 2500,
      })
    }).catch(() => {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Could not access clipboard. Try copying manually.',
        duration: 4000,
      })
    })
  }

  function handleDownloadTxt() {
    if (state.status !== 'success' || !videoId) return
    exportTxt(state.data.transcript, state.data.title, videoId, mode)
    toast({ variant: 'success', title: 'Downloading TXT…', duration: 2000 })
  }

  function handleDownloadSrt() {
    if (state.status !== 'success') return
    exportSrt(state.data.transcript, state.data.title)
    toast({ variant: 'success', title: 'Downloading SRT…', duration: 2000 })
  }

  async function handleDownloadDocx() {
    if (state.status !== 'success' || !videoId) return
    setExportingDocx(true)
    try {
      await exportDocx(state.data.transcript, state.data.title, state.data.channel, videoId, mode)
      toast({ variant: 'success', title: 'Downloading DOCX…', duration: 2000 })
    } catch {
      toast({ variant: 'destructive', title: 'Export failed', description: 'Could not generate the Word document.', duration: 4000 })
    } finally {
      setExportingDocx(false)
    }
  }

  const displayCount = timestampsOn ? filteredSegments.length : filteredParagraphs.length
  const totalCount = timestampsOn ? transcript.length : paragraphs.length
  const unitLabel = timestampsOn ? 'segments' : 'paragraphs'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost" size="sm"
            className="gap-2 text-[hsl(var(--muted-foreground))]"
            onClick={() => navigate('/transcript')}
          >
            <ArrowLeft className="h-4 w-4" />
            New transcript
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs hidden sm:flex">{videoId}</Badge>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--primary))] hover:underline">
              View on YouTube ↗
            </a>
          </div>
        </div>

        {/* Loading / Error (full-width) */}
        {state.status === 'loading' && videoId && <LoadingCard videoId={videoId} />}
        {state.status === 'error'   && videoId && <ErrorCard error={state.error} videoId={videoId} />}

        {/* Success: page title + two-column layout */}
        {state.status === 'success' && (
          <>
            {/* Page heading */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                Transcript of 🎬 {state.data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {state.data.channel}
                </span>
                <span className="text-[hsl(var(--border))]">·</span>
                <Badge variant="secondary" className="text-xs">{transcript.length} segments</Badge>
                <Badge variant="secondary" className="text-xs">{segmentsToMinutes(wordCount)} read</Badge>
              </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

              {/* ── Left: Transcript panel ─────────────────────── */}
              <Card className="shadow-sm overflow-hidden">

                {/* Thumbnail — full width, clickable */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-video bg-black overflow-hidden group"
                >
                  <img
                    src={state.data.thumbnail}
                    alt={state.data.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white fill-current ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </a>

                <CardContent className="p-4 sm:p-5">

                  {/* Transcript label */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                    </div>
                    <h2 className="font-semibold text-sm">Transcript</h2>
                  </div>

                  {/* ── Action toolbar ──────────────────────────── */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">

                    {/* Copy — primary */}
                    <Button onClick={handleCopy} className="gap-2 h-9 px-5 text-sm">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>

                    {/* Timestamp toggle */}
                    <Button
                      variant={timestampsOn ? 'secondary' : 'outline'}
                      onClick={() => { setTimestampsOn((v) => !v); setSearchQuery('') }}
                      className={`gap-2 h-9 px-4 text-sm ${
                        timestampsOn
                          ? 'border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))]'
                          : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      <Clock className={`h-4 w-4 ${timestampsOn ? 'text-[hsl(var(--primary))]' : ''}`} />
                      Timestamp {timestampsOn ? 'ON' : 'OFF'}
                    </Button>

                    {/* Download group — right-aligned, smaller */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        variant="outline" size="sm"
                        onClick={handleDownloadTxt}
                        className="gap-1.5 h-8 px-3 text-xs font-medium"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        TXT
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={handleDownloadSrt}
                        className="gap-1.5 h-8 px-3 text-xs font-medium"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        SRT
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={handleDownloadDocx}
                        disabled={exportingDocx}
                        className="gap-1.5 h-8 px-3 text-xs font-medium"
                      >
                        {exportingDocx
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <FileDown className="h-3.5 w-3.5" />
                        }
                        DOCX
                      </Button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      placeholder="Search transcript…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>

                  {/* ── Transcript body (flows naturally) ───────── */}

                  {/* Full Script */}
                  {!timestampsOn && (
                    filteredParagraphs.length === 0 ? (
                      <p className="py-10 text-sm text-center text-[hsl(var(--muted-foreground))]">
                        No results for "{searchQuery}"
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {filteredParagraphs.map((para, i) => (
                          <p key={i} className="text-sm leading-7 text-[hsl(var(--foreground))]">
                            {para}
                          </p>
                        ))}
                      </div>
                    )
                  )}

                  {/* Timestamps */}
                  {timestampsOn && (
                    filteredSegments.length === 0 ? (
                      <p className="py-10 text-sm text-center text-[hsl(var(--muted-foreground))]">
                        No results for "{searchQuery}"
                      </p>
                    ) : (
                      <div className="divide-y divide-[hsl(var(--border))] rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                        {filteredSegments.map((seg, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-4 px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <a
                              href={`${youtubeUrl}&t=${Math.floor(seg.offset / 1000)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5 w-14 hover:underline tabular-nums"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {msToClockStamp(seg.offset)}
                            </a>
                            <p className="text-sm leading-relaxed">{seg.text}</p>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      <FileText className="inline h-3.5 w-3.5 mr-1" />
                      {displayCount} of {totalCount} {unitLabel}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                    <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                      <Link to="/transcript">
                        <ArrowLeft className="h-3 w-3" />
                        Try another
                      </Link>
                    </Button>
                  </div>

                </CardContent>
              </Card>

              {/* ── Right: AI Features panel (sticky) ─────────── */}
              <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                <AIFeaturesPanel />
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
