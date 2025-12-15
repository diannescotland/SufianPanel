import api from './api'
import {
  AITool,
  Subscription,
  CreditUsage,
  ClientServiceSelection,
  ClientCostSummary,
  GenerationType,
} from '@/types'

// Response types for paginated endpoints
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface UsageByClientResponse {
  usages: CreditUsage[]
  totals: {
    total_cost_mad: number
    total_credits: number
    total_items: number
  }
}

interface SubscriptionUsageResponse {
  subscription: Subscription
  usage_by_client: {
    client__id: string
    client__name: string
    total_credits: number
    total_cost: number
    total_items: number
  }[]
  summary: {
    total_credits_used: number
    credits_remaining: number | null
    cost_per_credit: number | null
  }
}

interface MonthlyOverviewResponse {
  month: string
  month_key: string
  total_cost_mad: number
  subscriptions: {
    tool: string
    tool_type: string
    cost_mad: number
    original_amount: number | null
    original_currency: string
    credits_total: number | null
    credits_used: number
    credits_remaining: number | null
    cost_per_credit_mad: number | null
  }[]
}

interface LogGenerationPayload {
  tool_id: string
  client_id: string
  project_id?: string
  generation_type?: GenerationType
  items_generated?: number
  credits_used?: number
  video_seconds?: number
  description?: string
}

// AI Tools Service
export const aiToolsService = {
  getAll: async (): Promise<AITool[]> => {
    const response = await api.get<PaginatedResponse<AITool>>('/subscriptions/tools/')
    return response.data.results
  },

  getActive: async (): Promise<AITool[]> => {
    const response = await api.get<AITool[]>('/subscriptions/tools/active/')
    return response.data
  },

  getById: async (id: string): Promise<AITool> => {
    const response = await api.get<AITool>(`/subscriptions/tools/${id}/`)
    return response.data
  },

  create: async (data: Partial<AITool>): Promise<AITool> => {
    const response = await api.post<AITool>('/subscriptions/tools/', data)
    return response.data
  },

  update: async (id: string, data: Partial<AITool>): Promise<AITool> => {
    const response = await api.patch<AITool>(`/subscriptions/tools/${id}/`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/tools/${id}/`)
  },
}

// Subscriptions Service
export const subscriptionsService = {
  getAll: async (): Promise<Subscription[]> => {
    const response = await api.get<PaginatedResponse<Subscription>>('/subscriptions/subscriptions/')
    return response.data.results
  },

  getById: async (id: string): Promise<Subscription> => {
    const response = await api.get<Subscription>(`/subscriptions/subscriptions/${id}/`)
    return response.data
  },

  getCurrentMonth: async (): Promise<Subscription[]> => {
    const response = await api.get<Subscription[]>('/subscriptions/subscriptions/current_month/')
    return response.data
  },

  getUsageByClient: async (id: string): Promise<SubscriptionUsageResponse> => {
    const response = await api.get<SubscriptionUsageResponse>(
      `/subscriptions/subscriptions/${id}/usage_by_client/`
    )
    return response.data
  },

  create: async (data: {
    tool: string
    billing_month: string
    total_cost_mad: number
    original_amount?: number
    original_currency?: string
    exchange_rate?: number
    total_credits?: number
    notes?: string
  }): Promise<Subscription> => {
    const response = await api.post<Subscription>('/subscriptions/subscriptions/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Subscription>): Promise<Subscription> => {
    const response = await api.patch<Subscription>(`/subscriptions/subscriptions/${id}/`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/subscriptions/${id}/`)
  },
}

// Credit Usage Service
export const creditUsageService = {
  getAll: async (): Promise<CreditUsage[]> => {
    const response = await api.get<PaginatedResponse<CreditUsage>>('/subscriptions/usage/')
    return response.data.results
  },

  getById: async (id: string): Promise<CreditUsage> => {
    const response = await api.get<CreditUsage>(`/subscriptions/usage/${id}/`)
    return response.data
  },

  getByClient: async (clientId: string): Promise<UsageByClientResponse> => {
    const response = await api.get<UsageByClientResponse>(
      `/subscriptions/usage/by_client/?client_id=${clientId}`
    )
    return response.data
  },

  logGeneration: async (data: LogGenerationPayload): Promise<CreditUsage> => {
    const response = await api.post<CreditUsage>('/subscriptions/usage/log_generation/', data)
    return response.data
  },

  create: async (data: {
    subscription: string
    client: string
    project?: string
    generation_type: GenerationType
    credits_used?: number
    items_generated?: number
    video_seconds?: number
    description?: string
    manual_cost_mad?: number
  }): Promise<CreditUsage> => {
    const response = await api.post<CreditUsage>('/subscriptions/usage/', data)
    return response.data
  },

  update: async (id: string, data: Partial<CreditUsage>): Promise<CreditUsage> => {
    const response = await api.patch<CreditUsage>(`/subscriptions/usage/${id}/`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/usage/${id}/`)
  },
}

// Client Service Selection
export const clientServicesService = {
  getAll: async (): Promise<ClientServiceSelection[]> => {
    const response = await api.get<PaginatedResponse<ClientServiceSelection>>(
      '/subscriptions/client-services/'
    )
    return response.data.results
  },

  getByClient: async (clientId: string): Promise<ClientServiceSelection[]> => {
    const response = await api.get<ClientServiceSelection[]>(
      `/subscriptions/client-services/by_client/?client_id=${clientId}`
    )
    return response.data
  },

  updateClientTools: async (
    clientId: string,
    toolIds: string[]
  ): Promise<ClientServiceSelection[]> => {
    const response = await api.post<ClientServiceSelection[]>(
      '/subscriptions/client-services/update_client_tools/',
      { client_id: clientId, tool_ids: toolIds }
    )
    return response.data
  },

  create: async (data: {
    client: string
    tool: string
    notes?: string
  }): Promise<ClientServiceSelection> => {
    const response = await api.post<ClientServiceSelection>(
      '/subscriptions/client-services/',
      data
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/client-services/${id}/`)
  },
}

// Analytics Service
export const subscriptionAnalyticsService = {
  getCostsByClient: async (): Promise<ClientCostSummary[]> => {
    const response = await api.get<ClientCostSummary[]>('/subscriptions/analytics/costs/')
    return response.data
  },

  getMonthlyOverview: async (month?: string): Promise<MonthlyOverviewResponse> => {
    const url = month
      ? `/subscriptions/analytics/monthly/?month=${month}`
      : '/subscriptions/analytics/monthly/'
    const response = await api.get<MonthlyOverviewResponse>(url)
    return response.data
  },
}
