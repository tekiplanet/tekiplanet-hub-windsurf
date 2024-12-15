<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseLesson extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'module_id', 
        'title', 
        'description', 
        'content_type', 
        'duration_minutes', 
        'order', 
        'resource_url', 
        'is_preview'
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
}
