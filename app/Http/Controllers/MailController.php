<?php

namespace App\Http\Controllers;

use App\Models\SentMail;
use App\Services\MailApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MailController extends Controller
{
    public function compose()
    {
        return \Inertia\Inertia::render('Mail/Compose', [
            'categories' => \App\Models\ApprovalCategory::with('sequences.user')->get()
        ]);
    }

    public function store(Request $request)
    {
        // Step 1: Validate the incoming request
        $request->validate([
            'receiver'           => 'required|string',
            'cc'                 => 'nullable|string',
            'subject'            => 'required|string',
            'body'               => 'required|string',
            'attachments'        => 'nullable|array',
            'attachments.*'      => 'file|max:10240',
            'category_id'        => 'required|exists:approval_categories,id',
        ]);

        $category = \App\Models\ApprovalCategory::with('sequences.user')->findOrFail($request->category_id);
        $approvers = $category->sequences->map(function($seq) {
            return [
                'name' => $seq->user->name,
                'email' => $seq->user->email,
                'order' => $seq->order_position,
            ];
        })->toArray();

        // Step 2: Handle file attachments
        $storedPaths = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $filename = uniqid() . '_' . preg_replace('/[^A-Za-z0-9.\-_]/', '_', $file->getClientOriginalName());
                $path = Storage::disk('local')->putFileAs('mail_attachments', $file, $filename);
                $storedPaths[] = $path;
            }
        }

        // Step 3: Save the mail record
        $sentMail = SentMail::create([
            'sender_id'      => auth()->id(),
            'receiver'       => $request->receiver,
            'cc'             => $request->cc,
            'subject'        => $request->subject,
            'body'           => $request->body,
            'attachments'    => $storedPaths,
            'overall_status' => 'pending',
        ]);

        // Step 4: Call the approval service
        $success = app(MailApprovalService::class)
                       ->sendForApproval($sentMail, $approvers);

        // Step 5: Return response
        if ($success) {
            return response()->json([
                'message' => 'Mail sent and submitted for approval.',
                'id'      => $sentMail->id,
            ], 201);
        }

        return response()->json([
            'message' => 'Mail was saved but could not be submitted for approval. Please contact your administrator.',
            'id'      => $sentMail->id,
        ], 500);
    }

    public function show($id)
    {
        $mail = SentMail::with(['sender', 'trackers'])->findOrFail($id);
        
        return \Inertia\Inertia::render('Mail/Show', [
            'mail' => $mail
        ]);
    }

    public function download($id, $index)
    {
        $mail = SentMail::findOrFail($id);

        if ($mail->isExpired()) {
            abort(403, 'Time expired');
        }

        $attachments = $mail->attachments ?? [];
        
        if (!isset($attachments[$index])) {
            abort(404);
        }

        $path = $attachments[$index];
        $filename = basename($path);
        $cleanName = preg_replace('/^[0-9a-f]{13}_/', '', $filename);

        return Storage::disk('local')->download($path, $cleanName);
    }
}
