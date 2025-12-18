'use client'

import { ThemeProvider } from './theme-provider'
import { QueryProvider } from './query-provider'
import { SettingsProvider } from './settings-provider'
import { SearchCommand } from '@/components/search/SearchCommand'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SettingsProvider>
          {children}
          <SearchCommand />
        </SettingsProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
