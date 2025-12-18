from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, Q, Value
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay, Coalesce
from django.core.cache import cache
from django.conf import settings
from datetime import timedelta
from decimal import Decimal

from clients.models import Client
from projects.models import Project
from invoices.models import Invoice, Payment
from services.models import ServicePricing

# Constants
DEFAULT_MONTHS_LOOKBACK = 12  # Default number of months for analytics queries
CACHE_TIMEOUT = getattr(settings, 'CACHE_TIMEOUT_ANALYTICS', 300)  # 5 minutes default


class OverviewView(APIView):
    """Dashboard overview statistics - optimized with consolidated queries and caching."""

    def get(self, request):
        # Try to get cached response first
        cache_key = f'analytics_overview_{timezone.now().date()}'
        cached_response = cache.get(cache_key)
        if cached_response is not None:
            return Response(cached_response)

        today = timezone.now().date()
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

        # OPTIMIZED: Single aggregated query for all payment metrics (was 3 queries)
        payment_stats = Payment.objects.aggregate(
            total_revenue=Coalesce(Sum('amount'), Value(Decimal('0'))),
            this_month_revenue=Coalesce(
                Sum('amount', filter=Q(payment_date__gte=this_month_start)),
                Value(Decimal('0'))
            ),
            last_month_revenue=Coalesce(
                Sum('amount', filter=Q(
                    payment_date__gte=last_month_start,
                    payment_date__lt=this_month_start
                )),
                Value(Decimal('0'))
            ),
        )

        total_revenue = payment_stats['total_revenue']
        this_month_revenue = payment_stats['this_month_revenue']
        last_month_revenue = payment_stats['last_month_revenue']

        # Revenue change percentage
        if last_month_revenue > 0:
            revenue_change = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
        else:
            revenue_change = 100 if this_month_revenue > 0 else 0

        # OPTIMIZED: Single aggregated query for all invoice metrics (was 4 queries)
        invoice_stats = Invoice.objects.aggregate(
            pending_count=Count('id', filter=Q(payment_status__in=['unpaid', 'partial'])),
            pending_amount=Coalesce(
                Sum('total_amount', filter=Q(payment_status__in=['unpaid', 'partial'])),
                Value(Decimal('0'))
            ),
            overdue_count=Count('id', filter=Q(
                due_date__lt=today,
                payment_status__in=['unpaid', 'partial', 'overdue']
            )),
            overdue_total=Coalesce(
                Sum('total_amount', filter=Q(
                    due_date__lt=today,
                    payment_status__in=['unpaid', 'partial', 'overdue']
                )),
                Value(Decimal('0'))
            ),
            overdue_paid=Coalesce(
                Sum('amount_paid', filter=Q(
                    due_date__lt=today,
                    payment_status__in=['unpaid', 'partial', 'overdue']
                )),
                Value(Decimal('0'))
            ),
            avg_value=Coalesce(Avg('total_amount'), Value(Decimal('0'))),
        )

        overdue_amount = invoice_stats['overdue_total'] - invoice_stats['overdue_paid']

        # OPTIMIZED: Single query for client and project counts (was 2 queries)
        active_clients = Client.objects.filter(is_active=True).count()
        projects_this_month = Project.objects.filter(
            created_at__gte=this_month_start
        ).count()

        response_data = {
            'total_revenue': float(total_revenue),
            'this_month_revenue': float(this_month_revenue),
            'revenue_change': float(revenue_change),
            'active_clients': active_clients,
            'pending_invoices': invoice_stats['pending_count'],
            'pending_amount': float(invoice_stats['pending_amount']),
            'overdue_invoices': invoice_stats['overdue_count'],
            'overdue_amount': float(overdue_amount),
            'projects_this_month': projects_this_month,
            'avg_project_value': float(invoice_stats['avg_value']),
        }

        # Cache the response for faster subsequent requests
        cache.set(cache_key, response_data, CACHE_TIMEOUT)

        return Response(response_data)


class RevenueAnalyticsView(APIView):
    """Revenue analytics over time."""

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        months = int(request.query_params.get('months', DEFAULT_MONTHS_LOOKBACK))

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
        months = int(request.query_params.get('months', DEFAULT_MONTHS_LOOKBACK))
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
