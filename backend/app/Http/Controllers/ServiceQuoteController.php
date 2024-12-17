<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceQuoteField;
use Illuminate\Http\Request;

class ServiceQuoteController extends Controller
{
    public function getServiceDetails($serviceId)
    {
        $service = Service::with(['category', 'quoteFields'])
            ->findOrFail($serviceId);

        return response()->json([
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'short_description' => $service->short_description,
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name
                ]
            ],
            'quote_fields' => $service->quoteFields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'name' => $field->name,
                    'label' => $field->label,
                    'type' => $field->type,
                    'required' => $field->required,
                    'options' => is_string($field->options) ? json_decode($field->options, true) : ($field->options ?? null)
                ];
            })
        ]);
    }
}
