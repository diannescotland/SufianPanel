'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientsService } from '@/services/clients'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useEffect } from 'react'

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  company: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const queryClient = useQueryClient()
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsService.getById(clientId),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company || '',
        notes: client.notes || '',
      })
    }
  }, [client, reset])

  const updateMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientsService.update(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/clients/${clientId}`)
      }, 1500)
    },
  })

  const onSubmit = (data: ClientFormData) => {
    updateMutation.mutate(data)
  }

  if (clientLoading) {
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
        <Link
          href={`/clients/${clientId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground">Update client information</p>
        </div>

        {showSuccess && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-success font-medium">Client updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-muted border',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.name ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-muted border',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.email ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-muted border',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.phone ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('company')}
                  type="text"
                  id="company"
                  placeholder="Acme Inc."
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-muted border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Notes <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={4}
                  placeholder="Any additional notes about this client..."
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-muted border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all resize-none'
                  )}
                />
              </div>
            </div>
          </div>

          {updateMutation.isError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4">
              <p className="text-destructive text-sm font-medium">Failed to update client</p>
              <p className="text-destructive/80 text-xs mt-1">
                {(updateMutation.error as Error)?.message || 'Please try again.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/clients/${clientId}`}
              className={cn(
                'px-5 py-2.5 rounded-xl',
                'bg-muted border border-border/50 text-foreground font-medium text-sm',
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
