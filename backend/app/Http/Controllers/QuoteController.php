<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuoteController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'industry' => 'required|string',
            'budget_range' => 'required|string',
            'contact_method' => 'required|string',
            'project_description' => 'required|string',
            'project_deadline' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $quote = Quote::create([
                'service_id' => $request->service_id,
                'user_id' => Auth::id(),
                'industry' => $request->industry,
                'budget_range' => $request->budget_range,
                'contact_method' => $request->contact_method,
                'project_description' => $request->project_description,
                'project_deadline' => $request->project_deadline,
                'quote_fields' => $request->quote_fields ?? null,
                'submitted_ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quote submitted successfully',
                'quote_id' => $quote->id
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $quotes = Quote::with(['service', 'user'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'quotes' => $quotes
        ]);
    }
}
