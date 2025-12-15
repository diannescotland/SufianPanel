'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useTheme } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'
import {
  Settings,
  User,
  Palette,
  Bell,
  Building2,
  Moon,
  Sun,
  Monitor,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Business info state
  const [businessName, setBusinessName] = useState('Design Studio')
  const [businessEmail, setBusinessEmail] = useState('hello@designstudio.com')
  const [businessPhone, setBusinessPhone] = useState('+1 (555) 000-0000')
  const [businessAddress, setBusinessAddress] = useState('')

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [deadlineReminders, setDeadlineReminders] = useState(true)
  const [paymentAlerts, setPaymentAlerts] = useState(true)

  const handleSave = () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }, 500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and business information</p>
          </div>
        </div>

        {/* Success message */}
        {showSaved && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-success font-medium">Settings saved successfully!</p>
          </div>
        )}

        {/* Appearance */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Appearance</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = theme === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Business Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-secondary/50 border border-border/50',
                  'text-foreground placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                rows={2}
                placeholder="Enter your business address"
                className={cn(
                  'w-full px-4 py-3 rounded-xl resize-none',
                  'bg-secondary/50 border border-border/50',
                  'text-foreground placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                )}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  emailNotifications ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-foreground">Deadline Reminders</p>
                <p className="text-xs text-muted-foreground">Get notified about upcoming deadlines</p>
              </div>
              <button
                onClick={() => setDeadlineReminders(!deadlineReminders)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  deadlineReminders ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    deadlineReminders ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-foreground">Payment Alerts</p>
                <p className="text-xs text-muted-foreground">Notify when payments are received or overdue</p>
              </div>
              <button
                onClick={() => setPaymentAlerts(!paymentAlerts)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  paymentAlerts ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    paymentAlerts ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg shadow-primary/25',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
