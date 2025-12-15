import api from './api'
import { Client, ClientHistoryResponse, PaginatedResponse } from '@/types'

export const clientsService = {
  getAll: async (params?: { search?: string; is_active?: boolean; page?: number }) => {
    const response = await api.get<PaginatedResponse<Client>>('/clients/', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Client>(`/clients/${id}/`)
    return response.data
  },

  getHistory: async (id: string): Promise<ClientHistoryResponse> => {
    const response = await api.get<ClientHistoryResponse>(`/clients/${id}/history/`)
    return response.data
  },

  create: async (data: Partial<Client>) => {
    const response = await api.post<Client>('/clients/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Client>) => {
    const response = await api.put<Client>(`/clients/${id}/`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/clients/${id}/`)
  },
}
