<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserCourseNotice extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 
        'course_notice_id', 
        'is_read', 
        'read_at',
        'is_hidden'
    ];

    protected $dates = [
        'read_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_hidden' => 'boolean'
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

    public function courseNotice()
    {
        return $this->belongsTo(CourseNotice::class);
    }
}
