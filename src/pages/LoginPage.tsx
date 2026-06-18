import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--primary))] to-purple-700 flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Zap className="h-4 w-4 text-white" />
          </div>
          TranscriptFlow
        </Link>

        <div className="max-w-sm">
          <blockquote className="text-2xl font-medium leading-snug mb-6">
            "TranscriptFlow saves me hours every week. It's become an essential part of my workflow."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
              SC
            </div>
            <div>
              <div className="font-medium">Sarah Chen</div>
              <div className="text-sm text-white/70">Content Creator, 2.1M subscribers</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '2M+', label: 'Transcripts' },
            { value: '50+', label: 'Languages' },
            { value: '99.2%', label: 'Accuracy' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-400 bg-clip-text text-transparent">
              TranscriptFlow
            </span>
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Sign in to your TranscriptFlow account'
                  : 'Start generating transcripts for free'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">or continue with email</span>
                <Separator className="flex-1" />
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <Link
                        to="#"
                        className="text-xs text-[hsl(var(--primary))] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLogin ? '••••••••' : 'Min. 8 characters'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {isLogin ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              {!isLogin && (
                <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                  By creating an account, you agree to our{' '}
                  <Link to="#" className="text-[hsl(var(--primary))] hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="#" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</Link>.
                </p>
              )}

              <div className="text-center text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(isLogin ? 'signup' : 'login')}
                  className="text-[hsl(var(--primary))] font-medium hover:underline"
                >
                  {isLogin ? 'Sign up for free' : 'Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
