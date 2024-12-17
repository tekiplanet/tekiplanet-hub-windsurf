<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CourseExam;
use App\Models\UserCourseExam;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class UserCourseExamsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        // Ensure users and course exams exist
        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }
        if (CourseExam::count() === 0) {
            $this->call(CourseExamsSeeder::class);
        }

        $users = User::all();
        $courseExams = CourseExam::all();

        foreach ($users as $user) {
            // Randomly select some course exams for the user
            $selectedExams = $courseExams->random(rand(1, min(5, $courseExams->count())));

            foreach ($selectedExams as $courseExam) {
                // Determine status based on exam date and randomness
                $status = 'not_started';
                $score = null;
                $totalScore = null;
                $startedAt = null;
                $completedAt = null;
                $attempts = 0;

                // Simulate different exam statuses
                $randomStatus = $faker->randomElement([
                    'not_started', 
                    'in_progress', 
                    'completed', 
                    'missed'
                ]);

                switch ($randomStatus) {
                    case 'completed':
                        $status = 'completed';
                        $score = $faker->randomFloat(2, 0, $courseExam->total_score);
                        $totalScore = $courseExam->total_score;
                        $startedAt = $faker->dateTimeBetween('-1 month', 'now');
                        $completedAt = $faker->dateTimeBetween($startedAt, 'now');
                        $attempts = $faker->numberBetween(1, 3);
                        break;
                    
                    case 'in_progress':
                        $status = 'in_progress';
                        $startedAt = $faker->dateTimeBetween('-1 week', 'now');
                        $attempts = 1;
                        break;
                    
                    case 'missed':
                        $status = 'missed';
                        $attempts = $faker->numberBetween(0, 2);
                        break;
                }

                UserCourseExam::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'course_exam_id' => $courseExam->id,
                    'status' => $status,
                    'score' => $score,
                    'total_score' => $totalScore,
                    'attempts' => $attempts,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'answers' => $status === 'completed' ? json_encode($faker->words(5)) : null,
                    'review_notes' => $status === 'completed' ? json_encode([
                        'strengths' => $faker->sentence,
                        'improvements' => $faker->sentence
                    ]) : null
                ]);
            }
        }
    }
}
