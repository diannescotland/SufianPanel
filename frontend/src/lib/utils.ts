import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in MAD
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MAD'
}

// Format date
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Format datetime
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get status color classes using theme colors
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Project statuses
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-secondary/20 text-secondary',
    review: 'bg-chart-2/20 text-chart-2',
    completed: 'bg-primary/20 text-primary',
    cancelled: 'bg-destructive/20 text-destructive',
    // Payment statuses
    unpaid: 'bg-muted text-muted-foreground',
    partial: 'bg-chart-2/20 text-chart-2',
    paid: 'bg-primary/20 text-primary',
    overdue: 'bg-destructive/20 text-destructive',
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}
