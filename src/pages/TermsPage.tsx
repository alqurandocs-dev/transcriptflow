import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMeta } from '@/hooks/useMeta'

const EFFECTIVE_DATE = 'June 1, 2025'
const CONTACT_EMAIL = 'legal@transcriptflow.app'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of terms',
    body: 'By accessing or using TranscriptFlow ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms apply to all visitors, users, and others who access the Service.',
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    body: 'You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this requirement. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.',
  },
  {
    id: 'your-account',
    title: '3. Your account',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at legal@transcriptflow.app if you suspect unauthorized access. We are not liable for losses caused by unauthorized use of your account.',
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable use',
    body: `You agree not to use the Service to: (a) transcribe videos you do not have the rights to process; (b) violate any applicable laws or regulations; (c) infringe the intellectual property rights of others; (d) scrape, crawl, or use automated means to access the Service beyond our published API limits; (e) reverse-engineer, decompile, or attempt to derive source code; (f) upload or transmit malware, viruses, or any malicious code; (g) attempt to gain unauthorized access to our systems or other users' accounts; (h) use the Service to generate content that is illegal, harmful, or defamatory.`,
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual property',
    body: 'The Service, including its software, design, and branding, is owned by TranscriptFlow, Inc. and protected by copyright and other intellectual property laws. You retain ownership of any transcripts you generate. You grant us a limited, non-exclusive license to store and process your transcripts solely to provide and improve the Service.',
  },
  {
    id: 'youtube-content',
    title: '6. YouTube content and third-party rights',
    body: "TranscriptFlow retrieves publicly available captions from YouTube using YouTube's public caption API. You are solely responsible for ensuring you have the right to use, copy, or process the content of any video you transcribe. We do not claim ownership of any third-party content. If you believe your content is being processed without authorization, contact us at legal@transcriptflow.app.",
  },
  {
    id: 'subscriptions-billing',
    title: '7. Subscriptions and billing',
    body: 'Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or described in our refund policy. We reserve the right to change pricing with at least 30 days\' notice to subscribers. Failure to pay may result in suspension or termination of your account.',
  },
  {
    id: 'termination',
    title: '8. Termination',
    body: 'You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you violate these Terms, engage in fraudulent activity, or for any other reason with reasonable notice, except in cases of serious violations where immediate termination may be necessary. Upon termination, your right to use the Service ceases and we will handle your data per our Privacy Policy.',
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    body: 'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR COMPLETELY ACCURATE. TRANSCRIPT QUALITY DEPENDS ON THE QUALITY OF THE SOURCE VIDEO CAPTIONS.',
  },
  {
    id: 'limitation-of-liability',
    title: '10. Limitation of liability',
    body: 'TO THE FULLEST EXTENT PERMITTED BY LAW, TRANSCRIPTFLOW AND ITS OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PRECEDING THREE MONTHS, OR $10 USD, WHICHEVER IS GREATER.',
  },
  {
    id: 'governing-law',
    title: '11. Governing law and disputes',
    body: 'These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration under the rules of the American Arbitration Association, except that either party may seek injunctive relief in court for intellectual property violations.',
  },
  {
    id: 'changes',
    title: '12. Changes to these terms',
    body: 'We may modify these Terms at any time. Material changes will be communicated by email and through an in-app notice at least 14 days before taking effect. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.',
  },
  {
    id: 'contact-legal',
    title: '13. Contact',
    body: `For questions about these Terms, contact us at ${CONTACT_EMAIL} or: TranscriptFlow, Inc., 340 Pine Street, Suite 800, San Francisco, CA 94104, USA.`,
  },
]

export default function TermsPage() {
  useMeta({
    title: 'Terms of Service',
    description:
      'Read the TranscriptFlow Terms of Service. Understand your rights, our responsibilities, and the rules that govern use of the platform.',
    canonical: '/terms',
  })

  return (
    <div className="bg-[hsl(var(--background))]">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Effective date: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
            These Terms govern your use of TranscriptFlow. Please read them carefully — by using our service you're agreeing to them. We've kept the language as plain as possible.
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
                <a href={`#${s.id}`} className="text-sm text-[hsl(var(--primary))] hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <span>Last updated: {EFFECTIVE_DATE}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</Link>
            <Link to="/contact" className="text-[hsl(var(--primary))] hover:underline">Contact us</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
