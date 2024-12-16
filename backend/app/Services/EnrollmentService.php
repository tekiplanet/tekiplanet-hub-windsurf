<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Setting;
use App\Models\Installment;
use App\Models\Transaction;
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

    public function processInstallmentPayment(User $user, Enrollment $enrollment, Installment $installment)
    {
        return DB::transaction(function () use ($user, $enrollment, $installment) {
            // Verify the installment belongs to the enrollment and user
            if ($installment->enrollment_id !== $enrollment->id || $installment->user_id !== $user->id) {
                throw new \Exception('Invalid installment');
            }

            // Check if installment is already paid
            if ($installment->status === 'paid') {
                throw new \Exception('Installment already paid');
            }

            // Check if previous installments are paid (if applicable)
            $previousUnpaidInstallments = Installment::where('enrollment_id', $enrollment->id)
                ->where('id', '!=', $installment->id)
                ->where('status', '!=', 'paid')
                ->where('due_date', '<', $installment->due_date)
                ->exists();

            if ($previousUnpaidInstallments) {
                throw new \Exception('Previous installments must be paid first');
            }

            // Check wallet balance
            if ($user->wallet_balance < $installment->amount) {
                throw new \Exception('Insufficient wallet balance');
            }

            // Deduct installment amount from wallet
            $user->wallet_balance -= $installment->amount;
            $user->save();

            // Update installment status
            $installment->status = 'paid';
            $installment->paid_at = now();
            $installment->save();

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'enrollment_id' => $enrollment->id,
                'installment_id' => $installment->id,
                'amount' => $installment->amount,
                'type' => 'installment_payment',
                'status' => 'success',
                'payment_method' => 'wallet',
                'transaction_date' => now(),
                'reference' => 'INST-' . uniqid()
            ]);

            // Check if all installments are now paid
            $allInstallmentsPaid = Installment::where('enrollment_id', $enrollment->id)
                ->where('status', '!=', 'paid')
                ->doesntExist();

            // Update enrollment status if all installments are paid
            if ($allInstallmentsPaid) {
                $enrollment->payment_status = 'fully_paid';
                $enrollment->save();
            }

            // Log the transaction
            Log::info('Installment payment processed', [
                'user_id' => $user->id,
                'enrollment_id' => $enrollment->id,
                'installment_id' => $installment->id,
                'amount' => $installment->amount
            ]);

            return $transaction;
        });
    }
}
