import uuid
from django.db import models


class Service(models.Model):
    """Model for services offered."""

    SERVICE_TYPES = [
        ('image', 'Image Generation'),
        ('video', 'Video Generation'),
        ('audio', 'Audio Generation'),
        ('both', 'Image & Video'),
    ]

    AI_TOOLS = [
        ('kling_ai', 'Kling AI'),
        ('freepik', 'Freepik'),
        ('openart', 'OpenArt'),
        ('adobe', 'Adobe'),
        ('suno_ai', 'Suno AI'),
        ('grok', 'Grok'),
        ('higgsfield', 'Higgsfield'),
        ('runway', 'Runway'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    ai_tool = models.CharField(max_length=50, choices=AI_TOOLS)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_name = models.CharField(max_length=50, default='item')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.get_ai_tool_display()}"


class ServicePricing(models.Model):
    """Model for detailed pricing tiers."""

    SERVICE_TYPES = [
        ('image', 'Image Generation'),
        ('video', 'Video Generation'),
        ('audio', 'Audio Generation'),
        ('both', 'Image & Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ai_tool = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)

    # Pricing tiers (Free / Standard / Pro / Premier)
    free_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    standard_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pro_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    premier_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Credits per tier
    free_credits = models.IntegerField(default=0)
    standard_credits = models.IntegerField(default=0)
    pro_credits = models.IntegerField(default=0)
    premier_credits = models.IntegerField(null=True, blank=True)

    # Per unit pricing
    price_per_image = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_video_second = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Metadata
    description = models.TextField(blank=True)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Service Pricing"
        ordering = ['display_name']

    def __str__(self):
        return self.display_name
