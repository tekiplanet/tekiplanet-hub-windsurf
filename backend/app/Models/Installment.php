<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Installment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'enrollment_id', 
        'user_id', 
        'amount', 
        'due_date', 
        'status', 
        'paid_at'
    ];

    protected $dates = [
        'due_date', 
        'paid_at'
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

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
