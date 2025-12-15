'use client'

import { useState } from 'react'
import { useTheme } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'

interface HeaderProps {
  sidebarCollapsed?: boolean
  onMenuClick?: () => void
}

export function Header({ sidebarCollapsed, onMenuClick }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-20 transition-all duration-300',
        'left-0 lg:left-72',
        sidebarCollapsed && 'lg:left-20',
        'bg-background/60 backdrop-blur-xl',
        'border-b border-border/50'
      )}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Search - triggers Cmd+K modal */}
          <button
            onClick={() => {
              // Trigger the search modal by dispatching keyboard event
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
            }}
            className={cn(
              'relative flex items-center w-72 rounded-xl',
              'bg-secondary/60 hover:bg-secondary transition-colors'
            )}
          >
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
            <span className="w-full py-2.5 pl-11 pr-4 text-sm text-muted-foreground/60 text-left">
              Search...
            </span>
            <kbd className={cn(
              'absolute right-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide',
              'bg-background/80 text-muted-foreground/60 border border-border/50'
            )}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors group">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors group"
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-border/50 mx-2" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={cn(
                'flex items-center gap-3 p-1.5 pr-3 rounded-xl',
                'hover:bg-secondary transition-colors group'
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-sm font-semibold text-primary-foreground">A</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">admin@studio.com</p>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-muted-foreground transition-transform',
                showProfileMenu && 'rotate-180'
              )} />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className={cn(
                  'absolute right-0 top-full mt-2 z-50 w-56',
                  'bg-card/95 backdrop-blur-xl rounded-xl',
                  'border border-border/50 shadow-xl shadow-black/20',
                  'py-1.5 animate-in fade-in slide-in-from-top-2 duration-200'
                )}>
                  <div className="px-3 py-2 border-b border-border/50 mb-1.5">
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@studio.com</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-border/50 mt-1.5 pt-1.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
