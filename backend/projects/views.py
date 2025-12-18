from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer, ProjectDetailSerializer

# Constants
DEFAULT_DEADLINE_DAYS = 7  # Default number of days for deadline queries


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['client', 'status', 'service_type']
    search_fields = ['title', 'description', 'client__name']
    ordering_fields = ['deadline', 'created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Optimize queryset with select_related to avoid N+1 queries."""
        queryset = super().get_queryset()
        # Always select_related client to avoid N+1 for client_name
        if self.action in ['list', 'retrieve', 'deadlines', 'calendar']:
            queryset = queryset.select_related('client')
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    @action(detail=False, methods=['get'])
    def deadlines(self, request):
        """Get upcoming deadlines."""
        days = int(request.query_params.get('days', DEFAULT_DEADLINE_DAYS))
        now = timezone.now()
        deadline_date = now + timedelta(days=days)

        projects = Project.objects.filter(
            status__in=['pending', 'in_progress', 'review'],
            deadline__lte=deadline_date
        ).order_by('deadline')

        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get projects for calendar view."""
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        projects = Project.objects.filter(
            deadline__month=month,
            deadline__year=year
        ).values('id', 'title', 'deadline', 'status', 'client__name')

        return Response(list(projects))

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update project status."""
        project = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(Project.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)

        project.status = new_status
        if new_status == 'completed':
            project.completed_at = timezone.now()
        project.save()

        return Response(ProjectSerializer(project).data)
