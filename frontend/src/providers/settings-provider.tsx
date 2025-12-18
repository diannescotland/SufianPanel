'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Settings interface
interface Settings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  emailNotifications: boolean
  deadlineReminders: boolean
  paymentAlerts: boolean
}

// Default values
const defaultSettings: Settings = {
  businessName: 'Design Studio',
  businessEmail: 'hello@designstudio.com',
  businessPhone: '+1 (555) 000-0000',
  businessAddress: '',
  emailNotifications: true,
  deadlineReminders: true,
  paymentAlerts: true,
}

// Context interface
interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  saveSettings: () => Promise<void>
  isLoading: boolean
  isSaving: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const STORAGE_KEY = 'sufian-panel-settings'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
    setIsLoading(false)
  }, [])

  // Update settings in state
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  // Save settings to localStorage
  const saveSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      // Simulate brief delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, isLoading, isSaving }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Helper function to get initials from a name
export function getSettingsInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
