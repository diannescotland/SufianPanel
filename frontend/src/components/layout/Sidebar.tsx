'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-out',
        'bg-gradient-to-b from-[#0c0f1a] via-[#111827] to-[#0c0f1a]',
        'border-r border-white/[0.08]',
        // Desktop
        'hidden lg:block',
        collapsed ? 'lg:w-20' : 'lg:w-72',
        // Mobile - show as drawer when open
        mobileOpen && 'block w-72'
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/3 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 group" onClick={onMobileClose}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-semibold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
                  Design Studio
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  AI Creative Suite
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  'hover:bg-white/[0.04]',
                  isActive && 'bg-white/[0.06]'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-r-full" />
                )}

                <div className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-white/40 group-hover:text-white/70 group-hover:bg-white/[0.04]'
                )}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md" />
                  )}
                </div>

                {!collapsed && (
                  <span className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                  )}>
                    {item.label}
                  </span>
                )}

                {/* Hover glow */}
                <div className={cn(
                  'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  'bg-gradient-to-r from-primary/5 to-transparent'
                )} />
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="p-4 border-t border-white/[0.06] hidden lg:block">
          <button
            onClick={() => onCollapse?.(!collapsed)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
              'bg-white/[0.03] hover:bg-white/[0.06] transition-colors',
              'text-white/40 hover:text-white/60'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
