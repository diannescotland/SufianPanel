from django.core.management.base import BaseCommand
from clients.models import Client


class Command(BaseCommand):
    help = 'Set all clients to is_active=True'

    def handle(self, *args, **options):
        updated = Client.objects.filter(is_active=False).update(is_active=True)
        self.stdout.write(
            self.style.SUCCESS(f'{updated} clients updated to active')
        )
