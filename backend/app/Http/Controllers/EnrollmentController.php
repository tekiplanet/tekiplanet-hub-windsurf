<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Installment;
use App\Models\Transaction;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentController extends Controller
{
    protected $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    public function enroll(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id'
        ]);

        try {
            $user = Auth::user();
            $course = Course::findOrFail($request->course_id);

            $enrollment = $this->enrollmentService->enrollUserInCourse($user, $course);

            return response()->json([
                'success' => true,
                'message' => 'Successfully enrolled in the course',
                'enrollment' => $enrollment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getUserEnrollments()
    {
        $user = Auth::user();
        $enrollments = $user->enrollments()->with('course')->get();

        return response()->json([
            'success' => true,
            'enrollments' => $enrollments
        ]);
    }

    public function getUserEnrolledCourses()
    {
        $user = Auth::user();
        Log::info('Fetching enrolled courses for user', [
            'user_id' => $user->id,
            'username' => $user->username
        ]);

        // Eager load course and installments
        $enrollments = $user->enrollments()->with(['course', 'installments'])->get();

        $enrichedEnrollments = $enrollments->map(function($enrollment) {
            // Calculate overall payment status
            $installments = $enrollment->installments;
            $paymentStatus = $this->calculateOverallPaymentStatus($installments);

            // Ensure course is loaded and price is retrieved
            $course = $enrollment->course;
            $totalTuition = $course ? $course->price : 0;

            Log::info('Course details for enrollment', [
                'course_id' => $enrollment->course_id,
                'course_title' => optional($course)->title,
                'course_price' => $totalTuition,
                'course_exists' => $course ? 'Yes' : 'No'
            ]);

            $paidAmount = $installments->where('status', 'paid')->sum('amount');

            return [
                'enrollment_id' => $enrollment->id,
                'course_id' => $enrollment->course_id,
                'course_title' => optional($course)->title,
                'course_image' => optional($course)->image_url,
                'enrollment_status' => $enrollment->status,
                'payment_status' => $paymentStatus,
                'total_tuition' => $totalTuition,
                'paid_amount' => $paidAmount,
                'progress' => $enrollment->progress ?? 0,
                'installments' => $installments->map(function($installment) {
                    return [
                        'id' => $installment->id,
                        'amount' => $installment->amount,
                        'due_date' => $installment->due_date,
                        'status' => $installment->status,
                        'paid_at' => $installment->paid_at,
                    ];
                }),
            ];
        });

        Log::info('Enrollment query results', [
            'total_enrollments' => $enrichedEnrollments->count(),
        ]);

        return response()->json([
            'success' => true,
            'enrollments' => $enrichedEnrollments
        ]);
    }

    public function processFullPayment(Request $request)
    {
        $user = Auth::user();
        
        // Validate request
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'amount' => 'required|numeric|min:0'
        ]);

        // Find the course
        $course = Course::findOrFail($validated['course_id']);

        // Verify amount matches course price
        if (abs($course->price - $validated['amount']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment amount'
            ], 400);
        }

        // Check if already enrolled
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'Already enrolled in this course'
            ], 400);
        }

        // Create enrollment
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => 'active',
            'progress' => 0,
            'enrolled_at' => now()
        ]);

        // Create full payment installment
        $installment = Installment::create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $user->id,
            'amount' => $course->price,
            'due_date' => now(),
            'status' => 'paid',
            'paid_at' => now()
        ]);

        // Log the transaction
        Log::info('Full course payment processed', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'enrollment_id' => $enrollment->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course enrolled successfully',
            'enrollment_id' => $enrollment->id
        ]);
    }

    public function processFullTuitionPayment(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'amount' => 'required|numeric|min:0'
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // Find the course
        $course = Course::findOrFail($validated['course_id']);

        // Check if user is already enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        // Validate amount matches course price
        if (abs($course->price - $validated['amount']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment amount'
            ], 400);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Deduct balance from user's wallet
            $user->wallet_balance -= $validated['amount'];
            $user->save();

            // If not enrolled, create enrollment
            if (!$enrollment) {
                $enrollment = Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'status' => 'active',
                    'progress' => 0,
                    'enrolled_at' => now()
                ]);
            } else {
                // Update existing enrollment status
                $enrollment->status = 'active';
                $enrollment->save();
            }

            // Check if full payment installment already exists
            $existingInstallment = Installment::where('enrollment_id', $enrollment->id)
                ->where('status', 'paid')
                ->first();

            // Create full payment installment if not exists
            if (!$existingInstallment) {
                Installment::create([
                    'enrollment_id' => $enrollment->id,
                    'user_id' => $user->id,
                    'amount' => $course->price,
                    'due_date' => now(),
                    'status' => 'paid',
                    'paid_at' => now()
                ]);
            }

            // Record transaction
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'debit',
                'amount' => $validated['amount'],
                'description' => "Full tuition payment for {$course->title}",
                'status' => 'completed'
            ]);

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course payment processed successfully',
                'enrollment_id' => $enrollment->id
            ]);
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            // Log the error
            Log::error('Full tuition payment processing failed', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed'
            ], 500);
        }
    }

    // Helper method to calculate overall payment status
    private function calculateOverallPaymentStatus($installments)
    {
        if ($installments->isEmpty()) {
            return 'not_started';
        }

        $totalInstallments = $installments->count();
        $paidInstallments = $installments->where('status', 'paid')->count();

        if ($paidInstallments == $totalInstallments) {
            return 'fully_paid';
        }

        $overdueInstallments = $installments->filter(function($installment) {
            return $installment->status !== 'paid' && 
                   now()->greaterThan($installment->due_date);
        })->count();

        if ($overdueInstallments > 0) {
            return 'overdue';
        }

        return 'partially_paid';
    }
}
