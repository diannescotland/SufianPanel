// Client Types
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  // Moroccan business fields
  ice_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
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
  title: string
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
  // Moroccan invoice fields
  deposit_amount: number | null
  tva_rate: number
  tva_amount?: number
  total_with_tva?: number
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
  // Pricing tiers
  free_price: number
  standard_price: number
  pro_price: number
  premier_price: number | null
  // Credits per tier
  free_credits: number
  standard_credits: number
  pro_credits: number
  premier_credits: number | null
  // Per unit pricing
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

// Subscription Types (Credit Tracking)
export type ToolType = 'image' | 'video' | 'audio' | 'both'
export type PricingModel = 'monthly' | 'credits' | 'per_use'
export type GenerationType = 'image' | 'video' | 'audio' | 'other'

export interface AITool {
  id: string
  name: string
  display_name: string
  tool_type: ToolType
  pricing_model: PricingModel
  default_monthly_cost_mad: number
  default_credits_per_month: number
  default_cost_per_image_mad: number
  default_cost_per_video_second_mad: number
  // Pricing tiers (Free / Standard / Pro / Premier)
  free_monthly_cost_mad: number
  free_credits_per_month: number
  free_features: string
  standard_monthly_cost_mad: number | null
  standard_credits_per_month: number | null
  standard_features: string
  pro_monthly_cost_mad: number | null
  pro_credits_per_month: number | null
  pro_features: string
  premier_monthly_cost_mad: number | null
  premier_credits_per_month: number | null
  premier_features: string
  icon: string
  is_active: boolean
}

export interface Subscription {
  id: string
  tool: string
  tool_name?: string
  tool_type?: ToolType
  billing_month: string
  total_cost_mad: number
  original_amount?: number | null
  original_currency: string
  exchange_rate?: number | null
  total_credits?: number | null
  credits_remaining?: number | null
  cost_per_credit_mad?: number | null
  credits_used?: number
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreditUsage {
  id: string
  subscription: string
  tool_name?: string
  client: string
  client_name?: string
  project?: string | null
  project_title?: string | null
  generation_type: GenerationType
  credits_used: number
  items_generated: number
  video_seconds: number
  calculated_cost_mad: number
  manual_cost_mad?: number | null
  final_cost_mad?: number
  description: string
  usage_date: string
  created_at: string
}

export interface ClientServiceSelection {
  id: string
  client: string
  tool: string
  tool_name?: string
  tool_type?: ToolType
  is_active: boolean
  added_at: string
  notes: string
}

export interface ClientCostSummary {
  client_id: string
  client_name: string
  company?: string | null
  total_cost_mad: number
  total_credits_used: number
  total_items_generated: number
  breakdown_by_tool: {
    tool_name: string
    cost_mad: number
    credits: number
    items: number
  }[]
}

export interface MonthlyOverview {
  month: string
  month_key: string
  total_cost_mad: number
  subscriptions: {
    tool: string
    tool_type: ToolType
    cost_mad: number
    original_amount?: number | null
    original_currency: string
    credits_total?: number | null
    credits_used: number
    credits_remaining?: number | null
    cost_per_credit_mad?: number | null
  }[]
}
