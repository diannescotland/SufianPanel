from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    total_projects = serializers.ReadOnlyField()
    total_invoiced = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    outstanding_balance = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'notes',
            'created_at', 'updated_at', 'is_active',
            'total_projects', 'total_invoiced', 'total_paid', 'outstanding_balance'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    total_projects = serializers.ReadOnlyField()
    outstanding_balance = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'company', 'is_active', 'total_projects', 'outstanding_balance']
