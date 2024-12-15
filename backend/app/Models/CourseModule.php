<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseModule extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'course_id', 
        'title', 
        'description', 
        'order', 
        'duration_hours'
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

    public function topics()
    {
        return $this->hasMany(CourseTopic::class, 'module_id');
    }
}
