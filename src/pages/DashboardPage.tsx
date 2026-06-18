import { Link } from 'react-router-dom'
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Globe,
  ArrowUpRight,
  MoreHorizontal,
  PlayCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Transcripts this month', value: '24', change: '+12%', icon: FileText },
  { label: 'Minutes transcribed', value: '347', change: '+8%', icon: Clock },
  { label: 'Languages used', value: '4', change: '+1', icon: Globe },
  { label: 'Words extracted', value: '92.4k', change: '+18%', icon: TrendingUp },
]

const recentTranscripts = [
  {
    id: '1',
    title: 'How to Build a SaaS Product in 2024',
    duration: '18:42',
    language: 'English',
    date: '2 hours ago',
    status: 'completed',
  },
  {
    id: '2',
    title: 'React 19 New Features Deep Dive',
    duration: '24:15',
    language: 'English',
    date: '1 day ago',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Supabase Full Course for Beginners',
    duration: '1:12:33',
    language: 'English',
    date: '2 days ago',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Tailwind CSS v4 — Everything New',
    duration: '31:08',
    language: 'English',
    date: '3 days ago',
    status: 'completed',
  },
  {
    id: '5',
    title: 'TypeScript Tips & Tricks for 2024',
    duration: '42:50',
    language: 'English',
    date: '5 days ago',
    status: 'completed',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            Welcome back, John. Here's what's happening.
          </p>
        </div>
        <Button className="gap-2 shrink-0" asChild>
          <Link to="/transcript">
            <Plus className="h-4 w-4" />
            New transcript
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-xs text-green-600 font-medium">{change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan usage */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Pro Plan</h3>
                <Badge variant="default" className="gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                24 of 100 transcripts used this month
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/billing">Upgrade plan</Link>
            </Button>
          </div>
          <div className="w-full h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width: '24%' }} />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
            76 transcripts remaining · Resets in 18 days
          </p>
        </CardContent>
      </Card>

      {/* Recent transcripts */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Transcripts</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/transcripts">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-[hsl(var(--border))]">
            {recentTranscripts.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <PlayCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.duration}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.language}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs text-green-700 bg-green-50">
                    {t.status}
                  </Badge>
                  <button className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
