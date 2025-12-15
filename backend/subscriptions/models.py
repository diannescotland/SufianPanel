import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from clients.models import Client
from projects.models import Project


class AITool(models.Model):
    """Available AI tools with default pricing."""

    TOOL_TYPES = [
        ('image', "Génération d'images"),
        ('video', 'Génération de vidéos'),
        ('audio', 'Génération audio'),
        ('both', 'Images & Vidéos'),
    ]

    PRICING_MODELS = [
        ('monthly', 'Abonnement mensuel'),
        ('credits', 'Basé sur crédits'),
        ('per_use', 'Par utilisation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    tool_type = models.CharField(max_length=20, choices=TOOL_TYPES)
    pricing_model = models.CharField(max_length=20, choices=PRICING_MODELS, default='monthly')

    # Default pricing in MAD (for estimation before you enter actual costs)
    default_monthly_cost_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Coût mensuel par défaut en MAD"
    )
    default_credits_per_month = models.IntegerField(
        default=0,
        help_text="Crédits par défaut inclus par mois"
    )
    default_cost_per_image_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Coût par image en MAD"
    )
    default_cost_per_video_second_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Coût par seconde de vidéo en MAD"
    )

    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_name']
        verbose_name = "Outil IA"
        verbose_name_plural = "Outils IA"

    def __str__(self):
        return self.display_name


class Subscription(models.Model):
    """
    Monthly subscription to an AI tool.
    User inputs actual cost paid and credits received.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE, related_name='subscriptions')

    # Billing period (first day of the month)
    billing_month = models.DateField(help_text="Premier jour du mois de facturation")

    # Actual cost in MAD
    total_cost_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Montant total payé en MAD"
    )

    # Original cost if paid in foreign currency
    original_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    original_currency = models.CharField(
        max_length=3,
        default='MAD',
        help_text="USD, EUR, ou MAD"
    )
    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True,
        help_text="Taux de change vers MAD"
    )

    # Credits (if applicable)
    total_credits = models.IntegerField(
        null=True,
        blank=True,
        help_text="Crédits totaux inclus"
    )
    credits_remaining = models.IntegerField(
        null=True,
        blank=True
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-billing_month']
        unique_together = ['tool', 'billing_month']
        verbose_name = "Abonnement"
        verbose_name_plural = "Abonnements"

    def __str__(self):
        return f"{self.tool.display_name} - {self.billing_month.strftime('%B %Y')}"

    @property
    def cost_per_credit_mad(self):
        """Calculate cost per credit in MAD."""
        if self.total_credits and self.total_credits > 0:
            return self.total_cost_mad / Decimal(self.total_credits)
        return None

    @property
    def credits_used(self):
        """Sum of credits used from this subscription."""
        total = self.usages.aggregate(total=models.Sum('credits_used'))['total']
        return total or 0

    def save(self, *args, **kwargs):
        # Calculate MAD amount from foreign currency if needed
        if self.original_currency != 'MAD' and self.original_amount and self.exchange_rate:
            self.total_cost_mad = self.original_amount * self.exchange_rate

        # Initialize remaining credits
        if self.credits_remaining is None and self.total_credits:
            self.credits_remaining = self.total_credits

        super().save(*args, **kwargs)


class CreditUsage(models.Model):
    """
    Track each generation/usage per client.
    This allows fine-tuning cost calculations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='credit_usages'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='credit_usages'
    )

    # What was generated
    GENERATION_TYPES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
        ('audio', 'Audio'),
        ('other', 'Autre'),
    ]
    generation_type = models.CharField(max_length=20, choices=GENERATION_TYPES, default='image')

    # Usage details
    credits_used = models.IntegerField(default=0)
    items_generated = models.IntegerField(default=1)
    video_seconds = models.IntegerField(default=0, help_text="Durée en secondes (pour vidéos)")

    # Auto-calculated cost in MAD
    calculated_cost_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # Override cost (if you want to set manually)
    manual_cost_mad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Coût manuel en MAD (override le calcul automatique)"
    )

    description = models.CharField(max_length=500, blank=True)
    usage_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-usage_date']
        verbose_name = "Utilisation"
        verbose_name_plural = "Utilisations"

    def __str__(self):
        return f"{self.client.name} - {self.subscription.tool.display_name} ({self.items_generated} items)"

    @property
    def final_cost_mad(self):
        """Return manual cost if set, otherwise calculated cost."""
        if self.manual_cost_mad is not None:
            return self.manual_cost_mad
        return self.calculated_cost_mad

    def calculate_cost(self):
        """Calculate cost based on subscription or defaults."""
        tool = self.subscription.tool

        # Priority 1: Use subscription's cost per credit if available
        if self.subscription.cost_per_credit_mad and self.credits_used > 0:
            return self.credits_used * self.subscription.cost_per_credit_mad

        # Priority 2: Calculate based on generation type
        if self.generation_type == 'video' and self.video_seconds > 0:
            cost_per_sec = tool.default_cost_per_video_second_mad
            if cost_per_sec > 0:
                return Decimal(self.video_seconds) * cost_per_sec

        if self.generation_type == 'image' and self.items_generated > 0:
            cost_per_img = tool.default_cost_per_image_mad
            if cost_per_img > 0:
                return Decimal(self.items_generated) * cost_per_img

        # Priority 3: Proportional cost based on subscription
        if self.subscription.total_credits and self.subscription.total_credits > 0:
            proportion = Decimal(self.credits_used) / Decimal(self.subscription.total_credits)
            return self.subscription.total_cost_mad * proportion

        # Fallback: Estimate based on item count
        if self.subscription.total_cost_mad > 0:
            # Assume ~100 items per month as baseline
            return (self.subscription.total_cost_mad / 100) * self.items_generated

        return Decimal('0')

    def save(self, *args, **kwargs):
        # Auto-calculate cost if not manually set
        if self.manual_cost_mad is None:
            self.calculated_cost_mad = self.calculate_cost()

        # Update subscription remaining credits
        if self.subscription.credits_remaining is not None and self.credits_used > 0:
            self.subscription.credits_remaining = max(
                0,
                (self.subscription.total_credits or 0) - self.subscription.credits_used
            )
            self.subscription.save(update_fields=['credits_remaining', 'updated_at'])

        super().save(*args, **kwargs)


class ClientServiceSelection(models.Model):
    """Which services/tools are assigned to each client."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='service_selections'
    )
    tool = models.ForeignKey(
        AITool,
        on_delete=models.CASCADE,
        related_name='client_selections'
    )
    is_active = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['client', 'tool']
        ordering = ['tool__display_name']

    def __str__(self):
        return f"{self.client.name} - {self.tool.display_name}"
