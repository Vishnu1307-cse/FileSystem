<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SentMail;
use App\Models\ExternalFileLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExternalPortalController extends Controller
{
    /**
     * Show the inbox for the external user.
     */
    public function inbox(Request $request)
    {
        $userId = Session::get('external_user_id');
        $user   = User::findOrFail($userId);

        $mails = SentMail::where('receiver', $user->email)
                          ->where('overall_status', 'approved')
                          ->latest()
                          ->get();

        return Inertia::render('ExternalPortal/Inbox', [
            'user'  => $user,
            'mails' => $mails,
        ]);
    }

    /**
     * Show a specific mail and log the view action.
     */
    public function show(Request $request, $id)
    {
        $userId = Session::get('external_user_id');
        $user   = User::findOrFail($userId);
        $mail   = SentMail::findOrFail($id);

        if ($mail->receiver !== $user->email) {
            abort(403);
        }

        ExternalFileLog::create([
            'user_id'      => $userId,
            'sent_mail_id' => $mail->id,
            'action'       => 'viewed',
            'ip_address'   => $request->ip(),
        ]);

        return Inertia::render('ExternalPortal/Show', [
            'user' => $user,
            'mail' => $mail,
        ]);
    }

    /**
     * Generate and send an OTP for file download.
     */
    public function requestDownloadOtp(Request $request, $id)
    {
        $userId = Session::get('external_user_id');
        $user   = User::findOrFail($userId);
        $mail   = SentMail::findOrFail($id);

        if ($mail->receiver !== $user->email) {
            abort(403);
        }

        $otp = strval(random_int(100000, 999999));
        $mail->update([
            'download_otp'            => bcrypt($otp),
            'download_otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::raw(
            "Your file download OTP is: {$otp}\n\nThis expires in 10 minutes.",
            function ($message) use ($user, $mail) {
                $message->to($user->email)
                        ->subject('Download OTP: ' . $mail->subject);
            }
        );

        return response()->json(['message' => 'Download OTP sent to your email.'], 200);
    }

    /**
     * Verify OTP and download the attachment.
     */
    public function download(Request $request, $id)
    {
        $request->validate(['otp' => 'required|string']);

        $userId = Session::get('external_user_id');
        $user   = User::findOrFail($userId);
        $mail   = SentMail::findOrFail($id);

        if ($mail->receiver !== $user->email) {
            abort(403);
        }

        if (!$mail->download_otp_expires_at || $mail->download_otp_expires_at->isPast()) {
            return response()->json([
                'message' => 'OTP has expired. Please request a new one.'
            ], 422);
        }

        if (!Hash::check($request->otp, $mail->download_otp)) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        $mail->update([
            'download_otp'            => null,
            'download_otp_expires_at' => null,
        ]);

        ExternalFileLog::create([
            'user_id'      => $userId,
            'sent_mail_id' => $mail->id,
            'action'       => 'downloaded',
            'ip_address'   => $request->ip(),
        ]);

        $attachments = $mail->attachments ?? [];
        if (empty($attachments)) {
            return response()->json(['message' => 'No file attached.'], 404);
        }

        // Return the first attachment found in the array
        $path = $attachments[0];
        $filename = basename($path);
        $cleanName = preg_replace('/^[0-9a-f]{13}_/', '', $filename);
        
        return Storage::disk('local')->download($path, $cleanName);
    }

    /**
     * Handle file upload for request-type mails.
     */
    public function submitUpload(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB limit
        ]);

        $userId = Session::get('external_user_id');
        $user   = User::findOrFail($userId);
        $mail   = SentMail::findOrFail($id);

        if ($mail->receiver !== $user->email || $mail->type !== 'request') {
            abort(403);
        }

        if ($mail->upload_status === 'uploaded') {
            return response()->json(['message' => 'File already uploaded for this request.'], 422);
        }

        $file = $request->file('file');
        $filename = uniqid() . '_' . preg_replace('/[^A-Za-z0-9.\-_]/', '_', $file->getClientOriginalName());
        $path = Storage::disk('local')->putFileAs('mail_attachments', $file, $filename);

        // Update the mail record
        $mail->update([
            'attachments'   => array_merge($mail->attachments ?? [], [$path]),
            'upload_status' => 'uploaded',
        ]);

        // Log the upload action
        ExternalFileLog::create([
            'user_id'      => $userId,
            'sent_mail_id' => $mail->id,
            'action'       => 'uploaded',
            'ip_address'   => $request->ip(),
        ]);

        return response()->json(['message' => 'File uploaded successfully.'], 200);
    }
}
