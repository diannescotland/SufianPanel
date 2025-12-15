from django.urls import path
from .views import (
    OverviewView, RevenueAnalyticsView, ClientAnalyticsView,
    ServiceAnalyticsView, PaymentAnalyticsView, DeadlineAnalyticsView
)

urlpatterns = [
    path('analytics/overview/', OverviewView.as_view(), name='analytics-overview'),
    path('analytics/revenue/', RevenueAnalyticsView.as_view(), name='analytics-revenue'),
    path('analytics/clients/', ClientAnalyticsView.as_view(), name='analytics-clients'),
    path('analytics/services/', ServiceAnalyticsView.as_view(), name='analytics-services'),
    path('analytics/payments/', PaymentAnalyticsView.as_view(), name='analytics-payments'),
    path('analytics/deadlines/', DeadlineAnalyticsView.as_view(), name='analytics-deadlines'),
]
