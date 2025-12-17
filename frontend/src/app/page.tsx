'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics'
import { projectsService } from '@/services/projects'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import {
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FolderKanban,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
  })

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery({
    queryKey: ['projects', 'deadlines'],
    queryFn: () => projectsService.getDeadlines(14),
  })

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(overview?.total_revenue || 0),
      change: overview?.revenue_change || 0,
      icon: DollarSign,
      color: 'bg-primary',
      bgGlow: 'bg-primary/20',
    },
    {
      label: 'Active Clients',
      value: overview?.active_clients || 0,
      icon: Users,
      color: 'bg-secondary',
      bgGlow: 'bg-secondary/20',
    },
    {
      label: 'Pending Invoices',
      value: overview?.pending_invoices || 0,
      subValue: formatCurrency(overview?.pending_amount || 0),
      icon: FileText,
      color: 'bg-chart-2',
      bgGlow: 'bg-chart-2/20',
    },
    {
      label: 'Overdue Payments',
      value: overview?.overdue_invoices || 0,
      subValue: formatCurrency(overview?.overdue_amount || 0),
      icon: AlertCircle,
      color: 'bg-destructive',
      bgGlow: 'bg-destructive/20',
      alert: (overview?.overdue_invoices || 0) > 0,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={cn(
                  'group relative overflow-hidden rounded-2xl',
                  'bg-card/50 backdrop-blur-sm border border-border/50',
                  'p-5 transition-all duration-300',
                  'hover:border-border hover:shadow-xl hover:shadow-black/5',
                  stat.alert && 'border-destructive/30 hover:border-destructive/50'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background glow */}
                <div className={cn(
                  'absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                  stat.bgGlow
                )} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'p-2.5 rounded-xl shadow-lg',
                      stat.color
                    )}>
                      <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
                    </div>
                    {stat.change !== undefined && (
                      <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        stat.change >= 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      )}>
                        {stat.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(stat.change).toFixed(1)}%
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                    {stat.subValue && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {stat.subValue} total
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upcoming deadlines */}
          <div className="xl:col-span-2 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Upcoming Deadlines</h2>
                  <p className="text-xs text-muted-foreground">Next 14 days</p>
                </div>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-border/50">
              {deadlines && deadlines.length > 0 ? (
                deadlines.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      project.is_overdue
                        ? 'bg-destructive/10'
                        : (project.days_until_deadline ?? Infinity) <= 3
                          ? 'bg-warning/10'
                          : 'bg-primary/10'
                    )}>
                      <FolderKanban className={cn(
                        'w-5 h-5',
                        project.is_overdue
                          ? 'text-destructive'
                          : (project.days_until_deadline ?? Infinity) <= 3
                            ? 'text-warning'
                            : 'text-primary'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-medium',
                        project.is_overdue
                          ? 'text-destructive'
                          : (project.days_until_deadline ?? Infinity) <= 3
                            ? 'text-warning'
                            : 'text-muted-foreground'
                      )}>
                        {project.is_overdue
                          ? 'Overdue'
                          : project.days_until_deadline === 0
                            ? 'Today'
                            : project.days_until_deadline === 1
                              ? 'Tomorrow'
                              : `${project.days_until_deadline} days`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      getStatusColor(project.status)
                    )}>
                      {project.status_display || project.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                  <p className="text-sm text-muted-foreground/70">You&apos;re all caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-6">
            {/* Projects this month */}
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FolderKanban className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground">Projects This Month</h3>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {overview?.projects_this_month || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg. value: {formatCurrency(overview?.avg_project_value || 0)}
              </p>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/clients/new"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Add New Client</span>
                </Link>
                <Link
                  href="/projects/new"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <FolderKanban className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Create Project</span>
                </Link>
                <Link
                  href="/invoices/new"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 transition-colors">
                    <FileText className="w-4 h-4 text-chart-2" />
                  </div>
                  <span className="text-sm font-medium text-foreground">New Invoice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
