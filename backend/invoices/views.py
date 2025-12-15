from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.http import HttpResponse
from .models import Invoice, InvoiceItem, Payment
from .serializers import (
    InvoiceSerializer, InvoiceListSerializer, InvoiceCreateSerializer,
    InvoiceItemSerializer, PaymentSerializer
)
from .pdf_generator import generate_invoice_pdf


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['client', 'project', 'payment_status']
    search_fields = ['invoice_number', 'client__name', 'project__title']
    ordering_fields = ['due_date', 'issued_date', 'total_amount']
    ordering = ['-issued_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue invoices."""
        today = timezone.now().date()
        invoices = Invoice.objects.filter(
            due_date__lt=today,
            payment_status__in=['unpaid', 'partial']
        ).order_by('due_date')

        # Update overdue status
        for invoice in invoices:
            if invoice.payment_status != 'overdue':
                invoice.payment_status = 'overdue'
                invoice.save()

        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add item to invoice."""
        invoice = self.get_object()
        serializer = InvoiceItemSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(invoice=invoice)
            # Recalculate total
            invoice.total_amount = sum(item.total_price for item in invoice.items.all())
            invoice.save()
            return Response(InvoiceSerializer(invoice).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a payment for invoice."""
        invoice = self.get_object()
        serializer = PaymentSerializer(data={**request.data, 'invoice': invoice.id})

        if serializer.is_valid():
            serializer.save()
            invoice.refresh_from_db()
            return Response(InvoiceSerializer(invoice).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and view PDF invoice inline."""
        invoice = self.get_object()

        try:
            pdf = generate_invoice_pdf(invoice)

            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=500
            )

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Download PDF as attachment."""
        invoice = self.get_object()

        try:
            pdf = generate_invoice_pdf(invoice)

            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=500
            )


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method']
    ordering = ['-payment_date']

    @action(detail=False, methods=['get'])
    def by_invoice(self, request):
        """Get payments for a specific invoice."""
        invoice_id = request.query_params.get('invoice_id')
        if not invoice_id:
            return Response({'error': 'invoice_id is required'}, status=400)

        payments = Payment.objects.filter(invoice_id=invoice_id)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
