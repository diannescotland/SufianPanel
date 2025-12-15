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
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO


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
        """Generate PDF for invoice."""
        invoice = self.get_object()

        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)

        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=20)
        heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=14, spaceAfter=10)
        normal_style = styles['Normal']

        elements = []

        # Header
        elements.append(Paragraph("INVOICE", title_style))
        elements.append(Spacer(1, 10))

        # Invoice details
        invoice_info = [
            ['Invoice Number:', invoice.invoice_number],
            ['Issue Date:', invoice.issued_date.strftime('%B %d, %Y')],
            ['Due Date:', invoice.due_date.strftime('%B %d, %Y')],
            ['Status:', invoice.get_payment_status_display()],
        ]
        info_table = Table(invoice_info, colWidths=[1.5*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))

        # Client info
        elements.append(Paragraph("Bill To:", heading_style))
        elements.append(Paragraph(invoice.client.name, normal_style))
        elements.append(Paragraph(invoice.client.email, normal_style))
        if invoice.client.company:
            elements.append(Paragraph(invoice.client.company, normal_style))
        elements.append(Spacer(1, 20))

        # Line items
        elements.append(Paragraph("Items:", heading_style))
        items_data = [['Description', 'Qty', 'Unit Price', 'Total']]
        for item in invoice.items.all():
            items_data.append([
                item.description,
                str(item.quantity),
                f"${item.unit_price:.2f}",
                f"${item.total_price:.2f}",
            ])

        items_table = Table(items_data, colWidths=[3.5*inch, 0.75*inch, 1*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 20))

        # Totals
        totals_data = [
            ['', '', 'Subtotal:', f"${invoice.total_amount:.2f}"],
            ['', '', 'Amount Paid:', f"${invoice.amount_paid:.2f}"],
            ['', '', 'Balance Due:', f"${(invoice.total_amount - invoice.amount_paid):.2f}"],
        ]
        totals_table = Table(totals_data, colWidths=[3.5*inch, 0.75*inch, 1*inch, 1*inch])
        totals_table.setStyle(TableStyle([
            ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('LINEABOVE', (2, -1), (-1, -1), 1, colors.black),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(totals_table)

        # Notes
        if invoice.notes:
            elements.append(Spacer(1, 30))
            elements.append(Paragraph("Notes:", heading_style))
            elements.append(Paragraph(invoice.notes, normal_style))

        # Build PDF
        doc.build(elements)

        # Return PDF response
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response


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
