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
| PDF | ReportLab (pure Python, Canva template match) |

---

## Project Structure

```
backend/
├── config/           # Settings, URLs
├── clients/          # Client management
│   └── management/commands/seed_data.py
├── projects/         # Project workflow
├── invoices/         # Invoices, payments, PDF generation
│   └── management/commands/migrate_invoice_numbers.py
├── services/         # Service pricing
├── analytics/        # Dashboard analytics
├── subscriptions/    # AI tool credit tracking
│   └── management/commands/seed_tools.py
└── static/
    ├── images/logo.svg
    └── fonts/        # Quicksand fonts (Quicksand-Regular.ttf, etc.)

frontend/src/
├── app/
│   ├── clients/      # Client pages
│   ├── projects/     # Project pages
│   ├── invoices/     # Invoice pages
│   ├── subscriptions/# Subscription & usage tracking pages
│   ├── calculator/   # Pricing calculator
│   ├── analytics/    # Analytics dashboard
│   └── settings/     # Settings page
├── components/
│   └── layout/       # Sidebar, Header, DashboardLayout
├── services/         # API clients (clients.ts, invoices.ts, subscriptions.ts, etc.)
├── providers/        # React Query, Theme
├── types/index.ts    # TypeScript interfaces
└── lib/utils.ts      # Helpers

Root files:
├── docker-compose.yml  # Docker orchestration
├── Dockerfile          # (in backend/ and frontend/)
└── SB LOGO 4.4.svg     # Main logo
```

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, deadlines, quick actions |
| `/clients` | Client list with search, filter |
| `/clients/new` | Create new client |
| `/clients/[id]` | Client detail + history |
| `/projects` | Project list |
| `/projects/new` | Create new project |
| `/projects/[id]` | Project detail |
| `/invoices` | Invoice list |
| `/invoices/new` | Create invoice with line items |
| `/invoices/[id]` | Invoice detail + PDF download |
| `/subscriptions` | AI tool subscriptions, monthly costs, usage by client |
| `/subscriptions/usage` | Usage history with filters |
| `/calculator` | Pricing calculator |
| `/analytics` | Revenue, clients, services analytics |
| `/settings` | App settings |

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
- Pure ReportLab implementation (no GTK/WeasyPrint dependency)
- Exact carbon copy of Canva template (222.pdf) with:
  - Beige header/footer bands (#D4C4B0)
  - Teal logo box (#2A7B88) with "Sufian BOUHRARA" text
  - Quicksand fonts (falls back to Helvetica if not found)
  - French format: "FACTURE", amounts in MAD/dhs
  - Seller info + stamp box with ICE: 003747242000025
  - Bank details: Al Barid Bank, RIB, IBAN

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

### Management Commands
```bash
python manage.py seed_tools              # Seed AI tools with default pricing
python manage.py seed_data               # Seed sample clients
python manage.py migrate_invoice_numbers # Migrate old INV-YYYY-XXXXX to SB6-XX format
python manage.py migrate_invoice_numbers --dry-run  # Preview changes only
```

---

## UI/UX Features

### Theme
- **Light/Dark mode toggle**: Single-click button in header (sun/moon icon)
- **Dropdown styling**: Dark mode dropdowns have dark background with light text
- **Sidebar**: Collapsible with logo "Sufian Bouhrara"

### Logo
- **File**: `SB LOGO 4.4.svg` (root) → copied to `frontend/public/logo.svg`
- **Display**: Sidebar shows logo with "Sufian Bouhrara" text

### Currency Display
- All amounts displayed with `formatCurrency()` → "X.XX MAD"
- Invoice form unit price prefix: "MAD"

---

## Frontend Services

| Service | File | Purpose |
|---------|------|---------|
| Clients | `services/clients.ts` | Client CRUD |
| Projects | `services/projects.ts` | Project CRUD + deadlines |
| Invoices | `services/invoices.ts` | Invoice CRUD + payments |
| Pricing | `services/pricing.ts` | Pricing calculator |
| Analytics | `services/analytics.ts` | Dashboard analytics |
| Subscriptions | `services/subscriptions.ts` | AI tools, subscriptions, usage, costs |

---

## Running the App

### Docker (Recommended)
No Python or Node.js installation required - just Docker.

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

**URLs:**
- Dashboard: http://localhost:3000
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin/

### Manual Start (Development)
```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_tools    # Seed AI tools
python manage.py runserver     # http://localhost:8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

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
GET /api/invoices/{id}/download_pdf/  # Download file (fetch + blob)
```

---

## Recent Updates

### Bug Fixes
- **Logo**: Changed from Sparkles icon to actual `SB LOGO 4.4.svg`
- **Currency**: Changed "$" to "MAD" in invoice form
- **Theme toggle**: Single-click toggle instead of dropdown menu
- **Calculator**: Fixed pagination error (`pricingOptions?.find`)
- **PDF download**: Uses fetch + blob for direct download (bypasses IDM)
- **Dropdowns**: Dark mode styling for select elements
- **Invoice creation**: Fixed missing `id` in API response (was causing "Invoice not found" after create)
- **PDF generator**: Fixed `RoundRect` import error in ReportLab

### New Features
- **Docker support**: Single `docker-compose up` to run everything (no Python/Node install needed)
- **Subscriptions frontend**: Full UI for managing AI tool subscriptions
- **Usage tracking page**: `/subscriptions/usage` with filters
- **Quicksand fonts**: Copied to `backend/static/fonts/`
- **PDF generator rewrite**: Pure ReportLab implementation matching Canva template exactly
- **Invoice migration command**: `migrate_invoice_numbers` to convert old format to SB6-XX

---

## Notes

- All amounts in MAD (Moroccan Dirham)
- TVA default 0% (auto-entrepreneur status)
- Soft delete for clients (is_active=False)
- PDF generation uses pure ReportLab (no GTK/WeasyPrint dependency)
- Invoice items need `title` field (main line), `description` is subtitle
- Dropdown menus styled for dark mode compatibility
