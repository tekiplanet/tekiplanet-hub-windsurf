<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Http\Request;

class CustomThrottleRequests extends ThrottleRequests
{
    /**
     * Resolve the number of attempts and decay minutes for the given key.
     *
     * @param  Request  $request
     * @param  int|null  $maxAttempts
     * @return array
     */
    protected function resolveMaxAttempts(Request $request, $maxAttempts = null)
    {
        // Specifically for login route, allow more attempts
        if ($request->is('api/login')) {
            return [
                $this->maxAttempts = 10,  // 10 attempts
                $this->decayMinutes = 1   // per minute
            ];
        }

        // Default Laravel throttling
        return parent::resolveMaxAttempts($request, $maxAttempts);
    }
}
