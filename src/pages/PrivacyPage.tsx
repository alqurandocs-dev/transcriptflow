import { Shield } from 'lucide-react'
import { useMeta } from '@/hooks/useMeta'

const EFFECTIVE_DATE = 'June 1, 2025'
const CONTACT_EMAIL = 'privacy@transcriptflow.app'

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information we collect',
    content: [
      {
        heading: 'Account information',
        body: 'When you create an account we collect your email address and, optionally, your name and profile photo via OAuth providers (Google, GitHub). We never receive or store your OAuth passwords.',
      },
      {
        heading: 'Usage data',
        body: 'We log the YouTube video IDs you submit for transcription, timestamps of those requests, and basic browser metadata (user-agent, language). We use this data solely for rate-limiting, abuse prevention, and improving our service.',
      },
      {
        heading: 'Payment information',
        body: 'Billing is handled entirely by Stripe. We never see or store your full credit card number. We retain only the last four digits, card type, and expiry date that Stripe surfaces to us.',
      },
      {
        heading: 'Cookies and local storage',
        body: 'We use session cookies for authentication and a small number of first-party cookies for preferences (e.g. theme). We do not use third-party advertising cookies.',
      },
    ],
  },
  {
    id: 'how-we-use-information',
    title: '2. How we use your information',
    content: [
      {
        heading: null,
        body: 'We use collected information to: provide, maintain, and improve the TranscriptFlow service; authenticate your identity and enforce access controls; send transactional emails (receipts, password resets, service notices) — never marketing emails without your explicit consent; detect and prevent fraud, abuse, and violations of our Terms of Service; comply with legal obligations.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: '3. Data retention',
    content: [
      {
        heading: null,
        body: 'Transcripts you generate are stored in your account for as long as your account is active. You may delete individual transcripts or your entire account at any time. On account deletion, your personal data is purged within 30 days, except where we are required to retain it by law (e.g. billing records for up to 7 years per tax regulations).',
      },
    ],
  },
  {
    id: 'sharing',
    title: '4. Sharing and disclosure',
    content: [
      {
        heading: 'We do not sell your data',
        body: 'TranscriptFlow has never sold personal data and never will.',
      },
      {
        heading: 'Service providers',
        body: 'We share data with a small number of trusted vendors who help us operate the service: Supabase (database and auth), Stripe (payments), Vercel (hosting and edge functions), and Resend (transactional email). Each vendor is bound by a data processing agreement.',
      },
      {
        heading: 'Legal requirements',
        body: 'We may disclose information if required by law, court order, or to protect the rights, property, or safety of TranscriptFlow, our users, or the public.',
      },
    ],
  },
  {
    id: 'security',
    title: '5. Security',
    content: [
      {
        heading: null,
        body: 'All data is transmitted over TLS 1.2 or higher. Databases are encrypted at rest using AES-256. We conduct periodic security reviews and follow responsible disclosure practices. Despite these measures, no system is 100% secure. If you discover a vulnerability, please report it to security@transcriptflow.app.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '6. Your rights',
    content: [
      {
        heading: null,
        body: 'Depending on your jurisdiction you may have the right to: access a copy of the personal data we hold about you; correct inaccurate data; request deletion of your data; object to or restrict processing; port your data to another service. To exercise any of these rights, email us at privacy@transcriptflow.app. We will respond within 30 days.',
      },
    ],
  },
  {
    id: 'international-transfers',
    title: "7. International data transfers",
    content: [
      {
        heading: null,
        body: 'TranscriptFlow is operated from the United States. If you are located outside the US, your data will be transferred to and processed in the US. We rely on Standard Contractual Clauses approved by the European Commission for transfers from the EEA.',
      },
    ],
  },
  {
    id: 'children',
    title: "8. Children's privacy",
    content: [
      {
        heading: null,
        body: 'TranscriptFlow is not directed at children under 13. We do not knowingly collect personal information from children. If we learn we have collected data from a child, we will delete it promptly.',
      },
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    content: [
      {
        heading: null,
        body: 'We may update this policy from time to time. We will notify registered users by email and update the "effective date" above at least 14 days before material changes take effect. Continued use of the service after that date constitutes acceptance of the revised policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact',
    content: [
      {
        heading: null,
        body: `Questions about this policy? Email us at ${CONTACT_EMAIL} or write to: TranscriptFlow, Inc., 340 Pine Street, Suite 800, San Francisco, CA 94104, USA.`,
      },
    ],
  },
]

export default function PrivacyPage() {
  useMeta({
    title: 'Privacy Policy',
    description:
      'Read the TranscriptFlow Privacy Policy. We explain exactly what data we collect, how we use it, and your rights as a user.',
    canonical: '/privacy',
  })

  return (
    <div className="bg-[hsl(var(--background))]">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Effective date: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
            Your privacy matters to us. This policy explains what information TranscriptFlow collects, why we collect it, and how you can control it. We've written it in plain language — no legal jargon.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        {/* TOC */}
        <nav className="mb-12 p-5 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm font-semibold mb-3">Table of contents</p>
          <ol className="space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map((block, i) => (
                  <div key={i}>
                    {block.heading && (
                      <p className="font-medium text-sm mb-1">{block.heading}</p>
                    )}
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {block.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[hsl(var(--border))] text-center">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Questions? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[hsl(var(--primary))] hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
