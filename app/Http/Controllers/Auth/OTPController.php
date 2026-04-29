<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\OTPMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OTPController extends Controller
{
    public function showPortalLogin()
    {
        return Inertia::render('Auth/PortalLogin', [
            'status' => session('status'),
        ]);
    }

    public function showRequest()
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'requiresOTP' => true
        ]);
    }

    public function sendOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Only for Customer and Vendor
        if (!in_array($user->role, ['customer', 'vendor'])) {
            return back()->withErrors(['email' => 'Standard login required for your role.']);
        }

        $otp = rand(100000, 999999);
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        Mail::to($user->email)->send(new OTPMail($otp));

        return back()->with('status', 'OTP has been sent to your email.');
    }

    public function verifyOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', now())
            ->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP.']);
        }

        // Clear OTP and login
        $user->update([
            'otp' => null,
            'otp_expires_at' => null
        ]);

        Auth::login($user);

        return redirect()->intended(route('external.dashboard', absolute: false));
    }
}
