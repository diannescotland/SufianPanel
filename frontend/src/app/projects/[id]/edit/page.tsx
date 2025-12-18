'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'
import { clientsService } from '@/services/clients'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  FolderKanban,
  User,
  FileText,
  Calendar,
  Image,
  Video,
  Music,
  Layers,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { ServiceType } from '@/types'

// Service type options
const serviceTypes: { value: ServiceType; label: string; icon: typeof Image; color: string }[] = [
  { value: 'image', label: 'Image Generation', icon: Image, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  { value: 'video', label: 'Video Generation', icon: Video, color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { value: 'audio', label: 'Audio Generation', icon: Music, color: 'bg-pink-500/10 text-pink-500 border-pink-500/30' },
  { value: 'both', label: 'Image & Video', icon: Layers, color: 'bg-primary/10 text-primary border-primary/30' },
]

// Validation schema
const projectSchema = z.object({
  client: z.string().min(1, 'Please select a client'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  service_type: z.enum(['image', 'video', 'audio', 'both'], {
    message: 'Please select a service type',
  }),
  deadline: z.string().min(1, 'Please select a deadline'),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const queryClient = useQueryClient()
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch existing project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getById(projectId),
  })

  // Fetch clients for dropdown
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', { is_active: true }],
    queryFn: () => clientsService.getAll({ is_active: true }),
  })

  const clients = clientsData?.results || []

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client: '',
      title: '',
      description: '',
      service_type: undefined,
      deadline: '',
    },
  })

  // Populate form when project data is loaded
  useEffect(() => {
    if (project) {
      reset({
        client: project.client,
        title: project.title,
        description: project.description || '',
        service_type: project.service_type as ServiceType,
        deadline: project.deadline ? project.deadline.slice(0, 16) : '',
      })
    }
  }, [project, reset])

  const selectedServiceType = watch('service_type')

  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsService.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/projects/${projectId}`)
      }, 1500)
    },
  })

  const onSubmit = (data: ProjectFormData) => {
    updateMutation.mutate(data)
  }

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-success font-medium">Project updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
            {/* Client selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-foreground mb-2">
                Client <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  {...register('client')}
                  id="client"
                  disabled={clientsLoading}
                  className={cn(
                    'w-full pl-11 pr-10 py-3 rounded-xl appearance-none',
                    'bg-secondary/50 border',
                    'text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all cursor-pointer',
                    errors.client ? 'border-destructive/50' : 'border-border/50',
                    clientsLoading && 'opacity-50'
                  )}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.client && (
                <p className="mt-1.5 text-sm text-destructive">{errors.client.message}</p>
              )}
            </div>

            {/* Project title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Project Title <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <FolderKanban className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  placeholder="E.g., Product Launch Video"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-secondary/50 border',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.title ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.title && (
                <p className="mt-1.5 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Service type selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedServiceType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setValue('service_type', type.value, { shouldValidate: true })}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                        isSelected
                          ? type.color + ' border-2'
                          : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isSelected ? '' : 'text-muted-foreground')} />
                      <span className={cn(
                        'font-medium text-sm',
                        isSelected ? '' : 'text-muted-foreground'
                      )}>
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('service_type')} />
              {errors.service_type && (
                <p className="mt-1.5 text-sm text-destructive">{errors.service_type.message}</p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
                Deadline <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('deadline')}
                  type="datetime-local"
                  id="deadline"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-secondary/50 border',
                    'text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.deadline ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.deadline && (
                <p className="mt-1.5 text-sm text-destructive">{errors.deadline.message}</p>
              )}
            </div>

            {/* Description (optional) */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  placeholder="Describe the project requirements, specifications, and any special instructions..."
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all resize-none'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {updateMutation.isError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4">
              <p className="text-destructive text-sm font-medium">Failed to update project</p>
              <p className="text-destructive/80 text-xs mt-1">
                {(updateMutation.error as Error)?.message || 'Please try again.'}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/projects/${projectId}`}
              className={cn(
                'px-5 py-2.5 rounded-xl',
                'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
                'hover:bg-secondary hover:border-border transition-colors'
              )}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending || showSuccess}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium text-sm',
                'hover:bg-primary/90 transition-colors',
                'shadow-lg shadow-primary/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {(isSubmitting || updateMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
