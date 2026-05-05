<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Models\SentMail;
use App\Models\MailApprovalTracker;
use App\Services\SendFileApprovalService;

class SendFileController extends Controller
{
    public function store(Request $request)
    {
        if ($request->has('category_id')) {
            $category = \App\Models\ApprovalCategory::with('sequences.user')->find($request->category_id);
            if ($category) {
                $request->merge(['approval_table_name' => $category->name]);
                if (!$request->has('approvers')) {
                    $approvers = $category->sequences->map(function($seq) {
                        return [
                            'name' => $seq->user->name ?? '',
                            'email' => $seq->user->email ?? '',
                            'order' => $seq->order_position ?? 1,
                        ];
                    })->toArray();
                    $request->merge(['approvers' => $approvers]);
                }
            }
        }

        $request->validate([
            'receiver'            => 'required|string',
            'subject'             => 'required|string',
            'cc'                  => 'nullable|string',
            'body'                => 'required|string',
            'approval_table_name' => 'required|string',
            'attachments'         => 'nullable|array',
            'attachments.*'       => 'file|max:10240',
            'approvers'           => 'required|array|min:1',
            'approvers.*.name'    => 'required|string',
            'approvers.*.email'   => 'required|email',
            'approvers.*.order'   => 'required|integer|min:1',
        ]);

        $storedPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $filename = uniqid() . '_' . preg_replace('/[^A-Za-z0-9.\-_]/', '_', $file->getClientOriginalName());
                $path = Storage::disk('local')->putFileAs('mail_attachments', $file, $filename);
                $storedPaths[] = $path;
            }
        }

        $sentMail = SentMail::create([
            'sender_id'            => auth()->id(),
            'type'                 => $request->input('type', 'send'),
            'receiver'             => $request->receiver,
            'cc'                   => $request->cc,
            'subject'              => $request->subject,
            'body'                 => $request->body,
            'attachments'          => $storedPaths,
            'overall_status'       => 'pending',
            'upload_status'        => $request->input('type') === 'request' ? 'awaiting' : 'none',
            'approval_table_name'  => $request->approval_table_name,
        ]);

        $code = app(SendFileApprovalService::class)
            ->submit($sentMail, $request->approvers);

        if ($code !== null) {
            foreach ($request->approvers as $approver) {
                MailApprovalTracker::create([
                    'mid'          => $sentMail->id,
                    'mail_id'      => $code,
                    'level'        => $approver['order'],
                    'name'         => $approver['name'],
                    'email'        => $approver['email'],
                    'status'       => 'pending',
                    'last_approved'=> null,
                ]);
            }

            // Mail will be sent by WebhookController or FileRequestController upon final approval

            return response()->json([
                'message' => 'Submitted successfully.',
                'id'      => $sentMail->id
            ], 201);
        }

        return response()->json([
            'message' => 'Mail saved but approval submission failed.'
        ], 500);
    }
}
