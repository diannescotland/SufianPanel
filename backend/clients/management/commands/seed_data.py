from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from clients.models import Client
from projects.models import Project
from services.models import Service, ServicePricing
from invoices.models import Invoice, InvoiceItem, Payment


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create Service Pricing
        self.create_service_pricing()

        # Create Clients
        clients = self.create_clients()

        # Create Projects
        projects = self.create_projects(clients)

        # Create Invoices and Payments
        self.create_invoices_and_payments(projects)

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def create_service_pricing(self):
        pricing_data = [
            {
                'ai_tool': 'kling_ai',
                'display_name': 'Kling AI',
                'service_type': 'video',
                'basic_price': Decimal('25.00'),
                'standard_price': Decimal('50.00'),
                'premium_price': Decimal('100.00'),
                'price_per_image': Decimal('0'),
                'price_per_video_second': Decimal('2.00'),
                'features': ['4K Output', 'Fast Rendering', 'Custom Styles'],
            },
            {
                'ai_tool': 'freepik',
                'display_name': 'Freepik AI',
                'service_type': 'image',
                'basic_price': Decimal('10.00'),
                'standard_price': Decimal('25.00'),
                'premium_price': Decimal('50.00'),
                'price_per_image': Decimal('1.00'),
                'price_per_video_second': Decimal('0'),
                'features': ['HD Images', 'Multiple Styles', 'Quick Generation'],
            },
            {
                'ai_tool': 'runway',
                'display_name': 'Runway ML',
                'service_type': 'video',
                'basic_price': Decimal('30.00'),
                'standard_price': Decimal('60.00'),
                'premium_price': Decimal('120.00'),
                'price_per_image': Decimal('0'),
                'price_per_video_second': Decimal('2.50'),
                'features': ['Gen-2 Model', 'Motion Brush', 'Extend Video'],
            },
            {
                'ai_tool': 'openart',
                'display_name': 'OpenArt',
                'service_type': 'image',
                'basic_price': Decimal('15.00'),
                'standard_price': Decimal('30.00'),
                'premium_price': Decimal('60.00'),
                'price_per_image': Decimal('1.50'),
                'price_per_video_second': Decimal('0'),
                'features': ['SDXL Models', 'ControlNet', 'Inpainting'],
            },
            {
                'ai_tool': 'adobe',
                'display_name': 'Adobe Firefly',
                'service_type': 'both',
                'basic_price': Decimal('20.00'),
                'standard_price': Decimal('40.00'),
                'premium_price': Decimal('80.00'),
                'price_per_image': Decimal('1.50'),
                'price_per_video_second': Decimal('2.00'),
                'features': ['Commercial Safe', 'Style Match', 'Text Effects'],
            },
            {
                'ai_tool': 'grok',
                'display_name': 'Grok',
                'service_type': 'image',
                'basic_price': Decimal('10.00'),
                'standard_price': Decimal('20.00'),
                'premium_price': Decimal('40.00'),
                'price_per_image': Decimal('1.00'),
                'price_per_video_second': Decimal('0'),
                'features': ['Fast Generation', 'Realistic Style', 'No Filters'],
            },
            {
                'ai_tool': 'higgsfield',
                'display_name': 'Higgsfield',
                'service_type': 'video',
                'basic_price': Decimal('20.00'),
                'standard_price': Decimal('45.00'),
                'premium_price': Decimal('90.00'),
                'price_per_image': Decimal('0'),
                'price_per_video_second': Decimal('1.75'),
                'features': ['Character Animation', 'Lip Sync', 'Expressions'],
            },
            {
                'ai_tool': 'suno_ai',
                'display_name': 'Suno AI',
                'service_type': 'audio',
                'basic_price': Decimal('15.00'),
                'standard_price': Decimal('30.00'),
                'premium_price': Decimal('60.00'),
                'price_per_image': Decimal('0'),
                'price_per_video_second': Decimal('2.00'),
                'features': ['Full Songs', 'Custom Lyrics', 'Multiple Genres'],
            },
        ]

        for data in pricing_data:
            ServicePricing.objects.update_or_create(
                ai_tool=data['ai_tool'],
                defaults=data
            )
        self.stdout.write(f'Created {len(pricing_data)} service pricing entries')

    def create_clients(self):
        clients_data = [
            {'name': 'John Smith', 'email': 'john.smith@techcorp.com', 'phone': '+1-555-0101', 'company': 'TechCorp Industries'},
            {'name': 'Sarah Johnson', 'email': 'sarah@creativestudio.io', 'phone': '+1-555-0102', 'company': 'Creative Studio'},
            {'name': 'Michael Chen', 'email': 'mchen@startup.co', 'phone': '+1-555-0103', 'company': 'StartupCo'},
            {'name': 'Emily Davis', 'email': 'emily.d@marketing.agency', 'phone': '+1-555-0104', 'company': 'Marketing Agency Pro'},
            {'name': 'David Wilson', 'email': 'dwilson@enterprise.com', 'phone': '+1-555-0105', 'company': 'Enterprise Solutions'},
            {'name': 'Lisa Anderson', 'email': 'lisa@boutique.design', 'phone': '+1-555-0106', 'company': 'Boutique Design Co'},
            {'name': 'James Taylor', 'email': 'james@digitalfirst.io', 'phone': '+1-555-0107', 'company': 'Digital First'},
            {'name': 'Amanda Martinez', 'email': 'amanda@socialbrands.com', 'phone': '+1-555-0108', 'company': 'Social Brands Inc'},
        ]

        clients = []
        for data in clients_data:
            client, _ = Client.objects.update_or_create(
                email=data['email'],
                defaults=data
            )
            clients.append(client)

        self.stdout.write(f'Created {len(clients)} clients')
        return clients

    def create_projects(self, clients):
        project_templates = [
            {'title': 'Brand Video Campaign', 'service_type': 'video', 'description': 'Create promotional videos for social media campaign'},
            {'title': 'Product Image Set', 'service_type': 'image', 'description': 'AI-generated product images for e-commerce'},
            {'title': 'Social Media Content Pack', 'service_type': 'both', 'description': 'Mixed media content for Instagram and TikTok'},
            {'title': 'Corporate Presentation', 'service_type': 'image', 'description': 'Professional images for company presentation'},
            {'title': 'Advertisement Videos', 'service_type': 'video', 'description': 'Short-form video ads for digital marketing'},
            {'title': 'Website Hero Images', 'service_type': 'image', 'description': 'High-quality images for website redesign'},
            {'title': 'Music Video Production', 'service_type': 'video', 'description': 'AI-assisted music video creation'},
            {'title': 'App Promotional Content', 'service_type': 'both', 'description': 'Images and videos for app store listing'},
        ]

        statuses = ['pending', 'in_progress', 'review', 'completed', 'completed']
        projects = []

        for i, client in enumerate(clients):
            template = project_templates[i % len(project_templates)]
            days_offset = random.randint(-30, 30)
            deadline = timezone.now() + timedelta(days=days_offset)

            status = random.choice(statuses)
            completed_at = None
            if status == 'completed':
                completed_at = deadline - timedelta(days=random.randint(1, 5))

            project, _ = Project.objects.update_or_create(
                client=client,
                title=template['title'],
                defaults={
                    'description': template['description'],
                    'service_type': template['service_type'],
                    'status': status,
                    'deadline': deadline,
                    'completed_at': completed_at,
                }
            )
            projects.append(project)

        self.stdout.write(f'Created {len(projects)} projects')
        return projects

    def create_invoices_and_payments(self, projects):
        payment_statuses = ['unpaid', 'partial', 'paid', 'paid', 'paid']
        payment_methods = ['bank_transfer', 'paypal', 'stripe', 'cash']

        for project in projects:
            total = Decimal(random.randint(200, 2000))
            due_date = (project.deadline + timedelta(days=14)).date()

            invoice, created = Invoice.objects.update_or_create(
                project=project,
                client=project.client,
                defaults={
                    'total_amount': total,
                    'due_date': due_date,
                    'notes': f'Invoice for {project.title}',
                }
            )

            if created:
                # Add invoice items
                services = list(ServicePricing.objects.all()[:3])
                for service in random.sample(services, min(2, len(services))):
                    quantity = random.randint(1, 5)
                    unit_price = service.basic_price
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        description=f'{service.display_name} - Basic Package',
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=quantity * unit_price,
                    )

            # Create payments based on status
            status = random.choice(payment_statuses)
            if status == 'paid':
                Payment.objects.get_or_create(
                    invoice=invoice,
                    amount=total,
                    defaults={
                        'payment_method': random.choice(payment_methods),
                        'notes': 'Full payment received',
                    }
                )
            elif status == 'partial':
                partial_amount = total * Decimal(random.uniform(0.3, 0.7))
                Payment.objects.get_or_create(
                    invoice=invoice,
                    amount=partial_amount.quantize(Decimal('0.01')),
                    defaults={
                        'payment_method': random.choice(payment_methods),
                        'notes': 'Partial payment',
                    }
                )

        self.stdout.write(f'Created invoices and payments for {len(projects)} projects')
