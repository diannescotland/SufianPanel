from django.contrib import admin
from .models import Service, ServicePricing


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'service_type', 'ai_tool', 'base_price', 'price_per_unit', 'is_active']
    list_filter = ['service_type', 'ai_tool', 'is_active']
    search_fields = ['name', 'description']


@admin.register(ServicePricing)
class ServicePricingAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'ai_tool', 'service_type', 'basic_price', 'standard_price', 'premium_price', 'is_active']
    list_filter = ['service_type', 'is_active']
    search_fields = ['display_name', 'ai_tool']
