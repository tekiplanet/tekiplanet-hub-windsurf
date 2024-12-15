<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseSchedule extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'course_id', 
        'start_date', 
        'end_date', 
        'days_of_week', 
        'start_time', 
        'end_time', 
        'location'
    ];

    protected $dates = [
        'start_date', 
        'end_date'
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
