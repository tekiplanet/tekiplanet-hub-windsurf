<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseExam;
use App\Models\UserCourseExam;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserCourseExamsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        // Ensure users, courses, and course exams exist
        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }
        if (Course::count() === 0) {
            $this->call(CourseSeeder::class);
        }
        if (CourseExam::count() === 0) {
            $this->call(CourseExamsSeeder::class);
        }

        // Get all users and course exams
        $users = User::all();
        $courseExams = CourseExam::all();

        // Create exam attempts for each user
        foreach ($users as $user) {
            // Randomly select some course exams for the user
            $selectedExams = $courseExams->random(
                $faker->numberBetween(1, min(5, $courseExams->count()))
            );

            foreach ($selectedExams as $courseExam) {
                // Determine exam attempt details
                $status = $this->generateExamStatus($faker, $courseExam);
                
                // Generate exam attempt data
                $examAttemptData = $this->generateExamAttemptData(
                    $faker, 
                    $courseExam, 
                    $status
                );

                // Create user course exam entry
                UserCourseExam::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'course_exam_id' => $courseExam->id,
                    'status' => $status,
                    'score' => $examAttemptData['score'],
                    'total_score' => $examAttemptData['total_score'],
                    'attempts' => $examAttemptData['attempts'],
                    'started_at' => $examAttemptData['started_at'],
                    'completed_at' => $examAttemptData['completed_at'],
                    'answers' => $examAttemptData['answers'],
                    'review_notes' => $examAttemptData['review_notes']
                ]);
            }
        }
    }

    /**
     * Generate exam status based on exam date and randomness
     */
    private function generateExamStatus($faker, $courseExam): string
    {
        $now = now();
        $examDate = Carbon::parse($courseExam->date);

        // If exam is in the future, it can only be not_started
        if ($examDate->isFuture()) {
            return 'not_started';
        }

        // If exam is in the past, it can be completed, missed, or in_progress
        $statusOptions = ['completed', 'missed', 'in_progress'];
        return $faker->randomElement($statusOptions);
    }

    /**
     * Generate detailed exam attempt data
     */
    private function generateExamAttemptData($faker, $courseExam, $status): array
    {
        $now = now();
        $examDate = Carbon::parse($courseExam->date);
        
        $attempts = 0;
        $score = null;
        $totalScore = null;
        $startedAt = null;
        $completedAt = null;
        $answers = null;
        $reviewNotes = null;

        switch ($status) {
            case 'completed':
                $attempts = $faker->numberBetween(1, 3);
                $startedAt = $faker->dateTimeBetween($examDate->subDays(7), $examDate);
                $completedAt = $faker->dateTimeBetween($startedAt, $now);
                
                // Generate score
                $totalScore = $courseExam->total_questions * 2; // Assuming 2 points per question
                $score = $faker->randomFloat(2, $totalScore * 0.5, $totalScore);
                
                // Generate sample answers and review notes
                $answers = json_encode($this->generateSampleAnswers($courseExam->total_questions));
                $reviewNotes = json_encode([
                    'strengths' => $faker->sentence,
                    'improvements' => $faker->sentence
                ]);
                break;

            case 'in_progress':
                $attempts = 1;
                $startedAt = $faker->dateTimeBetween($examDate->subDays(7), $now);
                break;

            case 'missed':
                $attempts = $faker->numberBetween(0, 2);
                break;

            default: // not_started
                $attempts = 0;
                break;
        }

        return [
            'attempts' => $attempts,
            'score' => $score,
            'total_score' => $totalScore,
            'started_at' => $startedAt,
            'completed_at' => $completedAt,
            'answers' => $answers,
            'review_notes' => $reviewNotes
        ];
    }

    /**
     * Generate sample answers for an exam
     */
    private function generateSampleAnswers(int $totalQuestions): array
    {
        $answers = [];
        $possibleAnswers = ['A', 'B', 'C', 'D'];

        for ($i = 1; $i <= $totalQuestions; $i++) {
            $answers["question_{$i}"] = $possibleAnswers[array_rand($possibleAnswers)];
        }

        return $answers;
    }
}
