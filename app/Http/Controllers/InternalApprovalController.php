<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MailApprovalTracker;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InternalApprovalController extends Controller
{
    /**
     * Handle internal approval actions.
     */
    public function act(Request $request)
    {
        try {
            $request->validate([
                'mail_id' => 'required|string',
                'level'   => 'required|integer',
                'action'  => 'required|in:approve,reject,approved,rejected,pending,PENDING,APPROVE,REJECT,APPROVED,REJECTED',
            ]);

            // Normalize action to lowercase
            $action = strtolower($request->action);
            $action = str_replace('d', '', $action); 

            $tracker = MailApprovalTracker::where('mail_id', $request->mail_id)
                                         ->where('level', $request->level)
                                         ->first();

            if (!$tracker) {
                return response()->json(['message' => 'Tracker record not found.'], 404);
            }

            $tokenPayload = [
                'approval_code' => $tracker->mail_id,
                'order'         => $tracker->level,
                'email'         => $tracker->email,
                'exp'           => time() + (30 * 24 * 60 * 60),
            ];
            $encoded = base64_encode(json_encode($tokenPayload));

            $baseUrl = 'https://approvalengine.pricol.net';

            if (strtoupper($request->action) === 'APPROVE') {
                $targetUrl = "{$baseUrl}/approve/{$encoded}";
            } else {
                $targetUrl = "{$baseUrl}/reject/{$encoded}";
            }

            $response = Http::get($targetUrl);

            if ($response->successful()) {
                return response()->json([
                    'message' => 'Action submitted successfully.'
                ], 200);
            }

            if ($response->failed()) {
                Log::error('InternalApproval engine call failed', [
                    'url'    => $targetUrl,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return response()->json([
                    'message' => 'Failed to reach approval engine.'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Exception in InternalApprovalController@act', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Internal server error occurred.'
            ], 500);
        }
    }
}
