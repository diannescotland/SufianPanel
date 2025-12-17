import uuid
from django.db import models
from django.utils import timezone
from clients.models import Client


class Project(models.Model):
    """Model for client projects."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    SERVICE_TYPES = [
        ('image', 'Image Generation'),
        ('video', 'Video Generation'),
        ('audio', 'Audio Generation'),
        ('both', 'Image & Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['deadline']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['client', 'deadline']),
        ]

    def __str__(self):
        return f"{self.title} - {self.client.name}"

    @property
    def is_overdue(self):
        if self.status in ['completed', 'cancelled']:
            return False
        return timezone.now() > self.deadline

    @property
    def days_until_deadline(self):
        if self.status in ['completed', 'cancelled']:
            return None
        delta = self.deadline - timezone.now()
        return delta.days
