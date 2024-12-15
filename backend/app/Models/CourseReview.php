<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CourseReview extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'course_id',
        'user_id',
        'rating',
        'comment',
        'is_verified'
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });

        // Update course rating and total reviews when a review is created
        static::created(function ($review) {
            $course = Course::find($review->course_id);
            if ($course) {
                // Recalculate average rating
                $averageRating = self::where('course_id', $review->course_id)->avg('rating');
                $totalReviews = self::where('course_id', $review->course_id)->count();

                $course->update([
                    'rating' => round($averageRating, 2),
                    'total_reviews' => $totalReviews
                ]);
            }
        });
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
