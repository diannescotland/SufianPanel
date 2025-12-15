'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { creditUsageService, aiToolsService } from '@/services/subscriptions'
import { clientsService } from '@/services/clients'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  ArrowLeft,
  Loader2,
  Image,
  Video,
  Music,
  Sparkles,
  Filter,
  Users,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

const typeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  other: Sparkles,
}

const typeColors = {
  image: 'bg-blue-500/10 text-blue-500',
  video: 'bg-purple-500/10 text-purple-500',
  audio: 'bg-green-500/10 text-green-500',
  other: 'bg-orange-500/10 text-orange-500',
}

export default function UsageHistoryPage() {
  const [selectedClient, setSelectedClient] = useState<string>('')

  const { data: usages, isLoading } = useQuery({
    queryKey: ['credit-usages'],
    queryFn: () => creditUsageService.getAll(),
  })

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { is_active: true }],
    queryFn: () => clientsService.getAll({ is_active: true }),
  })

  const clients = clientsData?.results || []

  // Filter usages by selected client
  const filteredUsages = selectedClient
    ? usages?.filter((u) => u.client === selectedClient)
    : usages

  // Calculate totals
  const totals = filteredUsages?.reduce(
    (acc, usage) => ({
      items: acc.items + usage.items_generated,
      credits: acc.credits + usage.credits_used,
      cost: acc.cost + (usage.final_cost_mad || usage.calculated_cost_mad),
    }),
    { items: 0, credits: 0, cost: 0 }
  ) || { items: 0, credits: 0, cost: 0 }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/subscriptions"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Usage History
              </h1>
              <p className="text-muted-foreground">
                View all AI generation usage records
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl appearance-none',
                'bg-secondary/50 border border-border/50',
                'text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card/50 border border-border/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Items</p>
            <p className="text-2xl font-bold text-foreground">{totals.items}</p>
          </div>
          <div className="rounded-xl bg-card/50 border border-border/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
            <p className="text-2xl font-bold text-foreground">{totals.credits}</p>
          </div>
          <div className="rounded-xl bg-card/50 border border-border/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals.cost)}
            </p>
          </div>
        </div>

        {/* Usage List */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredUsages && filteredUsages.length > 0 ? (
          <div className="rounded-xl bg-card/50 border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">
                    Tool
                  </th>
                  <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-muted-foreground">
                    Items
                  </th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-muted-foreground">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsages.map((usage) => {
                  const TypeIcon = typeIcons[usage.generation_type] || Sparkles
                  const typeColor = typeColors[usage.generation_type] || typeColors.other
                  return (
                    <tr
                      key={usage.id}
                      className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(usage.usage_date)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {usage.client_name}
                        </p>
                        {usage.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {usage.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {usage.tool_name}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              typeColor
                            )}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {usage.generation_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-foreground">
                        {usage.items_generated}
                        {usage.video_seconds > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({usage.video_seconds}s)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground">
                        {formatCurrency(usage.final_cost_mad || usage.calculated_cost_mad)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl bg-card/50 border border-border/50 p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No usage records</h3>
            <p className="text-sm text-muted-foreground">
              Start logging generations to see usage history
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
