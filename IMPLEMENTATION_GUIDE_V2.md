# SufianPanel Implementation Guide v2

## Updates from v1
- ✅ New SVG logo (SB_LOGO_4_4.svg) integrated
- ✅ Default pricing with per-generation tracking
- ✅ MAD currency throughout the system

---

## 1. Invoice PDF Generator (Updated)

### Step 1: Copy Logo to Static Files

```bash
# Create static folder structure
mkdir -p backend/static/images
mkdir -p backend/static/fonts

# Copy your logo
cp SB_LOGO_4_4.svg backend/static/images/logo.svg
```

### Step 2: Download Quicksand Font

Download from Google Fonts and place in `backend/static/fonts/`:
- Quicksand-Regular.ttf
- Quicksand-Bold.ttf  
- Quicksand-Medium.ttf
- Quicksand-Light.ttf

### Step 3: Install WeasyPrint

Add to `backend/requirements.txt`:
```
weasyprint==62.3
```

### Step 4: Create Invoice HTML Template

Create `backend/invoices/templates/invoices/invoice_template.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('file://{{ font_path }}/Quicksand-Regular.ttf');
            font-weight: 400;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('file://{{ font_path }}/Quicksand-Bold.ttf');
            font-weight: 700;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('file://{{ font_path }}/Quicksand-Medium.ttf');
            font-weight: 500;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('file://{{ font_path }}/Quicksand-Light.ttf');
            font-weight: 300;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'Quicksand', sans-serif;
            font-size: 11pt;
            color: #333333;
            line-height: 1.5;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            background: white;
            position: relative;
        }
        
        /* Header Band */
        .header {
            background: #D4C4B0;
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .facture-title {
            font-family: 'Times New Roman', Georgia, serif;
            font-size: 48pt;
            font-weight: bold;
            color: #1a1a2e;
            letter-spacing: 6px;
            text-transform: uppercase;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
        }
        
        .logo-container {
            width: 120px;
            height: 120px;
            background: #2A7B88;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }
        
        .logo-container img {
            width: 100%;
            height: auto;
            filter: brightness(0) invert(1);
        }
        
        /* Content Area */
        .content {
            padding: 35px 40px;
            min-height: 500px;
        }
        
        /* Client Info Section */
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
        }
        
        .client-info {
            flex: 1;
        }
        
        .client-info h3 {
            font-size: 13pt;
            font-weight: 500;
            text-decoration: underline;
            margin-bottom: 12px;
            color: #333;
        }
        
        .client-info p {
            margin: 4px 0;
            font-size: 11pt;
        }
        
        .client-info .company-name {
            font-weight: 700;
            font-size: 12pt;
        }
        
        .invoice-meta {
            text-align: right;
        }
        
        .invoice-meta p {
            margin: 6px 0;
            font-size: 11pt;
        }
        
        .invoice-meta strong {
            font-weight: 600;
        }
        
        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .items-table th {
            border-bottom: 2px solid #333;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11pt;
        }
        
        .items-table th.center {
            text-align: center;
        }
        
        .items-table td {
            padding: 18px 8px;
            vertical-align: top;
            font-size: 11pt;
        }
        
        .items-table td.center {
            text-align: center;
        }
        
        .item-title {
            font-weight: 600;
            font-size: 12pt;
            color: #333;
        }
        
        .item-description {
            font-size: 10pt;
            color: #666;
            margin-top: 4px;
        }
        
        .table-divider {
            border-top: 1px solid #333;
            margin: 8px 0;
        }
        
        /* Note and Total Section */
        .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin: 50px 0 30px 0;
        }
        
        .note-box {
            max-width: 50%;
            font-size: 10pt;
            line-height: 1.7;
            color: #444;
        }
        
        .note-box p {
            margin-bottom: 12px;
        }
        
        .total-box {
            border: 2px solid #2A7B88;
            padding: 18px 30px;
            text-align: center;
            min-width: 200px;
        }
        
        .total-label {
            color: #2A7B88;
            font-size: 12pt;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 22pt;
            font-weight: 700;
            color: #2A7B88;
        }
        
        /* Seller Footer Info */
        .seller-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #ccc;
        }
        
        .seller-info {
            font-size: 10pt;
        }
        
        .seller-info p {
            margin: 3px 0;
        }
        
        .seller-info .name {
            font-weight: 700;
            font-size: 11pt;
        }
        
        .stamp-box {
            border: 2px solid #2A7B88;
            border-radius: 6px;
            padding: 12px 20px;
            text-align: center;
            color: #2A7B88;
        }
        
        .stamp-name {
            font-size: 14pt;
            font-weight: 700;
        }
        
        .stamp-title {
            font-size: 9pt;
            margin: 4px 0;
        }
        
        .stamp-details {
            font-size: 9pt;
        }
        
        /* Bank Footer */
        .bank-footer {
            background: #D4C4B0;
            padding: 20px 40px;
            text-align: center;
            font-size: 10pt;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }
        
        .bank-footer p {
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <div class="facture-title">FACTURE</div>
            <div class="logo-container">
                <img src="file://{{ logo_path }}" alt="Logo">
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Client and Invoice Info -->
            <div class="info-section">
                <div class="client-info">
                    <h3>Facture à :</h3>
                    <p class="company-name">{{ client.company|default:client.name }}</p>
                    {% if client.address_line1 %}<p>{{ client.address_line1 }}</p>{% endif %}
                    {% if client.address_line2 %}<p>{{ client.address_line2 }}</p>{% endif %}
                    {% if client.ice_number %}<p>ICE : {{ client.ice_number }}</p>{% endif %}
                </div>
                <div class="invoice-meta">
                    <p>Facture n° : <strong>{{ invoice.invoice_number }}</strong></p>
                    <p>En date du : <strong>{{ invoice.issued_date|date:"d-m-Y" }}</strong></p>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Description</th>
                        <th class="center" style="width: 15%;">Quantité</th>
                        <th class="center" style="width: 15%;">TVA</th>
                        <th class="center" style="width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in items %}
                    <tr>
                        <td>
                            <div class="item-title">{{ item.title|default:item.description }}</div>
                            {% if item.subtitle %}<div class="item-description">{{ item.subtitle }}</div>{% endif %}
                        </td>
                        <td class="center">{{ item.quantity }}</td>
                        <td class="center">{{ invoice.tva_rate|floatformat:0 }}%</td>
                        <td class="center">{{ item.total_price|floatformat:0 }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            
            <div class="table-divider"></div>
            <div class="table-divider"></div>
            
            <!-- Note and Total -->
            <div class="bottom-section">
                <div class="note-box">
                    {% if invoice.deposit_amount %}
                    <p>Note : Un acompte de {{ invoice.deposit_amount|floatformat:0 }} MAD sera versé titre d'avance sur la facture d'un montant total de {{ invoice.total_amount|floatformat:0 }} MAD.</p>
                    <p>Le solde de {{ remaining_amount|floatformat:0 }} MAD sera réglé à la livraison de la prestation.</p>
                    {% elif invoice.notes %}
                    <p>{{ invoice.notes }}</p>
                    {% endif %}
                </div>
                <div class="total-box">
                    <div class="total-label">Total à payer HT</div>
                    <div class="total-amount">{{ invoice.total_amount|floatformat:0 }} dhs</div>
                </div>
            </div>
            
            <!-- Seller Info -->
            <div class="seller-section">
                <div class="seller-info">
                    <p class="name">Soufian Bouhrara</p>
                    <p>ICE : 003747242000025</p>
                    <p>+212 724216096</p>
                </div>
                <div class="stamp-box">
                    <div class="stamp-name">Soufian BOUHRARA</div>
                    <div class="stamp-title">Auto-Entrepreneur</div>
                    <div class="stamp-details">ICE: 003747242000025</div>
                    <div class="stamp-details">Tél: 07 24 21 60 96</div>
                </div>
            </div>
        </div>
        
        <!-- Bank Footer -->
        <div class="bank-footer">
            <p>Compte bancaire : Al Barid Bank</p>
            <p>Titulaire : BOUHRARA SOUFIAN</p>
            <p>RIB : 350810000000001304811290</p>
            <p>IBAN : MA64 350 810 0000000013048112 90</p>
        </div>
    </div>
</body>
</html>
```

### Step 5: Create PDF Generator Service

Create `backend/invoices/pdf_generator.py`:

```python
import os
from django.conf import settings
from django.template.loader import render_to_string
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration


def generate_invoice_pdf(invoice):
    """
    Generate a PDF invoice matching the Canva template.
    Uses Quicksand font and the SB logo.
    """
    font_config = FontConfiguration()
    
    # Paths
    static_dir = os.path.join(settings.BASE_DIR, 'static')
    font_path = os.path.join(static_dir, 'fonts')
    logo_path = os.path.join(static_dir, 'images', 'logo.svg')
    
    # Calculate remaining amount after deposit
    remaining_amount = 0
    if invoice.deposit_amount:
        remaining_amount = invoice.total_amount - invoice.deposit_amount
    
    # Get items with proper titles
    items = []
    for item in invoice.items.all():
        items.append({
            'title': item.title or item.description,
            'subtitle': item.description if item.title else None,
            'quantity': item.quantity,
            'total_price': item.total_price,
        })
    
    context = {
        'invoice': invoice,
        'client': invoice.client,
        'items': items,
        'font_path': font_path,
        'logo_path': logo_path,
        'remaining_amount': remaining_amount,
    }
    
    html_string = render_to_string('invoices/invoice_template.html', context)
    
    html = HTML(string=html_string, base_url=str(settings.BASE_DIR))
    pdf = html.write_pdf(font_config=font_config)
    
    return pdf
```

### Step 6: Update Invoice Model

Update `backend/invoices/models.py`:

```python
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
        # Generate invoice number if not set (format: SB6-XX)
        if not self.invoice_number:
            with transaction.atomic():
                last_invoice = Invoice.objects.select_for_update().filter(
                    invoice_number__startswith='SB6-'
                ).order_by('-invoice_number').first()
                
                if last_invoice:
                    try:
                        last_num = int(last_invoice.invoice_number.split('-')[1])
                        new_num = last_num + 1
                    except (ValueError, IndexError):
                        new_num = 1
                else:
                    new_num = 1
                
                self.invoice_number = f'SB6-{new_num}'
        
        super().save(*args, **kwargs)


class InvoiceItem(models.Model):
    """Model for individual invoice line items."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Title and description (Title = main line, description = subtitle)
    title = models.CharField(max_length=255, help_text="Titre principal (ex: Campagne ADS)")
    description = models.CharField(max_length=500, blank=True, help_text="Sous-titre/description")
    
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.title} - {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
```

### Step 7: Update Client Model

Update `backend/clients/models.py`:

```python
import uuid
from django.db import models


class Client(models.Model):
    """Model for storing client information - Moroccan format."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=255, blank=True, null=True)
    
    # Moroccan business fields
    ice_number = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        verbose_name="ICE",
        help_text="Identifiant Commun de l'Entreprise"
    )
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    
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
```

### Step 8: Update Invoice Views

Update `backend/invoices/views.py` to use the new PDF generator:

```python
from django.http import HttpResponse
from .pdf_generator import generate_invoice_pdf

class InvoiceViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and download PDF invoice."""
        invoice = self.get_object()
        
        try:
            pdf = generate_invoice_pdf(invoice)
            
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'}, 
                status=500
            )
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Download PDF as attachment."""
        invoice = self.get_object()
        
        try:
            pdf = generate_invoice_pdf(invoice)
            
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'}, 
                status=500
            )
```

---

## 2. Darkmatter Theme (Same as v1)

Replace `frontend/src/app/globals.css` with the Darkmatter theme CSS provided in v1. No changes needed.

---

## 3. Code Review Issues (Same as v1)

Refer to v1 for the full list of issues and fixes.

---

## 4. Production Mode Script (Same as v1)

Refer to v1 for `start.sh` and `start.bat` scripts.

---

## 5. Credit Tracking System (Updated with MAD + Default Pricing)

### Create New Django App

```bash
cd backend
python manage.py startapp subscriptions
```

### Add to INSTALLED_APPS

In `backend/config/settings.py`:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    "subscriptions",
]
```

### Models with MAD Currency and Default Pricing

Create `backend/subscriptions/models.py`:

```python
import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from clients.models import Client
from projects.models import Project


class AITool(models.Model):
    """Available AI tools with default pricing."""
    
    TOOL_TYPES = [
        ('image', 'Génération d\'images'),
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
```

### Seed Default Tools with Pricing

Create `backend/subscriptions/management/commands/seed_tools.py`:

```python
from django.core.management.base import BaseCommand
from subscriptions.models import AITool


class Command(BaseCommand):
    help = 'Seed default AI tools with estimated pricing'
    
    def handle(self, *args, **options):
        # Exchange rates (approximate) - update as needed
        # 1 USD ≈ 10 MAD, 1 EUR ≈ 11 MAD
        
        tools = [
            {
                'name': 'kling_ai',
                'display_name': 'Kling AI',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 300,  # ~$30
                'default_credits_per_month': 660,
                'default_cost_per_video_second_mad': 5,
            },
            {
                'name': 'freepik',
                'display_name': 'Freepik',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 374,  # €34
                'default_credits_per_month': 0,  # Unlimited downloads
                'default_cost_per_image_mad': 1.5,  # Estimated
            },
            {
                'name': 'openart',
                'display_name': 'OpenArt',
                'tool_type': 'image',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 120,  # ~$12
                'default_credits_per_month': 3000,
                'default_cost_per_image_mad': 0.4,
            },
            {
                'name': 'adobe',
                'display_name': 'Adobe Creative Cloud',
                'tool_type': 'both',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 213,  # ~$21.31
                'default_credits_per_month': 500,
                'default_cost_per_image_mad': 2,
            },
            {
                'name': 'suno_ai',
                'display_name': 'Suno AI',
                'tool_type': 'audio',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 100,  # ~$10
                'default_credits_per_month': 500,
                'default_cost_per_image_mad': 0,
            },
            {
                'name': 'grok',
                'display_name': 'Grok (xAI)',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 160,  # ~$16
                'default_credits_per_month': 0,
                'default_cost_per_image_mad': 1,
            },
            {
                'name': 'higgsfield',
                'display_name': 'Higgsfield',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 200,  # ~$20
                'default_credits_per_month': 1000,
                'default_cost_per_video_second_mad': 3,
            },
            {
                'name': 'runway',
                'display_name': 'Runway',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 150,  # ~$15
                'default_credits_per_month': 625,  # 625 credits = 125 seconds
                'default_cost_per_video_second_mad': 1.2,
            },
            {
                'name': 'openai',
                'display_name': 'OpenAI / ChatGPT Plus',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 200,  # $20
                'default_credits_per_month': 0,
                'default_cost_per_image_mad': 1,
            },
        ]
        
        created = 0
        updated = 0
        
        for tool_data in tools:
            obj, was_created = AITool.objects.update_or_create(
                name=tool_data['name'],
                defaults=tool_data
            )
            if was_created:
                created += 1
            else:
                updated += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ {created} outils créés, {updated} outils mis à jour'
            )
        )
```

### Create Serializers

Create `backend/subscriptions/serializers.py`:

```python
from rest_framework import serializers
from decimal import Decimal
from .models import AITool, Subscription, CreditUsage, ClientServiceSelection


class AIToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITool
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)
    cost_per_credit_mad = serializers.DecimalField(
        max_digits=10, decimal_places=4, read_only=True
    )
    credits_used = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating subscriptions."""
    
    class Meta:
        model = Subscription
        fields = [
            'tool', 'billing_month', 'total_cost_mad',
            'original_amount', 'original_currency', 'exchange_rate',
            'total_credits', 'notes'
        ]


class CreditUsageSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(
        source='subscription.tool.display_name', 
        read_only=True
    )
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(
        source='project.title', 
        read_only=True
    )
    final_cost_mad = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = CreditUsage
        fields = '__all__'
        read_only_fields = ['calculated_cost_mad']


class CreditUsageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for logging usage."""
    
    class Meta:
        model = CreditUsage
        fields = [
            'subscription', 'client', 'project',
            'generation_type', 'credits_used', 'items_generated',
            'video_seconds', 'description', 'manual_cost_mad'
        ]


class ClientServiceSelectionSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source='tool.display_name', read_only=True)
    tool_type = serializers.CharField(source='tool.tool_type', read_only=True)
    
    class Meta:
        model = ClientServiceSelection
        fields = '__all__'


class ClientCostSummarySerializer(serializers.Serializer):
    """Summary of costs per client in MAD."""
    client_id = serializers.UUIDField()
    client_name = serializers.CharField()
    total_cost_mad = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_credits_used = serializers.IntegerField()
    total_items_generated = serializers.IntegerField()
    breakdown_by_tool = serializers.ListField()
```

### Create Views

Create `backend/subscriptions/views.py`:

```python
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
    ClientServiceSelectionSerializer
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
        if self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionSerializer
    
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
                {'error': 'client_id requis'}, 
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
                {'error': 'tool_id et client_id sont requis'},
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
                {'error': f'Aucun abonnement actif trouvé pour cet outil ce mois'},
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
    
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get active service selections for a client."""
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {'error': 'client_id requis'},
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
                {'error': 'client_id requis'},
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
        """Get cost summary for all clients."""
        summaries = []
        
        for client in Client.objects.filter(is_active=True):
            usages = CreditUsage.objects.filter(client=client)
            
            # Use final_cost which respects manual overrides
            total_cost = sum(u.final_cost_mad for u in usages)
            
            totals = usages.aggregate(
                total_credits=Sum('credits_used'),
                total_items=Sum('items_generated')
            )
            
            # Breakdown by tool
            breakdown = usages.values(
                tool_name=F('subscription__tool__display_name')
            ).annotate(
                cost_mad=Sum('calculated_cost_mad'),
                credits=Sum('credits_used'),
                items=Sum('items_generated')
            )
            
            summaries.append({
                'client_id': str(client.id),
                'client_name': client.name,
                'company': client.company,
                'total_cost_mad': float(total_cost),
                'total_credits_used': totals['total_credits'] or 0,
                'total_items_generated': totals['total_items'] or 0,
                'breakdown_by_tool': list(breakdown)
            })
        
        # Sort by cost descending
        summaries.sort(key=lambda x: x['total_cost_mad'], reverse=True)
        
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
```

### Create URLs

Create `backend/subscriptions/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tools', views.AIToolViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'usage', views.CreditUsageViewSet)
router.register(r'client-services', views.ClientServiceSelectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/costs/', views.CostAnalyticsView.as_view(), name='cost-analytics'),
    path('analytics/monthly/', views.MonthlyOverviewView.as_view(), name='monthly-overview'),
]
```

### Update Main URLs

Add to `backend/config/urls.py`:

```python
urlpatterns = [
    # ... existing urls ...
    path('api/subscriptions/', include('subscriptions.urls')),
]
```

---

## 6. Commands Summary

```bash
# Backend setup
cd backend
pip install weasyprint --break-system-packages
python manage.py startapp subscriptions
# Add 'subscriptions' to INSTALLED_APPS
python manage.py makemigrations clients invoices subscriptions
python manage.py migrate
python manage.py seed_tools

# Create static folders
mkdir -p static/images static/fonts
# Copy your logo and fonts

# Frontend - no changes needed for theme, just replace globals.css
```

---

## 7. Frontend Types Update

Add to `frontend/src/types/index.ts`:

```typescript
// Subscription Types
export interface AITool {
  id: string
  name: string
  display_name: string
  tool_type: 'image' | 'video' | 'audio' | 'both'
  pricing_model: 'monthly' | 'credits' | 'per_use'
  default_monthly_cost_mad: number
  default_credits_per_month: number
  default_cost_per_image_mad: number
  default_cost_per_video_second_mad: number
  is_active: boolean
}

export interface Subscription {
  id: string
  tool: string
  tool_name?: string
  billing_month: string
  total_cost_mad: number
  original_amount?: number
  original_currency: string
  exchange_rate?: number
  total_credits?: number
  credits_remaining?: number
  cost_per_credit_mad?: number
  credits_used?: number
  notes: string
  is_active: boolean
}

export interface CreditUsage {
  id: string
  subscription: string
  tool_name?: string
  client: string
  client_name?: string
  project?: string
  project_title?: string
  generation_type: 'image' | 'video' | 'audio' | 'other'
  credits_used: number
  items_generated: number
  video_seconds: number
  calculated_cost_mad: number
  manual_cost_mad?: number
  final_cost_mad?: number
  description: string
  usage_date: string
}

export interface ClientCostSummary {
  client_id: string
  client_name: string
  company?: string
  total_cost_mad: number
  total_credits_used: number
  total_items_generated: number
  breakdown_by_tool: {
    tool_name: string
    cost_mad: number
    credits: number
    items: number
  }[]
}
```

---

## Summary

This updated guide includes:

1. ✅ **Invoice Generator** - Your SVG logo with teal background, Quicksand font, 0% TVA default
2. ✅ **Darkmatter Theme** - Ready to drop in
3. ✅ **Code Review Fixes** - 10 issues identified
4. ✅ **Start Script** - Single-click local startup
5. ✅ **Credit Tracking** - MAD currency, default pricing, per-generation tracking

The workflow for credits:
1. Input monthly subscription → "I paid 374 MAD for Freepik"
2. Select client services → "Client X uses Freepik + Runway"
3. Log each generation → "Generated 15 images for Client X"
4. View costs → "Client X coût total: 22.50 MAD"

*Ready for Claude Code execution!*
