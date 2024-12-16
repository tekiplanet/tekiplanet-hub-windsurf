<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
