'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesService } from '@/services/invoices'
import { clientsService } from '@/services/clients'
import { projectsService } from '@/services/projects'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCurrency, cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  User,
  FolderKanban,
  Calendar,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  ChevronDown,
  DollarSign,
} from 'lucide-react'

// Validation schema
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be positive'),
})

const invoiceSchema = z.object({
  client: z.string().min(1, 'Please select a client'),
  project: z.string().min(1, 'Please select a project'),
  due_date: z.string().min(1, 'Please select a due date'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one line item'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

// Type for the create API
interface InvoiceCreatePayload {
  client: string
  project: string
  due_date: string
  notes?: string
  total_amount: number
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [showSuccess, setShowSuccess] = useState(false)

  // Get pre-selected values from URL params
  const preselectedClientId = searchParams.get('client')
  const preselectedProjectId = searchParams.get('project')

  // Set default due date to 14 days from now
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  const defaultDueDateStr = defaultDueDate.toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client: preselectedClientId || '',
      project: preselectedProjectId || '',
      due_date: defaultDueDateStr,
      notes: '',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const selectedClientId = watch('client')
  const items = watch('items')

  // Calculate total
  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)

  // Fetch clients
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', { is_active: true }],
    queryFn: () => clientsService.getAll({ is_active: true }),
  })

  // Fetch projects for selected client
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', { client: selectedClientId }],
    queryFn: () => projectsService.getAll({ client: selectedClientId || undefined }),
    enabled: !!selectedClientId,
  })

  const clients = clientsData?.results || []
  const projects = projectsData?.results || []

  // Reset project when client changes
  useEffect(() => {
    if (!preselectedProjectId) {
      setValue('project', '')
    }
  }, [selectedClientId, setValue, preselectedProjectId])

  const createMutation = useMutation({
    mutationFn: (data: InvoiceFormData) => {
      const payload: InvoiceCreatePayload = {
        client: data.client,
        project: data.project,
        due_date: data.due_date,
        notes: data.notes,
        total_amount: total,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }
      return invoicesService.create(payload as any)
    },
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/invoices/${newInvoice.id}`)
      }, 1500)
    },
  })

  const onSubmit = (data: InvoiceFormData) => {
    createMutation.mutate(data)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for a client</p>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-success font-medium">Invoice created successfully! Redirecting...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client & Project selection */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Invoice Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      errors.client ? 'border-destructive/50' : 'border-border/50'
                    )}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.client && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.client.message}</p>
                )}
              </div>

              {/* Project selection */}
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-foreground mb-2">
                  Project <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <FolderKanban className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    {...register('project')}
                    id="project"
                    disabled={!selectedClientId || projectsLoading}
                    className={cn(
                      'w-full pl-11 pr-10 py-3 rounded-xl appearance-none',
                      'bg-secondary/50 border',
                      'text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                      'transition-all cursor-pointer',
                      errors.project ? 'border-destructive/50' : 'border-border/50',
                      (!selectedClientId || projectsLoading) && 'opacity-50'
                    )}
                  >
                    <option value="">
                      {!selectedClientId ? 'Select a client first...' : 'Select a project...'}
                    </option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.project && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.project.message}</p>
                )}
              </div>
            </div>

            {/* Due date */}
            <div className="max-w-xs">
              <label htmlFor="due_date" className="block text-sm font-medium text-foreground mb-2">
                Due Date <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('due_date')}
                  type="date"
                  id="due_date"
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-xl',
                    'bg-secondary/50 border',
                    'text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all',
                    errors.due_date ? 'border-destructive/50' : 'border-border/50'
                  )}
                />
              </div>
              {errors.due_date && (
                <p className="mt-1.5 text-sm text-destructive">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Line Items</h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                  'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
                )}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {errors.items?.root && (
              <p className="text-sm text-destructive">{errors.items.root.message}</p>
            )}

            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              {fields.map((field, index) => {
                const qty = Number(items[index]?.quantity) || 0
                const price = Number(items[index]?.unit_price) || 0
                const lineTotal = qty * price

                return (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                    {/* Description */}
                    <div className="col-span-6">
                      <input
                        {...register(`items.${index}.description`)}
                        type="text"
                        placeholder="Service description..."
                        className={cn(
                          'w-full px-4 py-2.5 rounded-xl',
                          'bg-secondary/50 border',
                          'text-foreground placeholder:text-muted-foreground/60 text-sm',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                          errors.items?.[index]?.description ? 'border-destructive/50' : 'border-border/50'
                        )}
                      />
                      {errors.items?.[index]?.description && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <input
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        placeholder="1"
                        className={cn(
                          'w-full px-3 py-2.5 rounded-xl',
                          'bg-secondary/50 border border-border/50',
                          'text-foreground text-sm text-center',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                        )}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">MAD</span>
                        <input
                          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={cn(
                            'w-full pl-12 pr-3 py-2.5 rounded-xl',
                            'bg-secondary/50 border border-border/50',
                            'text-foreground text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                          )}
                        />
                      </div>
                    </div>

                    {/* Line total & Delete */}
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(lineTotal)}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-4">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes <span className="text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
              <textarea
                {...register('notes')}
                id="notes"
                rows={3}
                placeholder="Payment terms, additional information..."
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

          {/* Error message */}
          {createMutation.isError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4">
              <p className="text-destructive text-sm">
                Failed to create invoice. Please try again.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/invoices"
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
              disabled={isSubmitting || createMutation.isPending || showSuccess || total === 0}
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
                <>
                  Create Invoice ({formatCurrency(total)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
