'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation } from '@tanstack/react-query'
import { pricingService, CostCalculatorItem, CostBreakdownItem } from '@/services/pricing'
import { formatCurrency, cn } from '@/lib/utils'
import {
  Calculator,
  Plus,
  Trash2,
  Loader2,
  Image,
  Video,
  Music,
  Layers,
  Sparkles,
  ChevronDown,
  Clock,
  Hash,
} from 'lucide-react'
import { ServicePricing } from '@/types'

// Tier colors
const tierColors = {
  free: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  standard: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  pro: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  premier: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
}

// Service type icons
const serviceTypeIcons: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
  both: Layers,
}

interface CalculatorLineItem {
  id: string
  ai_tool: string
  tier: 'free' | 'standard' | 'pro' | 'premier'
  quantity: number
  duration_seconds: number
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function CalculatorPage() {
  const [items, setItems] = useState<CalculatorLineItem[]>([
    { id: generateId(), ai_tool: '', tier: 'free', quantity: 1, duration_seconds: 0 },
  ])
  const [result, setResult] = useState<{ breakdown: CostBreakdownItem[]; total_cost: number } | null>(null)

  // Fetch available pricing options
  const { data: pricingOptions, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: pricingService.getAll,
  })

  const calculateMutation = useMutation({
    mutationFn: (calculatorItems: CostCalculatorItem[]) => pricingService.calculate(calculatorItems),
    onSuccess: (data) => {
      setResult(data)
    },
  })

  const addItem = () => {
    setItems([
      ...items,
      { id: generateId(), ai_tool: '', tier: 'free', quantity: 1, duration_seconds: 0 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
      setResult(null)
    }
  }

  const updateItem = (id: string, updates: Partial<CalculatorLineItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setResult(null)
  }

  const handleCalculate = () => {
    const validItems = items.filter((item) => item.ai_tool)
    if (validItems.length === 0) return

    const calculatorItems: CostCalculatorItem[] = validItems.map((item) => ({
      ai_tool: item.ai_tool,
      tier: item.tier,
      quantity: item.quantity,
      duration_seconds: item.duration_seconds,
    }))

    calculateMutation.mutate(calculatorItems)
  }

  const getSelectedPricing = (aiTool: string): ServicePricing | undefined => {
    return pricingOptions?.find((p) => p.ai_tool === aiTool)
  }

  const canCalculate = items.some((item) => item.ai_tool)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/25">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            Cost Calculator
          </h1>
          <p className="text-muted-foreground mt-2">Estimate project costs based on AI services and quantity</p>
        </div>

        {/* Calculator form */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Services</h3>
            <button
              onClick={addItem}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
              )}
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {pricingLoading ? (
            <div className="py-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading pricing options...
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const selectedPricing = getSelectedPricing(item.ai_tool)
                const ServiceIcon = selectedPricing
                  ? serviceTypeIcons[selectedPricing.service_type] || Layers
                  : Sparkles

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Service #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* AI Tool selection */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          AI Service
                        </label>
                        <div className="relative">
                          <ServiceIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <select
                            value={item.ai_tool}
                            onChange={(e) => updateItem(item.id, { ai_tool: e.target.value })}
                            className={cn(
                              'w-full pl-10 pr-10 py-2.5 rounded-xl appearance-none',
                              'bg-secondary/50 border border-border/50',
                              'text-foreground text-sm',
                              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                              'cursor-pointer'
                            )}
                          >
                            <option value="">Select a service...</option>
                            {pricingOptions?.map((pricing) => (
                              <option key={pricing.id} value={pricing.ai_tool}>
                                {pricing.display_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      {/* Tier selection */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Tier
                        </label>
                        <div className="flex gap-1">
                          {(['free', 'standard', 'pro', 'premier'] as const).map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => updateItem(item.id, { tier })}
                              className={cn(
                                'flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all border',
                                item.tier === tier
                                  ? tierColors[tier]
                                  : 'bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50'
                              )}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity / Duration */}
                      <div>
                        {selectedPricing?.service_type === 'image' || !selectedPricing ? (
                          <>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Quantity
                            </label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })
                                }
                                className={cn(
                                  'w-full pl-10 pr-4 py-2.5 rounded-xl',
                                  'bg-secondary/50 border border-border/50',
                                  'text-foreground text-sm',
                                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                                )}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Duration (seconds)
                            </label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="number"
                                min="0"
                                value={item.duration_seconds}
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    duration_seconds: parseInt(e.target.value) || 0,
                                  })
                                }
                                className={cn(
                                  'w-full pl-10 pr-4 py-2.5 rounded-xl',
                                  'bg-secondary/50 border border-border/50',
                                  'text-foreground text-sm',
                                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                                )}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pricing info */}
                    {selectedPricing && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span>
                          Base: {formatCurrency(selectedPricing[`${item.tier}_price` as keyof ServicePricing] as number)}
                        </span>
                        {selectedPricing.service_type === 'image' && (
                          <span>+ {formatCurrency(selectedPricing.price_per_image)}/image</span>
                        )}
                        {(selectedPricing.service_type === 'video' ||
                          selectedPricing.service_type === 'audio') && (
                          <span>
                            + {formatCurrency(selectedPricing.price_per_video_second)}/second
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Calculate button */}
          <div className="pt-4 border-t border-border/50">
            <button
              onClick={handleCalculate}
              disabled={!canCalculate || calculateMutation.isPending}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors',
                'shadow-lg shadow-primary/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Cost
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <div className="p-5 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
            </div>

            <div className="divide-y divide-border/50">
              {result.breakdown.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.ai_tool}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} tier
                      {item.quantity > 0 && ` • ${item.quantity} items`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(item.item_total)}</p>
                    <p className="text-xs text-muted-foreground">
                      Base: {formatCurrency(item.tier_price)}
                      {item.quantity_cost > 0 && ` + ${formatCurrency(item.quantity_cost)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="p-5 bg-primary/5 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Estimated Cost</span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(result.total_cost)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pricing reference */}
        {pricingOptions && pricingOptions.length > 0 && (
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <h3 className="font-semibold text-foreground mb-4">Pricing Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Service
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                      Free
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                      Standard
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                      Pro
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                      Premier
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                      Per Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {pricingOptions.map((pricing) => {
                    const TypeIcon = serviceTypeIcons[pricing.service_type] || Layers
                    return (
                      <tr key={pricing.id}>
                        <td className="px-3 py-3 font-medium text-foreground">
                          {pricing.display_name}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TypeIcon className="w-4 h-4" />
                            <span className="capitalize">{pricing.service_type}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {formatCurrency(pricing.free_price)}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {formatCurrency(pricing.standard_price)}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {formatCurrency(pricing.pro_price)}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {pricing.premier_price ? formatCurrency(pricing.premier_price) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {pricing.service_type === 'image'
                            ? `${formatCurrency(pricing.price_per_image)}/img`
                            : `${formatCurrency(pricing.price_per_video_second)}/sec`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
