import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transcripts', href: '/dashboard/transcripts', icon: FileText },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))]">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--background))] border-r border-[hsl(var(--border))] transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 border-b border-[hsl(var(--border))]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-[hsl(var(--primary))] to-purple-400 bg-clip-text text-transparent">
            TranscriptFlow
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">john@example.com</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[hsl(var(--muted-foreground))]">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs">JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
