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
    description: 'Perfect for trying out TranscriptFlow',
    features: [
      '5 transcripts / month',
      'Up to 10 min per video',
      'English only',
      'TXT export',
      'Community support',
    ],
    notIncluded: ['Priority processing', 'All languages', 'PDF & SRT export', 'API access'],
    highlighted: false,
    cta: 'Get started free',
    href: '/login',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 9,
    description: 'For creators and solo professionals',
    features: [
      '100 transcripts / month',
      'Up to 3 hours per video',
      '50+ languages',
      'TXT, PDF, SRT export',
      'Priority processing',
      'Email support',
      'Search & bookmark',
    ],
    notIncluded: ['Team workspaces', 'API access'],
    highlighted: true,
    cta: 'Start free trial',
    href: '/login',
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 39,
    yearlyPrice: 29,
    description: 'For teams and growing businesses',
    features: [
      'Unlimited transcripts',
      'Unlimited video length',
      '50+ languages',
      'All export formats',
      'Priority processing',
      'Team workspaces',
      'REST API access',
      'Dedicated support',
      'Custom integrations',
    ],
    notIncluded: [],
    highlighted: false,
    cta: 'Start free trial',
    href: '/login',
  },
]

const faqs = [
  {
    q: 'How accurate are the transcripts?',
    a: 'Our AI achieves 97%+ accuracy on clear audio. Accuracy may vary for heavily accented speech, background noise, or technical jargon.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time and keep access until the end of your billing period.',
  },
  {
    q: 'Do unused transcripts roll over?',
    a: 'Transcripts reset monthly and do not roll over. We recommend upgrading if you consistently hit the limit.',
  },
  {
    q: 'Is there an API available?',
    a: 'Yes, REST API access is available on the Team plan. Documentation and API keys are available in your dashboard.',
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
                {plan.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="gap-1 px-3">
                      <Zap className="h-3 w-3" />
                      Most popular
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
            All plans include a 14-day free trial. No credit card required to start.
          </p>
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
