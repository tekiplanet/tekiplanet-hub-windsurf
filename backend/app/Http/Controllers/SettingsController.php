<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::first();
        return response()->json($settings ?? []);
    }

    public function update(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'site_name' => 'sometimes|string',
            'default_currency' => 'sometimes|string',
            'currency_symbol' => 'sometimes|string',
            // Add more validation rules as needed
        ]);

        $settings = Setting::updateSettings($validatedData);
        return response()->json($settings);
    }

    // Method to get a specific setting
    public function getSetting(string $key): JsonResponse
    {
        $value = Setting::getSetting($key);
        return response()->json([$key => $value]);
    }
}
