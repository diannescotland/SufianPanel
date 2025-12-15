from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tools', views.AIToolViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'usage', views.CreditUsageViewSet)
router.register(r'client-services', views.ClientServiceSelectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/costs/', views.CostAnalyticsView.as_view(), name='cost-analytics'),
    path('analytics/monthly/', views.MonthlyOverviewView.as_view(), name='monthly-overview'),
]
