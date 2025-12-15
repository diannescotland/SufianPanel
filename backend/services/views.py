from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from decimal import Decimal
from .models import Service, ServicePricing
from .serializers import ServiceSerializer, ServicePricingSerializer, CostCalculatorSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    filterset_fields = ['service_type', 'ai_tool', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


class ServicePricingViewSet(viewsets.ModelViewSet):
    queryset = ServicePricing.objects.filter(is_active=True)
    serializer_class = ServicePricingSerializer
    filterset_fields = ['service_type', 'is_active']
    search_fields = ['display_name', 'ai_tool']
    ordering = ['display_name']


class CostCalculatorView(APIView):
    """Calculate cost based on service selections."""

    def post(self, request):
        serializer = CostCalculatorSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        total_cost = Decimal('0.00')
        breakdown = []

        for item in serializer.validated_data:
            try:
                pricing = ServicePricing.objects.get(ai_tool=item['ai_tool'])
            except ServicePricing.DoesNotExist:
                continue

            # Get tier price
            tier_prices = {
                'basic': pricing.basic_price,
                'standard': pricing.standard_price,
                'premium': pricing.premium_price,
            }
            tier_price = tier_prices.get(item['tier'], pricing.basic_price)

            # Calculate unit costs
            quantity_cost = Decimal('0.00')
            if pricing.service_type == 'image':
                quantity_cost = pricing.price_per_image * item['quantity']
            elif pricing.service_type in ['video', 'audio']:
                duration = item.get('duration_seconds', 0)
                quantity_cost = pricing.price_per_video_second * duration

            item_total = tier_price + quantity_cost
            total_cost += item_total

            breakdown.append({
                'ai_tool': pricing.display_name,
                'tier': item['tier'],
                'tier_price': float(tier_price),
                'quantity': item['quantity'],
                'quantity_cost': float(quantity_cost),
                'item_total': float(item_total),
            })

        return Response({
            'breakdown': breakdown,
            'total_cost': float(total_cost),
        })
