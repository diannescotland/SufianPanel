from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F
from django.utils import timezone
from decimal import Decimal
from .models import AITool, Subscription, CreditUsage, ClientServiceSelection
from .serializers import (
    AIToolSerializer,
    SubscriptionSerializer,
    SubscriptionCreateSerializer,
    CreditUsageSerializer,
    CreditUsageCreateSerializer,
    ClientServiceSelectionSerializer,
    ClientServiceSelectionCreateSerializer
)
from clients.models import Client


class AIToolViewSet(viewsets.ModelViewSet):
    queryset = AITool.objects.filter(is_active=True)
    serializer_class = AIToolSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active tools with their default pricing."""
        tools = AITool.objects.filter(is_active=True)
        serializer = self.get_serializer(tools, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'upsert']:
            return SubscriptionCreateSerializer
        return SubscriptionSerializer

    def create(self, request, *args, **kwargs):
        """
        Create or update a subscription (upsert behavior).
        If a subscription for the same tool+billing_month exists, update it.
        """
        tool_id = request.data.get('tool')
        billing_month = request.data.get('billing_month')

        # Check if subscription already exists
        existing = None
        if tool_id and billing_month:
            existing = Subscription.objects.filter(
                tool_id=tool_id,
                billing_month=billing_month
            ).first()

        if existing:
            # Update existing subscription
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            # Refresh from database to get computed fields
            instance.refresh_from_db()
            return Response(SubscriptionSerializer(instance).data, status=status.HTTP_200_OK)
        else:
            # Create new subscription
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            # Refresh from database to get computed fields
            instance.refresh_from_db()
            return Response(SubscriptionSerializer(instance).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get subscriptions for current month."""
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        subscriptions = Subscription.objects.filter(
            billing_month=first_of_month,
            is_active=True
        ).select_related('tool')

        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def usage_by_client(self, request, pk=None):
        """Get usage breakdown by client for this subscription."""
        subscription = self.get_object()

        usage_by_client = CreditUsage.objects.filter(
            subscription=subscription
        ).values(
            'client__id', 'client__name'
        ).annotate(
            total_credits=Sum('credits_used'),
            total_cost=Sum('calculated_cost_mad'),
            total_items=Sum('items_generated')
        ).order_by('-total_cost')

        return Response({
            'subscription': SubscriptionSerializer(subscription).data,
            'usage_by_client': list(usage_by_client),
            'summary': {
                'total_credits_used': subscription.credits_used,
                'credits_remaining': subscription.credits_remaining,
                'cost_per_credit': subscription.cost_per_credit_mad,
            }
        })


class CreditUsageViewSet(viewsets.ModelViewSet):
    queryset = CreditUsage.objects.all()
    serializer_class = CreditUsageSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return CreditUsageCreateSerializer
        return CreditUsageSerializer

    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get all usage for a specific client."""
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {'error': 'client_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        usages = CreditUsage.objects.filter(
            client_id=client_id
        ).select_related('subscription__tool', 'project')

        serializer = self.get_serializer(usages, many=True)

        # Calculate totals
        totals = usages.aggregate(
            total_cost=Sum('calculated_cost_mad'),
            total_credits=Sum('credits_used'),
            total_items=Sum('items_generated')
        )

        return Response({
            'usages': serializer.data,
            'totals': {
                'total_cost_mad': totals['total_cost'] or 0,
                'total_credits': totals['total_credits'] or 0,
                'total_items': totals['total_items'] or 0,
            }
        })

    @action(detail=False, methods=['post'])
    def log_generation(self, request):
        """
        Quick endpoint to log a generation.
        Automatically finds current month's subscription.
        """
        tool_id = request.data.get('tool_id')
        client_id = request.data.get('client_id')
        project_id = request.data.get('project_id')
        generation_type = request.data.get('generation_type', 'image')
        items_generated = request.data.get('items_generated', 1)
        credits_used = request.data.get('credits_used', 0)
        video_seconds = request.data.get('video_seconds', 0)
        description = request.data.get('description', '')

        if not tool_id or not client_id:
            return Response(
                {'error': 'tool_id and client_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find current subscription for this tool
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        subscription = Subscription.objects.filter(
            tool_id=tool_id,
            billing_month=first_of_month,
            is_active=True
        ).first()

        if not subscription:
            return Response(
                {'error': 'No active subscription found for this tool this month'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create usage
        usage = CreditUsage.objects.create(
            subscription=subscription,
            client_id=client_id,
            project_id=project_id,
            generation_type=generation_type,
            items_generated=items_generated,
            credits_used=credits_used,
            video_seconds=video_seconds,
            description=description
        )

        return Response(CreditUsageSerializer(usage).data, status=status.HTTP_201_CREATED)


class ClientServiceSelectionViewSet(viewsets.ModelViewSet):
    queryset = ClientServiceSelection.objects.all()
    serializer_class = ClientServiceSelectionSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return ClientServiceSelectionCreateSerializer
        return ClientServiceSelectionSerializer

    def create(self, request, *args, **kwargs):
        """
        Create or update a client service selection (upsert behavior).
        If a selection for the same client+tool exists, update it.
        """
        client_id = request.data.get('client')
        tool_id = request.data.get('tool')

        # Check if selection already exists
        existing = None
        if client_id and tool_id:
            existing = ClientServiceSelection.objects.filter(
                client_id=client_id,
                tool_id=tool_id
            ).first()

        if existing:
            # Update existing selection
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            instance.refresh_from_db()
            return Response(ClientServiceSelectionSerializer(instance).data, status=status.HTTP_200_OK)
        else:
            # Create new selection
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            instance.refresh_from_db()
            return Response(ClientServiceSelectionSerializer(instance).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get active service selections for a client."""
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {'error': 'client_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        selections = ClientServiceSelection.objects.filter(
            client_id=client_id,
            is_active=True
        ).select_related('tool')

        serializer = self.get_serializer(selections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_client_tools(self, request):
        """Update all service selections for a client."""
        client_id = request.data.get('client_id')
        tool_ids = request.data.get('tool_ids', [])

        if not client_id:
            return Response(
                {'error': 'client_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deactivate all current selections
        ClientServiceSelection.objects.filter(
            client_id=client_id
        ).update(is_active=False)

        # Activate/create selected ones
        for tool_id in tool_ids:
            ClientServiceSelection.objects.update_or_create(
                client_id=client_id,
                tool_id=tool_id,
                defaults={'is_active': True}
            )

        # Return updated list
        selections = ClientServiceSelection.objects.filter(
            client_id=client_id,
            is_active=True
        ).select_related('tool')

        serializer = self.get_serializer(selections, many=True)
        return Response(serializer.data)


class CostAnalyticsView(APIView):
    """Analytics endpoints for cost tracking."""

    def get(self, request):
        """Get cost summary for all clients - optimized with single query."""
        # Get all usages with client and tool info in single query
        client_totals = CreditUsage.objects.filter(
            client__is_active=True
        ).values(
            'client__id', 'client__name', 'client__company'
        ).annotate(
            total_cost_mad=Sum('calculated_cost_mad'),
            total_credits_used=Sum('credits_used'),
            total_items_generated=Sum('items_generated')
        ).order_by('-total_cost_mad')

        # Get breakdown by tool for each client in one query
        tool_breakdown = CreditUsage.objects.filter(
            client__is_active=True
        ).values(
            'client__id',
            tool_name=F('subscription__tool__display_name')
        ).annotate(
            cost_mad=Sum('calculated_cost_mad'),
            credits=Sum('credits_used'),
            items=Sum('items_generated')
        )

        # Build breakdown lookup
        breakdown_by_client = {}
        for item in tool_breakdown:
            client_id = str(item['client__id'])
            if client_id not in breakdown_by_client:
                breakdown_by_client[client_id] = []
            breakdown_by_client[client_id].append({
                'tool_name': item['tool_name'],
                'cost_mad': item['cost_mad'] or 0,
                'credits': item['credits'] or 0,
                'items': item['items'] or 0,
            })

        # Build response
        summaries = []
        for client in client_totals:
            client_id = str(client['client__id'])
            summaries.append({
                'client_id': client_id,
                'client_name': client['client__name'],
                'company': client['client__company'],
                'total_cost_mad': float(client['total_cost_mad'] or 0),
                'total_credits_used': client['total_credits_used'] or 0,
                'total_items_generated': client['total_items_generated'] or 0,
                'breakdown_by_tool': breakdown_by_client.get(client_id, [])
            })

        return Response(summaries)


class MonthlyOverviewView(APIView):
    """Monthly subscription overview."""

    def get(self, request):
        month_str = request.query_params.get('month')

        if month_str:
            from datetime import datetime
            first_of_month = datetime.strptime(month_str, '%Y-%m').date()
        else:
            today = timezone.now().date()
            first_of_month = today.replace(day=1)

        subscriptions = Subscription.objects.filter(
            billing_month=first_of_month,
            is_active=True
        ).select_related('tool')

        overview = []
        total_cost = Decimal('0')

        for sub in subscriptions:
            sub_data = {
                'tool': sub.tool.display_name,
                'tool_type': sub.tool.tool_type,
                'cost_mad': float(sub.total_cost_mad),
                'original_amount': float(sub.original_amount) if sub.original_amount else None,
                'original_currency': sub.original_currency,
                'credits_total': sub.total_credits,
                'credits_used': sub.credits_used,
                'credits_remaining': sub.credits_remaining,
                'cost_per_credit_mad': float(sub.cost_per_credit_mad) if sub.cost_per_credit_mad else None,
            }
            overview.append(sub_data)
            total_cost += sub.total_cost_mad

        return Response({
            'month': first_of_month.strftime('%B %Y'),
            'month_key': first_of_month.strftime('%Y-%m'),
            'total_cost_mad': float(total_cost),
            'subscriptions': overview
        })
