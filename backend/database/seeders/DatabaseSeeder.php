<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\CourseSeeder;
use Database\Seeders\SettingsSeeder;
use Database\Seeders\CourseReviewSeeder;
use Database\Seeders\CourseExamsSeeder;
use Database\Seeders\CourseModulesSeeder;
use Database\Seeders\CourseLessonsSeeder;
use Database\Seeders\CourseNoticesSeeder;
use Database\Seeders\CourseSchedulesSeeder;
use Database\Seeders\CourseTopicsSeeder;
use Database\Seeders\UserCourseNoticesSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\CourseFeatureSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CourseSeeder::class,
            CourseFeatureSeeder::class,
            SettingsSeeder::class,
            CourseReviewSeeder::class,
            CourseExamsSeeder::class,
            CourseModulesSeeder::class,
            CourseLessonsSeeder::class,
            CourseNoticesSeeder::class,
            CourseSchedulesSeeder::class,
            CourseTopicsSeeder::class,
            UserCourseNoticesSeeder::class
        ]);
    }
}
