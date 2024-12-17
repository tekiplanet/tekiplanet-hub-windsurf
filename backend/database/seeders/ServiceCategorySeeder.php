<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;

class ServiceCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Software Engineering',
                'description' => 'Custom software development solutions',
                'icon_name' => 'Code',
                'is_featured' => true
            ],
            [
                'name' => 'Cyber Security',
                'description' => 'Comprehensive security services',
                'icon_name' => 'Shield',
                'is_featured' => true
            ],
            [
                'name' => 'IT Consulting',
                'description' => 'Strategic technology guidance',
                'icon_name' => 'Briefcase',
                'is_featured' => false
            ]
        ];

        foreach ($categories as $categoryData) {
            ServiceCategory::create($categoryData);
        }
    }
}
