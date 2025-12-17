'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesService } from '@/services/invoices'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  FolderKanban,
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  X,
  Download,
} from 'lucide-react'
import { PaymentMethod } from '@/types'

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
]

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const queryClient = useQueryClient()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [paymentNotes, setPaymentNotes] = useState('')

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoicesService.getById(invoiceId),
  })

  const recordPaymentMutation = useMutation({
    mutationFn: (data: { amount: number; payment_method: PaymentMethod; notes: string }) =>
      invoicesService.recordPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentNotes('')
    },
  })

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return
    recordPaymentMutation.mutate({
      amount,
      payment_method: paymentMethod,
      notes: paymentNotes,
    })
  }

  const handleDownloadPdf = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(`${apiUrl}/invoices/${invoiceId}/download_pdf/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('PDF download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.invoice_number || 'invoice'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invoice not found</p>
          <Link href="/invoices" className="text-primary hover:underline mt-2 inline-block">
            Back to Invoices
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const amountRemaining = invoice.total_amount - invoice.amount_paid

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {invoice.invoice_number}
              </h1>
              <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(invoice.payment_status))}>
                {invoice.payment_status_display || invoice.payment_status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Issued {formatDate(invoice.issued_date)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
                'hover:bg-secondary transition-colors'
              )}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {invoice.payment_status !== 'paid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-primary text-primary-foreground font-medium text-sm',
                  'hover:bg-primary/90 transition-colors',
                  'shadow-lg shadow-primary/25'
                )}
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Amount</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(invoice.total_amount)}</p>
          </div>

          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Amount Paid</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(invoice.amount_paid)}</p>
          </div>

          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('p-2 rounded-lg', amountRemaining > 0 ? 'bg-warning/10' : 'bg-success/10')}>
                <AlertCircle className={cn('w-4 h-4', amountRemaining > 0 ? 'text-warning' : 'text-success')} />
              </div>
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <p className={cn('text-2xl font-bold', amountRemaining > 0 ? 'text-warning' : 'text-success')}>
              {formatCurrency(amountRemaining)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Info */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Invoice Details</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <Link href={`/clients/${invoice.client}`} className="text-foreground hover:text-primary transition-colors">
                    {invoice.client_name || 'Unknown'}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Project</p>
                  <Link href={`/projects/${invoice.project}`} className="text-foreground hover:text-primary transition-colors">
                    {invoice.project_title || 'Unknown'}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className={cn('text-foreground', invoice.is_overdue && 'text-destructive')}>
                    {formatDate(invoice.due_date)}
                    {invoice.is_overdue && ' (Overdue)'}
                  </p>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Line Items</h2>

            {invoice.items && invoice.items.length > 0 ? (
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <p className="font-medium text-foreground">Total</p>
                  <p className="font-bold text-foreground">{formatCurrency(invoice.total_amount)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No line items</p>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
          <h2 className="font-semibold text-foreground mb-4">Payment History</h2>

          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CreditCard className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.payment_method_display || payment.payment_method} • {formatDate(payment.payment_date)}
                      </p>
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">{payment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No payments recorded yet</p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max: ${formatCurrency(amountRemaining)}`}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                  )}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl resize-none',
                    'bg-secondary/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl',
                    'bg-secondary/50 border border-border/50 text-foreground font-medium text-sm',
                    'hover:bg-secondary transition-colors'
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={recordPaymentMutation.isPending || !paymentAmount}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                    'bg-primary text-primary-foreground font-medium text-sm',
                    'hover:bg-primary/90 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {recordPaymentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Record Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
