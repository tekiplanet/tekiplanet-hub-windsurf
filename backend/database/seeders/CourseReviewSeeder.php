<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\User;
use App\Models\CourseReview;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class CourseReviewSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        // Ensure courses exist
        if (Course::count() === 0) {
            $this->call(CourseSeeder::class);
        }
        
        // Ensure users exist
        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        $courses = Course::all();
        $users = User::all();

        if ($courses->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No courses or users found to seed reviews.');
            return;
        }

        foreach ($courses as $course) {
            // Create 5-10 reviews per course
            $reviewCount = $faker->numberBetween(5, 10);
            
            for ($i = 0; $i < $reviewCount; $i++) {
                $user = $users->random();
                
                CourseReview::create([
                    'id' => Str::uuid(),
                    'course_id' => $course->id,
                    'user_id' => $user->id,
                    'rating' => $faker->numberBetween(3, 5),
                    'comment' => $faker->paragraph,
                    'is_verified' => $faker->boolean(70) // 70% chance of being verified
                ]);
            }

            // Update course rating after seeding
            $course->updateRating();
        }
    }
}
