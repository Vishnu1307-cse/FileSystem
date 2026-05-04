<?php

namespace App\Services;

use App\Models\SentMail;
use App\Models\SiteSetting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendFileApprovalService
{
    public function submit(SentMail $sentMail, array $approvers): ?string
    {
        try {
            $setting = SiteSetting::first();

            if ($setting === null || !$setting->is_external_api_enabled || empty($setting->api_url)) {
                return null;
            }

            $payload = [
                'title'         => $sentMail->subject,
                'description'   => Str::limit(strip_tags($sentMail->body), 300),
                'approval_type' => 'SEQUENTIAL',
                'id'            => $sentMail->id,
                'metadata'      => [
                    'sender'   => $sentMail->sender->name ?? 'Unknown',
                    'receiver' => $sentMail->receiver,
                    'cc'       => $sentMail->cc,
                    'body'     => $sentMail->body,
                    'subject'  => $sentMail->subject,
                ],
                'callback_url' => url('/api/webhooks/send-file-approval'),
                'approvers'    => $approvers,
            ];

            $response = Http::withHeaders(['X-API-KEY' => $setting->api_key])
                ->post($setting->api_url, $payload);

            if ($response->successful()) {
                return $response->json('code');
            }

            Log::error('SendFile API failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SendFileApprovalService exception: ' . $e->getMessage());
            return null;
        }
    }
}
