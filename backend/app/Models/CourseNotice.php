<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseNotice extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'course_id', 
        'title', 
        'content', 
        'priority', 
        'is_important', 
        'published_at'
    ];

    protected $dates = [
        'published_at'
    ];

    protected $casts = [
        'is_important' => 'boolean'
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

    public function userNotices()
    {
        return $this->hasMany(UserCourseNotice::class);
    }
}
