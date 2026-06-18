import { Link } from 'react-router-dom'
import {
  ArrowRight,
  PlayCircle,
  Zap,
  Globe,
  Download,
  Search,
  Shield,
  Star,
  Play,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get transcripts in seconds, not minutes. Our AI processes videos at blazing speed.',
  },
  {
    icon: Globe,
    title: '50+ Languages',
    description: 'Auto-detect and translate transcripts across 50+ languages with high accuracy.',
  },
  {
    icon: Search,
    title: 'Full-text Search',
    description: 'Search across all your transcripts instantly. Find any quote or moment.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Export as TXT, PDF, SRT, or copy to clipboard. Works with any workflow.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your transcripts are encrypted and never shared. Complete privacy guaranteed.',
  },
  {
    icon: PlayCircle,
    title: 'YouTube Native',
    description: 'Paste any YouTube URL and we handle the rest. No extensions needed.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator',
    avatar: 'SC',
    quote: 'TranscriptFlow saves me 3+ hours every week. The accuracy is incredible.',
    stars: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'Podcast Producer',
    avatar: 'MW',
    quote: 'Best transcript tool I\'ve used. Clean UI, fast results, great export options.',
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Researcher',
    avatar: 'PS',
    quote: 'The multilingual support is a game changer for my academic research.',
    stars: 5,
  },
]

const stats = [
  { value: '2M+', label: 'Transcripts generated' },
  { value: '50+', label: 'Languages supported' },
  { value: '99.2%', label: 'Accuracy rate' },
  { value: '< 30s', label: 'Average processing time' },
]

export default function HomePage() {
  return (
    <>
      {/* SEO meta handled in index.html */}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))] pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[hsl(var(--primary))]/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5" />
            Now with GPT-4 accuracy
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Turn YouTube Videos Into{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-400 bg-clip-text text-transparent">
              Perfect Transcripts
            </span>{' '}
            Instantly
          </h1>

          <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a YouTube URL and get an accurate, searchable transcript in seconds.
            Supports 50+ languages and exports to any format you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="xl" asChild className="gap-2 shadow-lg shadow-[hsl(var(--primary))]/25">
              <Link to="/transcript">
                <Play className="h-4 w-4" />
                Generate transcript
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
            No account required · 3 free transcripts/month · Upgrade anytime
          </p>

          {/* Demo preview */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-md bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center px-3">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">youtube.com/watch?v=...</span>
                </div>
              </div>
              <div className="p-6 sm:p-8 text-left">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shrink-0">
                    <PlayCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">How to Build a SaaS in 2024</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Tech Channel · 1.2M views · 18:42</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    '0:00 - Introduction to modern SaaS architecture...',
                    '2:15 - Choosing the right tech stack for scalability...',
                    '5:30 - Setting up authentication and authorization...',
                    '8:45 - Database design patterns and best practices...',
                  ].map((line, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs text-[hsl(var(--primary))] font-mono mt-0.5 shrink-0">
                        {line.split(' - ')[0]}
                      </span>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {line.split(' - ')[1]}
                      </p>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] pt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Processing complete · 97.4% accuracy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[hsl(var(--primary))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need for transcripts
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Powerful tools built for content creators, researchers, and teams who work with video content.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--primary))]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Loved by creators worldwide
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, quote, stars }) => (
              <Card key={name} className="flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 mb-6">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">{role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[hsl(var(--primary))] to-purple-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Start transcribing today
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of creators who save time with TranscriptFlow every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="secondary" asChild className="gap-2">
              <Link to="/transcript">
                Generate transcript
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="gap-2 border-white/30 text-white hover:bg-white/10">
              <Link to="/pricing">
                See pricing
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/70">
            {['No account needed', '3 free/month', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
