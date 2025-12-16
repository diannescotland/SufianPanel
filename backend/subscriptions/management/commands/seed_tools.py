from django.core.management.base import BaseCommand
from subscriptions.models import AITool


class Command(BaseCommand):
    help = 'Seed default AI tools with pricing tiers'

    def handle(self, *args, **options):
        # Exchange rate: 1 USD = 9.16 MAD
        USD_TO_MAD = 9.16

        tools = [
            {
                'name': 'kling_ai',
                'display_name': 'Kling AI',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 338.92,  # Pro tier default
                'default_credits_per_month': 3000,
                'default_cost_per_video_second_mad': 5,
                # Free Tier: ~66 daily credits
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 2000,  # ~66/day * 30
                'free_features': 'Watermark, limited features',
                # Standard Tier: $10/mo
                'standard_monthly_cost_mad': 91.60,  # $10 * 9.16
                'standard_credits_per_month': 660,
                'standard_features': '660 credits/mo',
                # Pro Tier: $37/mo
                'pro_monthly_cost_mad': 338.92,  # $37 * 9.16
                'pro_credits_per_month': 3000,
                'pro_features': 'No watermark, pro mode, extensions',
                # Premier Tier: $92/mo
                'premier_monthly_cost_mad': 842.72,  # $92 * 9.16
                'premier_credits_per_month': 8000,
                'premier_features': 'All features, priority access',
            },
            {
                'name': 'freepik',
                'display_name': 'Freepik',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 91.60,  # Premium default
                'default_credits_per_month': 150,
                'default_cost_per_image_mad': 1.5,
                # Free Tier
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 10,  # Limited daily
                'free_features': 'Limited downloads, small AI credit pool',
                # Standard Tier (Premium): ~$10/mo
                'standard_monthly_cost_mad': 91.60,
                'standard_credits_per_month': 150,
                'standard_features': '100 downloads/day, ~100-200 AI credits/mo',
                # Pro Tier
                'pro_monthly_cost_mad': None,
                'pro_credits_per_month': None,
                'pro_features': '',
                # Premier Tier
                'premier_monthly_cost_mad': None,
                'premier_credits_per_month': None,
                'premier_features': '',
            },
            {
                'name': 'openart',
                'display_name': 'OpenArt',
                'tool_type': 'image',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 128.24,  # Essential default
                'default_credits_per_month': 4000,
                'default_cost_per_image_mad': 0.4,
                # Free Tier
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 40,  # One-time trial
                'free_features': '40 trial credits, +50 via Discord',
                # Standard (Essential): $14/mo
                'standard_monthly_cost_mad': 128.24,  # $14 * 9.16
                'standard_credits_per_month': 4000,
                'standard_features': '4,000 credits/mo, parallel gens',
                # Pro (Advanced): $29/mo
                'pro_monthly_cost_mad': 265.64,  # $29 * 9.16
                'pro_credits_per_month': 12000,
                'pro_features': '12,000 credits/mo, more parallel gens',
                # Premier (Infinite)
                'premier_monthly_cost_mad': 457.50,  # ~$50 estimate
                'premier_credits_per_month': 50000,
                'premier_features': 'Large pool with throttling',
            },
            {
                'name': 'adobe',
                'display_name': 'Adobe Firefly',
                'tool_type': 'both',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 183.20,  # CC default
                'default_credits_per_month': 500,
                'default_cost_per_image_mad': 2,
                # Free Tier (Firefly web)
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 25,  # ~25-50/mo
                'free_features': 'Small monthly pool, standard res',
                # Standard (CC plan)
                'standard_monthly_cost_mad': 183.20,  # ~$20
                'standard_credits_per_month': 500,
                'standard_features': 'Plan-specific pools (100-1000+ credits/mo)',
                # Pro Tier
                'pro_monthly_cost_mad': 549.60,  # ~$60
                'pro_credits_per_month': 1500,
                'pro_features': 'Higher resolution, video support',
                # Premier Tier
                'premier_monthly_cost_mad': None,
                'premier_credits_per_month': None,
                'premier_features': '',
            },
            {
                'name': 'suno_ai',
                'display_name': 'Suno AI',
                'tool_type': 'audio',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 91.60,  # Pro default
                'default_credits_per_month': 2500,
                'default_cost_per_image_mad': 0,
                # Free Tier (Basic)
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 1500,  # 50/day * 30
                'free_features': 'Personal use only, MP3 only',
                # Standard Tier
                'standard_monthly_cost_mad': None,
                'standard_credits_per_month': None,
                'standard_features': '',
                # Pro Tier: ~$10/mo
                'pro_monthly_cost_mad': 91.60,  # ~$10
                'pro_credits_per_month': 2500,
                'pro_features': 'Commercial rights, ~500 songs/mo',
                # Premier Tier: ~$30/mo
                'premier_monthly_cost_mad': 274.80,  # ~$30
                'premier_credits_per_month': 10000,
                'premier_features': '~2,000 songs/mo, heavy users/teams',
            },
            {
                'name': 'grok',
                'display_name': 'Grok (xAI)',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 160,
                'default_credits_per_month': 0,
                'default_cost_per_image_mad': 1,
                # Free Tier (X Premium)
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 0,
                'free_features': 'Limited access via X',
                # Standard (X Premium+)
                'standard_monthly_cost_mad': 146.56,  # ~$16
                'standard_credits_per_month': 0,
                'standard_features': 'X Premium+ access, elevated limits',
                # Pro Tier (API)
                'pro_monthly_cost_mad': 2748.00,  # ~$300
                'pro_credits_per_month': 0,
                'pro_features': 'API access, token-based pricing',
                # Premier Tier
                'premier_monthly_cost_mad': None,
                'premier_credits_per_month': None,
                'premier_features': '',
            },
            {
                'name': 'higgsfield',
                'display_name': 'Higgsfield',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 200,
                'default_credits_per_month': 1000,
                'default_cost_per_video_second_mad': 3,
                # Free Tier
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 100,
                'free_features': 'Base allowance with throttling',
                # Standard (Creator)
                'standard_monthly_cost_mad': 183.20,  # ~$20
                'standard_credits_per_month': 1000,
                'standard_features': 'Creator plan, priority',
                # Pro (Ultimate)
                'pro_monthly_cost_mad': 457.50,  # ~$50
                'pro_credits_per_month': 3000,
                'pro_features': 'Unlimited generations, top priority',
                # Premier Tier
                'premier_monthly_cost_mad': None,
                'premier_credits_per_month': None,
                'premier_features': '',
            },
            {
                'name': 'runway',
                'display_name': 'Runway',
                'tool_type': 'video',
                'pricing_model': 'credits',
                'default_monthly_cost_mad': 256.48,  # Pro default
                'default_credits_per_month': 2250,
                'default_cost_per_video_second_mad': 1.2,
                # Free Tier
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 125,  # One-time
                'free_features': 'Watermarked, ~25s Gen-4 Turbo',
                # Standard: $12/mo
                'standard_monthly_cost_mad': 109.92,  # $12 * 9.16
                'standard_credits_per_month': 625,
                'standard_features': '~25s Gen-4.5 or 125s Gen-4 Turbo',
                # Pro: $28/mo
                'pro_monthly_cost_mad': 256.48,  # $28 * 9.16
                'pro_credits_per_month': 2250,
                'pro_features': '~90s Gen-4.5 or 450s Gen-4 Turbo',
                # Premier (Unlimited): $76/mo
                'premier_monthly_cost_mad': 696.16,  # $76 * 9.16
                'premier_credits_per_month': 2250,
                'premier_features': '2,250 credits + unlimited with rate limits',
            },
            {
                'name': 'openai',
                'display_name': 'OpenAI / ChatGPT Plus',
                'tool_type': 'image',
                'pricing_model': 'monthly',
                'default_monthly_cost_mad': 183.20,  # $20
                'default_credits_per_month': 0,
                'default_cost_per_image_mad': 1,
                # Free Tier
                'free_monthly_cost_mad': 0,
                'free_credits_per_month': 0,
                'free_features': 'Limited GPT-4, DALL-E access',
                # Standard (Plus): $20/mo
                'standard_monthly_cost_mad': 183.20,  # $20 * 9.16
                'standard_credits_per_month': 0,
                'standard_features': 'GPT-4, DALL-E 3, priority access',
                # Pro: $200/mo
                'pro_monthly_cost_mad': 1832.00,  # $200 * 9.16
                'pro_credits_per_month': 0,
                'pro_features': 'Unlimited GPT-4, o1 pro mode',
                # Premier (API Teams)
                'premier_monthly_cost_mad': None,
                'premier_credits_per_month': None,
                'premier_features': '',
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
