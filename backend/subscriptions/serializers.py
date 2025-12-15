from rest_framework import serializers
from decimal import Decimal
from .models import AITool, Subscription, CreditUsage, ClientServiceSelection


class AIToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITool
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)
    cost_per_credit_mad = serializers.DecimalField(
        max_digits=10, decimal_places=4, read_only=True
    )
    credits_used = serializers.IntegerField(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating subscriptions."""

    class Meta:
        model = Subscription
        fields = [
            'tool', 'billing_month', 'total_cost_mad',
            'original_amount', 'original_currency', 'exchange_rate',
            'total_credits', 'notes'
        ]


class CreditUsageSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(
        source='subscription.tool.display_name',
        read_only=True
    )
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(
        source='project.title',
        read_only=True
    )
    final_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CreditUsage
        fields = '__all__'
        read_only_fields = ['calculated_cost_mad']


class CreditUsageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for logging usage."""

    class Meta:
        model = CreditUsage
        fields = [
            'subscription', 'client', 'project',
            'generation_type', 'credits_used', 'items_generated',
            'video_seconds', 'description', 'manual_cost_mad'
        ]


class ClientServiceSelectionSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)

    class Meta:
        model = ClientServiceSelection
        fields = '__all__'


class ClientCostSummarySerializer(serializers.Serializer):
    """Summary of costs per client in MAD."""
    client_id = serializers.UUIDField()
    client_name = serializers.CharField()
    total_cost_mad = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_credits_used = serializers.IntegerField()
    total_items_generated = serializers.IntegerField()
    breakdown_by_tool = serializers.ListField()
