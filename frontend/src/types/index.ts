// Client Types
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  total_projects?: number
  total_invoiced?: number
  total_paid?: number
  outstanding_balance?: number
}

// Project Types
export type ProjectStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type ServiceType = 'image' | 'video' | 'audio' | 'both'

export interface Project {
  id: string
  client: string
  client_name?: string
  client_details?: Client
  title: string
  description: string
  service_type: ServiceType
  service_type_display?: string
  status: ProjectStatus
  status_display?: string
  deadline: string
  created_at: string
  updated_at: string
  completed_at: string | null
  is_overdue?: boolean
  days_until_deadline?: number | null
}

// Invoice Types
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'paypal' | 'stripe' | 'other'

export interface InvoiceItem {
  id: string
  service: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Payment {
  id: string
  invoice: string
  amount: number
  payment_method: PaymentMethod
  payment_method_display?: string
  payment_date: string
  notes: string
  transaction_id: string | null
}

export interface Invoice {
  id: string
  invoice_number: string
  project: string
  project_title?: string
  client: string
  client_name?: string
  total_amount: number
  amount_paid: number
  amount_remaining?: number
  payment_status: PaymentStatus
  payment_status_display?: string
  due_date: string
  issued_date: string
  notes: string
  pdf_file: string | null
  is_overdue?: boolean
  items?: InvoiceItem[]
  payments?: Payment[]
}

// Service Types
export interface Service {
  id: string
  name: string
  service_type: ServiceType
  service_type_display?: string
  ai_tool: string
  ai_tool_display?: string
  base_price: number
  price_per_unit: number
  unit_name: string
  description: string
  is_active: boolean
}

export interface ServicePricing {
  id: string
  ai_tool: string
  display_name: string
  service_type: ServiceType
  service_type_display?: string
  basic_price: number
  standard_price: number
  premium_price: number
  price_per_image: number
  price_per_video_second: number
  description: string
  features: string[]
  is_active: boolean
  updated_at: string
}

// Analytics Types
export interface OverviewStats {
  total_revenue: number
  this_month_revenue: number
  revenue_change: number
  active_clients: number
  pending_invoices: number
  pending_amount: number
  overdue_invoices: number
  overdue_amount: number
  projects_this_month: number
  avg_project_value: number
}

export interface RevenueDataPoint {
  period: string
  total: number
  count: number
}

export interface RevenueData {
  period: string
  data: RevenueDataPoint[]
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Client History Types (for /clients/{id}/history/ endpoint)
export interface ClientHistoryProject {
  id: string
  title: string
  status: ProjectStatus
  deadline: string
  created_at: string
}

export interface ClientHistoryInvoice {
  id: string
  invoice_number: string
  total_amount: string
  amount_paid: string
  payment_status: PaymentStatus
  due_date: string
  issued_date: string
}

export interface ClientHistorySummary {
  total_projects: number
  total_invoiced: number
  total_paid: number
  outstanding_balance: number
}

export interface ClientHistoryResponse {
  client: Client
  projects: ClientHistoryProject[]
  invoices: ClientHistoryInvoice[]
  summary: ClientHistorySummary
}

// Auth Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
}
