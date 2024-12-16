<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->insert([
            'id' => Str::uuid(),
            'site_name' => 'TekiPlanet',
            'enrollment_fee' => 0.00,
            'default_currency' => 'USD',
            'currency_symbol' => '$',
            'default_language' => 'en',
            'primary_color' => '#3B82F6',
            'secondary_color' => '#10B981',
            'default_theme' => 'system',
            'registration_enabled' => true,
            'course_purchase_enabled' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
