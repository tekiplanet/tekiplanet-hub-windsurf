<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Web Development Masterclass',
                'description' => 'Comprehensive course covering full-stack web development from beginner to advanced level.',
                'category' => 'Programming',
                'level' => 'Intermediate',
                'price' => 199.99,
                'instructor' => 'John Smith',
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
                'price' => 249.99,
                'instructor' => 'Emily Chen',
                'image_url' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 60,
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
                'title' => 'Digital Marketing Fundamentals',
                'description' => 'Comprehensive guide to digital marketing strategies, SEO, social media marketing, and content creation.',
                'category' => 'Marketing',
                'level' => 'Beginner',
                'price' => 149.99,
                'instructor' => 'Michael Johnson',
                'image_url' => 'https://images.unsplash.com/photo-1542903660-eedba2cda473?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 30,
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
                'title' => 'Mobile App Development with React Native',
                'description' => 'Learn to build cross-platform mobile applications using React Native and modern development practices.',
                'category' => 'Mobile Development',
                'level' => 'Intermediate',
                'price' => 219.99,
                'instructor' => 'Sarah Williams',
                'image_url' => 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 45,
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
                'title' => 'UX/UI Design Principles',
                'description' => 'Master user experience and user interface design principles for creating intuitive digital products.',
                'category' => 'Design',
                'level' => 'Intermediate',
                'price' => 179.99,
                'instructor' => 'David Lee',
                'image_url' => 'https://plus.unsplash.com/premium_photo-1682124651258-410b25fa9dc0?q=80&w=1921&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'duration_hours' => 35,
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
                'title' => 'Cybersecurity Essentials',
                'description' => 'Comprehensive course covering network security, ethical hacking, and cybersecurity best practices.',
                'category' => 'Cybersecurity',
                'level' => 'Advanced',
                'price' => 299.99,
                'instructor' => 'Alex Rodriguez',
                'image_url' => 'https://img.freepik.com/free-photo/top-view-nutritional-counter-app-concept_23-2149880602.jpg?t=st=1734284746~exp=1734288346~hmac=fe1891b86bbf29f57249f8ac937a946c90784041c7793e9aab42e196ac8552d4&w=900',
                'duration_hours' => 50,
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
                'title' => 'Machine Learning Fundamentals',
                'description' => 'Introduction to machine learning algorithms, neural networks, and practical applications.',
                'category' => 'Artificial Intelligence',
                'level' => 'Intermediate',
                'price' => 229.99,
                'instructor' => 'Rachel Kim',
                'image_url' => 'https://img.freepik.com/free-photo/hackers-uploading-cracks-torrents_482257-85704.jpg?t=st=1734286273~exp=1734289873~hmac=796dd1401c5e7c8704bb0c459ca7e57c847fa211a98047d6d106db02a145e963&w=1060',
                'duration_hours' => 55,
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
                'title' => 'Blockchain and Cryptocurrency Basics',
                'description' => 'Comprehensive guide to blockchain technology, cryptocurrencies, and decentralized finance.',
                'category' => 'Blockchain',
                'level' => 'Beginner',
                'price' => 169.99,
                'instructor' => 'Carlos Mendez',
                'image_url' => 'https://img.freepik.com/free-photo/businesswoman-reading-report-giving-presentation-business-meeting-holding-clipboard-close-up-african-american-employee-showing-analytics-research-charts-statistics-digital-board_482257-60540.jpg?t=st=1734284797~exp=1734288397~hmac=a036ee6d57f3ac1c5e41cb6a05ac28ace05d9ab834833f1eed86fd09bfa98503&w=1060',
                'duration_hours' => 25,
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
            ]
        ];

        foreach ($courses as $courseData) {
            Course::create($courseData);
        }
    }
}
