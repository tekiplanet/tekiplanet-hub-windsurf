<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        // Log detailed request information for debugging
        Log::info('Login attempt', [
            'ip' => $request->ip(),
            'login_field' => $request->input('login'),
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        $loginField = $request->input('login');
        $password = $request->input('password');

        if (empty($loginField) || empty($password)) {
            Log::warning('Login failed: empty login or password', [
                'ip' => $request->ip(),
                'login_field' => $loginField,
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            return response()->json([
                'message' => 'Login and password are required'
            ], 400);
        }

        // Determine login type
        $loginType = filter_var($loginField, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // Attempt authentication without session
        $credentials = [
            $loginType => $loginField,
            'password' => $password
        ];

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Generate a token for the user
            $token = $user->createToken('login_token')->plainTextToken;

            Log::info('Login successful', [
                'ip' => $request->ip(),
                'login_field' => $loginField,
                'user_id' => $user->id,
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            return response()->json([
                'token' => $token,
                'user' => $user->makeVisible([
                    'wallet_balance', 'dark_mode', 'two_factor_enabled', 
                    'email_notifications', 'push_notifications', 
                    'marketing_notifications', 'created_at', 'updated_at',
                    'email_verified_at', 'timezone', 'bio', 'profile_visibility',
                    'last_login_at', 'last_login_ip'
                ])->toArray()
            ]);
        }

        Log::warning('Login failed: invalid credentials', [
            'ip' => $request->ip(),
            'login_field' => $loginField,
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        return response()->json([
            'message' => 'Invalid credentials'
        ], 422);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
