<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServiceQuoteField extends Model
{
    use HasUuids;

    protected $fillable = [
        'service_id', 
        'name', 
        'label', 
        'type', 
        'required', 
        'order', 
        'validation_rules', 
        'options'
    ];

    protected $casts = [
        'required' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Ensure UUID is used
    public function uniqueIds()
    {
        return ['id'];
    }
}
