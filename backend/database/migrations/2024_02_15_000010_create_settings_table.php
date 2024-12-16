<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Global Site Settings
            $table->string('site_name')->default('TekiPlanet');
            $table->text('site_description')->nullable();
            $table->string('site_logo')->nullable();
            $table->string('site_favicon')->nullable();

            $table->decimal('enrollment_fee', 10, 2);

            
            // Currency and Financial Settings
            $table->string('default_currency')->default('USD');
            $table->string('currency_symbol')->default('$');
            $table->boolean('multi_currency_enabled')->default(false);
            $table->json('supported_currencies')->nullable();
            
            // Localization
            $table->string('default_language')->default('en');
            $table->json('supported_languages')->nullable();
            
            // Theme and Appearance
            $table->string('primary_color')->default('#3B82F6');
            $table->string('secondary_color')->default('#10B981');
            $table->enum('default_theme', ['light', 'dark', 'system'])->default('system');
            
            // Contact and Support
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->text('contact_address')->nullable();
            
            // Social Media
            $table->json('social_media_links')->nullable();
            
            // Platform Features
            $table->boolean('registration_enabled')->default(true);
            $table->boolean('course_purchase_enabled')->default(true);
            $table->boolean('affiliate_program_enabled')->default(false);
            
            // Payment and Billing
            $table->string('default_payment_gateway')->default('stripe');
            $table->json('enabled_payment_gateways')->nullable();
            $table->decimal('tax_rate', 5, 2)->default(0);
            
            // Security Settings
            $table->boolean('two_factor_enabled')->default(false);
            $table->boolean('gdpr_compliance')->default(true);
            
            // Marketing and Analytics
            $table->string('google_analytics_id')->nullable();
            $table->string('facebook_pixel_id')->nullable();
            
            // Maintenance Mode
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
};
