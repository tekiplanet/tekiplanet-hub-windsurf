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
                'image_url' => 'https://example.com/web-dev-course.jpg',
                'duration_hours' => 40,
                'status' => 'active'
            ],
            [
                'title' => 'Data Science with Python',
                'description' => 'Learn data science from scratch using Python, covering machine learning, data analysis, and visualization.',
                'category' => 'Data Science',
                'level' => 'Advanced',
                'price' => 249.99,
                'instructor' => 'Emily Chen',
                'image_url' => 'https://example.com/data-science-course.jpg',
                'duration_hours' => 60,
                'status' => 'active'
            ],
            [
                'title' => 'Digital Marketing Fundamentals',
                'description' => 'Comprehensive guide to digital marketing strategies, SEO, social media marketing, and content creation.',
                'category' => 'Marketing',
                'level' => 'Beginner',
                'price' => 149.99,
                'instructor' => 'Michael Johnson',
                'image_url' => 'https://example.com/digital-marketing-course.jpg',
                'duration_hours' => 30,
                'status' => 'active'
            ],
            [
                'title' => 'Mobile App Development with React Native',
                'description' => 'Learn to build cross-platform mobile applications using React Native and modern development practices.',
                'category' => 'Mobile Development',
                'level' => 'Intermediate',
                'price' => 219.99,
                'instructor' => 'Sarah Williams',
                'image_url' => 'https://example.com/react-native-course.jpg',
                'duration_hours' => 45,
                'status' => 'active'
            ],
            [
                'title' => 'UX/UI Design Principles',
                'description' => 'Master user experience and user interface design principles for creating intuitive digital products.',
                'category' => 'Design',
                'level' => 'Intermediate',
                'price' => 179.99,
                'instructor' => 'David Lee',
                'image_url' => 'https://example.com/ux-ui-course.jpg',
                'duration_hours' => 35,
                'status' => 'active'
            ],
            [
                'title' => 'Cybersecurity Essentials',
                'description' => 'Comprehensive course covering network security, ethical hacking, and cybersecurity best practices.',
                'category' => 'Cybersecurity',
                'level' => 'Advanced',
                'price' => 299.99,
                'instructor' => 'Alex Rodriguez',
                'image_url' => 'https://example.com/cybersecurity-course.jpg',
                'duration_hours' => 50,
                'status' => 'active'
            ],
            [
                'title' => 'Machine Learning Fundamentals',
                'description' => 'Introduction to machine learning algorithms, neural networks, and practical applications.',
                'category' => 'Artificial Intelligence',
                'level' => 'Intermediate',
                'price' => 229.99,
                'instructor' => 'Rachel Kim',
                'image_url' => 'https://example.com/ml-course.jpg',
                'duration_hours' => 55,
                'status' => 'active'
            ],
            [
                'title' => 'Blockchain and Cryptocurrency Basics',
                'description' => 'Comprehensive guide to blockchain technology, cryptocurrencies, and decentralized finance.',
                'category' => 'Blockchain',
                'level' => 'Beginner',
                'price' => 169.99,
                'instructor' => 'Carlos Mendez',
                'image_url' => 'https://example.com/blockchain-course.jpg',
                'duration_hours' => 25,
                'status' => 'active'
            ]
        ];

        foreach ($courses as $courseData) {
            Course::create($courseData);
        }
    }
}
