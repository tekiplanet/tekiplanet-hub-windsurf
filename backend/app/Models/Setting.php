<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Setting extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'site_name', 'site_description', 'site_logo', 'site_favicon',
        'default_currency', 'currency_symbol', 'multi_currency_enabled', 'supported_currencies',
        'default_language', 'supported_languages',
        'primary_color', 'secondary_color', 'default_theme',
        'support_email', 'support_phone', 'contact_address',
        'social_media_links',
        'registration_enabled', 'course_purchase_enabled', 'affiliate_program_enabled',
        'default_payment_gateway', 'enabled_payment_gateways', 'tax_rate',
        'two_factor_enabled', 'gdpr_compliance',
        'google_analytics_id', 'facebook_pixel_id',
        'maintenance_mode', 'maintenance_message',
        'enrollment_fee'
    ];

    protected $casts = [
        'multi_currency_enabled' => 'boolean',
        'supported_currencies' => 'array',
        'supported_languages' => 'array',
        'social_media_links' => 'array',
        'registration_enabled' => 'boolean',
        'course_purchase_enabled' => 'boolean',
        'affiliate_program_enabled' => 'boolean',
        'enabled_payment_gateways' => 'array',
        'two_factor_enabled' => 'boolean',
        'gdpr_compliance' => 'boolean',
        'maintenance_mode' => 'boolean',
        'tax_rate' => 'float'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    // Method to get a specific setting
    public static function getSetting($key, $default = null)
    {
        $setting = self::first();
        return $setting ? $setting->getAttribute($key) : $default;
    }

    // Method to update settings
    public static function updateSettings(array $data)
    {
        $setting = self::first() ?? new self();
        $setting->fill($data);
        $setting->save();
        return $setting;
    }
}
