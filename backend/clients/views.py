from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from .models import Client
from .serializers import ClientSerializer, ClientListSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Optimize queryset with annotations for list view."""
        queryset = super().get_queryset()
        if self.action == 'list':
            # Add aggregated fields to avoid N+1 queries
            queryset = queryset.annotate(
                _total_projects=Count('projects'),
                _total_invoiced=Sum('invoices__total_amount'),
                _total_paid=Sum('invoices__amount_paid'),
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get client's project and payment history."""
        # Use prefetch_related for efficient loading
        client = Client.objects.prefetch_related(
            'projects', 'invoices'
        ).get(pk=pk)

        projects = client.projects.all().values(
            'id', 'title', 'status', 'deadline', 'created_at'
        )
        invoices = client.invoices.all().values(
            'id', 'invoice_number', 'total_amount', 'amount_paid',
            'payment_status', 'due_date', 'issued_date'
        )

        # Calculate summary from prefetched data (single query)
        invoice_list = list(client.invoices.all())
        total_invoiced = sum(inv.total_amount for inv in invoice_list)
        total_paid = sum(inv.amount_paid for inv in invoice_list)

        return Response({
            'client': ClientSerializer(client).data,
            'projects': list(projects),
            'invoices': list(invoices),
            'summary': {
                'total_projects': client.projects.count(),
                'total_invoiced': total_invoiced,
                'total_paid': total_paid,
                'outstanding_balance': total_invoiced - total_paid,
            }
        })

    def perform_destroy(self, instance):
        """Soft delete - set is_active to False."""
        instance.is_active = False
        instance.save()
