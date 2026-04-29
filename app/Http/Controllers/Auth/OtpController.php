<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OtpController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Auth/OtpLogin', [
            'email' => $request->query('email', '')
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!in_array($user->role, ['vendor', 'customer'])) {
            return back()->withErrors(['email' => 'Only vendors and customers can use OTP login.']);
        }

        $otp = (string) random_int(100000, 999999);

        // Invalidate previous OTPs
        OtpVerification::where('email', $user->email)->update(['is_used' => true]);

        OtpVerification::create([
            'email' => $user->email,
            'otp' => Hash::make($otp),
            'expires_at' => now()->addMinutes(5),
            'is_used' => false,
        ]);

        Mail::to($user->email)->send(new \App\Mail\OtpMail($otp));

        return back()->with('status', 'OTP sent to your email.');
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $otpRecord = OtpVerification::where('email', $request->email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord || !Hash::check($request->otp, $otpRecord->otp)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP.']);
        }

        $otpRecord->update(['is_used' => true]);
        
        $user = User::where('email', $request->email)->first();
        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('external.dashboard'));
    }
}
