<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MailApprovalTracker;
use App\Models\SentMail;
use Illuminate\Support\Facades\Log;

class InternalApprovalWebhookController extends Controller
{
    /**
     * Handle callbacks from the external approval engine.
     */
    public function handle(Request $request)
    {
        try {
            $apiKey  = $request->input('api_key');
            $setting = \App\Models\SiteSetting::first();
            if (!$setting || $apiKey !== $setting->api_key) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $code         = $request->input('code');
            $status       = strtoupper($request->input('status', ''));
            $lastApprover = $request->input('last_approver');
            $actingLevel  = $lastApprover['approver_order'] ?? null;
            $actedAt      = $lastApprover['acted_at'] ?? now();

            $row = MailApprovalTracker::where('mail_id', $code)
                                      ->where('level', $actingLevel)
                                      ->first();

            if (!$row) {
                return response()->json(['message' => 'Tracker record not found.'], 404);
            }

            $sentMail = SentMail::find($row->mid);

            if (!$sentMail) {
                return response()->json(['message' => 'SentMail record not found.'], 404);
            }

            if ($status === 'REJECTED') {
                $row->update([
                    'status'        => 'rejected',
                    'last_approved' => $actedAt,
                ]);
                MailApprovalTracker::where('mail_id', $code)
                    ->where('level', '>', $row->level)
                    ->update(['status' => 'rejected']);
                $sentMail->update(['overall_status' => 'rejected']);
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
                $sentMail->update(['overall_status' => 'approved']);
            }

            return response()->json(['message' => 'Processed.'], 200);

        } catch (\Exception $e) {
            Log::error('Exception in InternalApprovalWebhookController@handle', [
                'error'   => $e->getMessage(),
                'request' => $request->all(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
