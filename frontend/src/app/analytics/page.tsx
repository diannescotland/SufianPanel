'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics'
import { formatCurrency, cn } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  AlertCircle,
  FolderKanban,
  Target,
  Clock,
  CheckCircle2,
  Image,
  Video,
  Music,
  Layers,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Chart colors
const COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  destructive: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  cyan: '#06b6d4',
}

const SERVICE_COLORS: Record<string, string> = {
  image: COLORS.blue,
  video: COLORS.purple,
  audio: COLORS.pink,
  both: COLORS.primary,
}

const STATUS_COLORS: Record<string, string> = {
  paid: COLORS.success,
  partial: COLORS.warning,
  unpaid: '#94a3b8',
  overdue: COLORS.destructive,
}

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading chart...</div>
    </div>
  )
}

// Stat card component
function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}: {
  title: string
  value: string
  subValue?: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'primary' | 'success' | 'warning' | 'destructive'
}) {
  const colorClasses = {
    primary: 'from-primary to-indigo-400',
    success: 'from-emerald-500 to-teal-400',
    warning: 'from-amber-500 to-orange-400',
    destructive: 'from-rose-500 to-red-400',
  }

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-2.5 rounded-xl bg-gradient-to-br shadow-lg',
          colorClasses[color]
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend === 'up' ? 'text-success' : 'text-destructive'
          )}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  )
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  // Fetch all analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
  })

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => analyticsService.getRevenue('monthly', 12),
  })

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['analytics', 'services'],
    queryFn: analyticsService.getServices,
  })

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['analytics', 'payments'],
    queryFn: analyticsService.getPayments,
  })

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['analytics', 'clients'],
    queryFn: () => analyticsService.getClients(12),
  })

  // Format revenue data for chart
  const revenueChartData = revenue?.data?.map((item: any) => ({
    name: new Date(item.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: item.total || 0,
    transactions: item.count || 0,
  })) || []

  // Format service data for pie chart
  const serviceChartData = services?.service_breakdown?.map((item: any) => ({
    name: item.service_type.charAt(0).toUpperCase() + item.service_type.slice(1),
    value: item.count,
    color: SERVICE_COLORS[item.service_type] || COLORS.primary,
  })) || []

  // Format payment status data for pie chart
  const paymentStatusData = payments?.status_distribution?.map((item: any) => ({
    name: item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1),
    value: item.count,
    amount: item.total_amount,
    color: STATUS_COLORS[item.payment_status] || '#94a3b8',
  })) || []

  // Format payment methods data
  const paymentMethodsData = payments?.payment_methods?.map((item: any) => ({
    name: item.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.total || 0,
    count: item.count,
  })) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {overviewLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card/50 border border-border/50 p-5 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
                <div className="h-8 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))
          ) : overview ? (
            <>
              <StatCard
                title="Total Revenue"
                value={formatCurrency(overview.total_revenue)}
                icon={DollarSign}
                color="success"
              />
              <StatCard
                title="This Month"
                value={formatCurrency(overview.this_month_revenue)}
                icon={TrendingUp}
                trend={overview.revenue_change >= 0 ? 'up' : 'down'}
                trendValue={`${Math.abs(overview.revenue_change).toFixed(1)}%`}
                color="primary"
              />
              <StatCard
                title="Active Clients"
                value={overview.active_clients.toString()}
                subValue={`${overview.projects_this_month} projects this month`}
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Outstanding"
                value={formatCurrency(overview.overdue_amount)}
                subValue={`${overview.overdue_invoices} overdue invoices`}
                icon={AlertCircle}
                color={overview.overdue_amount > 0 ? 'warning' : 'success'}
              />
            </>
          ) : null}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <h3 className="font-semibold text-foreground mb-4">Revenue Over Time</h3>
            {revenueLoading ? (
              <ChartSkeleton />
            ) : revenueChartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>

          {/* Service breakdown pie chart */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <h3 className="font-semibold text-foreground mb-4">Projects by Service Type</h3>
            {servicesLoading ? (
              <ChartSkeleton />
            ) : serviceChartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.value} projects</p>
                          </div>
                        )
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No service data available
              </div>
            )}
          </div>
        </div>

        {/* Second row of charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment status distribution */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <h3 className="font-semibold text-foreground mb-4">Payment Status Distribution</h3>
            {paymentsLoading ? (
              <ChartSkeleton />
            ) : paymentStatusData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.value} invoices</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(data.amount)}</p>
                          </div>
                        )
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No payment data available
              </div>
            )}
          </div>

          {/* Payment methods bar chart */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <h3 className="font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
            {paymentsLoading ? (
              <ChartSkeleton />
            ) : paymentMethodsData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#334155' }}
                      width={100}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />}
                    />
                    <Bar
                      dataKey="value"
                      fill={COLORS.primary}
                      radius={[0, 4, 4, 0]}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No payment method data available
              </div>
            )}
          </div>
        </div>

        {/* Top clients section */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
          <h3 className="font-semibold text-foreground mb-4">Top Clients by Revenue</h3>
          {clientsLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          ) : clients?.top_clients?.length > 0 ? (
            <div className="space-y-3">
              {clients.top_clients.map((client: any, index: number) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 ? 'bg-amber-500/20 text-amber-500' :
                    index === 1 ? 'bg-slate-300/20 text-slate-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-500' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{client.name}</p>
                    {client.company && (
                      <p className="text-sm text-muted-foreground truncate">{client.company}</p>
                    )}
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(client.total_paid || 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No client data available
            </div>
          )}
        </div>

        {/* Client retention stats */}
        {clients && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5 text-center">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{clients.total_clients}</p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </div>
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5 text-center">
              <div className="p-3 rounded-xl bg-success/10 w-fit mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-3xl font-bold text-foreground">{clients.repeat_clients}</p>
              <p className="text-sm text-muted-foreground">Repeat Clients</p>
            </div>
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5 text-center">
              <div className="p-3 rounded-xl bg-purple-500/10 w-fit mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{clients.retention_rate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
