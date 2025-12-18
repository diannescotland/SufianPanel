'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  subscriptionsService,
  subscriptionAnalyticsService,
  aiToolsService,
} from '@/services/subscriptions'
import { clientsService } from '@/services/clients'
import { formatCurrency, cn } from '@/lib/utils'
import {
  CreditCard,
  Plus,
  Loader2,
  Sparkles,
  Image,
  Video,
  Music,
  TrendingUp,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import {
  AddSubscriptionModal,
  LogUsageModal,
  EditSubscriptionModal,
  DeleteSubscriptionModal,
} from './subscription-modals'
import { Subscription } from '@/types'

const toolTypeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  both: Sparkles,
}

export default function SubscriptionsPage() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null)

  // Fetch data
  const { data: monthlyOverview, isLoading: loadingOverview } = useQuery({
    queryKey: ['subscriptions', 'monthly'],
    queryFn: () => subscriptionAnalyticsService.getMonthlyOverview(),
  })

  const { data: currentSubscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ['subscriptions', 'current'],
    queryFn: () => subscriptionsService.getCurrentMonth(),
  })

  const { data: costsByClient, isLoading: loadingCosts } = useQuery({
    queryKey: ['subscriptions', 'costs'],
    queryFn: () => subscriptionAnalyticsService.getCostsByClient(),
  })

  const { data: tools } = useQuery({
    queryKey: ['ai-tools'],
    queryFn: () => aiToolsService.getActive(),
  })

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { is_active: true }],
    queryFn: () => clientsService.getAll({ is_active: true }),
  })

  const clients = clientsData?.results || []

  const isLoading = loadingOverview || loadingSubs || loadingCosts

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Subscriptions
            </h1>
            <p className="text-muted-foreground">
              Track AI tool subscriptions and usage costs
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
                'hover:bg-secondary transition-colors'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Log Usage
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground font-medium text-sm',
                'hover:bg-primary/90 transition-colors',
                'shadow-lg shadow-primary/25'
              )}
            >
              <Plus className="w-4 h-4" />
              Add Subscription
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Monthly Overview Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {monthlyOverview?.month || 'Current Month'}
                </h2>
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Monthly Overview</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatCurrency(monthlyOverview?.total_cost_mad || 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                Total subscription costs this month
              </p>
            </div>

            {/* Current Subscriptions Grid */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Active Subscriptions
              </h2>
              {currentSubscriptions && currentSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentSubscriptions.map((sub) => {
                    const Icon = toolTypeIcons[sub.tool_type as keyof typeof toolTypeIcons] || Sparkles
                    return (
                      <div
                        key={sub.id}
                        className="rounded-xl bg-card/50 border border-border/50 p-5 hover:border-border transition-colors group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {sub.tool_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {sub.tool_type}
                            </p>
                          </div>
                          {/* Edit/Delete buttons */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingSubscription(sub)}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button
                              onClick={() => setDeletingSubscription(sub)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Cost</span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(sub.total_cost_mad)}
                            </span>
                          </div>
                          {sub.total_credits && (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Credits</span>
                                <span className="text-sm text-foreground">
                                  {sub.credits_used || 0} / {sub.total_credits}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      ((sub.credits_used || 0) / sub.total_credits) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-card/50 border border-border/50 p-8 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    No active subscriptions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first subscription to start tracking costs
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                      'bg-primary text-primary-foreground text-sm font-medium',
                      'hover:bg-primary/90 transition-colors'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Add Subscription
                  </button>
                </div>
              )}
            </div>

            {/* Cost by Client */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Costs by Client
              </h2>
              {costsByClient && costsByClient.length > 0 ? (
                <div className="rounded-xl bg-card/50 border border-border/50 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">
                          Client
                        </th>
                        <th className="text-right px-5 py-3 text-sm font-medium text-muted-foreground">
                          Items
                        </th>
                        <th className="text-right px-5 py-3 text-sm font-medium text-muted-foreground">
                          Credits
                        </th>
                        <th className="text-right px-5 py-3 text-sm font-medium text-muted-foreground">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costsByClient.map((client) => (
                        <tr
                          key={client.client_id}
                          className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {client.client_name}
                                </p>
                                {client.company && (
                                  <p className="text-xs text-muted-foreground">
                                    {client.company}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right text-foreground">
                            {client.total_items_generated}
                          </td>
                          <td className="px-5 py-4 text-right text-foreground">
                            {client.total_credits_used}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-foreground">
                            {formatCurrency(client.total_cost_mad)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl bg-card/50 border border-border/50 p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    No usage recorded yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Log generations to see cost breakdown by client
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <AddSubscriptionModal
          tools={tools || []}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            setShowAddModal(false)
          }}
        />
      )}

      {/* Log Usage Modal */}
      {showLogModal && (
        <LogUsageModal
          tools={tools || []}
          clients={clients}
          onClose={() => setShowLogModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            setShowLogModal(false)
          }}
        />
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            setEditingSubscription(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubscription && (
        <DeleteSubscriptionModal
          subscription={deletingSubscription}
          onClose={() => setDeletingSubscription(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            setDeletingSubscription(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}
