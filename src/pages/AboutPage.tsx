import { Zap, Users, Globe, Shield, TrendingUp, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMeta } from '@/hooks/useMeta'

const stats = [
  { value: '500K+', label: 'Transcripts generated' },
  { value: '50+', label: 'Languages supported' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 10s', label: 'Average generation time' },
]

const values = [
  {
    icon: Zap,
    title: 'Speed without compromise',
    description:
      'We built TranscriptFlow because waiting minutes for a transcript is absurd. Our pipeline delivers clean, timestamped text in under ten seconds for most videos.',
  },
  {
    icon: Globe,
    title: 'Built for a global audience',
    description:
      'Content is created in every language. TranscriptFlow auto-detects and accurately transcribes videos in over 50 languages, from Spanish and Mandarin to Hindi and Arabic.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    description:
      'We never store your video content on our servers. Transcripts are generated on-demand and handled according to our strict privacy policy.',
  },
  {
    icon: TrendingUp,
    title: 'Creator-focused features',
    description:
      'Export to TXT, SRT, or DOCX. Search inside transcripts. Copy with one click. Every feature was designed around how real creators and researchers actually work.',
  },
]

const team = [
  {
    name: 'Alex Rivera',
    role: 'Co-founder & CEO',
    bio: 'Former product lead at a video streaming company. Built TranscriptFlow after spending too many hours manually transcribing interviews.',
    initials: 'AR',
  },
  {
    name: 'Priya Nair',
    role: 'Co-founder & CTO',
    bio: 'Full-stack engineer with a background in NLP and speech recognition. Leads all things infrastructure and ML pipeline.',
    initials: 'PN',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Design',
    bio: 'Obsessed with making complex tools feel effortless. Previously designed products used by millions at two B2B SaaS companies.',
    initials: 'MC',
  },
]

export default function AboutPage() {
  useMeta({
    title: 'About Us',
    description:
      'Learn about TranscriptFlow — the team behind the fastest YouTube transcript tool, our mission, and why we built it.',
    canonical: '/about',
  })

  return (
    <div className="bg-[hsl(var(--background))]">

      {/* Hero */}
      <section className="py-20 sm:py-28 bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Our story
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            We believe every spoken word deserves to be searchable
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mx-auto">
            TranscriptFlow started as a weekend project born out of frustration. Too many great ideas, interviews, and tutorials were locked away in video — unsearchable, un-quotable, inaccessible. We set out to fix that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-[hsl(var(--primary))] mb-1">{s.value}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Our mission</h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                Billions of hours of video content are published every year. Researchers, journalists, students, and creators all need to work with that content — but video is slow to consume, impossible to search, and hard to cite.
              </p>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                Our mission is to make the spoken word as accessible and useful as the written word. Fast, accurate, multilingual transcription — available to everyone, not just those with enterprise budgets.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Meet the team</h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
              A small, focused team that uses TranscriptFlow every day — which keeps us honest about what actually matters.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-[hsl(var(--card))] rounded-xl p-6 border border-[hsl(var(--border))]">
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-[hsl(var(--primary))]">{member.initials}</span>
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-[hsl(var(--primary))] font-medium mb-3">{member.role}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-10 w-10 mx-auto mb-4 text-[hsl(var(--primary))]" />
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to try it?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            No account required to get started. Paste a YouTube URL and have your transcript in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/transcript">
                <Zap className="h-4 w-4" />
                Generate a transcript
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
