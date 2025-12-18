'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsService } from '@/services/clients'
import { formatCurrency, formatDate, getInitials, getStatusColor, cn } from '@/lib/utils'
import { Client, ClientHistoryProject, ClientHistoryInvoice, ClientHistorySummary } from '@/types'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Edit,
  Plus,
  FileText,
  FolderKanban,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react'

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl bg-card/50 border border-border/50 p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card/50 border border-border/50 p-5">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl bg-card/50 border border-border/50 p-5">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-card/50 border border-destructive/30 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Client Not Found</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Link
        href="/clients"
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
          'bg-primary text-primary-foreground font-medium text-sm',
          'hover:bg-primary/90 transition-colors'
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>
    </div>
  )
}

// Client header component
function ClientHeader({
  client,
  isActive,
  onDelete,
  isDeleting,
}: {
  client: Client
  isActive: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className={cn(
      'rounded-2xl bg-card/50 backdrop-blur-sm',
      'border border-border/50 p-6'
    )}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Avatar and basic info */}
        <div className="flex items-start gap-5 flex-1">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/80 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
              {getInitials(client.name)}
            </div>
            {/* Active status indicator */}
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
              isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-foreground truncate">
                {client.name}
              </h1>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-muted-foreground/10 text-muted-foreground'
              )}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {client.company && (
              <p className="text-muted-foreground flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" />
                {client.company}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                {client.email}
              </a>
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {client.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/clients/${client.id}/edit`}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
              'hover:bg-secondary hover:border-border transition-colors'
            )}
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-destructive/10 border border-destructive/30 text-destructive font-medium text-sm',
              'hover:bg-destructive/20 hover:border-destructive/50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <Link
            href={`/projects/new?client=${client.id}`}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
              'hover:bg-secondary hover:border-border transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
          <Link
            href={`/invoices/new?client=${client.id}`}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg shadow-primary/25'
            )}
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Notes section if present */}
      {client.notes && (
        <div className="mt-5 pt-5 border-t border-border/50">
          <p className="text-sm text-muted-foreground">{client.notes}</p>
        </div>
      )}
    </div>
  )
}

// Financial summary cards component
function FinancialSummaryCards({ summary }: { summary: ClientHistorySummary }) {
  const cards = [
    {
      label: 'Total Invoiced',
      value: formatCurrency(summary.total_invoiced),
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/20',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(summary.total_paid),
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-500',
      bgGlow: 'bg-emerald-500/20',
    },
    {
      label: 'Outstanding Balance',
      value: formatCurrency(summary.outstanding_balance),
      icon: AlertCircle,
      color: summary.outstanding_balance > 0
        ? 'from-amber-500 to-orange-500'
        : 'from-emerald-500 to-teal-500',
      bgGlow: summary.outstanding_balance > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20',
      highlight: summary.outstanding_balance > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={cn(
              'group relative overflow-hidden rounded-2xl',
              'bg-card/50 backdrop-blur-sm border border-border/50',
              'p-5 transition-all duration-300',
              'hover:border-border hover:shadow-xl hover:shadow-black/5',
              card.highlight && 'border-warning/30'
            )}
          >
            {/* Background glow */}
            <div className={cn(
              'absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-500',
              card.bgGlow
            )} />

            <div className="relative">
              <div className={cn(
                'inline-flex p-2.5 rounded-xl bg-gradient-to-br shadow-lg mb-4',
                card.color
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <p className="text-2xl font-bold text-foreground tracking-tight">
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Tab navigation component
function TabNavigation({
  activeTab,
  onTabChange,
  projectCount,
  invoiceCount,
}: {
  activeTab: 'projects' | 'invoices'
  onTabChange: (tab: 'projects' | 'invoices') => void
  projectCount: number
  invoiceCount: number
}) {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
      <button
        onClick={() => onTabChange('projects')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'projects'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FolderKanban className="w-4 h-4" />
        Projects
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs',
          activeTab === 'projects' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {projectCount}
        </span>
      </button>
      <button
        onClick={() => onTabChange('invoices')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'invoices'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="w-4 h-4" />
        Invoices
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs',
          activeTab === 'invoices' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {invoiceCount}
        </span>
      </button>
    </div>
  )
}

// Projects list component
function ProjectsList({ projects }: { projects: ClientHistoryProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FolderKanban className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">No projects yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a new project for this client to get started
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {project.title}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Due {formatDate(project.deadline)}
              </span>
            </div>
          </div>

          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium shrink-0 capitalize',
            getStatusColor(project.status)
          )}>
            {project.status.replace('_', ' ')}
          </span>
        </Link>
      ))}
    </div>
  )
}

// Invoices list component
function InvoicesList({ invoices }: { invoices: ClientHistoryInvoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">No invoices yet</h3>
        <p className="text-sm text-muted-foreground">
          Create an invoice for this client to start tracking payments
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Paid
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/invoices/${invoice.id}`}
            >
              <td className="px-4 py-4">
                <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                <p className="text-xs text-muted-foreground">
                  Issued {formatDate(invoice.issued_date)}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-foreground">
                  {formatCurrency(parseFloat(invoice.total_amount))}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className={cn(
                  'font-medium',
                  parseFloat(invoice.amount_paid) > 0 ? 'text-emerald-500' : 'text-muted-foreground'
                )}>
                  {formatCurrency(parseFloat(invoice.amount_paid))}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-muted-foreground">{formatDate(invoice.due_date)}</p>
              </td>
              <td className="px-4 py-4">
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
  )
}

// Main page component
export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const clientId = params.id as string
  const [activeTab, setActiveTab] = useState<'projects' | 'invoices'>('projects')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['client', clientId, 'history'],
    queryFn: () => clientsService.getHistory(clientId),
    enabled: !!clientId,
    retry: 1,
  })

  const deleteMutation = useMutation({
    mutationFn: () => clientsService.delete(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      router.push('/clients')
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError || !data ? (
          <ErrorState message="The client you're looking for doesn't exist or has been removed." />
        ) : (
          <>
            {/* Client Header */}
            <ClientHeader
              client={data.client}
              isActive={data.client.is_active}
              onDelete={() => setShowDeleteModal(true)}
              isDeleting={deleteMutation.isPending}
            />

            {/* Financial Summary */}
            <FinancialSummaryCards summary={data.summary} />

            {/* Tabs and Content */}
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  projectCount={data.projects.length}
                  invoiceCount={data.invoices.length}
                />
              </div>

              {activeTab === 'projects' ? (
                <ProjectsList projects={data.projects} />
              ) : (
                <InvoicesList invoices={data.invoices} />
              )}
            </div>

            {/* Client metadata footer */}
            <div className="text-xs text-muted-foreground text-center">
              Client since {formatDate(data.client.created_at)}
              {data.client.updated_at !== data.client.created_at && (
                <> &middot; Last updated {formatDate(data.client.updated_at)}</>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowDeleteModal(false)}
                />
                <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Delete Client</h2>
                      <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-foreground mb-6">
                    Are you sure you want to delete <span className="font-semibold">{data.client.name}</span>?
                    This will deactivate the client and hide them from lists.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl',
                        'bg-secondary/50 border border-border/50 text-foreground font-medium',
                        'hover:bg-secondary transition-colors'
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl',
                        'bg-destructive text-destructive-foreground font-medium',
                        'hover:bg-destructive/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
