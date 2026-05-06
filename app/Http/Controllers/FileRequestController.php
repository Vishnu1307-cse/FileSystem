<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use App\Models\TicketRequest;
use App\Models\ApprovalCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\ApproverActionRequiredMail;
use App\Mail\FileTransferApprovedMail;
use App\Mail\FileTransferRejectedMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class FileRequestController extends Controller
{
    public function create()
    {
        return Inertia::render('FileTransfers/Compose', [
            'categories' => ApprovalCategory::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:approval_categories,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'cc_ids' => 'nullable|array',
            'cc_ids.*' => 'exists:users,id',
            'message' => 'nullable|string',
            'file' => 'nullable|file|max:20480',
            'is_ticket' => 'required|boolean'
        ]);

        $category = ApprovalCategory::with('sequences')->findOrFail($request->category_id);
        $firstStep = $category->sequences()->where('order_position', 1)->first();

        if (!$firstStep) {
            return back()->with('error', 'The selected category has no approval sequence defined.');
        }

        $data = [
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'approver_id' => $firstStep->user_id,
            'category_id' => $request->category_id,
            'current_step' => 1,
            'subject' => $request->subject,
            'body' => $request->body,
            'cc_ids' => $request->cc_ids ?? [],
            'message' => $request->message,
            'status' => 'pending',
            'callback_url' => config('services.external.callback_url')
        ];

        if ($request->is_ticket) {
            $transfer = TicketRequest::create($data);
        } else {
            $path = $request->file('file')->store('transfers');
            $transfer = FileRequest::create(array_merge($data, ['file_path' => $path]));
        }

        // Notify first approver
        Mail::to($transfer->approver->email)->send(new ApproverActionRequiredMail($transfer));

        // External Callback Notification
        $this->notifyExternalService($transfer);

        return redirect()->route('employee.dashboard')->with('success', 'Transfer initiated successfully.');
    }

    private function notifyExternalService($transfer)
    {
        $setting = \App\Models\SiteSetting::first();
        if (!$setting || !$setting->is_external_api_enabled || empty($setting->api_url)) {
            return;
        }

        try {
            // Build approvers list from category sequences
            $approvers = $transfer->category->sequences->map(function($seq) {
                return [
                    'name' => $seq->user->name,
                    'email' => $seq->user->email,
                    'order' => $seq->order_position,
                ];
            })->toArray();

            $response = Http::withHeaders(['X-API-KEY' => $setting->api_key])
                ->timeout(5)
                ->post($setting->api_url, [
                    'title'        => $transfer->subject,
                    'description'  => Str::limit(strip_tags($transfer->body), 300),
                    'approval_type' => 'SEQUENTIAL',
                    'id'           => $transfer->id,
                    'metadata'     => [
                        'sender'   => $transfer->sender->name ?? 'Unknown',
                        'receiver' => $transfer->receiver->email ?? 'Unknown',
                        'subject'  => $transfer->subject,
                        'body'     => $transfer->body . "\n\nApproval Flow:\n" . implode("\n", array_map(function($a) {
                            return "Level {$a['order']}: {$a['name']} ({$a['email']})";
                        }, $approvers)),
                    ],
                    'callback_url' => url('/api/transfers/' . $transfer->id . '/status-update'),
                    'approvers'    => $approvers,
                ]);

            if (!$response->successful()) {
                \Log::error("External API notification failed: " . $response->body());
            }
        } catch (\Exception $e) {
            \Log::error("External API notification failed: " . $e->getMessage());
        }
    }

    public function approvalsIndex()
    {
        $user = Auth::user();
        
        // Legacy approvals
        $fileApprovals = FileRequest::with(['sender', 'receiver', 'category'])
            ->where('approver_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->map(function($item) {
                $item->source_type = 'legacy';
                return $item;
            });
        
        $ticketApprovals = TicketRequest::with(['sender', 'receiver', 'category'])
            ->where('approver_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->map(function($item) {
                $item->source_type = 'legacy';
                return $item;
            });

        // New SentMail approvals with sequential enforcement
        $mailApprovals = \App\Models\MailApprovalTracker::with(['sentMail.sender'])
            ->where('email', $user->email)
            ->where('status', 'pending')
            ->whereNotExists(function ($query) {
                $query->select(\Illuminate\Support\Facades\DB::raw(1))
                      ->from('mail_approval_trackers as prev')
                      ->whereColumn('prev.mid', 'mail_approval_trackers.mid')
                      ->whereColumn('prev.level', '<', 'mail_approval_trackers.level')
                      ->where('prev.status', 'pending');
            })
            ->get()
            ->map(function($tracker) {
                return [
                    'id' => $tracker->id,
                    'mid' => $tracker->mid,
                    'mail_id' => $tracker->mail_id, // The external tracking code
                    'source_type' => 'sent_mail',
                    'subject' => $tracker->sentMail->subject,
                    'sender' => $tracker->sentMail->sender,
                    'receiver_email' => $tracker->sentMail->receiver,
                    'current_step' => $tracker->level,
                    'category_name' => $tracker->sentMail->approval_table_name,
                    'type' => $tracker->sentMail->type,
                    'created_at' => $tracker->created_at,
                ];
            });

        return Inertia::render('FileTransfers/Approvals', [
            'approvals' => $fileApprovals->concat($ticketApprovals)->concat($mailApprovals)
        ]);
    }

    public function myApprovals()
    {
        $user = Auth::user();
        
        $myApprovals = \App\Models\MailApprovalTracker::with(['sentMail.sender'])
            ->where('email', $user->email)
            ->whereIn('status', ['approved', 'rejected'])
            ->orderByDesc('last_approved')
            ->get()
            ->map(function($tracker) {
                return [
                    'id' => $tracker->id,
                    'mail_id' => $tracker->sentMail->id,
                    'subject' => $tracker->sentMail->subject,
                    'sender' => $tracker->sentMail->sender,
                    'receiver_email' => $tracker->sentMail->receiver,
                    'my_action' => $tracker->status,
                    'acted_at' => $tracker->last_approved,
                    'overall_status' => $tracker->sentMail->overall_status,
                ];
            });

        return Inertia::render('FileTransfers/MyApprovals', [
            'approvals' => $myApprovals
        ]);
    }

    public function show($id)
    {
        $transfer = FileRequest::with(['sender', 'receiver', 'approver', 'approvalLogs.user', 'category.sequences.user'])->find($id) 
                 ?? TicketRequest::with(['sender', 'receiver', 'approver', 'approvalLogs.user', 'category.sequences.user'])->findOrFail($id);
        
        return Inertia::render('FileTransfers/Show', [
            'transfer' => $transfer
        ]);
    }

    public function approve($id)
    {
        $transfer = FileRequest::find($id) ?? TicketRequest::findOrFail($id);
        
        if ($transfer->approver_id !== Auth::id()) {
            abort(403);
        }

        $category = ApprovalCategory::with('sequences')->findOrFail($transfer->category_id);
        $nextStep = $category->sequences()->where('order_position', $transfer->current_step + 1)->first();

        \App\Models\RequestApprovalLog::create([
            'request_id' => $transfer->id,
            'request_type' => $transfer instanceof FileRequest ? 'file_request' : 'ticket_request',
            'user_id' => Auth::id(),
            'status' => 'approved',
            'step' => $transfer->current_step,
            'comment' => 'Approved'
        ]);

        if ($nextStep) {
            $transfer->update([
                'approver_id' => $nextStep->user_id,
                'current_step' => $transfer->current_step + 1
            ]);
            Mail::to($transfer->approver->email)->send(new ApproverActionRequiredMail($transfer));
        } else {
            $transfer->update([
                'status' => 'approved',
                'secure_token' => Str::random(32)
            ]);
            Mail::to($transfer->sender->email)->send(new FileTransferApprovedMail($transfer));
            Mail::to($transfer->receiver->email)->send(new FileTransferApprovedMail($transfer));
        }

        return back()->with('success', $nextStep ? 'Approved and moved to next stage.' : 'Transfer fully approved.');
    }

    public function reject(Request $request, $id)
    {
        $transfer = FileRequest::find($id) ?? TicketRequest::findOrFail($id);
        
        if ($transfer->approver_id !== Auth::id()) {
            abort(403);
        }

        \App\Models\RequestApprovalLog::create([
            'request_id' => $transfer->id,
            'request_type' => $transfer instanceof FileRequest ? 'file_request' : 'ticket_request',
            'user_id' => Auth::id(),
            'status' => 'rejected',
            'step' => $transfer->current_step,
            'comment' => $request->reason
        ]);

        $transfer->update(['status' => 'rejected']);
        Mail::to($transfer->sender->email)->send(new FileTransferRejectedMail($transfer));

        return back()->with('success', 'Transfer rejected.');
    }

    private function saveMailData(Request $request, $tracker)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'cc' => 'nullable|string',
            'body' => 'required|string',
            'removed_attachments' => 'nullable|array',
            'new_files.*' => 'nullable|file',
        ]);

        $sentMail = \App\Models\SentMail::findOrFail($tracker->mid);
        $currentAttachments = $sentMail->attachments ?? [];
        $removedAttachments = $request->removed_attachments ?? [];
        $newFiles = $request->file('new_files') ?? [];

        // Check the constraint: at least 1 file must remain
        $remainingCount = count($currentAttachments) - count($removedAttachments) + count($newFiles);
        if ($remainingCount < 1) {
            abort(422, 'You must leave at least one file attached to this request.');
        }

        // Process removals
        $finalAttachments = [];
        foreach ($currentAttachments as $attachment) {
            if (in_array($attachment, $removedAttachments)) {
                // Delete physical file
                \Illuminate\Support\Facades\Storage::disk('local')->delete($attachment);
            } else {
                $finalAttachments[] = $attachment;
            }
        }

        // Process new files
        foreach ($newFiles as $file) {
            $filename = uniqid() . '_' . preg_replace('/[^A-Za-z0-9.\-_]/', '_', $file->getClientOriginalName());
            $path = \Illuminate\Support\Facades\Storage::disk('local')->putFileAs('mail_attachments', $file, $filename);
            $finalAttachments[] = $path;
        }

        $sentMail->update([
            'subject' => $request->subject,
            'cc' => $request->cc,
            'body' => $request->body,
            'attachments' => $finalAttachments,
        ]);

        return $sentMail;
    }

    public function approveMail(Request $request, $id)
    {
        $tracker = \App\Models\MailApprovalTracker::findOrFail($id);
        if ($tracker->email !== Auth::user()->email) {
            abort(403);
        }

        // Save any edits made on the review screen before approving
        if ($request->has('subject')) {
            $this->saveMailData($request, $tracker);
        }

        $tracker->update([
            'status' => 'approved',
            'last_approved' => now()
        ]);

        // Check if there are other pending approvers for this mail
        $pendingCount = \App\Models\MailApprovalTracker::where('mid', $tracker->mid)
            ->where('status', 'pending')
            ->count();

        if ($pendingCount === 0) {
            $sentMail = \App\Models\SentMail::with('sender')->findOrFail($tracker->mid);
            
            // Generate credentials
            $plainPassword = strtoupper(\Illuminate\Support\Str::random(6));
            $sentMail->update([
                'overall_status' => 'approved',
                'credential_password' => bcrypt($plainPassword)
            ]);
            
            // Send the actual mail to the receiver
            Mail::to($sentMail->receiver)->send(new \App\Mail\SentMailApprovedMail($sentMail, $plainPassword));
            
            return redirect()->route('transfers.approvals')->with('success', 'Mail fully approved and sent to recipient.');
        }

        return redirect()->route('transfers.approvals')->with('success', 'Approval recorded. Waiting for other approvers.');
    }

    public function rejectMail(Request $request, $id)
    {
        $tracker = \App\Models\MailApprovalTracker::findOrFail($id);
        if ($tracker->email !== Auth::user()->email) {
            abort(403);
        }

        // Optionally save edits even on rejection
        if ($request->has('subject')) {
            try {
                $this->saveMailData($request, $tracker);
            } catch (\Exception $e) {
                // Ignore validation errors on reject
            }
        }

        $tracker->update([
            'status' => 'rejected',
            'last_approved' => now()
        ]);

        // Cascade rejection to the main mail record
        $sentMail = \App\Models\SentMail::findOrFail($tracker->mid);
        $sentMail->update(['overall_status' => 'rejected']);

        // Mark all other levels for this mail as rejected too
        \App\Models\MailApprovalTracker::where('mid', $tracker->mid)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        return redirect()->route('transfers.approvals')->with('success', 'Mail request rejected.');
    }

    public function editMail($id)
    {
        $tracker = \App\Models\MailApprovalTracker::with('sentMail.sender')->findOrFail($id);
        
        if ($tracker->email !== Auth::user()->email || $tracker->status !== 'pending') {
            abort(403, 'You do not have permission to edit this approval.');
        }

        // Make sure it's actually their turn (enforce sequential locally too)
        $previousPending = \App\Models\MailApprovalTracker::where('mid', $tracker->mid)
            ->where('level', '<', $tracker->level)
            ->where('status', 'pending')
            ->exists();

        if ($previousPending) {
            abort(403, 'Waiting on previous approvers.');
        }

        return Inertia::render('FileTransfers/MailEdit', [
            'tracker' => $tracker,
            'sentMail' => $tracker->sentMail
        ]);
    }

    public function updateMail(Request $request, $id)
    {
        $tracker = \App\Models\MailApprovalTracker::findOrFail($id);
        
        if ($tracker->email !== Auth::user()->email || $tracker->status !== 'pending') {
            abort(403);
        }

        $this->saveMailData($request, $tracker);

        return back()->with('success', 'Mail contents and attachments updated successfully.');
    }

    public function download($id)
    {
        $transfer = FileRequest::findOrFail($id);
        
        // Add download log
        \App\Models\FileLog::create([
            'file_request_id' => $transfer->id,
            'user_id' => Auth::id(),
            'action' => 'download',
            'ip_address' => request()->ip()
        ]);

        return Storage::download($transfer->file_path);
    }

    public function getReceivers(Request $request)
    {
        $request->validate([
            'type' => 'nullable|string',
            'q' => 'nullable|string'
        ]);

        $type = $request->query('type');
        $search = $request->query('q');
        $query = User::query();

        if ($type) {
            $query->whereHas('role', fn($q) => $q->where('slug', $type));
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return response()->json($query->select('id', 'name', 'email')->get());
    }

    public function getInternalUsers(Request $request)
    {
        $search = $request->query('q');
        $query = User::whereHas('role', fn($q) => $q->whereIn('slug', ['employee', 'hod']));

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return response()->json($query->select('id', 'name', 'email')->get());
    }

    public function updateStatus(Request $request, $id)
    {
        $fileRequest = FileRequest::find($id);
        $ticketRequest = TicketRequest::find($id);

        if ($request->status === 'approved') {
            return $this->approve($id);
        } elseif ($request->status === 'rejected') {
            return $this->reject($request, $id);
        }

        return response()->json(['message' => 'Status updated']);
    }

    public function signedApprove($id)
    {
        return $this->approve($id);
    }

    public function signedReject($id)
    {
        return $this->reject(new Request(['reason' => 'Rejected via email link']), $id);
    }

    public function signedDownload($id)
    {
        return $this->download($id);
    }
}
