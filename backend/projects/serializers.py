from rest_framework import serializers
from .models import Project
from clients.serializers import ClientListSerializer


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_deadline = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_name', 'title', 'description',
            'service_type', 'service_type_display', 'status', 'status_display',
            'deadline', 'created_at', 'updated_at', 'completed_at',
            'is_overdue', 'days_until_deadline'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    client_name = serializers.CharField(source='client.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_deadline = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_name', 'title', 'status', 'status_display',
            'service_type', 'deadline', 'is_overdue', 'days_until_deadline'
        ]


class ProjectDetailSerializer(ProjectSerializer):
    """Detailed serializer with client info."""
    client_details = ClientListSerializer(source='client', read_only=True)

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['client_details']
