<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseTopic extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'module_id', 
        'title', 
        'description', 
        'order', 
        'learning_outcomes'
    ];

    protected $casts = [
        'learning_outcomes' => 'array'
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

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function lessons()
    {
        return $this->hasMany(CourseLesson::class, 'module_id', 'module_id');
    }
}
