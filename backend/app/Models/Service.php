<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Service extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 
        'category', 
        'short_description', 
        'long_description', 
        'starting_price', 
        'icon_name', 
        'is_featured'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'starting_price' => 'decimal:2'
    ];

    public function quoteFields()
    {
        return $this->hasMany(ServiceQuoteField::class);
    }

    // Ensure UUID is used
    public function uniqueIds()
    {
        return ['id'];
    }
}
