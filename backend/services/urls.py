from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServicePricingViewSet, CostCalculatorView

router = DefaultRouter()
router.register('services', ServiceViewSet)
router.register('pricing', ServicePricingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('pricing/calculate/', CostCalculatorView.as_view(), name='calculate-cost'),
]
