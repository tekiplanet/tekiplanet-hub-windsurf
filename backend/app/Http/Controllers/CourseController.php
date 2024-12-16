<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseFeature;
use App\Models\CourseNotice;
use Illuminate\Http\Request;

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

        // Fetch notices related to this course
        $notices = CourseNotice::where('course_id', $courseId)
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'notices' => $notices,
            'course_id' => $courseId
        ]);
    }
}
