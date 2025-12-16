import api from './api'
import { ServicePricing } from '@/types'

export interface CostCalculatorItem {
  ai_tool: string
  tier: 'free' | 'standard' | 'pro' | 'premier'
  quantity: number
  duration_seconds?: number
}

export interface CostBreakdownItem {
  ai_tool: string
  tier: string
  tier_price: number
  quantity: number
  quantity_cost: number
  item_total: number
}

export interface CostCalculatorResponse {
  breakdown: CostBreakdownItem[]
  total_cost: number
}

export const pricingService = {
  getAll: async () => {
    const response = await api.get<{ results: ServicePricing[] }>('/pricing/')
    return response.data.results
  },

  getById: async (id: string) => {
    const response = await api.get<ServicePricing>(`/pricing/${id}/`)
    return response.data
  },

  calculate: async (items: CostCalculatorItem[]) => {
    const response = await api.post<CostCalculatorResponse>('/pricing/calculate/', items)
    return response.data
  },
}
