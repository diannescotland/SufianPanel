# CLAUDE.md - Project Context

## Overview

**Sufian Panel** - Full-stack client management system for a Moroccan graphic design business (AI-generated content services).

**Currency:** MAD (Moroccan Dirham) | **Language:** French labels in invoices

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Django 6.0 + DRF, SQLite, JWT auth |
| Frontend | Next.js 16 + React 19, Tailwind CSS 4, React Query v5 |
| PDF | ReportLab (fallback) / WeasyPrint (if GTK installed) |

---

## Project Structure

```
backend/
├── config/           # Settings, URLs
├── clients/          # Client management
├── projects/         # Project workflow
├── invoices/         # Invoices, payments, PDF generation
├── services/         # Service pricing
├── analytics/        # Dashboard analytics
├── subscriptions/    # AI tool credit tracking (NEW)
└── static/
    ├── images/logo.svg
    └── fonts/        # Quicksand fonts (for WeasyPrint)

frontend/src/
├── app/              # Next.js pages
├── components/       # UI components
├── services/         # API clients
├── providers/        # React Query, Theme
├── types/index.ts    # TypeScript interfaces
└── lib/utils.ts      # Helpers
```

---

## Database Models

### Client
```python
id, name, email, phone, company
ice_number          # Moroccan business ID (ICE)
address_line1, address_line2, city
is_active           # Soft delete flag
# Computed: total_projects, total_invoiced, total_paid, outstanding_balance
```

### Project
```python
client (FK), title, description
service_type: image | video | audio | both
status: pending | in_progress | review | completed | cancelled
deadline, completed_at
# Computed: is_overdue, days_until_deadline
```

### Invoice
```python
invoice_number      # Auto: SB6-{N}
project (FK), client (FK)
total_amount, amount_paid (MAD)
deposit_amount      # Acompte
tva_rate            # Default 0% (auto-entrepreneur)
payment_status: unpaid | partial | paid | overdue
due_date, issued_date, notes
# Computed: amount_remaining, tva_amount, total_with_tva, is_overdue
```

### InvoiceItem
```python
invoice (FK), service (FK, optional)
title               # Main line (e.g., "Campagne ADS")
description         # Subtitle
quantity, unit_price, total_price (auto-calculated)
```

### Payment
```python
invoice (FK), amount
payment_method: cash | bank_transfer | paypal | stripe | other
payment_date, transaction_id, notes
# Auto-updates invoice.amount_paid and payment_status on save
```

### Subscriptions App (Credit Tracking)

#### AITool
```python
name, display_name, tool_type, pricing_model
default_monthly_cost_mad, default_credits_per_month
default_cost_per_image_mad, default_cost_per_video_second_mad
```

#### Subscription
```python
tool (FK), billing_month
total_cost_mad, original_amount, original_currency, exchange_rate
total_credits, credits_remaining
# Computed: cost_per_credit_mad, credits_used
```

#### CreditUsage
```python
subscription (FK), client (FK), project (FK, optional)
generation_type: image | video | audio | other
credits_used, items_generated, video_seconds
calculated_cost_mad, manual_cost_mad
# Computed: final_cost_mad (manual if set, else calculated)
```

#### ClientServiceSelection
```python
client (FK), tool (FK), is_active, notes
```

---

## API Endpoints

### Core Resources
```
/api/clients/                    # CRUD, soft delete
/api/clients/{id}/history/       # Projects + invoices + summary
/api/projects/                   # CRUD + status workflow
/api/projects/deadlines/         # Upcoming deadlines
/api/invoices/                   # CRUD with items
/api/invoices/{id}/pdf/          # View PDF inline
/api/invoices/{id}/download_pdf/ # Download PDF
/api/invoices/{id}/add_item/     # Add line item
/api/invoices/{id}/record_payment/
```

### Analytics
```
/api/analytics/overview/         # Dashboard stats
/api/analytics/revenue/          # Revenue trends
/api/analytics/clients/          # Top clients, retention
/api/analytics/services/         # Service breakdown
/api/analytics/payments/         # Payment distribution
```

### Subscriptions (Credit Tracking)
```
/api/subscriptions/tools/              # AI tools CRUD
/api/subscriptions/tools/active/       # Active tools only
/api/subscriptions/subscriptions/      # Monthly subscriptions
/api/subscriptions/subscriptions/current_month/
/api/subscriptions/subscriptions/{id}/usage_by_client/
/api/subscriptions/usage/              # Credit usage records
/api/subscriptions/usage/by_client/?client_id=
/api/subscriptions/usage/log_generation/  # Quick log endpoint
/api/subscriptions/client-services/    # Client tool assignments
/api/subscriptions/client-services/by_client/?client_id=
/api/subscriptions/client-services/update_client_tools/
/api/subscriptions/analytics/costs/    # Cost per client
/api/subscriptions/analytics/monthly/  # Monthly overview
```

---

## Key Implementation Details

### Invoice PDF Generation
- **Location:** `backend/invoices/pdf_generator.py`
- **Template:** `backend/invoices/templates/invoices/invoice_template.html`
- Uses WeasyPrint if GTK installed, falls back to ReportLab
- French format: "FACTURE", amounts in MAD/dhs
- Includes seller info: Soufian BOUHRARA, ICE, bank details

### Invoice Number Format
- Pattern: `SB6-{N}` (sequential)
- Auto-generated on first save

### Credit Cost Calculation Priority
1. Subscription's cost_per_credit if credits_used > 0
2. Tool's default_cost_per_video_second (for video)
3. Tool's default_cost_per_image (for images)
4. Proportional based on subscription credits
5. Fallback: subscription_cost / 100 * items

### Seeded AI Tools
```
kling_ai, freepik, openart, adobe, suno_ai, grok, higgsfield, runway, openai
```
Run: `python manage.py seed_tools`

---

## Frontend Types (key additions)

```typescript
// Client - new fields
ice_number, address_line1, address_line2, city

// Invoice - new fields
deposit_amount, tva_rate, tva_amount?, total_with_tva?

// InvoiceItem - new field
title: string

// New types
AITool, Subscription, CreditUsage, ClientServiceSelection
ClientCostSummary, MonthlyOverview
ToolType, PricingModel, GenerationType
```

---

## Running the App

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_tools    # Seed AI tools
python manage.py runserver     # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

**Admin:** http://localhost:8000/admin/ (admin / admin123)

---

## Common Tasks

### Add subscription usage
```python
POST /api/subscriptions/usage/log_generation/
{
  "tool_id": "uuid",
  "client_id": "uuid",
  "generation_type": "image",
  "items_generated": 5
}
```

### Get client costs
```
GET /api/subscriptions/analytics/costs/
# Returns: [{client_id, client_name, total_cost_mad, breakdown_by_tool}]
```

### Generate invoice PDF
```
GET /api/invoices/{id}/pdf/           # View in browser
GET /api/invoices/{id}/download_pdf/  # Download file
```

---

## Notes

- All amounts in MAD (Moroccan Dirham)
- TVA default 0% (auto-entrepreneur status)
- Soft delete for clients (is_active=False)
- WeasyPrint requires GTK3 on Windows for full template
- Invoice items need `title` field (main line), `description` is subtitle
