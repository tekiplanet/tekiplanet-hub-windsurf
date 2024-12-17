<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function getCategoriesWithServices()
    {
        $categories = ServiceCategory::with(['services' => function ($query) {
            $query->select('id', 'category_id', 'name', 'short_description', 'icon_name');
        }])
        ->select('id', 'name', 'description', 'icon_name')
        ->get()
        ->map(function ($category) {
            return [
                'id' => $category->id,
                'title' => $category->name,
                'description' => $category->description,
                'icon' => $category->icon_name,
                'subServices' => $category->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->name,
                        'description' => $service->short_description,
                        'icon' => $service->icon_name
                    ];
                })->toArray()
            ];
        });

        return response()->json($categories);
    }
}
