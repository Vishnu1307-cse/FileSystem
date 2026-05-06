<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class ExternalAuthMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!\Illuminate\Support\Facades\Auth::check()) {
            return redirect('/external/login');
        }
        
        $user = \Illuminate\Support\Facades\Auth::user();
        
        // Verify the user is still a customer or vendor
        if (!$user->role || !in_array($user->role->slug, ['customer', 'vendor'])) {
            \Illuminate\Support\Facades\Auth::logout();
            return redirect('/external/login');
        }
        
        return $next($request);
    }
}
