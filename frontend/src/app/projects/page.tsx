'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'
import { formatDate, getStatusColor, cn } from '@/lib/utils'
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Image,
  Video,
  Music,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { ProjectStatus, ServiceType } from '@/types'

const statusFilters: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
]

const serviceIcons: Record<ServiceType, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
  both: Layers,
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', { search, status: statusFilter === 'all' ? undefined : statusFilter }],
    queryFn: () => projectsService.getAll({
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  })

  const projects = projectsData?.results || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Track and manage your design projects</p>
          </div>
          <Link
            href="/projects/new"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg shadow-primary/25'
            )}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl',
                'bg-muted border border-border/50',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                'transition-all'
              )}
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-card/50 border border-border/50 p-5 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : projects.length > 0 ? (
              projects.map((project) => {
                const ServiceIcon = serviceIcons[project.service_type] || Layers
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      'group relative rounded-2xl bg-card/50 backdrop-blur-sm',
                      'border border-border/50 hover:border-border',
                      'p-5 transition-all duration-200',
                      'hover:shadow-xl hover:shadow-black/5',
                      project.is_overdue && 'border-destructive/30'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        project.service_type === 'image' && 'bg-blue-500/10 text-blue-500',
                        project.service_type === 'video' && 'bg-purple-500/10 text-purple-500',
                        project.service_type === 'audio' && 'bg-pink-500/10 text-pink-500',
                        project.service_type === 'both' && 'bg-primary/10 text-primary'
                      )}>
                        <ServiceIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.client_name}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                        getStatusColor(project.status)
                      )}>
                        {project.status_display || project.status}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                      {project.days_until_deadline !== null && project.days_until_deadline !== undefined && (
                        <div className={cn(
                          'flex items-center gap-1.5 text-sm font-medium',
                          project.is_overdue
                            ? 'text-destructive'
                            : project.days_until_deadline <= 3
                              ? 'text-warning'
                              : 'text-muted-foreground'
                        )}>
                          <Clock className="w-4 h-4" />
                          {project.is_overdue
                            ? 'Overdue'
                            : project.days_until_deadline === 0
                              ? 'Today'
                              : project.days_until_deadline === 1
                                ? '1 day'
                                : `${project.days_until_deadline} days`}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No projects found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first project to get started'}
                </p>
                {!search && statusFilter === 'all' && (
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Project
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {projects.map((project) => {
                    const ServiceIcon = serviceIcons[project.service_type] || Layers
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/projects/${project.id}`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{project.title}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-muted-foreground">{project.client_name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ServiceIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground capitalize">
                              {project.service_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            getStatusColor(project.status)
                          )}>
                            {project.status_display || project.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className={cn(
                            'text-sm',
                            project.is_overdue ? 'text-destructive' : 'text-muted-foreground'
                          )}>
                            {formatDate(project.deadline)}
                          </div>
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
