<?php

namespace App\Http\Controllers;

use App\Models\SentMail;
use App\Models\MailApprovalTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\SentMailApprovedMail;

class WebhookController extends Controller
{
    public function mailApproval(Request $request)
    {
        try {
            // STEP 1: Verify API key (sent inside the request body)
            $apiKey  = $request->input('api_key');
            $setting = \App\Models\SiteSetting::first();

            if (!$setting || $apiKey !== $setting->api_key) {
                Log::warning('Webhook unauthorized attempt', [
                    'received_key' => $apiKey,
                    'body'         => $request->all(),
                ]);
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // STEP 2: Extract fields from actual callback payload
            $mailId       = $request->input('code');                    // ← 'code' not 'approval_code'
            $status       = strtoupper($request->input('status', '')); // normalize to uppercase
            $lastApprover = $request->input('last_approver');          // ← 'last_approver' not 'last_approved'
            $actingLevel  = $lastApprover['approver_order'] ?? null;

            // Find the tracker row first using the tracking code and the level
            $actingRow = MailApprovalTracker::where('mail_id', $mailId)
                                           ->where('level', $actingLevel)
                                           ->first();

            if (!$actingRow) {
                return response()->json(['message' => 'Tracker record not found'], 404);
            }

            // Now find the SentMail record using the 'mid' (Foreign Key) from the tracker
            $sentMail = SentMail::findOrFail($actingRow->mid);

            // STEP 3: Decision logic

            if ($status === 'REJECTED') {
                // One approver rejected — cascade rejection down the chain
                $actingRow->update([
                    'status'        => 'rejected',
                    'last_approved' => $lastApprover['acted_at'] ?? now(),
                ]);

                // Mark all lower level approvers as rejected too
                MailApprovalTracker::where('mail_id', $mailId)
                                  ->where('level', '>', $actingRow->level)
                                  ->update(['status' => 'rejected']);

                $sentMail->update(['overall_status' => 'rejected']);

            } elseif ($status === 'PENDING') {
                // One person approved, chain is still running
                $actingRow->update([
                    'status'        => 'approved',
                    'last_approved' => $lastApprover['acted_at'] ?? now(),
                ]);
                // Do NOT change overall_status — still waiting for remaining approvers

            } elseif ($status === 'APPROVED') {
                // All approvers have approved
                // Generate credentials
                $plainPassword = strtoupper(\Illuminate\Support\Str::random(6));
                $sentMail->update([
                    'overall_status' => 'approved',
                    'credential_password' => bcrypt($plainPassword)
                ]);

                MailApprovalTracker::where('mail_id', $mailId)
                                  ->where('status', 'pending')
                                  ->update([
                                      'status'        => 'approved',
                                      'last_approved' => now(),
                                  ]);

                // Send the actual mail to the receiver now that it is approved
                Mail::to($sentMail->receiver)->send(new SentMailApprovedMail($sentMail, $plainPassword));
            }

            return response()->json(['message' => 'Webhook processed successfully.'], 200);

        } catch (\Exception $e) {
            Log::error('Mail approval webhook exception', [
                'error'        => $e->getMessage(),
                'request_body' => $request->all(),
            ]);
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function sendFileApproval(Request $request)
    {
        try {
            // STEP 1: Verify API key
            $apiKey  = $request->input('api_key');
            $setting = \App\Models\SiteSetting::first();

            if (!$setting || $apiKey !== $setting->api_key) {
                Log::warning('Webhook unauthorized attempt for sendFileApproval', [
                    'received_key' => $apiKey,
                    'body'         => $request->all(),
                ]);
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // STEP 2: Extract values
            $code         = $request->input('code');
            $status       = strtoupper($request->input('status', ''));
            $lastApprover = $request->input('last_approver');
            $actingEmail  = $lastApprover['approver_email'] ?? null;
            $actingLevel  = $lastApprover['approver_order'] ?? null;
            $actedAt      = $lastApprover['acted_at'] ?? now();

            // STEP 3: Find matching row in mail_approval_trackers
            $row = MailApprovalTracker::where('mail_id', $code)
                                      ->where('level', $actingLevel)
                                      ->first();

            if ($row === null) {
                return response()->json(['message' => 'Record not found'], 404);
            }

            // STEP 4: Update based on status
            if ($status === 'REJECTED') {
                $row->update([
                    'status'        => 'rejected',
                    'last_approved' => $actedAt,
                ]);

                MailApprovalTracker::where('mail_id', $code)
                                   ->where('level', '>', $row->level)
                                   ->update(['status' => 'rejected']);

                SentMail::where('id', $row->mid)
                        ->update(['overall_status' => 'rejected']);

            } elseif ($status === 'PENDING') {
                $row->update([
                    'status'        => 'approved',
                    'last_approved' => $actedAt,
                ]);

            } elseif ($status === 'APPROVED') {
                $row->update([
                    'status'        => 'approved',
                    'last_approved' => $actedAt,
                ]);

                MailApprovalTracker::where('mail_id', $code)
                                   ->where('status', 'pending')
                                   ->update([
                                       'status'        => 'approved',
                                       'last_approved' => now(),
                                   ]);

                // Send the actual mail to the receiver now that it is approved
                $sentMail = SentMail::with('sender')->find($row->mid);
                if ($sentMail) {
                    $plainPassword = strtoupper(\Illuminate\Support\Str::random(6));
                    $sentMail->update([
                        'overall_status' => 'approved',
                        'credential_password' => bcrypt($plainPassword)
                    ]);
                    Mail::to($sentMail->receiver)->send(new SentMailApprovedMail($sentMail, $plainPassword));
                }
            }

            // STEP 5: Return response
            return response()->json(['message' => 'Processed.'], 200);

        } catch (\Exception $e) {
            Log::error('Send file approval webhook exception', [
                'error'        => $e->getMessage(),
                'request_body' => $request->all(),
            ]);
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}