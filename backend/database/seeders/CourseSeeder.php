<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Instructor;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // First, ensure we have some instructors
        $existingInstructors = Instructor::all();
        
        // Prepare instructor data
        $instructorData = [
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john.smith@example.com',
                'bio' => 'Web Development Expert',
                'expertise' => 'Web Development'
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Chen',
                'email' => 'emily.chen@example.com',
                'bio' => 'Data Science Specialist',
                'expertise' => 'Data Science'
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'email' => 'michael.johnson@example.com',
                'bio' => 'Digital Marketing Professional',
                'expertise' => 'Digital Marketing'
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'email' => 'sarah.williams@example.com',
                'bio' => 'Mobile App Development Expert',
                'expertise' => 'Mobile Development'
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Lee',
                'email' => 'david.lee@example.com',
                'bio' => 'UX/UI Design Specialist',
                'expertise' => 'Design'
            ],
            [
                'first_name' => 'Alex',
                'last_name' => 'Rodriguez',
                'email' => 'alex.rodriguez@example.com',
                'bio' => 'Cybersecurity Expert',
                'expertise' => 'Cybersecurity'
            ],
            [
                'first_name' => 'Rachel',
                'last_name' => 'Kim',
                'email' => 'rachel.kim@example.com',
                'bio' => 'Machine Learning Specialist',
                'expertise' => 'Artificial Intelligence'
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'Mendez',
                'email' => 'carlos.mendez@example.com',
                'bio' => 'Blockchain and Cryptocurrency Specialist',
                'expertise' => 'Blockchain'
            ]
        ];

        // Create instructors if not enough exist
        $instructors = $existingInstructors;
        if ($existingInstructors->count() < 8) {
            // Determine how many more instructors we need to create
            $instructorsToCreate = array_slice($instructorData, $existingInstructors->count());
            
            $newInstructors = collect($instructorsToCreate)->map(function($data) {
                return Instructor::create($data);
            });
            
            // Merge existing and new instructors
            $instructors = $existingInstructors->merge($newInstructors);
        }

        // Ensure we have exactly 8 instructors
        if ($instructors->count() !== 8) {
            throw new \Exception('Failed to create 8 instructors. Current count: ' . $instructors->count());
        }

        $courses = [
            [
                'title' => 'Web Development Masterclass',
                'description' => 'Comprehensive course covering full-stack web development from beginner to advanced level.',
                'category' => 'Programming',
                'level' => 'Intermediate',
                'price' => 199000.99,
                'instructor_id' => $instructors->get(0)->id,
                'image_url' => 'https://plus.unsplash.com/premium_photo-1714618942735-5f1585da8b88?q=80&w=1954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 40,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic HTML and CSS knowledge',
                    'Understanding of JavaScript fundamentals',
                    'Familiarity with basic programming concepts'
                ]),
                'learning_outcomes' => json_encode([
                    'Build responsive web applications',
                    'Understand modern web development frameworks',
                    'Create full-stack web solutions',
                    'Implement best practices in web development'
                ])
            ],
            [
                'title' => 'Data Science with Python',
                'description' => 'Learn data science from scratch using Python, covering machine learning, data analysis, and visualization.',
                'category' => 'Data Science',
                'level' => 'Advanced',
                'price' => 249000.99,
                'instructor_id' => $instructors->get(1)->id,
                'image_url' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 60,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic Python programming',
                    'Understanding of statistics',
                    'Basic linear algebra'
                ]),
                'learning_outcomes' => json_encode([
                    'Develop machine learning models',
                    'Understand data analysis techniques',
                    'Apply Python to data science problems'
                ])
            ],
            [
                'title' => 'Digital Marketing Fundamentals',
                'description' => 'Comprehensive guide to digital marketing strategies, SEO, social media marketing, and content creation.',
                'category' => 'Marketing',
                'level' => 'Beginner',
                'price' => 149000.99,
                'instructor_id' => $instructors->get(2)->id,
                'image_url' => 'https://images.unsplash.com/photo-1542903660-eedba2cda473?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 30,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic understanding of digital platforms',
                    'Interest in marketing',
                    'Basic computer literacy'
                ]),
                'learning_outcomes' => json_encode([
                    'Understand digital marketing strategies',
                    'Learn SEO techniques',
                    'Create effective social media campaigns'
                ])
            ],
            [
                'title' => 'Mobile App Development with React Native',
                'description' => 'Learn to build cross-platform mobile applications using React Native and modern development practices.',
                'category' => 'Mobile Development',
                'level' => 'Intermediate',
                'price' => 219000.99,
                'instructor_id' => $instructors->get(3)->id,
                'image_url' => 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 45,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'JavaScript fundamentals',
                    'Basic React knowledge',
                    'Understanding of mobile development concepts'
                ]),
                'learning_outcomes' => json_encode([
                    'Build cross-platform mobile apps',
                    'Understand React Native ecosystem',
                    'Deploy mobile applications'
                ])
            ],
            [
                'title' => 'UX/UI Design Fundamentals',
                'description' => 'Learn the principles of user experience and user interface design.',
                'category' => 'Design',
                'level' => 'Intermediate',
                'price' => 179000.99,
                'instructor_id' => $instructors->get(4)->id,
                'image_url' => 'https://plus.unsplash.com/premium_photo-1682124651258-410b25fa9dc0?q=80&w=1921&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 35,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic design principles',
                    'Familiarity with design tools',
                    'Creative thinking'
                ]),
                'learning_outcomes' => json_encode([
                    'Create user-centered design solutions',
                    'Understand UX/UI design principles',
                    'Design intuitive interfaces'
                ])
            ],
            [
                'title' => 'Cybersecurity Essentials',
                'description' => 'Comprehensive guide to understanding and implementing cybersecurity measures.',
                'category' => 'Cybersecurity',
                'level' => 'Advanced',
                'price' => 299000.99,
                'instructor_id' => $instructors->get(5)->id,
                'image_url' => 'https://img.freepik.com/free-photo/top-view-nutritional-counter-app-concept_23-2149880602.jpg?t=st=1734284746~exp=1734288346~hmac=fe1891b86bbf29f57249f8ac937a946c90784041c7793e9aab42e196ac8552d4&w=900',
                'duration_hours' => 50,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic networking knowledge',
                    'Understanding of computer systems',
                    'Basic programming skills'
                ]),
                'learning_outcomes' => json_encode([
                    'Implement cybersecurity best practices',
                    'Understand threat detection',
                    'Develop secure system architectures'
                ])
            ],
            [
                'title' => 'Machine Learning Fundamentals',
                'description' => 'Introduction to machine learning and artificial intelligence concepts.',
                'category' => 'Artificial Intelligence',
                'level' => 'Intermediate',
                'price' => 229000.99,
                'instructor_id' => $instructors->get(6)->id,
                'image_url' => 'https://img.freepik.com/free-photo/hackers-uploading-cracks-torrents_482257-85704.jpg?t=st=1734286273~exp=1734289873~hmac=796dd1401c5e7c8704bb0c459ca7e57c847fa211a98047d6d106db02a145e963&w=1060',
                'duration_hours' => 55,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic Python programming',
                    'Understanding of statistics',
                    'Basic linear algebra'
                ]),
                'learning_outcomes' => json_encode([
                    'Develop machine learning models',
                    'Understand AI algorithms',
                    'Apply ML techniques to real-world problems'
                ])
            ],
            [
                'title' => 'Blockchain and Cryptocurrency Basics',
                'description' => 'Comprehensive introduction to blockchain technology and cryptocurrencies.',
                'category' => 'Blockchain',
                'level' => 'Beginner',
                'price' => 169000.99,
                'instructor_id' => $instructors->get(7)->id,
                'image_url' => 'https://img.freepik.com/free-photo/businesswoman-reading-report-giving-presentation-business-meeting-holding-clipboard-close-up-african-american-employee-showing-analytics-research-charts-statistics-digital-board_482257-60540.jpg?t=st=1734284797~exp=1734288397~hmac=a036ee6d57f3ac1c5e41cb6a05ac28ace05d9ab834833f1eed86fd09bfa98503&w=1060',
                'duration_hours' => 25,
                'status' => 'active',
                'rating' => 4.5,
                'total_reviews' => 120,
                'total_students' => 500,
                'prerequisites' => json_encode([
                    'Basic understanding of digital currencies',
                    'Interest in financial technologies',
                    'Basic computer literacy'
                ]),
                'learning_outcomes' => json_encode([
                    'Understand blockchain technology',
                    'Learn about cryptocurrency fundamentals',
                    'Explore decentralized finance concepts'
                ])
            ]
        ];

        // Log the number of instructors before creating courses
        \Log::info('Number of instructors: ' . $instructors->count());

        // Validate instructors before creating courses
        foreach ($courses as $courseData) {
            $instructor = $instructors->firstWhere('id', $courseData['instructor_id']);
            
            if (!$instructor) {
                \Log::error('No instructor found for course: ' . $courseData['title']);
                throw new \Exception('No instructor found for course: ' . $courseData['title']);
            }
        }

        // Create courses
        foreach ($courses as $courseData) {
            try {
                Course::create($courseData);
            } catch (\Exception $e) {
                \Log::error('Error creating course: ' . $courseData['title'] . ' - ' . $e->getMessage());
                throw new \Exception('Error creating course: ' . $courseData['title']);
            }
        }
    }
}
