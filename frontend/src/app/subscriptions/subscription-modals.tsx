'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  subscriptionsService,
  creditUsageService,
} from '@/services/subscriptions'
import { cn } from '@/lib/utils'
import {
  X,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react'

// Types
interface ApiErrorResponse {
  non_field_errors?: string[]
  detail?: string
  [key: string]: string | string[] | undefined
}

interface AITool {
  id: string
  display_name: string
  tool_type: string
}

interface Client {
  id: string
  name: string
}

interface Subscription {
  id: string
  tool_name: string
  total_cost_mad: number
  total_credits: number | null
  notes: string | null
}

type GenerationType = 'image' | 'video' | 'audio' | 'other'

// Add Subscription Modal Component
export function AddSubscriptionModal({
  tools,
  onClose,
  onSuccess,
}: {
  tools: AITool[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [toolId, setToolId] = useState('')
  const [costMad, setCostMad] = useState('')
  const [totalCredits, setTotalCredits] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: subscriptionsService.create,
    onSuccess,
    onError: (err: AxiosError<ApiErrorResponse>) => {
      console.error('Subscription creation error:', err)
      const responseData = err?.response?.data

      if (responseData && typeof responseData === 'object') {
        if (responseData.non_field_errors) {
          setError(responseData.non_field_errors.join(', '))
          return
        }
        const fieldErrors = Object.entries(responseData)
          .filter(([key]) => key !== 'detail')
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        if (fieldErrors.length > 0) {
          setError(fieldErrors.join('; '))
          return
        }
        if (responseData.detail) {
          setError(responseData.detail)
          return
        }
      }
      setError(err?.message || 'Failed to create subscription')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!toolId || !costMad) return

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const billingMonth = `${year}-${month}-01`

    createMutation.mutate({
      tool: toolId,
      billing_month: billingMonth,
      total_cost_mad: parseFloat(costMad),
      total_credits: totalCredits ? parseInt(totalCredits) : undefined,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6"
        role="dialog"
        aria-labelledby="add-subscription-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="add-subscription-title" className="text-lg font-semibold text-foreground">
            Add Subscription
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tool-select" className="block text-sm font-medium text-foreground mb-2">
              AI Tool
            </label>
            <select
              id="tool-select"
              value={toolId}
              onChange={(e) => setToolId(e.target.value)}
              required
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              <option value="">Select a tool... ({tools.length} available)</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cost-input" className="block text-sm font-medium text-foreground mb-2">
              Monthly Cost (MAD)
            </label>
            <input
              id="cost-input"
              type="number"
              value={costMad}
              onChange={(e) => setCostMad(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div>
            <label htmlFor="credits-input" className="block text-sm font-medium text-foreground mb-2">
              Total Credits (optional)
            </label>
            <input
              id="credits-input"
              type="number"
              value={totalCredits}
              onChange={(e) => setTotalCredits(e.target.value)}
              min="0"
              placeholder="Leave empty if unlimited"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div>
            <label htmlFor="notes-input" className="block text-sm font-medium text-foreground mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes about this subscription..."
              className={cn(
                'w-full px-4 py-2.5 rounded-xl resize-none',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50 text-foreground font-medium',
                'hover:bg-secondary transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !toolId || !costMad}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden="true" />
              ) : (
                'Add Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Log Usage Modal Component
export function LogUsageModal({
  tools,
  clients,
  onClose,
  onSuccess,
}: {
  tools: AITool[]
  clients: Client[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [toolId, setToolId] = useState('')
  const [clientId, setClientId] = useState('')
  const [generationType, setGenerationType] = useState<GenerationType>('image')
  const [itemsGenerated, setItemsGenerated] = useState('1')
  const [creditsUsed, setCreditsUsed] = useState('')
  const [videoSeconds, setVideoSeconds] = useState('')
  const [description, setDescription] = useState('')

  const logMutation = useMutation({
    mutationFn: creditUsageService.logGeneration,
    onSuccess,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!toolId || !clientId) return

    logMutation.mutate({
      tool_id: toolId,
      client_id: clientId,
      generation_type: generationType,
      items_generated: parseInt(itemsGenerated) || 1,
      credits_used: creditsUsed ? parseInt(creditsUsed) : undefined,
      video_seconds: videoSeconds ? parseInt(videoSeconds) : undefined,
      description,
    })
  }

  const selectedTool = tools.find((t) => t.id === toolId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6"
        role="dialog"
        aria-labelledby="log-usage-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="log-usage-title" className="text-lg font-semibold text-foreground">Log Generation</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="log-tool-select" className="block text-sm font-medium text-foreground mb-2">
              AI Tool
            </label>
            <select
              id="log-tool-select"
              value={toolId}
              onChange={(e) => {
                setToolId(e.target.value)
                const tool = tools.find((t) => t.id === e.target.value)
                if (tool?.tool_type === 'video') setGenerationType('video')
                else if (tool?.tool_type === 'audio') setGenerationType('audio')
                else setGenerationType('image')
              }}
              required
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              <option value="">Select a tool...</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-foreground mb-2">
              Client
            </label>
            <select
              id="client-select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type-select" className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select
                id="type-select"
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl',
                  'bg-muted border border-border/50',
                  'text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="items-input" className="block text-sm font-medium text-foreground mb-2">
                Items Generated
              </label>
              <input
                id="items-input"
                type="number"
                value={itemsGenerated}
                onChange={(e) => setItemsGenerated(e.target.value)}
                min="1"
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl',
                  'bg-muted border border-border/50',
                  'text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              />
            </div>
          </div>

          {selectedTool?.tool_type === 'video' && (
            <div>
              <label htmlFor="video-seconds-input" className="block text-sm font-medium text-foreground mb-2">
                Video Duration (seconds)
              </label>
              <input
                id="video-seconds-input"
                type="number"
                value={videoSeconds}
                onChange={(e) => setVideoSeconds(e.target.value)}
                min="0"
                placeholder="e.g., 30"
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl',
                  'bg-muted border border-border/50',
                  'text-foreground placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              />
            </div>
          )}

          <div>
            <label htmlFor="credits-used-input" className="block text-sm font-medium text-foreground mb-2">
              Credits Used (optional)
            </label>
            <input
              id="credits-used-input"
              type="number"
              value={creditsUsed}
              onChange={(e) => setCreditsUsed(e.target.value)}
              min="0"
              placeholder="Leave empty for auto-calculation"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div>
            <label htmlFor="description-input" className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <input
              id="description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Product images for campaign"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50 text-foreground font-medium',
                'hover:bg-secondary transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logMutation.isPending}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {logMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden="true" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Log Usage
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Subscription Modal Component
export function EditSubscriptionModal({
  subscription,
  onClose,
  onSuccess,
}: {
  subscription: Subscription
  onClose: () => void
  onSuccess: () => void
}) {
  const [costMad, setCostMad] = useState(String(subscription.total_cost_mad))
  const [totalCredits, setTotalCredits] = useState(
    subscription.total_credits ? String(subscription.total_credits) : ''
  )
  const [notes, setNotes] = useState(subscription.notes || '')
  const [error, setError] = useState<string | null>(null)

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Subscription>) =>
      subscriptionsService.update(subscription.id, data),
    onSuccess,
    onError: (err: AxiosError<ApiErrorResponse>) => {
      console.error('Subscription update error:', err)
      const responseData = err?.response?.data
      if (responseData && typeof responseData === 'object') {
        if (responseData.non_field_errors) {
          setError(responseData.non_field_errors.join(', '))
          return
        }
        const fieldErrors = Object.entries(responseData)
          .filter(([key]) => key !== 'detail')
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        if (fieldErrors.length > 0) {
          setError(fieldErrors.join('; '))
          return
        }
        if (responseData.detail) {
          setError(responseData.detail)
          return
        }
      }
      setError(err?.message || 'Failed to update subscription')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!costMad) return

    updateMutation.mutate({
      total_cost_mad: parseFloat(costMad),
      total_credits: totalCredits ? parseInt(totalCredits) : null,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6"
        role="dialog"
        aria-labelledby="edit-subscription-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="edit-subscription-title" className="text-lg font-semibold text-foreground">Edit Subscription</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              AI Tool
            </label>
            <div className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground">
              {subscription.tool_name}
            </div>
          </div>

          <div>
            <label htmlFor="edit-cost-input" className="block text-sm font-medium text-foreground mb-2">
              Monthly Cost (MAD)
            </label>
            <input
              id="edit-cost-input"
              type="number"
              value={costMad}
              onChange={(e) => setCostMad(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div>
            <label htmlFor="edit-credits-input" className="block text-sm font-medium text-foreground mb-2">
              Total Credits (optional)
            </label>
            <input
              id="edit-credits-input"
              type="number"
              value={totalCredits}
              onChange={(e) => setTotalCredits(e.target.value)}
              min="0"
              placeholder="Leave empty if unlimited"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          <div>
            <label htmlFor="edit-notes-input" className="block text-sm font-medium text-foreground mb-2">
              Notes (optional)
            </label>
            <textarea
              id="edit-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes about this subscription..."
              className={cn(
                'w-full px-4 py-2.5 rounded-xl resize-none',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50 text-foreground font-medium',
                'hover:bg-secondary transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !costMad}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden="true" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Subscription Modal Component
export function DeleteSubscriptionModal({
  subscription,
  onClose,
  onSuccess,
}: {
  subscription: Subscription
  onClose: () => void
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => subscriptionsService.delete(subscription.id),
    onSuccess,
    onError: (err: AxiosError<ApiErrorResponse>) => {
      console.error('Subscription delete error:', err)
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete subscription')
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6"
        role="alertdialog"
        aria-labelledby="delete-subscription-title"
        aria-describedby="delete-subscription-description"
        aria-modal="true"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <h2 id="delete-subscription-title" className="text-lg font-semibold text-foreground">
              Delete Subscription
            </h2>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>

        <p id="delete-subscription-description" className="text-foreground mb-6">
          Are you sure you want to delete the subscription for{' '}
          <span className="font-semibold">{subscription.tool_name}</span>?
          This will also remove all associated usage records.
        </p>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl',
              'bg-muted border border-border/50 text-foreground font-medium',
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
              <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden="true" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
