<?php

namespace App\Services;

use App\Models\SentMail;
use App\Models\MailApprovalTracker;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class MailApprovalService
{
    public function sendForApproval(SentMail $sentMail, array $approvers): bool
    {
        try {
            // STEP 1 — Read settings
            $setting = \App\Models\SiteSetting::first();

            if (!$setting || !$setting->is_external_api_enabled || empty($setting->api_url)) {
                Log::warning('External API is not configured or disabled.', [
                    'setting_exists' => (bool) $setting,
                ]);
                return false;
            }

            // STEP 2 — Build the payload to send to the external API
            $payload = [
                'title'        => $sentMail->subject,
                'description'  => Str::limit(strip_tags($sentMail->body), 300),
                'approval_type' => 'SEQUENTIAL',
                'id'           => $sentMail->id,
                'metadata'     => [
                    'sender'   => $sentMail->sender->name ?? 'Unknown',
                    'receiver' => $sentMail->receiver,
                    'cc'       => $sentMail->cc,
                    'subject'  => $sentMail->subject,
                    'body'     => $sentMail->body,
                    // ⚠️ Do NOT include 'attachments' here.
                    // Files are stored locally only and must never be sent to the API.
                ],
                'callback_url' => url('/api/webhooks/internal-approval'),
                'approvers'    => array_map(function ($approver) {
                    return [
                        'name'  => $approver['name'],
                        'email' => $approver['email'],
                        'order' => $approver['order'],
                    ];
                }, $approvers),
            ];

            // STEP 3 — POST to external API
            $response = Http::withHeaders(['X-API-KEY' => $setting->api_key])
                            ->post($setting->api_url, $payload);

            // STEP 4 — Handle the response
            if ($response->successful()) {
                $resData = $response->json();
                
                // Extract the external unique ID using:
                $mailId = $resData['approval_code'] ?? $resData['code'] ?? null;
                
                if ($mailId === null) {
                    Log::error('External API returned no mail_id', ['response' => $resData]);
                    return false;
                }
                
                // Loop through $approvers and insert ONE row per approver into mail_approval_trackers
                foreach ($approvers as $approver) {
                    MailApprovalTracker::create([
                        'mid'          => $sentMail->id,   // OUR mail's ID
                        'mail_id'      => $mailId,         // External API's returned ID
                        'level'        => $approver['order'],
                        'name'         => $approver['name'],
                        'email'        => $approver['email'],
                        'status'       => 'pending',
                        'last_approved'=> null,
                    ]);
                }
                
                return true;
            }

            // If $response->failed():
            Log::error('External approval API failed', [
                'status'   => $response->status(),
                'body'     => $response->body(),
                'mail_id'  => $sentMail->id,
            ]);
            
            return false;

        } catch (Exception $e) {
            // STEP 5 — Error handling
            Log::error('MailApprovalService exception: ' . $e->getMessage());
            return false;
        }
    }
}
