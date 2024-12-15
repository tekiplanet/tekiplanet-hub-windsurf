<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserPreferencesController extends Controller
{
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validatedData = $request->validate([
            'dark_mode' => 'boolean',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'marketing_notifications' => 'boolean',
        ]);

        foreach ($validatedData as $key => $value) {
            $user->$key = $value;
        }

        $user->save();

        return response()->json($user);
    }
}
