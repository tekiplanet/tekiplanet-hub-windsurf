<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Enrollment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 
        'course_id', 
        'status', 
        'progress', 
        'enrolled_at', 
        'completed_at',
        'payment_status'
    ];

    protected $dates = [
        'enrolled_at', 
        'completed_at'
    ];

    protected $casts = [
        'progress' => 'float',
        'payment_status' => 'string'
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function installments()
    {
        return $this->hasMany(Installment::class);
    }
}
