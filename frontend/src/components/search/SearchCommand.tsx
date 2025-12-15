'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Search,
  X,
  User,
  FolderKanban,
  FileText,
  ArrowRight,
  Command,
  Loader2,
} from 'lucide-react'
import { clientsService } from '@/services/clients'
import { projectsService } from '@/services/projects'
import { invoicesService } from '@/services/invoices'

interface SearchResult {
  id: string
  type: 'client' | 'project' | 'invoice'
  title: string
  subtitle: string
}

export function SearchCommand() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
        clientsService.getAll({ search: searchQuery }).catch(() => ({ results: [] })),
        projectsService.getAll({ search: searchQuery }).catch(() => ({ results: [] })),
        invoicesService.getAll({ search: searchQuery }).catch(() => ({ results: [] })),
      ])

      const searchResults: SearchResult[] = [
        ...clientsRes.results.slice(0, 3).map((c) => ({
          id: c.id,
          type: 'client' as const,
          title: c.name,
          subtitle: c.email,
        })),
        ...projectsRes.results.slice(0, 3).map((p) => ({
          id: p.id,
          type: 'project' as const,
          title: p.title,
          subtitle: p.client_name || 'No client',
        })),
        ...invoicesRes.results.slice(0, 3).map((i) => ({
          id: i.id,
          type: 'invoice' as const,
          title: i.invoice_number,
          subtitle: i.client_name || 'No client',
        })),
      ]

      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        navigateToResult(results[selectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const navigateToResult = (result: SearchResult) => {
    const paths = {
      client: `/clients/${result.id}`,
      project: `/projects/${result.id}`,
      invoice: `/invoices/${result.id}`,
    }
    router.push(paths[result.type])
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return User
      case 'project':
        return FolderKanban
      case 'invoice':
        return FileText
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div className="w-full max-w-xl mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, projects, invoices..."
              autoFocus
              className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => {
                  const Icon = getIcon(result.type)
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => navigateToResult(result)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                        index === selectedIndex
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-secondary/50 text-foreground'
                      )}
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        result.type === 'client' && 'bg-blue-500/10',
                        result.type === 'project' && 'bg-purple-500/10',
                        result.type === 'invoice' && 'bg-emerald-500/10'
                      )}>
                        <Icon className={cn(
                          'w-4 h-4',
                          result.type === 'client' && 'text-blue-500',
                          result.type === 'project' && 'text-purple-500',
                          result.type === 'invoice' && 'text-emerald-500'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-secondary/50">
                        {getTypeLabel(result.type)}
                      </span>
                      {index === selectedIndex && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  )
                })}
              </div>
            ) : query && !isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
              </div>
            ) : !query ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Start typing to search...</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
