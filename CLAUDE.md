# CLAUDE.md - Project Context for AI Assistants

## Project Overview

**Name:** Sufian Panel (Design Studio Dashboard)
**Purpose:** Full-stack client management system for a graphic design business specializing in AI-generated image, video, and audio services.

**Core Features:**
- Client management with contact info and financial tracking
- Project management with status workflow and deadlines
- Invoice generation with line items and payment tracking
- Analytics dashboard with revenue, service, and client insights
- Cost calculator for AI service pricing estimates

---

## Tech Stack

### Backend
- **Framework:** Django 6.0 + Django REST Framework
- **Database:** SQLite (db.sqlite3)
- **Auth:** JWT via `djangorestframework-simplejwt`
- **Location:** `/backend/`

### Frontend
- **Framework:** Next.js 16.0.10 (App Router) + React 19.2.1
- **Styling:** Tailwind CSS 4 with CSS variables for theming
- **State:** TanStack React Query v5 for server state
- **Forms:** React Hook Form 7.68 + Zod 4.1 validation
- **Charts:** Recharts 3.5
- **Icons:** Lucide React
- **Location:** `/frontend/`

---

## Project Structure

```
Sufian Panel/
├── backend/
│   ├── config/              # Django settings, URLs, WSGI/ASGI
│   │   ├── settings.py      # Main config (CORS, JWT, installed apps)
│   │   └── urls.py          # API route registration
│   ├── clients/             # Client model, views, serializers
│   ├── projects/            # Project model with status workflow
│   ├── invoices/            # Invoice, InvoiceItem, Payment models
│   ├── services/            # Service and ServicePricing models
│   ├── analytics/           # Analytics aggregation views
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx        # Clients list
│   │   │   │   ├── new/page.tsx    # New client form
│   │   │   │   └── [id]/page.tsx   # Client detail
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx        # Projects list
│   │   │   │   ├── new/page.tsx    # New project form
│   │   │   │   └── [id]/page.tsx   # Project detail
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx        # Invoices list
│   │   │   │   └── new/page.tsx    # New invoice form
│   │   │   ├── analytics/page.tsx  # Analytics dashboard
│   │   │   ├── calculator/page.tsx # Cost calculator
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── globals.css         # Tailwind + theme CSS variables
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.tsx  # Main wrapper
│   │   │       ├── Sidebar.tsx          # Navigation
│   │   │       └── Header.tsx           # Top bar
│   │   ├── services/               # API service functions
│   │   │   ├── api.ts              # Axios instance with JWT
│   │   │   ├── clients.ts
│   │   │   ├── projects.ts
│   │   │   ├── invoices.ts
│   │   │   ├── analytics.ts
│   │   │   └── pricing.ts
│   │   ├── providers/              # React context providers
│   │   │   ├── query-provider.tsx  # React Query setup
│   │   │   └── theme-provider.tsx  # Dark/light mode
│   │   ├── lib/
│   │   │   └── utils.ts            # Utility functions
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   ├── .env.local                  # NEXT_PUBLIC_API_URL
│   └── package.json
│
├── PROGRESS.md              # Development progress tracker
├── CLAUDE.md                # This file
└── graphic-design-dashboard-spec.md  # Original spec
```

---

## Database Models

### Client
```python
- id: UUID (primary key)
- name: CharField(255)
- email: EmailField
- phone: CharField(20)
- company: CharField(255, optional)
- notes: TextField (optional)
- is_active: Boolean (default True, soft delete)
- created_at, updated_at: DateTime

# Computed properties:
- total_projects, total_invoiced, total_paid, outstanding_balance
```

### Project
```python
- id: UUID
- client: ForeignKey(Client)
- title: CharField(255)
- description: TextField
- service_type: ['image', 'video', 'audio', 'both']
- status: ['pending', 'in_progress', 'review', 'completed', 'cancelled']
- deadline: DateTime
- completed_at: DateTime (nullable)
- created_at, updated_at: DateTime

# Computed properties:
- is_overdue, days_until_deadline
```

### Invoice
```python
- id: UUID
- invoice_number: Auto-generated (INV-YYYY-NNNNN)
- project: ForeignKey(Project)
- client: ForeignKey(Client)
- total_amount: Decimal
- amount_paid: Decimal
- payment_status: ['unpaid', 'partial', 'paid', 'overdue']
- due_date: Date
- issued_date: Date (auto)
- notes: TextField

# Related:
- items: InvoiceItem[] (line items)
- payments: Payment[] (payment records)
```

### InvoiceItem
```python
- invoice: ForeignKey(Invoice)
- service: ForeignKey(Service, optional)
- description: CharField
- quantity: Integer
- unit_price: Decimal
- total_price: Decimal (computed)
```

### Payment
```python
- invoice: ForeignKey(Invoice)
- amount: Decimal
- payment_method: ['cash', 'bank_transfer', 'paypal', 'stripe', 'other']
- payment_date: DateTime
- transaction_id: CharField (optional)
- notes: TextField
```

### ServicePricing
```python
- ai_tool: CharField (kling_ai, freepik, runway, openart, adobe, grok, higgsfield, suno_ai)
- display_name: CharField
- service_type: ['image', 'video', 'audio', 'both']
- basic_price, standard_price, premium_price: Decimal
- price_per_image: Decimal
- price_per_video_second: Decimal
- features: JSONField
- is_active: Boolean
```

---

## API Endpoints

### Auth
```
POST /api/auth/login/     - Get JWT tokens
POST /api/auth/refresh/   - Refresh access token
```

### Clients
```
GET    /api/clients/              - List (filterable: is_active, search)
POST   /api/clients/              - Create
GET    /api/clients/{id}/         - Detail
PUT    /api/clients/{id}/         - Update
DELETE /api/clients/{id}/         - Soft delete (sets is_active=False)
GET    /api/clients/{id}/history/ - Full history with projects & invoices
```

### Projects
```
GET    /api/projects/                    - List (filterable: client, status, service_type)
POST   /api/projects/                    - Create
GET    /api/projects/{id}/               - Detail (includes client_details)
PUT    /api/projects/{id}/               - Update
DELETE /api/projects/{id}/               - Delete
POST   /api/projects/{id}/update_status/ - Update status only
GET    /api/projects/deadlines/          - Upcoming deadlines
GET    /api/projects/calendar/           - Calendar view by month
```

### Invoices
```
GET    /api/invoices/                    - List (filterable: client, project, payment_status)
POST   /api/invoices/                    - Create with items
GET    /api/invoices/{id}/               - Detail with items & payments
PUT    /api/invoices/{id}/               - Update
DELETE /api/invoices/{id}/               - Delete
GET    /api/invoices/overdue/            - Overdue invoices
POST   /api/invoices/{id}/add_item/      - Add line item
POST   /api/invoices/{id}/record_payment/ - Record payment
```

### Analytics
```
GET /api/analytics/overview/   - Dashboard stats
GET /api/analytics/revenue/    - Revenue over time (period: daily/weekly/monthly)
GET /api/analytics/clients/    - Client analytics, top clients
GET /api/analytics/services/   - Service type breakdown
GET /api/analytics/payments/   - Payment status distribution
GET /api/analytics/deadlines/  - Deadline analytics
```

### Pricing
```
GET  /api/pricing/            - List all pricing
POST /api/pricing/calculate/  - Calculate cost estimate
```

---

## Frontend Patterns

### Page Structure
All pages follow this pattern:
```tsx
'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
// ... imports

export default function PageName() {
  const { data, isLoading } = useQuery({
    queryKey: ['resource'],
    queryFn: () => serviceFunction(),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        {/* Content */}
      </div>
    </DashboardLayout>
  )
}
```

### Styling Conventions
```tsx
// Card container
className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-5"

// Primary button
className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90"

// Secondary button
className="bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5"

// Input field
className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground focus:ring-2 focus:ring-primary/20"

// Status badge
className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getStatusColor(status))}

// Avatar
className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/80"
```

### Theme Colors (CSS Variables)
```css
--primary: #6366f1      /* Indigo - main brand color */
--success: #22c55e      /* Emerald - paid, completed */
--warning: #f59e0b      /* Amber - partial, pending */
--destructive: #ef4444  /* Rose - overdue, error */
--card: varies          /* Light: white, Dark: #1e293b */
--border: varies        /* Light: #e2e8f0, Dark: #334155 */
```

### Utility Functions (lib/utils.ts)
```typescript
cn(...classes)           // Merge Tailwind classes
formatCurrency(amount)   // $1,234.56 format
formatDate(date)         // "Dec 14, 2025" format
formatDateTime(date)     // Includes time
getStatusColor(status)   // Returns Tailwind classes for status badges
getInitials(name)        // "John Doe" → "JD"
```

### Form Pattern (React Hook Form + Zod)
```tsx
const schema = z.object({
  name: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})

const mutation = useMutation({
  mutationFn: (data) => service.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] })
    router.push('/resource')
  },
})
```

### React Query Keys
```typescript
['clients']                           // Client list
['clients', { search, is_active }]    // Filtered list
['client', clientId]                  // Single client
['client', clientId, 'history']       // Client with history
['projects']                          // Project list
['project', projectId]                // Single project
['invoices']                          // Invoice list
['invoices', { project }]             // Invoices for project
['analytics', 'overview']             // Dashboard stats
['pricing']                           // Service pricing
```

---

## Running the Application

### Backend
```bash
cd backend
python -m venv venv              # Create venv (first time)
venv\Scripts\activate            # Windows
source venv/bin/activate         # Mac/Linux
pip install -r requirements.txt  # Install deps (first time)
python manage.py migrate         # Run migrations
python manage.py seed_data       # Seed sample data (first time)
python manage.py runserver       # Start at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install       # Install deps (first time)
npm run dev       # Start at http://localhost:3000
```

### Admin Access
- URL: http://localhost:8000/admin/
- Username: `admin`
- Password: `admin123`

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/config/settings.py` | Django config, CORS, JWT settings |
| `backend/*/models.py` | Database models |
| `backend/*/views.py` | API endpoints |
| `backend/*/serializers.py` | API data serialization |
| `frontend/src/app/globals.css` | Theme CSS variables |
| `frontend/src/services/api.ts` | Axios instance with JWT interceptors |
| `frontend/src/types/index.ts` | TypeScript interfaces |
| `frontend/src/lib/utils.ts` | Utility functions |
| `frontend/src/components/layout/*` | Layout components |

---

## Common Tasks

### Add a new page
1. Create `frontend/src/app/{route}/page.tsx`
2. Use `'use client'` directive
3. Wrap in `DashboardLayout`
4. Add to sidebar navigation in `Sidebar.tsx`

### Add a new API endpoint
1. Add method to `backend/{app}/views.py`
2. Register in `backend/{app}/urls.py`
3. Create service function in `frontend/src/services/{service}.ts`
4. Add types to `frontend/src/types/index.ts`

### Add a new model field
1. Update model in `backend/{app}/models.py`
2. Run `python manage.py makemigrations && python manage.py migrate`
3. Update serializer in `backend/{app}/serializers.py`
4. Update TypeScript types in `frontend/src/types/index.ts`

---

## Remaining Work (Low Priority)

- [ ] Settings page - User preferences
- [ ] PDF invoice generation - Export invoices as PDF
- [ ] Search command (Cmd+K) - Global search modal
- [ ] Mobile sidebar drawer - Hamburger menu for mobile

---

## Notes

- Soft delete is used for clients (sets `is_active=False`)
- Invoice numbers are auto-generated: `INV-YYYY-NNNNN`
- Payment status auto-updates based on `amount_paid` vs `total_amount`
- Theme persists in localStorage
- All monetary values stored as Decimal in backend
- Dates stored as ISO 8601 strings in API responses
