"""
Generate a test invoice PDF for visual verification.
Usage: python manage.py generate_test_invoice
"""
from django.core.management.base import BaseCommand
from invoices.pdf_generator import generate_invoice_pdf
from datetime import date
from decimal import Decimal
import os


class MockClient:
    """Mock client for testing."""
    def __init__(self):
        self.name = "Mohammed Al Fassi"
        self.company = "Al Fassi Design Studio"
        self.address_line1 = "123 Avenue Hassan II"
        self.address_line2 = "Gueliz"
        self.city = "Marrakech"


class MockInvoiceItem:
    """Mock invoice item for testing."""
    def __init__(self, title, description, quantity, unit_price):
        self.title = title
        self.description = description
        self.quantity = quantity
        self.unit_price = unit_price
        self.total_price = quantity * unit_price


class MockItemQuerySet:
    """Mock queryset for items."""
    def __init__(self, items):
        self._items = items

    def all(self):
        return self._items


class MockInvoice:
    """Mock invoice for testing."""
    def __init__(self):
        self.invoice_number = "SB6-42"
        self.issued_date = date(2024, 12, 15)
        self.client = MockClient()
        self.total_amount = Decimal("7500")

        # Create mock items
        mock_items = [
            MockInvoiceItem("Campagne ADS Decembre", "Creation de visuels publicitaires", 3, Decimal("1500")),
            MockInvoiceItem("Logo Design", "Conception logo moderne", 1, Decimal("3000")),
        ]
        self.items = MockItemQuerySet(mock_items)


class Command(BaseCommand):
    help = 'Generate a test invoice PDF for visual verification'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='test_invoice_output.pdf',
            help='Output filename (default: test_invoice_output.pdf)'
        )

    def handle(self, *args, **options):
        output_file = options['output']

        self.stdout.write("Generating test invoice PDF...")

        # Create mock invoice
        invoice = MockInvoice()

        # Generate PDF
        pdf_bytes = generate_invoice_pdf(invoice)

        # Save to file
        output_path = os.path.join(os.getcwd(), output_file)
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)

        self.stdout.write(self.style.SUCCESS(f"Test invoice saved to: {output_path}"))
        self.stdout.write(f"\nInvoice details:")
        self.stdout.write(f"  Number: {invoice.invoice_number}")
        self.stdout.write(f"  Date: {invoice.issued_date}")
        self.stdout.write(f"  Client: {invoice.client.company}")
        self.stdout.write(f"  Total: {invoice.total_amount} dhs")
        self.stdout.write(f"  Items: {len(list(invoice.items.all()))}")
