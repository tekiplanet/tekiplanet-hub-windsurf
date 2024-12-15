<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseSchedule;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CourseSchedulesSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $courses = Course::all();

        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        foreach ($courses as $course) {
            // Create 1-3 schedules per course
            $scheduleCount = $faker->numberBetween(1, 3);

            for ($i = 0; $i < $scheduleCount; $i++) {
                $startDate = Carbon::now()->addDays($faker->numberBetween(15, 90));
                $endDate = $startDate->copy()->addWeeks($course->duration_hours / 10);

                // Randomly select 2-4 days of the week
                $selectedDays = $faker->randomElements($daysOfWeek, $faker->numberBetween(2, 4));

                CourseSchedule::create([
                    'course_id' => $course->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'days_of_week' => implode(',', $selectedDays),
                    'start_time' => $faker->time('H:i:s', '09:00'),
                    'end_time' => $faker->time('H:i:s', '17:00'),
                    'location' => $faker->optional()->address
                ]);
            }
        }
    }
}
