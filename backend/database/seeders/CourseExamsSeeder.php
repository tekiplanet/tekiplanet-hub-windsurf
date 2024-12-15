<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseExam;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class CourseExamsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        // Ensure courses exist
        if (Course::count() === 0) {
            $this->call(CourseSeeder::class);
        }

        $courses = Course::all();

        if ($courses->isEmpty()) {
            $this->command->warn('No courses found to seed exams.');
            return;
        }

        foreach ($courses as $course) {
            // Create 2-3 exams per course
            $examCount = $faker->numberBetween(2, 3);

            for ($i = 0; $i < $examCount; $i++) {
                CourseExam::create([
                    'id' => Str::uuid(),
                    'course_id' => $course->id,
                    'title' => $faker->sentence(4),
                    'description' => $faker->paragraph,
                    'total_questions' => $faker->numberBetween(10, 50),
                    'pass_percentage' => $faker->numberBetween(60, 80),
                    'duration_minutes' => $faker->numberBetween(30, 120),
                    'type' => $faker->randomElement(['multiple_choice', 'true_false', 'mixed']),
                    'difficulty' => $faker->randomElement(['beginner', 'intermediate', 'advanced']),
                    'is_mandatory' => $faker->boolean(70)
                ]);
            }
        }
    }
}
