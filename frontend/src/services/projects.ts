import api from './api'
import { Project, PaginatedResponse, ProjectStatus } from '@/types'

export const projectsService = {
  getAll: async (params?: {
    client?: string
    status?: ProjectStatus
    service_type?: string
    search?: string
    page?: number
  }) => {
    const response = await api.get<PaginatedResponse<Project>>('/projects/', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Project>(`/projects/${id}/`)
    return response.data
  },

  getDeadlines: async (days: number = 7) => {
    const response = await api.get<Project[]>('/projects/deadlines/', { params: { days } })
    return response.data
  },

  getCalendar: async (month: number, year: number) => {
    const response = await api.get('/projects/calendar/', { params: { month, year } })
    return response.data
  },

  create: async (data: Partial<Project>) => {
    const response = await api.post<Project>('/projects/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await api.put<Project>(`/projects/${id}/`, data)
    return response.data
  },

  updateStatus: async (id: string, status: ProjectStatus) => {
    const response = await api.post<Project>(`/projects/${id}/update_status/`, { status })
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/projects/${id}/`)
  },
}
