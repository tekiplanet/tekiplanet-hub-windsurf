<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function updatePreferences(Request $request)
    {
        // Log the incoming request details
        Log::info('Update preferences request', [
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        $user = Auth::user();

        if (!$user) {
            Log::warning('Unauthorized preferences update attempt');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // More flexible validation
        $validatedData = $request->validate([
            'dark_mode' => 'sometimes|boolean',
            'theme' => 'sometimes|in:light,dark',
            'email_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'marketing_notifications' => 'sometimes|boolean',
        ]);

        // Map theme to dark_mode if theme is provided
        if (isset($validatedData['theme'])) {
            $validatedData['dark_mode'] = $validatedData['theme'] === 'dark';
            unset($validatedData['theme']);
        }

        Log::info('Validated preferences data', [
            'user_id' => $user->id,
            'validated_data' => $validatedData
        ]);

        try {
            // Update only the provided preferences
            foreach ($validatedData as $key => $value) {
                $user->$key = $value;
            }

            $user->save();

            Log::info('User preferences updated successfully', [
                'user_id' => $user->id,
                'updated_preferences' => $validatedData
            ]);

            return response()->json([
                'message' => 'Preferences updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating preferences', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update preferences',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUserType(Request $request)
    {
        $user = $request->user();
        
        $validatedData = $request->validate([
            'account_type' => ['required', 'in:student,business,professional']
        ]);

        $user->account_type = $validatedData['account_type'];
        $user->save();

        return response()->json([
            'user' => $user,
            'message' => 'User type updated successfully'
        ]);
    }
}
