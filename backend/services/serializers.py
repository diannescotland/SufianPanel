from rest_framework import serializers
from .models import Service, ServicePricing


class ServiceSerializer(serializers.ModelSerializer):
    ai_tool_display = serializers.CharField(source='get_ai_tool_display', read_only=True)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'service_type', 'service_type_display',
            'ai_tool', 'ai_tool_display', 'base_price', 'price_per_unit',
            'unit_name', 'description', 'is_active'
        ]


class ServicePricingSerializer(serializers.ModelSerializer):
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)

    class Meta:
        model = ServicePricing
        fields = [
            'id', 'ai_tool', 'display_name', 'service_type', 'service_type_display',
            'basic_price', 'standard_price', 'premium_price',
            'price_per_image', 'price_per_video_second',
            'description', 'features', 'is_active', 'updated_at'
        ]


class CostCalculatorSerializer(serializers.Serializer):
    """Serializer for cost calculation requests."""
    ai_tool = serializers.CharField()
    tier = serializers.ChoiceField(choices=['basic', 'standard', 'premium'])
    quantity = serializers.IntegerField(min_value=1, default=1)
    duration_seconds = serializers.IntegerField(min_value=0, default=0, required=False)
