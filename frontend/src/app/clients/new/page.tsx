'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  AlertCircle,
  Wifi,
  Clock,
  Server,
  ShieldAlert,
} from 'lucide-react'
import { categorizeError, CategorizedError } from '@/services/api'

// Validation schema
const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  company: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function NewClientPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorDetails, setErrorDetails] = useState<CategorizedError | null>(null)

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

  const createMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientsService.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setErrorDetails(null)
      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/clients/${newClient.id}`)
      }, 1500)
    },
    onError: (error) => {
      setErrorDetails(categorizeError(error))
    },
  })

  const onSubmit = (data: ClientFormData) => {
    createMutation.mutate(data)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">New Client</h1>
          <p className="text-muted-foreground">Add a new client to your business</p>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-success font-medium">Client created successfully! Redirecting...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
            {/* Name field */}
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
                    'bg-secondary/50 border',
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

            {/* Email field */}
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
                    'bg-secondary/50 border',
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

            {/* Phone field */}
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
                    'bg-secondary/50 border',
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

            {/* Company field (optional) */}
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
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>

            {/* Notes field (optional) */}
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
          {createMutation.isError && errorDetails && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                {errorDetails.type === 'network' && <Wifi className="w-4 h-4 text-destructive" />}
                {errorDetails.type === 'timeout' && <Clock className="w-4 h-4 text-destructive" />}
                {errorDetails.type === 'server' && <Server className="w-4 h-4 text-destructive" />}
                {errorDetails.type === 'validation' && <AlertCircle className="w-4 h-4 text-destructive" />}
                {errorDetails.type === 'auth' && <ShieldAlert className="w-4 h-4 text-destructive" />}
                {(errorDetails.type === 'cors' || errorDetails.type === 'unknown') && <AlertCircle className="w-4 h-4 text-destructive" />}
                <p className="text-destructive font-medium">
                  {errorDetails.type === 'network' && 'Connection Error'}
                  {errorDetails.type === 'timeout' && 'Request Timeout'}
                  {errorDetails.type === 'server' && 'Server Error'}
                  {errorDetails.type === 'validation' && 'Validation Error'}
                  {errorDetails.type === 'auth' && 'Authentication Error'}
                  {errorDetails.type === 'cors' && 'Connection Blocked'}
                  {errorDetails.type === 'unknown' && 'Error'}
                </p>
              </div>
              <p className="text-destructive/80 text-sm">{errorDetails.message}</p>
              {errorDetails.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted/50 rounded-lg overflow-auto text-muted-foreground">
                    {errorDetails.details}
                  </pre>
                </details>
              )}
              {errorDetails.type === 'network' && (
                <div className="text-xs text-muted-foreground border-t border-border/50 pt-3 mt-2">
                  <p className="font-medium mb-1">Troubleshooting:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Verify Django is running: <code className="bg-muted px-1 rounded">python manage.py runserver</code></li>
                    <li>Check it&apos;s on port 8000: <code className="bg-muted px-1 rounded">http://localhost:8000/api/</code></li>
                    <li>Restart Next.js after any .env changes</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/clients"
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
              disabled={isSubmitting || createMutation.isPending || showSuccess}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium text-sm',
                'hover:bg-primary/90 transition-colors',
                'shadow-lg shadow-primary/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {(isSubmitting || createMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
