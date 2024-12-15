<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Create a default admin user
        User::create([
            'username' => 'admin',
            'email' => 'admin@tekiplanet.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'account_type' => 'professional',
            'bio' => 'Platform Administrator',
            'timezone' => 'UTC',
            'dark_mode' => false,
            'two_factor_enabled' => false,
            'email_notifications' => true,
            'push_notifications' => true,
            'marketing_notifications' => false,
            'profile_visibility' => 'private'
        ]);

        // Create some random users
        for ($i = 0; $i < 10; $i++) {
            User::create([
                'username' => $faker->unique()->userName,
                'email' => $faker->unique()->safeEmail,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'first_name' => $faker->firstName,
                'last_name' => $faker->lastName,
                'bio' => $faker->optional()->paragraph,
                'timezone' => $faker->timezone,
                'account_type' => $faker->randomElement(['student', 'business', 'professional']),
                'avatar' => $faker->optional()->imageUrl,
                'dark_mode' => $faker->boolean,
                'two_factor_enabled' => $faker->boolean(20),
                'email_notifications' => $faker->boolean(80),
                'push_notifications' => $faker->boolean(70),
                'marketing_notifications' => $faker->boolean(50),
                'profile_visibility' => $faker->randomElement(['public', 'private']),
                'wallet_balance' => $faker->optional()->randomFloat(2, 0, 1000)
            ]);
        }
    }
}
