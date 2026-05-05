<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ExternalAuthController extends Controller
{
    /**
     * Send a 6-digit OTP to the external user's email.
     */
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            $user = User::whereHas('role', function ($q) {
                $q->whereIn('slug', ['customer', 'vendor']);
            })->where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'No external account found with this email.'
                ], 404);
            }

            $otp = strval(random_int(100000, 999999));

            $user->update([
                'otp_code'       => bcrypt($otp),
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            Mail::raw(
                "Your one-time login code is: {$otp}\n\nThis code expires in 10 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Your Portal Login Code');
                }
            );

            return response()->json([
                'message' => 'OTP sent to your email address.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('OTP send error: ' . $e->getMessage(), [
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to send OTP. Please try again later.'
            ], 500);
        }
    }

    /**
     * Verify the 6-digit OTP provided by the external user.
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string',
        ]);

        $user = User::whereHas('role', function ($q) {
            $q->whereIn('slug', ['customer', 'vendor']);
        })->where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No external account found with this email.'
            ], 404);
        }

        if ($user->otp_expires_at === null || $user->otp_expires_at->isPast()) {
            return response()->json([
                'message' => 'OTP has expired. Please request a new one.'
            ], 422);
        }

        if (!Hash::check($request->otp, $user->otp_code)) {
            return response()->json([
                'message' => 'Invalid OTP. Please try again.'
            ], 422);
        }

        $user->update([
            'otp_code'       => null,
            'otp_expires_at' => null
        ]);

        Session::put('external_user_id', $user->id);

        return response()->json(['message' => 'Login successful.'], 200);
    }

    /**
     * Clear the external session and log out.
     */
    public function logout(Request $request)
    {
        Session::forget('external_user_id');
        return redirect('/external/login');
    }
}
