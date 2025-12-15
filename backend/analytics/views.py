from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from datetime import timedelta
from decimal import Decimal

from clients.models import Client
from projects.models import Project
from invoices.models import Invoice, Payment
from services.models import ServicePricing


class OverviewView(APIView):
    """Dashboard overview statistics."""

    def get(self, request):
        today = timezone.now().date()
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

        # Total revenue
        total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # This month's revenue
        this_month_revenue = Payment.objects.filter(
            payment_date__gte=this_month_start
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # Last month's revenue for comparison
        last_month_revenue = Payment.objects.filter(
            payment_date__gte=last_month_start,
            payment_date__lt=this_month_start
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # Revenue change percentage
        if last_month_revenue > 0:
            revenue_change = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
        else:
            revenue_change = 100 if this_month_revenue > 0 else 0

        # Active clients
        active_clients = Client.objects.filter(is_active=True).count()

        # Pending invoices
        pending_invoices = Invoice.objects.filter(
            payment_status__in=['unpaid', 'partial']
        ).count()
        pending_amount = Invoice.objects.filter(
            payment_status__in=['unpaid', 'partial']
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

        # Overdue payments
        overdue_invoices = Invoice.objects.filter(
            due_date__lt=today,
            payment_status__in=['unpaid', 'partial', 'overdue']
        ).count()
        overdue_amount = Invoice.objects.filter(
            due_date__lt=today,
            payment_status__in=['unpaid', 'partial', 'overdue']
        ).aggregate(
            total=Sum('total_amount') - Sum('amount_paid')
        )
        overdue_total = (overdue_amount.get('total') or Decimal('0'))

        # Projects this month
        projects_this_month = Project.objects.filter(
            created_at__gte=this_month_start
        ).count()

        # Average project value
        avg_project_value = Invoice.objects.aggregate(avg=Avg('total_amount'))['avg'] or Decimal('0')

        return Response({
            'total_revenue': float(total_revenue),
            'this_month_revenue': float(this_month_revenue),
            'revenue_change': float(revenue_change),
            'active_clients': active_clients,
            'pending_invoices': pending_invoices,
            'pending_amount': float(pending_amount),
            'overdue_invoices': overdue_invoices,
            'overdue_amount': float(overdue_total),
            'projects_this_month': projects_this_month,
            'avg_project_value': float(avg_project_value),
        })


class RevenueAnalyticsView(APIView):
    """Revenue analytics over time."""

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        months = int(request.query_params.get('months', 12))

        end_date = timezone.now()
        start_date = end_date - timedelta(days=months * 30)

        if period == 'daily':
            truncate = TruncDay
        elif period == 'weekly':
            truncate = TruncWeek
        else:
            truncate = TruncMonth

        revenue_data = Payment.objects.filter(
            payment_date__gte=start_date
        ).annotate(
            period=truncate('payment_date')
        ).values('period').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('period')

        return Response({
            'period': period,
            'data': list(revenue_data)
        })


class ClientAnalyticsView(APIView):
    """Client analytics."""

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=months * 30)

        # New clients over time
        new_clients = Client.objects.filter(
            created_at__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        # Top clients by revenue
        top_clients = Client.objects.annotate(
            total_paid=Sum('invoices__amount_paid')
        ).filter(
            total_paid__gt=0
        ).order_by('-total_paid')[:10].values(
            'id', 'name', 'company', 'total_paid'
        )

        # Client retention (clients with multiple projects)
        total_clients = Client.objects.count()
        repeat_clients = Client.objects.annotate(
            project_count=Count('projects')
        ).filter(project_count__gt=1).count()

        retention_rate = (repeat_clients / total_clients * 100) if total_clients > 0 else 0

        return Response({
            'new_clients_over_time': list(new_clients),
            'top_clients': list(top_clients),
            'total_clients': total_clients,
            'repeat_clients': repeat_clients,
            'retention_rate': float(retention_rate),
        })


class ServiceAnalyticsView(APIView):
    """Service popularity analytics."""

    def get(self, request):
        # Projects by service type
        service_breakdown = Project.objects.values('service_type').annotate(
            count=Count('id')
        ).order_by('-count')

        # Revenue by service type (based on projects)
        service_revenue = Invoice.objects.values(
            'project__service_type'
        ).annotate(
            total=Sum('amount_paid'),
            count=Count('id')
        ).order_by('-total')

        return Response({
            'service_breakdown': list(service_breakdown),
            'service_revenue': list(service_revenue),
        })


class PaymentAnalyticsView(APIView):
    """Payment status analytics."""

    def get(self, request):
        # Payment status distribution
        status_distribution = Invoice.objects.values('payment_status').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        )

        # Payment methods breakdown
        payment_methods = Payment.objects.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('amount')
        ).order_by('-total')

        # Outstanding balance trend
        today = timezone.now().date()
        outstanding = Invoice.objects.filter(
            payment_status__in=['unpaid', 'partial', 'overdue']
        ).aggregate(
            total_outstanding=Sum('total_amount') - Sum('amount_paid')
        )

        return Response({
            'status_distribution': list(status_distribution),
            'payment_methods': list(payment_methods),
            'total_outstanding': float(outstanding.get('total_outstanding') or 0),
        })


class DeadlineAnalyticsView(APIView):
    """Deadline analytics."""

    def get(self, request):
        today = timezone.now()

        # Upcoming deadlines (next 30 days)
        upcoming = Project.objects.filter(
            deadline__gte=today,
            deadline__lte=today + timedelta(days=30),
            status__in=['pending', 'in_progress', 'review']
        ).order_by('deadline').values(
            'id', 'title', 'deadline', 'status', 'client__name'
        )[:20]

        # Overdue projects
        overdue = Project.objects.filter(
            deadline__lt=today,
            status__in=['pending', 'in_progress', 'review']
        ).count()

        # On-time completion rate
        completed = Project.objects.filter(status='completed')
        total_completed = completed.count()
        on_time = completed.filter(completed_at__lte=F('deadline')).count() if total_completed > 0 else 0
        on_time_rate = (on_time / total_completed * 100) if total_completed > 0 else 0

        return Response({
            'upcoming_deadlines': list(upcoming),
            'overdue_count': overdue,
            'total_completed': total_completed,
            'on_time_rate': float(on_time_rate),
        })
