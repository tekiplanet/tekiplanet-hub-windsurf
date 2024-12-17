<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServiceCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 
        'description', 
        'icon_name', 
        'is_featured'
    ];

    protected $casts = [
        'is_featured' => 'boolean'
    ];

    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    // Ensure UUID is used
    public function uniqueIds()
    {
        return ['id'];
    }
}
