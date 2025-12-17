from rest_framework import serializers
from decimal import Decimal
from .models import Invoice, InvoiceItem, Payment


class InvoiceItemSerializer(serializers.ModelSerializer):
    # Add validation for numeric fields
    quantity = serializers.IntegerField(min_value=1, max_value=10000)
    unit_price = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('9999999.99')
    )

    class Meta:
        model = InvoiceItem
        fields = ['id', 'service', 'title', 'description', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'total_price']


class PaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    # Add validation for payment amount
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.01'), max_value=Decimal('9999999.99')
    )

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'amount', 'payment_method', 'payment_method_display',
            'payment_date', 'notes', 'transaction_id'
        ]
        read_only_fields = ['id', 'payment_date']


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    amount_remaining = serializers.ReadOnlyField()
    tva_amount = serializers.ReadOnlyField()
    total_with_tva = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    # Add validation for numeric fields
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('9999999.99')
    )
    deposit_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('9999999.99'),
        required=False, allow_null=True
    )
    tva_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('100.00'),
        required=False
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'project', 'project_title', 'client', 'client_name',
            'total_amount', 'amount_paid', 'amount_remaining', 'deposit_amount',
            'tva_rate', 'tva_amount', 'total_with_tva',
            'payment_status', 'payment_status_display', 'due_date', 'issued_date',
            'notes', 'pdf_file', 'is_overdue', 'items', 'payments'
        ]
        read_only_fields = ['id', 'invoice_number', 'issued_date', 'amount_paid']


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    amount_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client_name', 'project_title', 'total_amount',
            'amount_paid', 'amount_remaining', 'deposit_amount', 'tva_rate',
            'payment_status', 'payment_status_display', 'due_date', 'issued_date', 'is_overdue'
        ]


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices with items."""
    items = InvoiceItemSerializer(many=True, required=False)
    invoice_number = serializers.ReadOnlyField()
    # Add validation for numeric fields
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('9999999.99')
    )
    deposit_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('9999999.99'),
        required=False, allow_null=True
    )
    tva_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('100.00'),
        required=False
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'project', 'client', 'total_amount', 'deposit_amount', 'tva_rate',
            'due_date', 'notes', 'items'
        ]
        read_only_fields = ['id', 'invoice_number']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)

        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        return invoice
