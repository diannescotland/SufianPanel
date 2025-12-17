from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from decimal import Decimal
from .models import AITool, Subscription, CreditUsage, ClientServiceSelection


def remove_unique_together_validators(serializer):
    """Remove only UniqueTogetherValidator, keeping other validators intact."""
    serializer.validators = [
        v for v in serializer.validators
        if not isinstance(v, UniqueTogetherValidator)
    ]


class AIToolSerializer(serializers.ModelSerializer):
    # Add validation for numeric fields
    default_monthly_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99'),
        required=False, allow_null=True
    )
    default_credits_per_month = serializers.IntegerField(
        min_value=0, max_value=1000000,
        required=False, allow_null=True
    )
    default_cost_per_image_mad = serializers.DecimalField(
        max_digits=10, decimal_places=4,
        min_value=Decimal('0.00'), max_value=Decimal('9999.9999'),
        required=False, allow_null=True
    )
    default_cost_per_video_second_mad = serializers.DecimalField(
        max_digits=10, decimal_places=4,
        min_value=Decimal('0.00'), max_value=Decimal('9999.9999'),
        required=False, allow_null=True
    )

    class Meta:
        model = AITool
        fields = [
            'id', 'name', 'display_name', 'tool_type', 'pricing_model',
            'default_monthly_cost_mad', 'default_credits_per_month',
            'default_cost_per_image_mad', 'default_cost_per_video_second_mad',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Read serializer for subscriptions with computed fields."""
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)
    cost_per_credit_mad = serializers.DecimalField(
        max_digits=10, decimal_places=4, read_only=True
    )
    credits_used = serializers.IntegerField(read_only=True)
    # Validation for writable numeric fields
    total_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99')
    )
    original_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99'),
        required=False, allow_null=True
    )
    exchange_rate = serializers.DecimalField(
        max_digits=10, decimal_places=4,
        min_value=Decimal('0.0001'), max_value=Decimal('9999.9999'),
        required=False, allow_null=True
    )
    total_credits = serializers.IntegerField(
        min_value=0, max_value=10000000,
        required=False, allow_null=True
    )
    credits_remaining = serializers.IntegerField(
        min_value=0, max_value=10000000,
        required=False, allow_null=True
    )

    class Meta:
        model = Subscription
        fields = [
            'id', 'tool', 'tool_name', 'tool_type', 'billing_month',
            'total_cost_mad', 'original_amount', 'original_currency', 'exchange_rate',
            'total_credits', 'credits_remaining', 'credits_used', 'cost_per_credit_mad',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating subscriptions (upsert operations)."""
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    # Validation for numeric fields
    total_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99')
    )
    original_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99'),
        required=False, allow_null=True
    )
    exchange_rate = serializers.DecimalField(
        max_digits=10, decimal_places=4,
        min_value=Decimal('0.0001'), max_value=Decimal('9999.9999'),
        required=False, allow_null=True
    )
    total_credits = serializers.IntegerField(
        min_value=0, max_value=10000000,
        required=False, allow_null=True
    )

    class Meta:
        model = Subscription
        fields = [
            'id', 'tool', 'tool_name', 'billing_month', 'total_cost_mad',
            'original_amount', 'original_currency', 'exchange_rate',
            'total_credits', 'notes'
        ]
        read_only_fields = ['id', 'tool_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove UniqueTogetherValidator only - view handles upsert logic
        remove_unique_together_validators(self)


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
    # Validation for writable numeric fields
    credits_used = serializers.IntegerField(
        min_value=0, max_value=1000000,
        required=False, default=0
    )
    items_generated = serializers.IntegerField(
        min_value=0, max_value=100000,
        required=False, default=0
    )
    video_seconds = serializers.IntegerField(
        min_value=0, max_value=86400,  # Max 24 hours
        required=False, allow_null=True
    )
    manual_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99'),
        required=False, allow_null=True
    )

    class Meta:
        model = CreditUsage
        fields = [
            'id', 'subscription', 'client', 'client_name', 'project', 'project_title',
            'tool_name', 'generation_type', 'credits_used', 'items_generated',
            'video_seconds', 'description', 'calculated_cost_mad', 'manual_cost_mad',
            'final_cost_mad', 'created_at'
        ]
        read_only_fields = ['id', 'calculated_cost_mad', 'created_at']


class CreditUsageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for logging usage."""
    # Validation for numeric fields
    credits_used = serializers.IntegerField(
        min_value=0, max_value=1000000,
        required=False, default=0
    )
    items_generated = serializers.IntegerField(
        min_value=0, max_value=100000,
        required=False, default=0
    )
    video_seconds = serializers.IntegerField(
        min_value=0, max_value=86400,
        required=False, allow_null=True
    )
    manual_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('0.00'), max_value=Decimal('999999.99'),
        required=False, allow_null=True
    )

    class Meta:
        model = CreditUsage
        fields = [
            'subscription', 'client', 'project',
            'generation_type', 'credits_used', 'items_generated',
            'video_seconds', 'description', 'manual_cost_mad'
        ]


class ClientServiceSelectionSerializer(serializers.ModelSerializer):
    """Read serializer for client service selections."""
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)

    class Meta:
        model = ClientServiceSelection
        fields = [
            'id', 'client', 'tool', 'tool_name', 'tool_type',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientServiceSelectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating client service selections (upsert operations)."""
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)

    class Meta:
        model = ClientServiceSelection
        fields = ['id', 'client', 'tool', 'tool_name', 'is_active', 'notes']
        read_only_fields = ['id', 'tool_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove UniqueTogetherValidator only - view handles upsert logic
        remove_unique_together_validators(self)


class ClientCostSummarySerializer(serializers.Serializer):
    """Summary of costs per client in MAD."""
    client_id = serializers.UUIDField()
    client_name = serializers.CharField()
    total_cost_mad = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_credits_used = serializers.IntegerField()
    total_items_generated = serializers.IntegerField()
    breakdown_by_tool = serializers.ListField()
