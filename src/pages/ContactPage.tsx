import { useState } from 'react'
import { Mail, MessageSquare, Clock, CheckCircle2, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useMeta } from '@/hooks/useMeta'

const SUPPORT_EMAIL = 'hello@transcriptflow.app'

const channels = [
  {
    icon: Mail,
    title: 'Email support',
    description: 'For billing, account, and general questions.',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    badge: 'Replies within 24 h',
  },
  {
    icon: MessageSquare,
    title: 'Bug reports',
    description: 'Found something broken? Let us know.',
    value: 'bugs@transcriptflow.app',
    href: 'mailto:bugs@transcriptflow.app',
    badge: 'Triaged within 48 h',
  },
  {
    icon: Clock,
    title: 'Business & partnerships',
    description: 'Enterprise plans, API access, or integrations.',
    value: 'partnerships@transcriptflow.app',
    href: 'mailto:partnerships@transcriptflow.app',
    badge: 'Typically 2–3 business days',
  },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  useMeta({
    title: 'Contact Us',
    description:
      'Get in touch with the TranscriptFlow team. We\'re here to help with support questions, bug reports, and partnership enquiries.',
    canonical: '/contact',
  })

  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.subject.trim()) e.subject = 'Subject is required.'
    if (!form.message.trim()) e.message = 'Message is required.'
    else if (form.message.trim().length < 20) e.message = 'Please provide a bit more detail (at least 20 characters).'
    return e
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setFormState('submitting')
    // Simulate sending — replace with a real API call or form service
    await new Promise((r) => setTimeout(r, 1200))
    setFormState('success')
  }

  return (
    <div className="bg-[hsl(var(--background))]">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Get in touch
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">We'd love to hear from you</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed max-w-xl mx-auto">
            Whether you have a question, a bug to report, or just want to say hi — we read every message and reply promptly.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Left — contact channels */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-6">Contact channels</h2>
            {channels.map(({ icon: Icon, title, description, value, href, badge }) => (
              <Card key={title} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">{description}</p>
                      <a
                        href={href}
                        className="text-xs text-[hsl(var(--primary))] hover:underline break-all"
                      >
                        {value}
                      </a>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {badge}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                <strong className="text-[hsl(var(--foreground))]">Support hours:</strong> Monday – Friday, 9 am – 6 pm PT. We aim to respond to all messages within one business day.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-semibold mb-6">Send us a message</h2>

            {formState === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Message sent!</h3>
                <p className="text-[hsl(var(--muted-foreground))] max-w-sm">
                  Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> within one business day.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setFormState('idle'); setForm({ name: '', email: '', subject: '', message: '' }) }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    id="name" label="Name" placeholder="Jane Smith"
                    value={form.name} onChange={(v) => handleChange('name', v)}
                    error={errors.name}
                  />
                  <Field
                    id="email" label="Email" type="email" placeholder="jane@example.com"
                    value={form.email} onChange={(v) => handleChange('email', v)}
                    error={errors.email}
                  />
                </div>

                <Field
                  id="subject" label="Subject" placeholder="Question about my subscription"
                  value={form.subject} onChange={(v) => handleChange('subject', v)}
                  error={errors.subject}
                />

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm resize-none bg-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 transition-colors ${
                      errors.message
                        ? 'border-red-400 focus-visible:ring-red-400 bg-red-50'
                        : 'border-[hsl(var(--input))]'
                    }`}
                  />
                  {errors.message && <FieldError msg={errors.message} />}
                </div>

                {formState === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}

                <Button type="submit" disabled={formState === 'submitting'} className="gap-2 w-full sm:w-auto">
                  {formState === 'submitting' ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  id, label, type = 'text', placeholder, value, onChange, error,
}: {
  id: string; label: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Input
        id={id} type={type} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-red-400 focus-visible:ring-red-400 bg-red-50' : ''}
        aria-invalid={!!error}
      />
      {error && <FieldError msg={error} />}
    </div>
  )
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  )
}
