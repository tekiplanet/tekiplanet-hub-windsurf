<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        $softwareEngineeringCategory = ServiceCategory::where('name', 'Software Engineering')->first();
        $cyberSecurityCategory = ServiceCategory::where('name', 'Cyber Security')->first();

        $services = [
            [
                'category_id' => $softwareEngineeringCategory->id,
                'name' => 'Web Development',
                'short_description' => 'Custom web solutions for your business',
                'long_description' => 'We create responsive, scalable web applications tailored to your business needs.',
                'starting_price' => 500000,
                'icon_name' => 'Code', 
                'is_featured' => true
            ],
            [
                'category_id' => $softwareEngineeringCategory->id,
                'name' => 'Mobile App Development',
                'short_description' => 'Native and cross-platform mobile apps',
                'long_description' => 'Develop cutting-edge mobile applications for iOS and Android.',
                'starting_price' => 750000,
                'icon_name' => 'Smartphone', 
                'is_featured' => true
            ],
            [
                'category_id' => $softwareEngineeringCategory->id,
                'name' => 'UI/UX Design',
                'short_description' => 'User-centered design services',
                'long_description' => 'Create intuitive and beautiful user interfaces that enhance user experience.',
                'starting_price' => 250000,
                'icon_name' => 'Palette', 
                'is_featured' => false
            ],
            [
                'category_id' => $cyberSecurityCategory->id,
                'name' => 'Penetration Testing',
                'short_description' => 'Comprehensive security vulnerability assessment',
                'long_description' => 'Identify and exploit potential security weaknesses in your IT infrastructure before malicious actors can.',
                'starting_price' => 350000,
                'icon_name' => 'Shield', 
                'is_featured' => true
            ],
            [
                'category_id' => $cyberSecurityCategory->id,
                'name' => 'Security Audit',
                'short_description' => 'Thorough security infrastructure review',
                'long_description' => 'Comprehensive evaluation of your organization\'s security policies, procedures, and technical controls.',
                'starting_price' => 450000,
                'icon_name' => 'Search', 
                'is_featured' => true
            ],
            [
                'category_id' => $cyberSecurityCategory->id,
                'name' => 'Incident Response',
                'short_description' => 'Rapid cybersecurity threat mitigation',
                'long_description' => 'Expert team to quickly detect, respond to, and mitigate cybersecurity incidents and breaches.',
                'starting_price' => 600000,
                'icon_name' => 'AlertTriangle', 
                'is_featured' => false
            ]
        ];

        foreach ($services as $serviceData) {
            Service::create($serviceData);
        }
    }
}
