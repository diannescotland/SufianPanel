import uuid
from django.db import models


class Client(models.Model):
    """Model for storing client information."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.company})" if self.company else self.name

    @property
    def total_projects(self):
        return self.projects.count()

    @property
    def total_invoiced(self):
        return sum(invoice.total_amount for invoice in self.invoices.all())

    @property
    def total_paid(self):
        return sum(invoice.amount_paid for invoice in self.invoices.all())

    @property
    def outstanding_balance(self):
        return self.total_invoiced - self.total_paid
