import api from './api'
import { Invoice, Payment, InvoiceItem, PaginatedResponse, PaymentStatus } from '@/types'

export const invoicesService = {
  getAll: async (params?: {
    client?: string
    project?: string
    payment_status?: PaymentStatus
    search?: string
    page?: number
  }) => {
    const response = await api.get<PaginatedResponse<Invoice>>('/invoices/', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Invoice>(`/invoices/${id}/`)
    return response.data
  },

  getOverdue: async () => {
    const response = await api.get<Invoice[]>('/invoices/overdue/')
    return response.data
  },

  create: async (data: Partial<Invoice> & { items?: Partial<InvoiceItem>[] }) => {
    const response = await api.post<Invoice>('/invoices/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Invoice>) => {
    const response = await api.put<Invoice>(`/invoices/${id}/`, data)
    return response.data
  },

  addItem: async (invoiceId: string, item: Partial<InvoiceItem>) => {
    const response = await api.post<Invoice>(`/invoices/${invoiceId}/add_item/`, item)
    return response.data
  },

  recordPayment: async (invoiceId: string, payment: Partial<Payment>) => {
    const response = await api.post<Invoice>(`/invoices/${invoiceId}/record_payment/`, payment)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/invoices/${id}/`)
  },
}

export const paymentsService = {
  getAll: async (params?: { invoice?: string; payment_method?: string; page?: number }) => {
    const response = await api.get<PaginatedResponse<Payment>>('/payments/', { params })
    return response.data
  },

  getByInvoice: async (invoiceId: string) => {
    const response = await api.get<Payment[]>('/payments/by_invoice/', {
      params: { invoice_id: invoiceId }
    })
    return response.data
  },
}
