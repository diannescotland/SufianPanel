from django.core.management.base import BaseCommand
from services.models import ServicePricing


class Command(BaseCommand):
    help = 'Seed ServicePricing with AI tools tier pricing data'

    def handle(self, *args, **options):
        # Data matching AITool seed_tools.py (1 USD = 9.16 MAD)
        pricing_data = [
            {
                'ai_tool': 'kling_ai',
                'display_name': 'Kling AI',
                'service_type': 'video',
                'free_price': 0,
                'standard_price': 91.60,  # $10
                'pro_price': 338.92,  # $37
                'premier_price': 842.72,  # $92
                'free_credits': 2000,
                'standard_credits': 660,
                'pro_credits': 3000,
                'premier_credits': 8000,
                'price_per_image': 0,
                'price_per_video_second': 5,
                'description': 'AI video generation with high quality output',
                'features': ['Video generation', 'Pro mode', 'Extensions'],
            },
            {
                'ai_tool': 'freepik',
                'display_name': 'Freepik',
                'service_type': 'image',
                'free_price': 0,
                'standard_price': 91.60,  # ~$10
                'pro_price': 183.20,  # ~$20
                'premier_price': None,
                'free_credits': 10,
                'standard_credits': 150,
                'pro_credits': 300,
                'premier_credits': None,
                'price_per_image': 1.5,
                'price_per_video_second': 0,
                'description': 'AI image generation and stock assets',
                'features': ['Image generation', 'Stock assets', 'Templates'],
            },
            {
                'ai_tool': 'openart',
                'display_name': 'OpenArt',
                'service_type': 'image',
                'free_price': 0,
                'standard_price': 128.24,  # $14
                'pro_price': 265.64,  # $29
                'premier_price': 457.50,  # ~$50
                'free_credits': 40,
                'standard_credits': 4000,
                'pro_credits': 12000,
                'premier_credits': 50000,
                'price_per_image': 0.4,
                'price_per_video_second': 0,
                'description': 'Multi-model AI image generation platform',
                'features': ['Multiple models', 'Parallel generations', 'Custom training'],
            },
            {
                'ai_tool': 'adobe',
                'display_name': 'Adobe Firefly',
                'service_type': 'both',
                'free_price': 0,
                'standard_price': 183.20,  # ~$20
                'pro_price': 549.60,  # ~$60
                'premier_price': None,
                'free_credits': 25,
                'standard_credits': 500,
                'pro_credits': 1500,
                'premier_credits': None,
                'price_per_image': 2,
                'price_per_video_second': 5,
                'description': 'Adobe Creative Cloud AI generation',
                'features': ['Image generation', 'Video support', 'Adobe integration'],
            },
            {
                'ai_tool': 'suno_ai',
                'display_name': 'Suno AI',
                'service_type': 'audio',
                'free_price': 0,
                'standard_price': 45.80,  # ~$5
                'pro_price': 91.60,  # ~$10
                'premier_price': 274.80,  # ~$30
                'free_credits': 1500,
                'standard_credits': 1000,
                'pro_credits': 2500,
                'premier_credits': 10000,
                'price_per_image': 0,
                'price_per_video_second': 0,
                'description': 'AI music and audio generation',
                'features': ['Music generation', 'Commercial rights', 'High quality audio'],
            },
            {
                'ai_tool': 'grok',
                'display_name': 'Grok (xAI)',
                'service_type': 'image',
                'free_price': 0,
                'standard_price': 146.56,  # ~$16
                'pro_price': 2748.00,  # ~$300 (API)
                'premier_price': None,
                'free_credits': 0,
                'standard_credits': 0,
                'pro_credits': 0,
                'premier_credits': None,
                'price_per_image': 1,
                'price_per_video_second': 0,
                'description': 'xAI image generation via X Premium',
                'features': ['X integration', 'API access', 'Aurora model'],
            },
            {
                'ai_tool': 'higgsfield',
                'display_name': 'Higgsfield',
                'service_type': 'video',
                'free_price': 0,
                'standard_price': 183.20,  # ~$20
                'pro_price': 457.50,  # ~$50
                'premier_price': None,
                'free_credits': 100,
                'standard_credits': 1000,
                'pro_credits': 3000,
                'premier_credits': None,
                'price_per_image': 0,
                'price_per_video_second': 3,
                'description': 'AI video generation with dancing/motion',
                'features': ['Video generation', 'Motion effects', 'Priority access'],
            },
            {
                'ai_tool': 'runway',
                'display_name': 'Runway',
                'service_type': 'video',
                'free_price': 0,
                'standard_price': 109.92,  # $12
                'pro_price': 256.48,  # $28
                'premier_price': 696.16,  # $76
                'free_credits': 125,
                'standard_credits': 625,
                'pro_credits': 2250,
                'premier_credits': 2250,
                'price_per_image': 0,
                'price_per_video_second': 1.2,
                'description': 'Professional AI video generation',
                'features': ['Gen-4/4.5', 'Video editing', 'Unlimited option'],
            },
            {
                'ai_tool': 'openai',
                'display_name': 'OpenAI / ChatGPT',
                'service_type': 'image',
                'free_price': 0,
                'standard_price': 183.20,  # $20
                'pro_price': 1832.00,  # $200
                'premier_price': None,
                'free_credits': 0,
                'standard_credits': 0,
                'pro_credits': 0,
                'premier_credits': None,
                'price_per_image': 1,
                'price_per_video_second': 0,
                'description': 'ChatGPT Plus with DALL-E 3',
                'features': ['GPT-4', 'DALL-E 3', 'o1 pro mode'],
            },
        ]

        created = 0
        updated = 0

        for data in pricing_data:
            obj, was_created = ServicePricing.objects.update_or_create(
                ai_tool=data['ai_tool'],
                defaults=data
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'{created} pricing entries created, {updated} updated'
            )
        )
