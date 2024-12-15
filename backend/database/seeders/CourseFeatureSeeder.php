<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseFeature;
use Illuminate\Support\Facades\DB;

class CourseFeatureSeeder extends Seeder
{
    public function run()
    {
        // Clear existing course features
        DB::table('course_features')->delete();

        // Get all courses
        $courses = Course::all();

        // Define features for courses
        $courseFeatures = [
            'Hands-on Projects',
            'Expert-led Instruction',
            'Lifetime Access',
            'Certificate of Completion',
            'Practical Assignments',
            'Community Support',
            'Real-world Case Studies',
            'Interactive Quizzes',
            'Downloadable Resources',
            'Flexible Learning Pace'
        ];

        // Randomly assign features to courses
        foreach ($courses as $course) {
            // Randomly select 2-4 features for each course
            $selectedFeatures = collect($courseFeatures)
                ->shuffle()
                ->take(rand(2, 4));

            foreach ($selectedFeatures as $feature) {
                CourseFeature::create([
                    'course_id' => $course->id,
                    'feature' => $feature
                ]);
            }
        }
    }
}
