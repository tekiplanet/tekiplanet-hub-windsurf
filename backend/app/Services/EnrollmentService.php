<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    public function enrollUserInCourse(User $user, Course $course)
    {
        // Get enrollment fee directly from the first settings record
        $enrollmentFee = Setting::first()->enrollment_fee ?? 0;

        // Start a database transaction
        return DB::transaction(function () use ($user, $course, $enrollmentFee) {
            // Check if user is already enrolled
            $existingEnrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existingEnrollment) {
                throw new \Exception('You are already enrolled in this course.');
            }

            // Check wallet balance
            if ($user->wallet_balance < $enrollmentFee) {
                throw new \Exception('Insufficient wallet balance.');
            }

            // Deduct enrollment fee
            $user->wallet_balance -= $enrollmentFee;
            $user->save();

            // Create enrollment
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'active',
                'progress' => 0,
                'enrolled_at' => now()
            ]);

            // Log the enrollment
            Log::info('User enrolled in course', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'enrollment_id' => $enrollment->id
            ]);

            return $enrollment;
        });
    }
}
