from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
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

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get client's project and payment history."""
        client = self.get_object()
        projects = client.projects.all().values(
            'id', 'title', 'status', 'deadline', 'created_at'
        )
        invoices = client.invoices.all().values(
            'id', 'invoice_number', 'total_amount', 'amount_paid',
            'payment_status', 'due_date', 'issued_date'
        )
        return Response({
            'client': ClientSerializer(client).data,
            'projects': list(projects),
            'invoices': list(invoices),
            'summary': {
                'total_projects': client.total_projects,
                'total_invoiced': client.total_invoiced,
                'total_paid': client.total_paid,
                'outstanding_balance': client.outstanding_balance,
            }
        })

    def perform_destroy(self, instance):
        """Soft delete - set is_active to False."""
        instance.is_active = False
        instance.save()
