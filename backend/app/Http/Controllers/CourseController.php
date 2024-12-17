<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseExam;
use App\Models\CourseFeature;
use App\Models\CourseNotice;
use App\Models\UserCourseNotice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::query();

        // Optional filtering by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        // Optional filtering by level
        if ($request->has('level')) {
            $query->where('level', $request->input('level'));
        }

        // Optional sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 8);
        $courses = $query->paginate($perPage);

        return response()->json([
            'courses' => $courses->items(),
            'total' => $courses->total(),
            'current_page' => $courses->currentPage(),
            'per_page' => $courses->perPage(),
            'last_page' => $courses->lastPage()
        ]);
    }

    public function show($id)
    {
        $course = Course::with([
            'modules' => function($query) {
                $query->orderBy('order');
            },
            'modules.topics' => function($query) {
                $query->orderBy('order');
            },
            'modules.lessons' => function($query) {
                $query->orderBy('order');
            },
            'instructor',
            'schedules'
        ])->findOrFail($id);
        
        return response()->json([
            'course' => $course,
            'instructor' => $course->instructor,
            'schedules' => $course->schedules
        ]);
    }

    /**
     * Returns the features of a course.
     *
     * @param int $courseId The ID of the course.
     * @return \Illuminate\Http\JsonResponse A JSON response containing the course features.
     */
    public function getCourseFeatures($courseId)
    {
        $features = CourseFeature::where('course_id', $courseId)->get();
        return response()->json($features);
    }

    public function getCurriculum($courseId)
    {
        $course = Course::with([
            'modules' => function($query) {
                $query->orderBy('order');
            },
            'modules.topics' => function($query) {
                $query->orderBy('order');
            },
            'modules.lessons' => function($query) {
                $query->orderBy('order');
            }
        ])->findOrFail($courseId);
        
        return response()->json($course->modules);
    }

    /**
     * Get notices for a specific course
     *
     * @param int $courseId The ID of the course
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCourseNotices($courseId)
    {
        // Validate the course exists
        $course = Course::findOrFail($courseId);

        // Get the authenticated user
        $user = auth()->user();

        // Fetch notices related to this course, excluding soft-deleted notices for this user
        $notices = CourseNotice::where('course_id', $courseId)
            ->whereDoesntHave('userNotices', function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('is_hidden', true);
            })
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'notices' => $notices,
            'course_id' => $courseId
        ]);
    }

    /**
     * Delete a user's course notice
     *
     * @param Request $request
     * @param string $courseNoticeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUserCourseNotice(Request $request, $courseNoticeId)
    {
        $user = $request->user();

        // Find or create the user's course notice record
        $userCourseNotice = UserCourseNotice::firstOrCreate([
            'user_id' => $user->id,
            'course_notice_id' => $courseNoticeId
        ]);

        // Mark as hidden for this user
        $userCourseNotice->is_hidden = true;
        $userCourseNotice->save();

        return response()->json([
            'success' => true,
            'message' => 'Notice removed successfully',
            'course_notice_id' => $courseNoticeId
        ]);
    }

    public function getCourseExams($courseId)
    {
        try {
            // Find all exams for the specified course
            $exams = CourseExam::where('course_id', $courseId)
                ->orderBy('created_at', 'asc')
                ->get();

            // Transform exams to include additional details
            $transformedExams = $exams->map(function($exam) {
                // Determine exam status based on current date
                $now = now();
                $examDate = Carbon::parse($exam->date);
                
                $status = 'upcoming';
                if ($examDate->isPast()) {
                    $status = 'missed';
                    
                    // Check if exam has been completed
                    if ($exam->score !== null) {
                        $status = 'completed';
                    }
                } elseif ($now->between($examDate, $examDate->copy()->addHours(2))) {
                    $status = 'ongoing';
                }

                return [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'type' => $exam->type,
                    'date' => $exam->date,
                    'duration' => $exam->duration,
                    'status' => $status,
                    'score' => $exam->score,
                    'totalScore' => $exam->total_score,
                    'topics' => $exam->topics ?? [],
                    'instructions' => $exam->instructions
                ];
            });

            return response()->json($transformedExams);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching course exams: ' . $e->getMessage());
            
            // Return an error response
            return response()->json([
                'message' => 'Unable to fetch course exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
