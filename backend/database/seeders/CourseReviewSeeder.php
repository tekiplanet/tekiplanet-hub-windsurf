<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\User;
use App\Models\CourseReview;
use Faker\Factory as Faker;

class CourseReviewSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $courses = Course::all();
        $users = User::all();

        foreach ($courses as $course) {
            // Create 5-10 reviews per course
            $reviewCount = $faker->numberBetween(5, 10);
            
            for ($i = 0; $i < $reviewCount; $i++) {
                $user = $users->random();
                
                CourseReview::create([
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
