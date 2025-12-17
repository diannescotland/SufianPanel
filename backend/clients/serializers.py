from rest_framework import serializers
from django.db.models import Sum, Count
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Full serializer for client detail view with computed fields."""
    total_projects = serializers.SerializerMethodField()
    total_invoiced = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'company',
            'ice_number', 'address_line1', 'address_line2', 'city',
            'notes', 'created_at', 'updated_at', 'is_active',
            'total_projects', 'total_invoiced', 'total_paid', 'outstanding_balance'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _get_aggregated_data(self, obj):
        """Get or compute aggregated invoice data (cached per instance)."""
        if not hasattr(obj, '_invoice_aggregates'):
            # Single query to get all invoice totals
            aggregates = obj.invoices.aggregate(
                total_invoiced=Sum('total_amount'),
                total_paid=Sum('amount_paid')
            )
            obj._invoice_aggregates = {
                'total_invoiced': aggregates['total_invoiced'] or 0,
                'total_paid': aggregates['total_paid'] or 0,
            }
        return obj._invoice_aggregates

    def get_total_projects(self, obj):
        """Get project count with single query."""
        if hasattr(obj, '_total_projects'):
            return obj._total_projects or 0
        return obj.projects.count()

    def get_total_invoiced(self, obj):
        """Get total invoiced amount."""
        if hasattr(obj, '_total_invoiced'):
            return obj._total_invoiced or 0
        return self._get_aggregated_data(obj)['total_invoiced']

    def get_total_paid(self, obj):
        """Get total paid amount."""
        if hasattr(obj, '_total_paid'):
            return obj._total_paid or 0
        return self._get_aggregated_data(obj)['total_paid']

    def get_outstanding_balance(self, obj):
        """Get outstanding balance (invoiced - paid)."""
        if hasattr(obj, '_total_invoiced') and hasattr(obj, '_total_paid'):
            return (obj._total_invoiced or 0) - (obj._total_paid or 0)
        data = self._get_aggregated_data(obj)
        return data['total_invoiced'] - data['total_paid']


class ClientListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views with annotated fields."""
    total_projects = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'company', 'ice_number', 'city',
            'is_active', 'total_projects', 'outstanding_balance'
        ]

    def get_total_projects(self, obj):
        """Use annotated field if available, else fallback to property."""
        if hasattr(obj, '_total_projects'):
            return obj._total_projects or 0
        return obj.total_projects

    def get_outstanding_balance(self, obj):
        """Use annotated fields if available, else fallback to property."""
        if hasattr(obj, '_total_invoiced') and hasattr(obj, '_total_paid'):
            total_invoiced = obj._total_invoiced or 0
            total_paid = obj._total_paid or 0
            return total_invoiced - total_paid
        return obj.outstanding_balance
