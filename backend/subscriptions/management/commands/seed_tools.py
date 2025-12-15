from django.core.management.base import BaseCommand
from subscriptions.models import AITool


class Command(BaseCommand):
    help = 'Seed default AI tools with estimated pricing'

    def handle(self, *args, **options):
        # Exchange rates (approximate) - update as needed
        # 1 USD ~ 10 MAD, 1 EUR ~ 11 MAD

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
                'default_monthly_cost_mad': 374,  # ~34 EUR
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
                f'{created} outils créés, {updated} outils mis à jour'
            )
        )
