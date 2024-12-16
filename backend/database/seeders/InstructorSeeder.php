<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Instructor;
use App\Models\Course;

class InstructorSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        DB::table('instructors')->delete();
        DB::table('courses')->update(['instructor_id' => null]);

        // Create instructors
        $instructors = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'bio' => 'Experienced software engineer with 10+ years in web development.',
                'avatar' => 'https://example.com/avatars/john-doe.jpg',
                'expertise' => 'Web Development, JavaScript, React',
                'total_courses' => 5,
                'total_students' => 1000,
                'rating' => 4.8
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'bio' => 'Data science expert with a passion for machine learning.',
                'avatar' => 'https://example.com/avatars/jane-smith.jpg',
                'expertise' => 'Data Science, Python, Machine Learning',
                'total_courses' => 3,
                'total_students' => 750,
                'rating' => 4.9
            ]
        ];

        foreach ($instructors as $instructorData) {
            $instructor = Instructor::create([
                'id' => Str::uuid()->toString(),
                'first_name' => $instructorData['first_name'],
                'last_name' => $instructorData['last_name'],
                'email' => $instructorData['email'],
                'bio' => $instructorData['bio'],
                'avatar' => $instructorData['avatar'],
                'expertise' => $instructorData['expertise'],
                'total_courses' => $instructorData['total_courses'],
                'total_students' => $instructorData['total_students'],
                'rating' => $instructorData['rating']
            ]);

            // Update some existing courses to use this instructor
            $courses = Course::inRandomOrder()->limit(2)->get();
            foreach ($courses as $course) {
                $course->update(['instructor_id' => $instructor->id]);
            }
        }
    }
}
