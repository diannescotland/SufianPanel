import uuid
from django.db import models
from django.utils import timezone
from django.db import transaction
from clients.models import Client
from projects.models import Project
from services.models import Service


class Invoice(models.Model):
    """Model for invoices - Moroccan format with MAD currency."""

    PAYMENT_STATUS = [
        ('unpaid', 'Non payé'),
        ('partial', 'Partiellement payé'),
        ('paid', 'Payé'),
        ('overdue', 'En retard'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')

    # Amounts in MAD
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Deposit (Acompte)
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Acompte en MAD"
    )

    # TVA - default 0% for auto-entrepreneur
    tva_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Taux TVA en % (0 par défaut)"
    )

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    due_date = models.DateField()
    issued_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)

    class Meta:
        ordering = ['-issued_date']
        indexes = [
            models.Index(fields=['payment_status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['client', 'payment_status']),
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.client.name}"

    @property
    def amount_remaining(self):
        return self.total_amount - self.amount_paid

    @property
    def tva_amount(self):
        """Calculate TVA amount."""
        if self.tva_rate > 0:
            return (self.total_amount * self.tva_rate) / 100
        return 0

    @property
    def total_with_tva(self):
        """Total including TVA."""
        return self.total_amount + self.tva_amount

    @property
    def is_overdue(self):
        if self.payment_status == 'paid':
            return False
        return timezone.now().date() > self.due_date

    def update_payment_status(self):
        """Update payment status based on amount paid."""
        if self.amount_paid >= self.total_amount:
            self.payment_status = 'paid'
        elif self.amount_paid > 0:
            self.payment_status = 'partial'
        elif self.is_overdue:
            self.payment_status = 'overdue'
        else:
            self.payment_status = 'unpaid'
        self.save()

    def save(self, *args, **kwargs):
        # Generate invoice number if not set (format: SB{month}-{N}, starting at 9)
        if not self.invoice_number:
            from datetime import datetime
            current_month = datetime.now().month
            prefix = f'SB{current_month}-'

            with transaction.atomic():
                # Get all invoices for current month and find the highest number
                invoices = Invoice.objects.select_for_update().filter(
                    invoice_number__startswith=prefix
                )

                max_num = 8  # Start at 9 (8 + 1)
                for inv in invoices:
                    try:
                        num = int(inv.invoice_number.split('-')[1])
                        if num > max_num:
                            max_num = num
                    except (ValueError, IndexError):
                        pass

                self.invoice_number = f'{prefix}{max_num + 1}'

        super().save(*args, **kwargs)


class InvoiceItem(models.Model):
    """Model for individual invoice line items."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)

    # Title and description (Title = main line, description = subtitle)
    title = models.CharField(max_length=255, default='', help_text="Titre principal (ex: Campagne ADS)")
    description = models.CharField(max_length=500, blank=True, help_text="Sous-titre/description")

    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.title} - {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Model for recording payments."""

    PAYMENT_METHODS = [
        ('cash', 'Espèces'),
        ('bank_transfer', 'Virement bancaire'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('other', 'Autre'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Paiement de {self.amount} MAD pour {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice amount paid
        self.invoice.amount_paid = sum(
            p.amount for p in self.invoice.payments.all()
        )
        self.invoice.update_payment_status()
