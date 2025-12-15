# Graphic Design Client Management Dashboard

## Project Overview

Build a full-stack client management dashboard for a graphic design business specializing in AI-generated image and video services. The application will handle client management, invoicing, payment tracking, service cost calculation, deadline management, and analytics.

---

## Tech Stack

### Backend
- **Framework:** Django 5.x with Django REST Framework
- **Database:** PostgreSQL (or SQLite for development)
- **Authentication:** Django built-in auth + JWT (djangorestframework-simplejwt)
- **Task Queue:** Celery with Redis (for deadline reminders - optional)

### Frontend
- **Framework:** React 18+ with Vite
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS + tweakcn for customization
- **State Management:** React Query (TanStack Query) for server state
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v6

---

## Database Models

### 1. Client Model
```python
class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

### 2. Service Model
```python
class Service(models.Model):
    SERVICE_TYPES = [
        ('image', 'Image Generation'),
        ('video', 'Video Generation'),
    ]
    
    AI_TOOLS = [
        ('kling_ai', 'Kling AI'),
        ('freepik', 'Freepik'),
        ('openart', 'Openart'),
        ('adobe', 'Adobe'),
        ('suno_ai', 'Suno AI'),
        ('grok', 'Grok'),
        ('higgsfield', 'Higgsfield'),
        ('runway', 'Runway'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    ai_tool = models.CharField(max_length=50, choices=AI_TOOLS)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_name = models.CharField(max_length=50, default='item')  # e.g., 'image', 'second', 'minute'
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
```

### 3. Project Model
```python
class Project(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=20)  # 'image', 'video', 'both'
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
```

### 4. Invoice Model
```python
class Invoice(models.Model):
    PAYMENT_STATUS = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    invoice_number = models.CharField(max_length=50, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    due_date = models.DateField()
    issued_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    canva_template_url = models.URLField(blank=True, null=True)
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)
    
    @property
    def amount_remaining(self):
        return self.total_amount - self.amount_paid
```

### 5. InvoiceItem Model
```python
class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
```

### 6. Payment Model
```python
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
```

### 7. ServicePricing Model (for cost calculator)
```python
class ServicePricing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    ai_tool = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=20)  # 'image', 'video', 'both'
    
    # Pricing tiers
    basic_price = models.DecimalField(max_digits=10, decimal_places=2)
    standard_price = models.DecimalField(max_digits=10, decimal_places=2)
    premium_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Per unit pricing
    price_per_image = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_video_second = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    description = models.TextField(blank=True)
    features = models.JSONField(default=list)  # List of features for each tier
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login/          - User login
POST   /api/auth/logout/         - User logout
POST   /api/auth/refresh/        - Refresh JWT token
GET    /api/auth/user/           - Get current user
```

### Clients
```
GET    /api/clients/             - List all clients (with pagination, filtering)
POST   /api/clients/             - Create new client
GET    /api/clients/{id}/        - Get client details
PUT    /api/clients/{id}/        - Update client
DELETE /api/clients/{id}/        - Delete client (soft delete)
GET    /api/clients/{id}/history/ - Get client project/payment history
```

### Projects
```
GET    /api/projects/            - List all projects
POST   /api/projects/            - Create new project
GET    /api/projects/{id}/       - Get project details
PUT    /api/projects/{id}/       - Update project
DELETE /api/projects/{id}/       - Delete project
GET    /api/projects/deadlines/  - Get upcoming deadlines
GET    /api/projects/calendar/   - Get projects for calendar view
```

### Invoices
```
GET    /api/invoices/            - List all invoices
POST   /api/invoices/            - Create new invoice
GET    /api/invoices/{id}/       - Get invoice details
PUT    /api/invoices/{id}/       - Update invoice
DELETE /api/invoices/{id}/       - Delete invoice
POST   /api/invoices/{id}/generate-pdf/  - Generate PDF from Canva template
GET    /api/invoices/overdue/    - Get overdue invoices
```

### Payments
```
GET    /api/payments/            - List all payments
POST   /api/payments/            - Record new payment
GET    /api/payments/{id}/       - Get payment details
GET    /api/invoices/{id}/payments/ - Get payments for specific invoice
```

### Services & Pricing
```
GET    /api/services/            - List all services
POST   /api/services/            - Create new service
GET    /api/services/{id}/       - Get service details
PUT    /api/services/{id}/       - Update service pricing
GET    /api/pricing/             - Get all pricing tiers
POST   /api/pricing/calculate/   - Calculate cost based on selections
```

### Analytics
```
GET    /api/analytics/overview/           - Dashboard overview stats
GET    /api/analytics/revenue/            - Revenue analytics (daily/weekly/monthly)
GET    /api/analytics/clients/            - Client analytics
GET    /api/analytics/services/           - Service popularity analytics
GET    /api/analytics/payments/           - Payment analytics
GET    /api/analytics/deadlines/          - Deadline analytics
```

---

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── clients/
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientList.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientHistory.tsx
│   │   │   └── ClientDetails.tsx
│   │   ├── projects/
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── DeadlineCalendar.tsx
│   │   │   └── DeadlineTimeline.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   ├── InvoiceItemForm.tsx
│   │   │   └── PaymentForm.tsx
│   │   ├── calculator/
│   │   │   ├── CostCalculator.tsx
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   └── QuoteGenerator.tsx
│   │   ├── analytics/
│   │   │   ├── OverviewCards.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ClientsChart.tsx
│   │   │   ├── ServicesChart.tsx
│   │   │   ├── PaymentStatusChart.tsx
│   │   │   └── DateRangePicker.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── SearchInput.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── ClientDetail.tsx
│   │   ├── Projects.tsx
│   │   ├── Invoices.tsx
│   │   ├── InvoiceDetail.tsx
│   │   ├── Calculator.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   ├── useClients.ts
│   │   ├── useProjects.ts
│   │   ├── useInvoices.ts
│   │   ├── usePayments.ts
│   │   ├── useAnalytics.ts
│   │   └── useAuth.ts
│   ├── services/
│   │   ├── api.ts              # Axios instance
│   │   ├── clientService.ts
│   │   ├── projectService.ts
│   │   ├── invoiceService.ts
│   │   ├── paymentService.ts
│   │   └── analyticsService.ts
│   ├── types/
│   │   ├── client.ts
│   │   ├── project.ts
│   │   ├── invoice.ts
│   │   ├── payment.ts
│   │   └── analytics.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Feature Specifications

### 1. Client Management

#### New Client Form
- **Fields:**
  - Full Name (required)
  - Email (required, validated)
  - Phone Number (required, with country code selector)
  - Company Name (optional)
  - Service Type Selection:
    - [ ] Image Generation
    - [ ] Video Generation
    - [ ] Both
  - Project Title (required)
  - Project Description (optional)
  - Deadline Date & Time (required, with date picker)
  - Payment Due Date (required)
  - Notes (optional)
  
- **On Submit:**
  1. Create Client record
  2. Create Project record linked to client
  3. Generate Invoice with selected services
  4. Option to generate Canva invoice

#### Client History View
- List of all projects per client
- Payment history with:
  - Total invoiced amount
  - Total paid
  - Outstanding balance
  - Payment timeline
- Status indicators (Active/Inactive client)
- Quick actions: New Project, New Invoice, Edit Client

### 2. Invoice System

#### Invoice Creation
- Auto-generate invoice number (format: INV-YYYY-XXXXX)
- Select client and project
- Add line items:
  - Service selection from preset list
  - Custom description
  - Quantity
  - Unit price (auto-filled from service pricing)
  - Line total (calculated)
- Invoice totals:
  - Subtotal
  - Tax (configurable %)
  - Discount (optional)
  - Grand Total
- Due date selection
- Notes field

#### Canva Integration
- Store Canva template URL in settings
- Export invoice data as JSON for Canva template variables:
  ```json
  {
    "invoice_number": "INV-2024-00001",
    "client_name": "John Doe",
    "client_email": "john@example.com",
    "items": [...],
    "total": "500.00",
    "due_date": "2024-02-15"
  }
  ```
- Generate download link for completed invoice

#### Payment Tracking
- Record partial payments
- Auto-calculate remaining balance
- Payment status updates:
  - Unpaid → Partial (when payment < total)
  - Partial → Paid (when payments = total)
  - Auto-mark as Overdue when past due date
- Payment history per invoice

### 3. Cost Calculator

#### Service Pricing Configuration
```
AI Tools with Pricing:
┌─────────────────┬──────────┬──────────────┬─────────────────┐
│ Tool            │ Type     │ Base Price   │ Per Unit Price  │
├─────────────────┼──────────┼──────────────┼─────────────────┤
│ Kling AI        │ Video    │ $XX.XX       │ $X.XX/second    │
│ Freepik         │ Image    │ $XX.XX       │ $X.XX/image     │
│ Openart         │ Image    │ $XX.XX       │ $X.XX/image     │
│ Adobe           │ Both     │ $XX.XX       │ $X.XX/item      │
│ Suno AI         │ Audio    │ $XX.XX       │ $X.XX/track     │
│ Grok            │ Image    │ $XX.XX       │ $X.XX/image     │
│ Higgsfield      │ Video    │ $XX.XX       │ $X.XX/second    │
│ Runway          │ Video    │ $XX.XX       │ $X.XX/second    │
└─────────────────┴──────────┴──────────────┴─────────────────┘
```

#### Calculator Interface
- Tool selection (multi-select)
- Quantity inputs per tool
- Complexity/tier selection (Basic/Standard/Premium)
- Real-time price calculation
- Generate quote button
- Save as draft invoice option

### 4. Analytics Dashboard

#### Overview Cards
- Total Revenue (with % change)
- Active Clients
- Pending Invoices
- Overdue Payments
- Projects This Month
- Average Project Value

#### Charts & Graphs
1. **Revenue Chart**
   - Line/Bar chart
   - Toggle: Daily / Weekly / Monthly / Yearly
   - Compare with previous period
   
2. **Client Acquisition**
   - New clients over time
   - Client retention rate
   
3. **Service Popularity**
   - Pie chart: Image vs Video services
   - Bar chart: AI tools usage breakdown
   
4. **Payment Status**
   - Donut chart: Paid / Partial / Unpaid / Overdue
   - Outstanding amount trend

5. **Deadline Timeline**
   - Gantt-style view of upcoming deadlines
   - Calendar heat map

#### Date Range Filters
- Preset: Today, This Week, This Month, This Quarter, This Year
- Custom date range picker

### 5. Deadline Management

#### Dashboard View
- Upcoming deadlines (next 7/14/30 days)
- Overdue projects highlighted in red
- Today's deadlines prominent display

#### Calendar View
- Monthly calendar with project deadlines
- Color coding by status:
  - 🟢 Green: On track
  - 🟡 Yellow: Due soon (within 3 days)
  - 🔴 Red: Overdue
  - 🔵 Blue: Completed

#### Timeline View
- Horizontal timeline of projects
- Filterable by client/status

---

## UI/UX Requirements

### Color Scheme (Customizable via tweakcn)
```css
--primary: #6366f1;      /* Indigo - main actions */
--secondary: #8b5cf6;    /* Purple - secondary elements */
--success: #22c55e;      /* Green - completed/paid */
--warning: #f59e0b;      /* Amber - pending/partial */
--danger: #ef4444;       /* Red - overdue/error */
--background: #0f172a;   /* Dark blue - dark mode bg */
--foreground: #f8fafc;   /* Light - text on dark */
--card: #1e293b;         /* Slate - card backgrounds */
--border: #334155;       /* Slate - borders */
```

### Dashboard Layout
```
┌────────────────────────────────────────────────────────────┐
│  Header: Logo | Search | Notifications | Profile          │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ Sidebar  │  Main Content Area                              │
│          │                                                 │
│ • Home   │  ┌─────────┬─────────┬─────────┬─────────┐     │
│ • Clients│  │ Revenue │ Clients │ Pending │ Overdue │     │
│ • Project│  └─────────┴─────────┴─────────┴─────────┘     │
│ • Invoice│                                                 │
│ • Calc   │  ┌─────────────────────────────────────────┐   │
│ • Analyt │  │         Revenue Chart                    │   │
│ • Setting│  └─────────────────────────────────────────┘   │
│          │                                                 │
│          │  ┌─────────────────┬───────────────────────┐   │
│          │  │ Recent Clients  │ Upcoming Deadlines    │   │
│          │  └─────────────────┴───────────────────────┘   │
│          │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 640px (collapsible sidebar)
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Implementation Steps

### Phase 1: Backend Setup
1. Create Django project and app structure
2. Configure PostgreSQL database
3. Implement all models with migrations
4. Set up Django REST Framework
5. Create serializers for all models
6. Implement ViewSets and API endpoints
7. Add JWT authentication
8. Create seed data command for testing
9. Write API tests

### Phase 2: Frontend Setup
1. Initialize Vite + React project
2. Install and configure Tailwind CSS
3. Set up shadcn/ui components
4. Configure tweakcn for theming
5. Set up React Router
6. Configure React Query
7. Create API service layer
8. Implement authentication flow

### Phase 3: Core Features
1. Build main layout (Sidebar, Header)
2. Implement Client management (CRUD)
3. Implement Project management
4. Build Invoice system
5. Create Payment recording
6. Build Cost Calculator

### Phase 4: Analytics & Polish
1. Implement Analytics dashboard
2. Add charts and graphs
3. Build Deadline calendar
4. Add notifications system
5. Implement search functionality
6. Add data export features
7. Performance optimization
8. Final testing and bug fixes

---

## Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/graphic_dashboard
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Canva Integration (optional)
CANVA_API_KEY=your-canva-api-key
CANVA_TEMPLATE_ID=your-template-id

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="Design Studio Dashboard"
```

---

## Commands to Run

### Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-dotenv pillow django-filter

# Create project
django-admin startproject config .
python manage.py startapp clients
python manage.py startapp projects
python manage.py startapp invoices
python manage.py startapp analytics

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Frontend
```bash
# Create project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install @tanstack/react-query axios react-router-dom date-fns recharts react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label table dialog select badge calendar form toast

# Run dev server
npm run dev
```

---

## Notes for Implementation

1. **Canva Integration**: The Canva API requires business account. Alternative: Generate PDF invoices directly using ReportLab or WeasyPrint and provide a manual Canva workflow.

2. **Pricing**: Create an admin interface or settings page where you can adjust service pricing without code changes.

3. **Data Validation**: Use Zod schemas on frontend and Django serializer validation on backend for consistent validation.

4. **Error Handling**: Implement global error boundary in React and proper exception handling in Django.

5. **Accessibility**: Ensure all components are keyboard navigable and screen reader friendly.

6. **Performance**: 
   - Use pagination for all list views
   - Implement lazy loading for dashboard components
   - Cache analytics data with appropriate TTL

7. **Security**:
   - Implement rate limiting on API
   - Sanitize all user inputs
   - Use HTTPS in production
   - Implement CSRF protection

---

## Placeholder Values to Replace

When implementing, replace these with actual values:
- `$XX.XX` - Actual pricing for each service
- `your-secret-key` - Generate secure Django secret key
- `your-canva-api-key` - Actual Canva API credentials
- `your-email@gmail.com` - Actual email for notifications

---

## Testing Checklist

- [ ] Client CRUD operations
- [ ] Project creation with deadline
- [ ] Invoice generation
- [ ] Partial payment recording
- [ ] Payment status auto-update
- [ ] Cost calculator accuracy
- [ ] Analytics data accuracy
- [ ] Deadline notifications
- [ ] Responsive design
- [ ] Authentication flow
- [ ] API error handling
- [ ] Form validations

---

*This specification is ready for implementation. Start with Phase 1 and proceed sequentially.*
