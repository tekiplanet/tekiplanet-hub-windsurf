<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseExam extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 
        'course_id', 
        'title', 
        'description', 
        'total_questions', 
        'pass_percentage', 
        'duration_minutes', 
        'type', 
        'difficulty', 
        'is_mandatory',
        
        // New columns
        'date',
        'duration',
        'status',
        'topics',
        'score',
        'total_score'
    ];

    protected $dates = [
        'date'
    ];

    protected $casts = [
        'id' => 'string',
        'course_id' => 'string',
        'date' => 'date',
        'is_mandatory' => 'boolean',
        'topics' => 'array',
        'score' => 'float',
        'total_score' => 'float'
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

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function userExams()
    {
        return $this->hasMany(UserCourseExam::class, 'course_exam_id');
    }

    // Optional: Add a method to get exam status
    public function getStatusAttribute($value)
    {
        $now = now();
        
        if ($this->date) {
            if ($this->date > $now) {
                return 'upcoming';
            } elseif ($this->date->addHours(2) > $now) {
                return 'ongoing';
            } elseif ($this->score !== null) {
                return 'completed';
            } else {
                return 'missed';
            }
        }

        return $value;
    }
}
