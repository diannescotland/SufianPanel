import api from './api'
import { OverviewStats, RevenueData } from '@/types'

export const analyticsService = {
  getOverview: async () => {
    const response = await api.get<OverviewStats>('/analytics/overview/')
    return response.data
  },

  getRevenue: async (period: 'daily' | 'weekly' | 'monthly' = 'monthly', months: number = 12) => {
    const response = await api.get<RevenueData>('/analytics/revenue/', {
      params: { period, months }
    })
    return response.data
  },

  getClients: async (months: number = 12) => {
    const response = await api.get('/analytics/clients/', { params: { months } })
    return response.data
  },

  getServices: async () => {
    const response = await api.get('/analytics/services/')
    return response.data
  },

  getPayments: async () => {
    const response = await api.get('/analytics/payments/')
    return response.data
  },

  getDeadlines: async () => {
    const response = await api.get('/analytics/deadlines/')
    return response.data
  },
}
