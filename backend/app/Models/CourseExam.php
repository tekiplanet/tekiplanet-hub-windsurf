<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseExam extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'course_id', 
        'title', 
        'type', 
        'date', 
        'duration', 
        'status', 
        'topics'
    ];

    protected $dates = [
        'date'
    ];

    protected $casts = [
        'topics' => 'array'
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
        return $this->belongsTo(Course::class);
    }
}
