"""
Management command to migrate old invoice numbers to SB6-XX format.
Run with: python manage.py migrate_invoice_numbers
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from invoices.models import Invoice


class Command(BaseCommand):
    help = 'Migrate old invoice numbers (INV-YYYY-XXXXX) to new format (SB6-XX)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview changes without applying them',
        )
        parser.add_argument(
            '--start-from',
            type=int,
            default=None,
            help='Start numbering from this number (default: auto-detect)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        start_from = options['start_from']

        # Find invoices that don't have SB6- format
        old_invoices = Invoice.objects.exclude(
            invoice_number__startswith='SB6-'
        ).order_by('issued_date')

        if not old_invoices.exists():
            self.stdout.write(self.style.SUCCESS('[OK] All invoices already use SB6-XX format!'))
            return

        # Find the highest existing SB6 number
        if start_from is None:
            last_sb6 = Invoice.objects.filter(
                invoice_number__startswith='SB6-'
            ).order_by('-invoice_number').first()

            if last_sb6:
                try:
                    current_num = int(last_sb6.invoice_number.split('-')[1])
                except (ValueError, IndexError):
                    current_num = 0
            else:
                current_num = 0
        else:
            current_num = start_from - 1

        self.stdout.write(f'\nFound {old_invoices.count()} invoices to migrate:\n')

        changes = []
        for invoice in old_invoices:
            current_num += 1
            new_number = f'SB6-{current_num}'
            changes.append({
                'invoice': invoice,
                'old_number': invoice.invoice_number,
                'new_number': new_number,
            })
            self.stdout.write(f'  {invoice.invoice_number} -> {new_number}')

        if dry_run:
            self.stdout.write(self.style.WARNING('\n[DRY RUN] No changes applied.'))
            self.stdout.write('Run without --dry-run to apply changes.')
            return

        # Apply changes
        self.stdout.write('\nApplying changes...')

        with transaction.atomic():
            for change in changes:
                invoice = change['invoice']
                invoice.invoice_number = change['new_number']
                invoice.save(update_fields=['invoice_number'])

        self.stdout.write(self.style.SUCCESS(f'\n[OK] Migrated {len(changes)} invoices to SB6-XX format!'))
