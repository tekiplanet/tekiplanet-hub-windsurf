<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseNotice;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CourseNoticesSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $courses = Course::all();

        foreach ($courses as $course) {
            // Create 2-4 notices per course
            $noticeCount = $faker->numberBetween(2, 4);

            for ($i = 0; $i < $noticeCount; $i++) {
                CourseNotice::create([
                    'id' => Str::uuid(),
                    'course_id' => $course->id,
                    'title' => $faker->sentence(6),
                    'content' => $faker->paragraph(2),
                    'priority' => $faker->randomElement(['low', 'medium', 'high']),
                    'is_important' => $faker->boolean(20), // 20% chance of being important
                    'published_at' => Carbon::now()->subDays($faker->numberBetween(0, 30))
                ]);
            }
        }
    }
}
