/**
 * Query Key Factory
 * Centralizes all React Query keys for consistency and type safety.
 *
 * Usage:
 *   queryKey: queryKeys.clients.all
 *   queryKey: queryKeys.clients.detail(id)
 *   queryKey: queryKeys.invoices.list({ status: 'paid' })
 */

export const queryKeys = {
  // Clients
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    history: (id: string) => [...queryKeys.clients.detail(id), 'history'] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    deadlines: (days?: number) => [...queryKeys.projects.all, 'deadlines', days] as const,
    calendar: (month: number, year: number) => [...queryKeys.projects.all, 'calendar', { month, year }] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    overdue: () => [...queryKeys.invoices.all, 'overdue'] as const,
  },

  // Subscriptions
  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...queryKeys.subscriptions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.subscriptions.lists(), filters] as const,
    details: () => [...queryKeys.subscriptions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.subscriptions.details(), id] as const,
    currentMonth: () => [...queryKeys.subscriptions.all, 'currentMonth'] as const,
    usageByClient: (id: string) => [...queryKeys.subscriptions.detail(id), 'usageByClient'] as const,
  },

  // AI Tools
  tools: {
    all: ['tools'] as const,
    active: () => [...queryKeys.tools.all, 'active'] as const,
  },

  // Credit Usage
  usage: {
    all: ['usage'] as const,
    byClient: (clientId: string) => [...queryKeys.usage.all, 'byClient', clientId] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...queryKeys.analytics.all, 'overview'] as const,
    revenue: (params?: { period?: string; months?: number }) =>
      [...queryKeys.analytics.all, 'revenue', params] as const,
    clients: (params?: { months?: number }) =>
      [...queryKeys.analytics.all, 'clients', params] as const,
    services: () => [...queryKeys.analytics.all, 'services'] as const,
    payments: () => [...queryKeys.analytics.all, 'payments'] as const,
    costs: () => [...queryKeys.analytics.all, 'costs'] as const,
    monthly: (month?: string) => [...queryKeys.analytics.all, 'monthly', month] as const,
  },

  // Services (pricing)
  services: {
    all: ['services'] as const,
    pricing: () => [...queryKeys.services.all, 'pricing'] as const,
  },
} as const

// Type helper for query key inference
export type QueryKeys = typeof queryKeys
