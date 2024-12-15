<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseModule;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class CourseModulesSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $courses = Course::all();

        foreach ($courses as $course) {
            // Create 4-6 modules per course
            $moduleCount = $faker->numberBetween(4, 6);

            for ($i = 0; $i < $moduleCount; $i++) {
                CourseModule::create([
                    'id' => Str::uuid(),
                    'course_id' => $course->id,
                    'title' => $this->generateModuleTitle($course->title, $i + 1),
                    'description' => $faker->paragraph,
                    'order' => $i + 1,
                    'duration_hours' => $faker->numberBetween(2, 8)
                ]);
            }
        }
    }

    private function generateModuleTitle(string $courseTitle, int $moduleNumber): string
    {
        $moduleTopics = [
            'Fundamentals',
            'Advanced Techniques',
            'Practical Applications',
            'Deep Dive',
            'Case Studies',
            'Best Practices'
        ];

        return sprintf(
            "%s: Module %d - %s", 
            $courseTitle, 
            $moduleNumber, 
            $moduleTopics[array_rand($moduleTopics)]
        );
    }
}
