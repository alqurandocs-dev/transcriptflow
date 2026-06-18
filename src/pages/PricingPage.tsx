import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Zap, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Billing = 'monthly' | 'yearly'

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Try TranscriptFlow with no commitment',
    badge: null,
    features: [
      '3 transcripts / month',
      'Any video length',
      'English transcripts',
      'Copy & TXT export',
      'Timestamps included',
    ],
    notIncluded: ['All languages', 'PDF & SRT export', 'Priority processing', 'API access'],
    highlighted: false,
    cta: 'Get started free',
    href: '/login',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'For creators and solo professionals',
    badge: 'Most popular',
    features: [
      '50 transcripts / month',
      'Any video length',
      '50+ languages',
      'TXT, PDF, SRT export',
      'Priority processing',
      'Search & timestamp jump',
      'Email support',
    ],
    notIncluded: ['Team workspaces', 'API access'],
    highlighted: true,
    cta: 'Start 7-day free trial',
    href: '/login',
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 29,
    yearlyPrice: 22,
    description: 'For teams and power users',
    badge: null,
    features: [
      '200 transcripts / month',
      'Any video length',
      '50+ languages',
      'All export formats',
      'Priority processing',
      'Team workspaces (5 seats)',
      'REST API access',
      'Dedicated support',
    ],
    notIncluded: [],
    highlighted: false,
    cta: 'Start 7-day free trial',
    href: '/login',
  },
]

const comparison = [
  { feature: 'Transcripts / month', free: '3', pro: '50', business: '200' },
  { feature: 'Video length', free: 'Any', pro: 'Any', business: 'Any' },
  { feature: 'Languages', free: 'English', pro: '50+', business: '50+' },
  { feature: 'TXT export', free: '✓', pro: '✓', business: '✓' },
  { feature: 'PDF & SRT export', free: '—', pro: '✓', business: '✓' },
  { feature: 'Priority processing', free: '—', pro: '✓', business: '✓' },
  { feature: 'Search & timestamps', free: '—', pro: '✓', business: '✓' },
  { feature: 'Team workspaces', free: '—', pro: '—', business: '✓' },
  { feature: 'API access', free: '—', pro: '—', business: '✓' },
  { feature: 'Support', free: 'Community', pro: 'Email', business: 'Dedicated' },
]

const faqs = [
  {
    q: 'How accurate are the transcripts?',
    a: 'TranscriptFlow uses YouTube\'s official caption data, so accuracy depends on the video\'s captions. Auto-generated captions are typically 90–95% accurate on clear speech.',
  },
  {
    q: 'What counts as one transcript?',
    a: 'Each video you generate a transcript for counts as one use, regardless of video length. Re-generating the same video does not count again.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your account settings. You keep access until the end of your billing period with no extra charges.',
  },
  {
    q: 'Do unused transcripts roll over?',
    a: 'No, transcript limits reset on the 1st of each month and do not roll over. Upgrade anytime if you need more.',
  },
  {
    q: 'What if a video has no transcript?',
    a: 'Some videos have captions disabled by the creator. This will not count against your monthly limit.',
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('yearly')

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* Header */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center px-4">
        <Badge variant="secondary" className="mb-4">Pricing</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl mx-auto">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-8">
          Start free. Upgrade when you need more. No hidden fees ever.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
          {(['monthly', 'yearly'] as Billing[]).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                'px-5 py-2 rounded-md text-sm font-medium transition-all capitalize',
                billing === b
                  ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              {b}
              {b === 'yearly' && (
                <Badge variant="default" className="ml-2 text-[10px] py-0 px-1.5 h-4">
                  Save 25%
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 sm:pb-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  plan.highlighted && 'ring-2 ring-[hsl(var(--primary))] shadow-xl shadow-[hsl(var(--primary))]/10'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="gap-1 px-3">
                      <Zap className="h-3 w-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-8">
                  <div className="mb-1">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold">
                      ${billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-[hsl(var(--muted-foreground))] text-sm">/mo</span>
                  </div>
                  {billing === 'yearly' && plan.yearlyPrice > 0 && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      Billed ${plan.yearlyPrice * 12}/year
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col flex-1 gap-6">
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={plan.href}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-[hsl(var(--muted-foreground))] line-through">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 opacity-30" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-8">
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="pb-16 sm:pb-24 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold text-center mb-6">Plan comparison</h2>
          <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(var(--primary))]">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      'border-b border-[hsl(var(--border))] last:border-0',
                      i % 2 === 0 ? '' : 'bg-[hsl(var(--muted)/0.4)]'
                    )}
                  >
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{row.feature}</td>
                    <td className="py-3 px-4 text-center">{row.free}</td>
                    <td className="py-3 px-4 text-center font-medium text-[hsl(var(--primary))]">{row.pro}</td>
                    <td className="py-3 px-4 text-center">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-semibold mb-2">{q}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-3">
              Still have questions?
            </p>
            <Button variant="outline" asChild>
              <Link to="/">Contact support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
