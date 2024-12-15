<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseModule;
use App\Models\CourseLesson;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class CourseLessonsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $modules = CourseModule::all();

        foreach ($modules as $module) {
            // Create 3-5 lessons per module
            $lessonCount = $faker->numberBetween(3, 5);

            for ($i = 0; $i < $lessonCount; $i++) {
                CourseLesson::create([
                    'id' => Str::uuid(),
                    'module_id' => $module->id,
                    'title' => $faker->sentence(4),
                    'description' => $faker->paragraph,
                    'content_type' => $faker->randomElement(['video', 'text', 'quiz', 'assignment']),
                    'duration_minutes' => $faker->numberBetween(10, 60),
                    'order' => $i + 1,
                    'resource_url' => $faker->boolean(50) ? $faker->url : null,
                    'is_preview' => $faker->boolean(20)
                ]);
            }
        }
    }
}
