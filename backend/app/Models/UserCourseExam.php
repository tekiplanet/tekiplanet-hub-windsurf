<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class UserCourseExam extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id', 
        'course_exam_id',
        'status', 
        'score', 
        'total_score',
        'attempts',
        'started_at', 
        'completed_at',
        'answers',
        'review_notes'
    ];

    protected $casts = [
        'id' => 'string',
        'user_id' => 'string',
        'course_exam_id' => 'string',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'answers' => 'array',
        'review_notes' => 'array',
        'score' => 'float',
        'total_score' => 'float'
    ];

    protected static function boot()
    {
        parent::boot();
        
        // Auto-generate UUID
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function courseExam()
    {
        return $this->belongsTo(CourseExam::class, 'course_exam_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    // Utility methods
    public function markAsStarted()
    {
        $this->status = 'in_progress';
        $this->started_at = now();
        $this->attempts++;
        $this->save();
    }

    public function markAsCompleted($score, $totalScore)
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->score = $score;
        $this->total_score = $totalScore;
        $this->save();
    }

    public function markAsMissed()
    {
        $this->status = 'missed';
        $this->save();
    }
}
