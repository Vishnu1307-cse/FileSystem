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
        $userId = Session::get('external_user_id');
        
        if ($userId === null) {
            return redirect('/external/login');
        }
        
        // Verify the user still exists and is still a customer or vendor
        $user = User::whereHas('role', function ($q) {
            $q->whereIn('slug', ['customer', 'vendor']);
        })->find($userId);
        
        if ($user === null) {
            Session::forget('external_user_id');
            return redirect('/external/login');
        }
        
        return $next($request);
    }
}
