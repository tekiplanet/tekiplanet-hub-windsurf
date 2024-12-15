<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseFeature;
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
        $course = Course::findOrFail($id);
        return response()->json($course);
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
}
