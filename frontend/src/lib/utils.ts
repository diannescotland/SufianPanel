import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    in_progress: 'bg-primary/10 text-primary',
    review: 'bg-purple-500/10 text-purple-500',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-muted-foreground/10 text-muted-foreground',
    unpaid: 'bg-destructive/10 text-destructive',
    partial: 'bg-warning/10 text-warning',
    paid: 'bg-success/10 text-success',
    overdue: 'bg-destructive/10 text-destructive',
  }
  return colors[status] || 'bg-muted-foreground/10 text-muted-foreground'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
