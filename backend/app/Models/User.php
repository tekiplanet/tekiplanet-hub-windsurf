<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'bio',
        'timezone',
        'avatar',
        'dark_mode',
        'two_factor_enabled',
        'email_notifications',
        'push_notifications',
        'marketing_notifications',
        'profile_visibility',
        'account_type',
        'wallet_balance'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'dark_mode' => false,
        'two_factor_enabled' => false,
        'email_notifications' => true,
        'push_notifications' => true,
        'marketing_notifications' => true,
        'profile_visibility' => 'public',
    ];

    /**
     * Validation rules for account type
     */
    public static $accountTypeOptions = ['student', 'business', 'professional'];
}
