<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Course extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 
        'description', 
        'category', 
        'level', 
        'price', 
        'instructor', 
        'image_url', 
        'duration_hours', 
        'status'
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

    public function modules()
    {
        return $this->hasMany(CourseModule::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function exams()
    {
        return $this->hasMany(CourseExam::class);
    }

    public function notices()
    {
        return $this->hasMany(CourseNotice::class);
    }

    public function schedules()
    {
        return $this->hasMany(CourseSchedule::class);
    }
}
