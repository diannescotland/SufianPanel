from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'service_type', 'status', 'deadline', 'created_at']
    list_filter = ['status', 'service_type', 'created_at']
    search_fields = ['title', 'description', 'client__name']
    ordering = ['-created_at']
    raw_id_fields = ['client']
