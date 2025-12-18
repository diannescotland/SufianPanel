'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'
import { invoicesService } from '@/services/invoices'
import { formatCurrency, formatDate, formatDateTime, getInitials, getStatusColor, cn } from '@/lib/utils'
import { Project, ProjectStatus, Invoice } from '@/types'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Edit,
  Plus,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
  Video,
  Music,
  Layers,
  User,
  Trash2,
} from 'lucide-react'

// Service type icons
const serviceTypeIcons: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  audio: Music,
  both: Layers,
}

// Status options for quick updates
const statusOptions: { value: ProjectStatus; label: string; icon: React.ElementType }[] = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in_progress', label: 'In Progress', icon: Loader2 },
  { value: 'review', label: 'Under Review', icon: AlertCircle },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
]

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl bg-card/50 border border-border/50 p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-7 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>

      {/* Info cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card/50 border border-border/50 p-5">
            <div className="h-4 bg-muted rounded w-1/3 mb-3" />
            <div className="h-6 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl bg-card/50 border border-border/50 p-5">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-4 bg-muted rounded w-3/5" />
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
      <h3 className="font-semibold text-foreground mb-2">Project Not Found</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Link
        href="/projects"
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
          'bg-primary text-primary-foreground font-medium text-sm',
          'hover:bg-primary/90 transition-colors'
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>
    </div>
  )
}

// Project header component
function ProjectHeader({
  project,
  onStatusChange,
  isUpdating,
  onDelete,
  isDeleting,
}: {
  project: Project
  onStatusChange: (status: ProjectStatus) => void
  isUpdating: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  const ServiceIcon = serviceTypeIcons[project.service_type] || Layers

  return (
    <div className={cn(
      'rounded-2xl bg-card/50 backdrop-blur-sm',
      'border border-border/50 p-6'
    )}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Icon and basic info */}
        <div className="flex items-start gap-5 flex-1">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/80 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ServiceIcon className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-foreground truncate">
                {project.title}
              </h1>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium shrink-0 capitalize',
                getStatusColor(project.status)
              )}>
                {project.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ServiceIcon className="w-4 h-4" />
                {project.service_type_display || project.service_type}
              </span>
              {project.client_name && (
                <Link
                  href={`/clients/${project.client}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  {project.client_name}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/projects/${project.id}/edit`}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
              'hover:bg-secondary hover:border-border transition-colors'
            )}
          >
            <Edit className="w-4 h-4" />
            Edit
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
            href={`/invoices/new?project=${project.id}&client=${project.client}`}
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

      {/* Status quick actions */}
      <div className="mt-5 pt-5 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-3">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon
            const isActive = project.status === option.value
            return (
              <button
                key={option.value}
                onClick={() => !isActive && onStatusChange(option.value)}
                disabled={isUpdating || isActive}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary',
                  isUpdating && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className={cn('w-4 h-4', isUpdating && isActive && 'animate-spin')} />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Deadline card component
function DeadlineCard({ project }: { project: Project }) {
  const isOverdue = project.is_overdue
  const daysLeft = project.days_until_deadline
  const isCompleted = project.status === 'completed' || project.status === 'cancelled'

  return (
    <div className={cn(
      'rounded-2xl bg-card/50 backdrop-blur-sm border p-5',
      isOverdue && !isCompleted ? 'border-destructive/30' : 'border-border/50'
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'p-2.5 rounded-xl',
          isOverdue && !isCompleted
            ? 'bg-destructive/10 text-destructive'
            : isCompleted
            ? 'bg-success/10 text-success'
            : 'bg-primary/10 text-primary'
        )}>
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Deadline</p>
          <p className="font-semibold text-foreground">{formatDateTime(project.deadline)}</p>
        </div>
      </div>

      {!isCompleted && (
        <div className={cn(
          'text-sm font-medium',
          isOverdue ? 'text-destructive' : daysLeft != null && daysLeft <= 3 ? 'text-warning' : 'text-muted-foreground'
        )}>
          {isOverdue ? (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Overdue by {Math.abs(daysLeft ?? 0)} days
            </span>
          ) : daysLeft != null && daysLeft === 0 ? (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Due today
            </span>
          ) : daysLeft != null ? (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {daysLeft} days remaining
            </span>
          ) : null}
        </div>
      )}

      {isCompleted && project.completed_at && (
        <div className="text-sm text-success flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Completed on {formatDate(project.completed_at)}
        </div>
      )}
    </div>
  )
}

// Client card component
function ClientCard({ project }: { project: Project }) {
  const clientDetails = project.client_details

  if (!clientDetails) {
    return (
      <Link
        href={`/clients/${project.client}`}
        className={cn(
          'rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5',
          'hover:border-border hover:shadow-xl hover:shadow-black/5 transition-all block'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold text-foreground">{project.client_name}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/clients/${project.client}`}
      className={cn(
        'rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5',
        'hover:border-border hover:shadow-xl hover:shadow-black/5 transition-all block group'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/80 flex items-center justify-center text-white font-semibold shadow-lg shadow-primary/20">
          {getInitials(clientDetails.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">Client</p>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {clientDetails.name}
          </p>
          {clientDetails.company && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {clientDetails.company}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span className="truncate">{clientDetails.email}</span>
        </p>
      </div>
    </Link>
  )
}

// Description section component
function DescriptionSection({ description }: { description: string }) {
  if (!description) {
    return (
      <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
        <h3 className="font-semibold text-foreground mb-3">Description</h3>
        <p className="text-sm text-muted-foreground italic">No description provided</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
      <h3 className="font-semibold text-foreground mb-3">Description</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
    </div>
  )
}

// Invoices section component
function InvoicesSection({ projectId }: { projectId: string }) {
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', { project: projectId }],
    queryFn: () => invoicesService.getAll({ project: projectId }),
  })

  const invoices = invoicesData?.results || []

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Invoices
          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
            {invoices.length}
          </span>
        </h3>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No invoices yet</h3>
          <p className="text-sm text-muted-foreground">
            Create an invoice for this project
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {invoice.invoice_number}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatCurrency(invoice.total_amount)}</span>
                  <span>Due {formatDate(invoice.due_date)}</span>
                </div>
              </div>

              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium shrink-0 capitalize',
                getStatusColor(invoice.payment_status)
              )}>
                {invoice.payment_status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Main page component
export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const projectId = params.id as string
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getById(projectId),
    enabled: !!projectId,
    retry: 1,
  })

  const statusMutation = useMutation({
    mutationFn: (status: ProjectStatus) => projectsService.updateStatus(projectId, status),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['project', projectId], updatedProject)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      router.push('/projects')
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError || !project ? (
          <ErrorState message="The project you're looking for doesn't exist or has been removed." />
        ) : (
          <>
            {/* Project Header with status actions */}
            <ProjectHeader
              project={project}
              onStatusChange={(status) => statusMutation.mutate(status)}
              isUpdating={statusMutation.isPending}
              onDelete={() => setShowDeleteModal(true)}
              isDeleting={deleteMutation.isPending}
            />

            {/* Info cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DeadlineCard project={project} />
              <ClientCard project={project} />
            </div>

            {/* Description */}
            <DescriptionSection description={project.description} />

            {/* Related invoices */}
            <InvoicesSection projectId={projectId} />

            {/* Project metadata footer */}
            <div className="text-xs text-muted-foreground text-center">
              Created {formatDate(project.created_at)}
              {project.updated_at !== project.created_at && (
                <> &middot; Last updated {formatDate(project.updated_at)}</>
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
                      <h2 className="text-lg font-semibold text-foreground">Delete Project</h2>
                      <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-foreground mb-6">
                    Are you sure you want to delete <span className="font-semibold">{project.title}</span>?
                    This will permanently remove the project and all associated data.
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
