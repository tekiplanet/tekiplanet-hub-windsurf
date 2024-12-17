<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Quote extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid();
            }
        });
    }

    protected $fillable = [
        'id',
        'service_id',
        'user_id',
        'industry',
        'budget_range',
        'contact_method',
        'project_description',
        'project_deadline',
        'quote_fields',
        'status',
        'assigned_to',
        'priority',
        'submitted_ip',
        'estimated_value',
        'source',
        'referral_code'
    ];

    protected $casts = [
        'id' => 'string',
        'service_id' => 'string',
        'user_id' => 'string',
        'assigned_to' => 'string',
        'quote_fields' => 'array',
        'project_deadline' => 'date',
        'estimated_value' => 'decimal:2'
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
