'use client'

import { ThemeProvider } from './theme-provider'
import { QueryProvider } from './query-provider'
import { SearchCommand } from '@/components/search/SearchCommand'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        <SearchCommand />
      </ThemeProvider>
    </QueryProvider>
  )
}
