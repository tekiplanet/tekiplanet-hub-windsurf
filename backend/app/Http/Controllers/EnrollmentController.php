<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Installment;
use App\Models\Transaction;
use App\Models\CourseSchedule;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

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

            // Find the next upcoming course schedule
            $nextCourseSchedule = CourseSchedule::where('course_id', $enrollment->course_id)
                ->where('start_date', '>=', now()->toDateString())
                ->orderBy('start_date', 'asc')
                ->first();

            // Determine next payment deadline logic
            $nextPaymentDeadline = null;
            
            // If payment status is fully paid, no upcoming deadlines
            if ($paymentStatus === 'fully_paid') {
                $nextPaymentDeadline = null;
            } 
            // If there are unpaid installments, use the earliest unpaid installment's due date
            elseif ($installments->where('status', '!=', 'paid')->count() > 0) {
                $nextPaymentDeadline = $installments
                    ->where('status', '!=', 'paid')
                    ->sortBy('due_date')
                    ->first()->due_date;
            } 
            // If no installments paid, use one month after enrollment date
            else {
                $enrolledAt = $enrollment->enrolled_at ?? $enrollment->created_at;
                $nextPaymentDeadline = Carbon::parse($enrolledAt)->addMonth()->toDateString();
            }

            return [
                'enrollment_id' => $enrollment->id,
                'course_id' => $enrollment->course_id,
                'course_title' => optional($course)->title,
                'course_image' => optional($course)->image_url,
                'enrollment_status' => $enrollment->status,
                'enrolled_at' => $enrollment->enrolled_at 
                    ? (is_string($enrollment->enrolled_at) 
                        ? $enrollment->enrolled_at 
                        : $enrollment->enrolled_at->format('Y-m-d\TH:i:s.uP')) 
                    : ($enrollment->created_at 
                        ? (is_string($enrollment->created_at) 
                            ? $enrollment->created_at 
                            : $enrollment->created_at->format('Y-m-d\TH:i:s.uP')) 
                        : null),
                'payment_status' => $paymentStatus,
                'total_tuition' => $totalTuition,
                'paid_amount' => $paidAmount,
                'progress' => $enrollment->progress ?? 0,
                'next_course_schedule' => $nextCourseSchedule ? $nextCourseSchedule->start_date : null,
                'next_payment_deadline' => $nextPaymentDeadline,
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
                'status' => 'completed',
                'payment_method' => $request->input('payment_method', 'wallet'),
                'reference_number' => 'INST-' . Str::uuid(),
                'notes' => 'Installment ID: ' . Str::uuid()                
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

    public function processInstallmentPayment(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'installment_id' => 'required|exists:installments,id',
            'amount' => 'required|numeric|min:0'
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // Find the installment
        $installment = Installment::findOrFail($validated['installment_id']);

        // Verify amount matches installment amount
        if (abs($installment->amount - $validated['amount']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment amount'
            ], 400);
        }

        // Check wallet balance
        if ($user->wallet_balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance'
            ], 400);
        }

        // Check if installment is already paid
        if ($installment->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This installment has already been paid'
            ], 400);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Deduct from wallet
            $user->wallet_balance -= $validated['amount'];
            $user->save();

            // Get the enrollment
            $enrollment = $installment->enrollment;

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'enrollment_id' => $enrollment->id,
                'installment_id' => $installment->id,
                'amount' => $validated['amount'],
                'type' => 'installment_payment',
                'status' => 'completed',
                'payment_method' => $request->input('payment_method', 'wallet'),
                'transaction_date' => now(),
                'reference' => 'INST-' . uniqid()
            ]);

            // Update installment
            $installment->status = 'paid';
            $installment->paid_at = now();
            $installment->save();

            // Check if all installments are paid
            $remainingUnpaidInstallments = Installment::where('enrollment_id', $enrollment->id)
                ->where('status', 'pending')
                ->count();

            // Update enrollment payment status
            if ($remainingUnpaidInstallments === 0) {
                $enrollment->payment_status = 'fully_paid';
            } else {
                $enrollment->payment_status = 'partially_paid';
            }
            $enrollment->save();

            // Log the transaction
            Log::info('Installment payment successful', [
                'user_id' => $user->id,
                'installment_id' => $installment->id,
                'amount' => $validated['amount']
            ]);

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Installment payment processed successfully',
                'enrollment' => $enrollment,
                'installment' => $installment,
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            // Log error
            Log::error('Installment payment processing failed', [
                'user_id' => $user->id,
                'installment_id' => $installment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process installment payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processSpecificInstallmentPayment(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'installment_id' => 'required|exists:installments,id',
            'amount' => 'required|numeric|min:0'
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // Find the course
        $course = Course::findOrFail($validated['course_id']);

        // Find the specific installment
        $installment = Installment::findOrFail($validated['installment_id']);

        // Validate the installment belongs to the user and course
        if ($installment->user_id !== $user->id || $installment->enrollment->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid installment'
            ], 400);
        }

        // Validate amount matches installment amount
        if (abs($installment->amount - $validated['amount']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment amount'
            ], 400);
        }

        // Debug logging
        Log::info('Installment payment attempt', [
            'installment_id' => $installment->id,
            'current_status' => $installment->status,
            'current_paid_at' => $installment->paid_at
        ]);

        // Check if installment is already paid
        if ($installment->status === 'paid' || !is_null($installment->paid_at)) {
            return response()->json([
                'success' => false,
                'message' => 'This installment has already been paid'
            ], 400);
        }

        // Check wallet balance
        if ($user->wallet_balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance'
            ], 400);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Deduct balance from user's wallet
            $user->wallet_balance -= $validated['amount'];
            $user->save();

            // Get the enrollment
            $enrollment = $installment->enrollment;

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'amount' => $validated['amount'],
                'type' => 'debit',
                'description' => 'Installment payment for course: ' . $course->title,
                'category' => 'course_payment',
                'status' => 'completed',
                'payment_method' => $request->input('payment_method', 'wallet'),
                'reference_number' => 'INST-' . $installment->id,
                'notes' => 'Installment ID: ' . $installment->id
            ]);

            // Update installment status explicitly
            $installment->status = 'paid';
            $installment->paid_at = now();
            $installment->save();

            // Debug logging
            Log::info('Installment payment processed', [
                'installment_id' => $installment->id,
                'new_status' => $installment->status,
                'new_paid_at' => $installment->paid_at
            ]);

            // Check if all installments are paid
            $remainingUnpaidInstallments = Installment::where('enrollment_id', $enrollment->id)
                ->where('status', 'pending')
                ->count();

            // Update enrollment status
            if ($remainingUnpaidInstallments === 0) {
                $enrollment->payment_status = 'fully_paid';
            } else {
                $enrollment->payment_status = 'partially_paid';
            }
            $enrollment->save();

            // Commit transaction
            DB::commit();

            // Log the transaction
            Log::info('Installment payment processed', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'installment_id' => $installment->id,
                'amount' => $validated['amount']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Installment payment processed successfully',
                'enrollment' => $enrollment,
                'installment' => $installment,
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            // Log error
            Log::error('Specific installment payment processing failed', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'installment_id' => $installment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process specific installment payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processInstallmentPlan(Request $request)
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

        // Validate amount is half of the course price
        $halfPrice = $course->price / 2;
        if (abs($halfPrice - $validated['amount']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid installment amount'
            ], 400);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Find or create enrollment
            $enrollment = Enrollment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $course->id
                ],
                [
                    'status' => 'active',
                    'progress' => 0,
                    'enrolled_at' => now()
                ]
            );

            // Check if installments already exist for this enrollment
            $existingInstallments = Installment::where('enrollment_id', $enrollment->id)->count();
            if ($existingInstallments > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Installment plan already exists for this course'
                ], 400);
            }

            // Create first installment (pending)
            $firstInstallment = Installment::create([
                'enrollment_id' => $enrollment->id,
                'user_id' => $user->id,
                'amount' => $halfPrice,
                'due_date' => now()->addWeeks(1),
                'status' => 'pending',
                'paid_at' => null
            ]);

            // Create second installment (pending)
            $secondInstallment = Installment::create([
                'enrollment_id' => $enrollment->id,
                'user_id' => $user->id,
                'amount' => $halfPrice,
                'due_date' => now()->addMonths(1),
                'status' => 'pending',
                'paid_at' => null
            ]);

            // Update enrollment payment status
            $enrollment->payment_status = 'unpaid';
            $enrollment->save();

            // Commit transaction
            DB::commit();

            // Log the transaction
            Log::info('Installment plan created', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'first_installment_id' => $firstInstallment->id,
                'second_installment_id' => $secondInstallment->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Installment plan created successfully',
                'installments' => [
                    [
                        'id' => $firstInstallment->id,
                        'amount' => $firstInstallment->amount,
                        'due_date' => $firstInstallment->due_date,
                        'status' => $firstInstallment->status,
                        'paid_at' => $firstInstallment->paid_at,
                    ],
                    [
                        'id' => $secondInstallment->id,
                        'amount' => $secondInstallment->amount,
                        'due_date' => $secondInstallment->due_date,
                        'status' => $secondInstallment->status,
                        'paid_at' => $secondInstallment->paid_at,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            // Log error
            Log::error('Installment plan creation failed', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create installment plan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function payInstallment(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'installment_id' => 'required|exists:installments,id',
            'amount' => 'required|numeric|min:0'
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // Find the installment
        $installment = Installment::findOrFail($validated['installment_id']);

        // Verify the installment belongs to the user
        if ($installment->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to pay this installment'
            ], 403);
        }

        // Check if installment is already paid
        if ($installment->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Installment already paid'
            ], 400);
        }

        // Check wallet balance
        if ($user->wallet_balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance'
            ], 400);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Deduct from wallet
            $user->wallet_balance -= $validated['amount'];
            $user->save();

            // Update installment
            $installment->status = 'paid';
            $installment->paid_at = now();
            $installment->save();

            // Get the enrollment
            $enrollment = $installment->enrollment;

            // Check if all installments are paid
            $remainingUnpaidInstallments = Installment::where('enrollment_id', $enrollment->id)
                ->where('status', 'pending')
                ->count();

            // Update enrollment payment status
            if ($remainingUnpaidInstallments === 0) {
                $enrollment->payment_status = 'fully_paid';
            } else {
                $enrollment->payment_status = 'partially_paid';
            }
            $enrollment->save();

            // Log the transaction
            Log::info('Installment payment successful', [
                'user_id' => $user->id,
                'installment_id' => $installment->id,
                'amount' => $validated['amount']
            ]);

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Installment paid successfully',
                'installment' => [
                    'id' => $installment->id,
                    'amount' => $installment->amount,
                    'due_date' => $installment->due_date,
                    'status' => $installment->status,
                    'paid_at' => $installment->paid_at,
                ],
                'enrollment' => [
                    'id' => $enrollment->id,
                    'payment_status' => $enrollment->payment_status
                ]
            ]);
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            // Log error
            Log::error('Installment payment failed', [
                'user_id' => $user->id,
                'installment_id' => $installment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process installment payment: ' . $e->getMessage()
            ], 500);
        }
    }

    // Helper method to calculate overall payment status
    private function calculateOverallPaymentStatus($installments)
    {
        if (!$installments || $installments->isEmpty()) {
            return 'pending_installments';
        }

        // Check if all installments are paid
        $allPaid = $installments->every(function ($installment) {
            return $installment->status === 'paid';
        });

        if ($allPaid) {
            return 'fully_paid';
        }

        // Check if any installment is paid
        $anyPaid = $installments->contains(function ($installment) {
            return $installment->status === 'paid';
        });

        return $anyPaid ? 'partially_paid' : 'pending_installments';
    }
}
