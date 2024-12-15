<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
            // Validate account type
            'type' => [
                'required', 
                Rule::in(User::$accountTypeOptions)
            ],
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // Save account type
            'account_type' => $request->type,
            'first_name' => $request->first_name ?? null,
            'last_name' => $request->last_name ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required'
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginField, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke all existing tokens for this user
        $user->tokens()->delete();

        // Create a new token
        $token = $user->createToken('login_token')->plainTextToken;

        // Return full user data including wallet_balance
        return response()->json([
            'user' => array_merge(
                $user->makeVisible(['wallet_balance', 'dark_mode', 'two_factor_enabled', 'email_notifications', 'push_notifications', 'marketing_notifications'])->toArray(),
                [
                    'preferences' => [
                        'dark_mode' => $user->dark_mode ?? false,
                        'theme' => $user->dark_mode ? 'dark' : 'light'
                    ]
                ]
            ),
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        // Fetch the user from the database to ensure fresh data
        $user = User::findOrFail($request->user()->id);
        
        Log::info('User data being returned', [
            'id' => $user->id,
            'wallet_balance' => $user->wallet_balance,
            'attributes' => $user->getAttributes()
        ]);

        // Add cache-control headers to prevent caching
        return response()->json(
            $user->makeVisible([
                'wallet_balance', 'dark_mode', 'two_factor_enabled', 
                'email_notifications', 'push_notifications', 
                'marketing_notifications', 'created_at', 'updated_at',
                'email_verified_at', 'timezone', 'bio', 'profile_visibility',
                'last_login_at', 'last_login_ip'
            ])->toArray()
        )->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
          ->header('Pragma', 'no-cache')
          ->header('Expires', '0');
    }
}
