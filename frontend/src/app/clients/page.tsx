'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { clientsService } from '@/services/clients'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', { search, is_active: showActiveOnly ? true : undefined }],
    queryFn: () => clientsService.getAll({ search: search || undefined, is_active: showActiveOnly ? true : undefined }),
  })

  const clients = clientsData?.results || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Link
            href="/clients/new"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg shadow-primary/25'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl',
                'bg-secondary/50 border border-border/50',
                'text-foreground placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                'transition-all'
              )}
            />
          </div>
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border',
              'text-sm font-medium transition-colors',
              showActiveOnly
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-secondary/50 border-border/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <Filter className="w-4 h-4" />
            Active Only
          </button>
        </div>

        {/* Clients grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/50 border border-border/50 p-5 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className={cn(
                  'group relative rounded-2xl bg-card/50 backdrop-blur-sm',
                  'border border-border/50 hover:border-border',
                  'p-5 transition-all duration-200',
                  'hover:shadow-xl hover:shadow-black/5'
                )}
              >
                {/* Status indicator */}
                <div className={cn(
                  'absolute top-4 right-4 w-2 h-2 rounded-full',
                  client.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                )} />

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/80 flex items-center justify-center text-white font-semibold shadow-lg shadow-primary/20">
                    {getInitials(client.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {client.company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="text-lg font-semibold text-foreground">
                      {client.total_projects || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className={cn(
                      'text-lg font-semibold',
                      (client.outstanding_balance || 0) > 0 ? 'text-warning' : 'text-foreground'
                    )}>
                      {formatCurrency(client.outstanding_balance || 0)}
                    </p>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No clients found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Try adjusting your search' : 'Add your first client to get started'}
              </p>
              {!search && (
                <Link
                  href="/clients/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination would go here */}
        {clientsData && clientsData.count > 20 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground">
              Showing {clients.length} of {clientsData.count} clients
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
