import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Zap, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Transcript', href: '/transcript' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMobileOpen(false)
  }

  const avatarLetter = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? '?'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-400 bg-clip-text text-transparent">
              TranscriptFlow
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-semibold">
                    {avatarLetter}
                  </div>
                  <span className="text-sm text-[hsl(var(--muted-foreground))] max-w-[140px] truncate">
                    {user.user_metadata?.full_name ?? user.email}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-1.5 text-[hsl(var(--muted-foreground))]">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/login">Get started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-semibold">
                    {avatarLetter}
                  </div>
                  <span className="text-sm truncate">{user.user_metadata?.full_name ?? user.email}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
