from django.contrib import admin
from .models import AITool, Subscription, CreditUsage, ClientServiceSelection


@admin.register(AITool)
class AIToolAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'tool_type', 'pricing_model', 'default_monthly_cost_mad', 'is_active']
    list_filter = ['tool_type', 'pricing_model', 'is_active']
    search_fields = ['name', 'display_name']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['tool', 'billing_month', 'total_cost_mad', 'total_credits', 'credits_remaining', 'is_active']
    list_filter = ['tool', 'billing_month', 'is_active']
    date_hierarchy = 'billing_month'


@admin.register(CreditUsage)
class CreditUsageAdmin(admin.ModelAdmin):
    list_display = ['client', 'subscription', 'generation_type', 'items_generated', 'credits_used', 'calculated_cost_mad', 'usage_date']
    list_filter = ['generation_type', 'subscription__tool', 'usage_date']
    search_fields = ['client__name', 'description']
    date_hierarchy = 'usage_date'


@admin.register(ClientServiceSelection)
class ClientServiceSelectionAdmin(admin.ModelAdmin):
    list_display = ['client', 'tool', 'is_active', 'added_at']
    list_filter = ['tool', 'is_active']
    search_fields = ['client__name']
