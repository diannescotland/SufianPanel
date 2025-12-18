'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { cn } from '@/lib/utils'
import { Calculator, Users } from 'lucide-react'
import { ClientCostSimulator } from '@/components/calculator/ClientCostSimulator'
import { ServicePricingSimulator } from '@/components/calculator/ServicePricingSimulator'

type TabType = 'pricing' | 'simulator'

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simulator')

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
          <p className="text-muted-foreground mt-2">
            {activeTab === 'simulator'
              ? 'Estimate how much one client will cost you in AI tools'
              : 'Estimate project costs based on AI services and quantity'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 rounded-xl bg-[#17181C] border border-border/50 w-fit">
          <button
            onClick={() => setActiveTab('simulator')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'simulator'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-[#17181C]'
            )}
          >
            <Users className="w-4 h-4" />
            Client Cost Simulator
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'pricing'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-[#17181C]'
            )}
          >
            <Calculator className="w-4 h-4" />
            Service Pricing
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'simulator' ? (
          <ClientCostSimulator />
        ) : (
          <ServicePricingSimulator />
        )}
      </div>
    </DashboardLayout>
  )
}
