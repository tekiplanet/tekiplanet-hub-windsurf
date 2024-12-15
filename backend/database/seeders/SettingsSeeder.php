<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'site_name' => 'TekiPlanet',
            'site_description' => 'Your ultimate platform for online learning and skill development',
            'site_logo' => '/logo.png',
            'site_favicon' => '/favicon.ico',
            
            'default_currency' => 'NGN',
            'currency_symbol' => '₦',
            'multi_currency_enabled' => false,
            'supported_currencies' => ['USD', 'EUR', 'GBP'],
            
            'default_language' => 'en',
            'supported_languages' => ['en', 'es', 'fr'],
            
            'primary_color' => '#3B82F6',
            'secondary_color' => '#10B981',
            'default_theme' => 'system',
            
            'support_email' => 'support@tekiplanet.com',
            'support_phone' => '+1 (555) 123-4567',
            
            'social_media_links' => [
                'facebook' => 'https://facebook.com/tekiplanet',
                'twitter' => 'https://twitter.com/tekiplanet',
                'linkedin' => 'https://linkedin.com/company/tekiplanet'
            ],
            
            'registration_enabled' => true,
            'course_purchase_enabled' => true,
            'affiliate_program_enabled' => false,
            
            'default_payment_gateway' => 'stripe',
            'enabled_payment_gateways' => ['stripe', 'paypal'],
            'tax_rate' => 0.08,
            
            'two_factor_enabled' => false,
            'gdpr_compliance' => true,
            
            'google_analytics_id' => 'UA-XXXXXXXX-X',
            'facebook_pixel_id' => null,
            
            'maintenance_mode' => false,
            'maintenance_message' => 'We are currently undergoing maintenance. Please check back soon.'
        ]);
    }
}
