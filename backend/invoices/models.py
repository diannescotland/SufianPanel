import uuid
from django.db import models
from django.utils import timezone
from clients.models import Client
from projects.models import Project
from services.models import Service


class Invoice(models.Model):
    """Model for invoices."""

    PAYMENT_STATUS = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    due_date = models.DateField()
    issued_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)

    class Meta:
        ordering = ['-issued_date']

    def __str__(self):
        return f"{self.invoice_number} - {self.client.name}"

    @property
    def amount_remaining(self):
        return self.total_amount - self.amount_paid

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
        # Generate invoice number if not set
        if not self.invoice_number:
            year = timezone.now().year
            last_invoice = Invoice.objects.filter(
                invoice_number__startswith=f'INV-{year}'
            ).order_by('-invoice_number').first()

            if last_invoice:
                last_num = int(last_invoice.invoice_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1

            self.invoice_number = f'INV-{year}-{new_num:05d}'

        super().save(*args, **kwargs)


class InvoiceItem(models.Model):
    """Model for individual invoice line items."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Model for recording payments."""

    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('other', 'Other'),
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
        return f"Payment of ${self.amount} for {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice amount paid
        self.invoice.amount_paid = sum(
            p.amount for p in self.invoice.payments.all()
        )
        self.invoice.update_payment_status()
