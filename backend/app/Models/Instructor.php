<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Instructor extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'first_name', 
        'last_name', 
        'email', 
        'bio', 
        'avatar', 
        'expertise', 
        'total_courses', 
        'total_students', 
        'rating'
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

    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
