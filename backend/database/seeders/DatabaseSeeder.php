<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\CourseSeeder;
use Database\Seeders\SettingsSeeder;
use Database\Seeders\CourseReviewSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CourseSeeder::class,
            SettingsSeeder::class,
            CourseReviewSeeder::class
        ]);
    }
}
