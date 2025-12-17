'use client'

import { useState, useMemo, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { invoicesService } from '@/services/invoices'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  LayoutGrid,
  List,
} from 'lucide-react'
import Link from 'next/link'
import { PaymentStatus } from '@/types'

const statusFilters: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

const statusIcons: Record<PaymentStatus, typeof CheckCircle2> = {
  unpaid: Clock,
  partial: AlertCircle,
  paid: CheckCircle2,
  overdue: AlertCircle,
}

// Debounce delay in milliseconds
const SEARCH_DEBOUNCE_MS = 300

export default function InvoicesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [search])

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', { search: debouncedSearch, payment_status: statusFilter === 'all' ? undefined : statusFilter }],
    queryFn: () => invoicesService.getAll({
      search: debouncedSearch || undefined,
      payment_status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  })

  const invoices = invoicesData?.results || []

  // Calculate totals with useMemo to avoid recalculation on every render
  const totals = useMemo(() =>
    invoices.reduce(
      (acc, inv) => ({
        total: acc.total + inv.total_amount,
        paid: acc.paid + inv.amount_paid,
        outstanding: acc.outstanding + (inv.total_amount - inv.amount_paid),
      }),
      { total: 0, paid: 0, outstanding: 0 }
    ),
    [invoices]
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and track payments</p>
          </div>
          <Link
            href="/invoices/new"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg shadow-primary/25'
            )}
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Invoiced</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.total)}</p>
          </div>
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totals.paid)}</p>
          </div>
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm text-muted-foreground">Outstanding</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              totals.outstanding > 0 ? 'text-amber-500' : 'text-foreground'
            )}>
              {formatCurrency(totals.outstanding)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                'transition-all'
              )}
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoices grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-card/50 border border-border/50 p-5 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.payment_status]
                const progress = invoice.total_amount > 0
                  ? (invoice.amount_paid / invoice.total_amount) * 100
                  : 0
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className={cn(
                      'group relative rounded-2xl bg-card/50 backdrop-blur-sm',
                      'border border-border/50 hover:border-border',
                      'p-5 transition-all duration-200',
                      'hover:shadow-xl hover:shadow-black/5',
                      invoice.payment_status === 'overdue' && 'border-destructive/30'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        invoice.payment_status === 'paid' && 'bg-emerald-500/10 text-emerald-500',
                        invoice.payment_status === 'partial' && 'bg-amber-500/10 text-amber-500',
                        invoice.payment_status === 'unpaid' && 'bg-muted text-muted-foreground',
                        invoice.payment_status === 'overdue' && 'bg-destructive/10 text-destructive'
                      )}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {invoice.invoice_number}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {invoice.client_name}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium shrink-0 capitalize',
                        getStatusColor(invoice.payment_status)
                      )}>
                        {invoice.payment_status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-2xl font-bold text-foreground">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(invoice.amount_paid)} paid
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            invoice.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-primary'
                          )}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Due {formatDate(invoice.due_date)}</span>
                      </div>
                      {invoice.is_overdue && (
                        <span className="text-xs font-medium text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No invoices found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first invoice to get started'}
                </p>
                {!search && statusFilter === 'all' && (
                  <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">
                              Issued {formatDate(invoice.issued_date)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-muted-foreground">{invoice.client_name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className={cn(
                            'font-medium',
                            invoice.amount_paid > 0 ? 'text-emerald-500' : 'text-muted-foreground'
                          )}>
                            {formatCurrency(invoice.amount_paid)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className={cn(
                            'text-sm',
                            invoice.is_overdue ? 'text-destructive' : 'text-muted-foreground'
                          )}>
                            {formatDate(invoice.due_date)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                            getStatusColor(invoice.payment_status)
                          )}>
                            {invoice.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No invoices found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first invoice to get started'}
                </p>
                {!search && statusFilter === 'all' && (
                  <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination info */}
        {invoicesData && invoicesData.count > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground">
              Showing {invoices.length} of {invoicesData.count} invoices
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
