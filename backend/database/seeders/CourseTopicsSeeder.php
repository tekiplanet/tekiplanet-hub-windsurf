<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseTopic;
use App\Models\CourseModule;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class CourseTopicsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $modules = CourseModule::all();

        $topicTemplates = [
            'Web Development' => [
                'HTML5 and CSS3', 
                'JavaScript Fundamentals', 
                'React.js', 
                'Node.js', 
                'Full-stack Development'
            ],
            'Data Science' => [
                'Python Programming', 
                'Statistical Analysis', 
                'Machine Learning Algorithms', 
                'Data Visualization', 
                'Big Data Technologies'
            ],
            'Digital Marketing' => [
                'SEO Strategies', 
                'Social Media Marketing', 
                'Content Marketing', 
                'Email Marketing', 
                'Analytics and Reporting'
            ],
            'Mobile Development' => [
                'React Native Basics', 
                'Mobile UI/UX Design', 
                'State Management', 
                'Native APIs', 
                'Performance Optimization'
            ],
            'UX/UI Design' => [
                'Design Principles', 
                'User Research', 
                'Wireframing', 
                'Prototyping', 
                'Design Systems'
            ],
            'Cybersecurity' => [
                'Network Security', 
                'Ethical Hacking', 
                'Cryptography', 
                'Threat Detection', 
                'Security Protocols'
            ],
            'Machine Learning' => [
                'Neural Networks', 
                'Deep Learning', 
                'Natural Language Processing', 
                'Computer Vision', 
                'Reinforcement Learning'
            ],
            'Blockchain' => [
                'Cryptocurrency Basics', 
                'Smart Contracts', 
                'Decentralized Applications', 
                'Blockchain Architecture', 
                'Token Economics'
            ]
        ];

        foreach ($modules as $module) {
            $course = $module->course;
            $courseTopics = $topicTemplates[$course->category] ?? 
                array_merge(...array_values($topicTemplates));

            // Randomly select 3-5 topics for each module
            $selectedTopics = $faker->randomElements($courseTopics, $faker->numberBetween(3, 5));

            foreach ($selectedTopics as $index => $topicName) {
                CourseTopic::create([
                    'module_id' => $module->id,
                    'title' => $topicName,
                    'description' => $faker->sentence(6),
                    'order' => $index + 1,
                    'learning_outcomes' => json_encode([
                        $faker->sentence(6),
                        $faker->sentence(6),
                        $faker->sentence(6)
                    ])
                ]);
            }
        }
    }
}
