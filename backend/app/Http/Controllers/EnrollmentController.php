<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}
