<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use App\Models\TicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function employee(Request $request)
    {
        $user = $request->user();

        // 1. Calculate combined Outbound Stats (Legacy + New)
        $legacySent = \App\Models\FileRequest::where('sender_id', $user->id)->get()
            ->concat(\App\Models\TicketRequest::where('sender_id', $user->id)->get());
        
        $newSent = \App\Models\SentMail::where('sender_id', $user->id)->get();

        $stats = [
            'total'    => $legacySent->count() + $newSent->count(),
            'pending'  => $legacySent->where('status', 'pending')->count() + $newSent->where('overall_status', 'pending')->count(),
            'approved' => $legacySent->where('status', 'approved')->count() + $newSent->where('overall_status', 'approved')->count(),
            'rejected' => $legacySent->where('status', 'rejected')->count() + $newSent->where('overall_status', 'rejected')->count(),
        ];

        // 2. Combined Inbound Stats (Employees receiving from others)
        $receivedTotal = \App\Models\FileRequest::where('receiver_id', $user->id)->where('status', 'approved')->count() + 
                         \App\Models\TicketRequest::where('receiver_id', $user->id)->where('status', 'approved')->count() +
                         \App\Models\SentMail::where('receiver', $user->email)->where('overall_status', 'approved')->count();

        // 3. Pending Approvals (Action Required)
        $pendingApprovalsCount = \App\Models\FileRequest::where('approver_id', $user->id)->where('status', 'pending')->count() +
                                \App\Models\TicketRequest::where('approver_id', $user->id)->where('status', 'pending')->count() +
                                \App\Models\MailApprovalTracker::where('email', $user->email)->where('status', 'pending')->count();

        // 4. Recent Outbound Activity for the table
        $recentMails = \App\Models\SentMail::where('sender_id', $user->id)
            ->withCount([
                'externalLogs as view_count' => function ($query) {
                    $query->where('action', 'viewed');
                },
                'externalLogs as download_count' => function ($query) {
                    $query->where('action', 'downloaded');
                },
                'externalLogs as upload_count' => function ($query) {
                    $query->where('action', 'uploaded');
                }
            ])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('EmployeeDashboard', [
            'sentStats' => $stats,
            'receivedTotal' => $receivedTotal,
            'pendingApprovalsCount' => $pendingApprovalsCount,
            'recentLogs' => $recentMails
        ]);
    }

    public function external(Request $request)
    {
        $user = $request->user();

        // 1. Fetch Sent Items (Outbound)
        $sentFiles = FileRequest::where('sender_id', $user->id)->get();
        $sentTickets = TicketRequest::where('sender_id', $user->id)->get();
        $sentMails = \App\Models\SentMail::where('sender_id', $user->id)->get();
        
        $sentTotal = $sentFiles->count() + $sentTickets->count() + $sentMails->count();

        // 2. Fetch Received Items (Inbound) - Only Approved as per previous requirement
        $receivedFiles = FileRequest::where('receiver_id', $user->id)->where('status', 'approved')->get();
        $receivedTickets = TicketRequest::where('receiver_id', $user->id)->where('status', 'approved')->get();
        $receivedMails = \App\Models\SentMail::where('receiver', $user->email)
            ->where('overall_status', 'approved')
            ->get();
            
        $receivedTotal = $receivedFiles->count() + $receivedTickets->count() + $receivedMails->count();

        $mapItem = function ($item) use ($user) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;
            
            // Determine if the current user is the sender or receiver
            $isSender = false;
            if ($isMail) {
                $isSender = $item->sender_id === $user->id;
                $item->status = $item->overall_status;
                $item->is_mail = true;
                $item->is_ticket = false;
                
                // Action Type logic
                if (!$isSender) {
                    $item->action_type = ($item->type === 'request') ? 'Upload' : 'Download';
                } else {
                    $item->action_type = 'Sent';
                }
            } else {
                $isSender = $item->sender_id === $user->id;
                $item->is_mail = false;
                $item->is_ticket = $isTicket;
                if (!$isTicket && $item->status === 'approved' && $item->secure_token) {
                    $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
                }
                
                // Action Type logic
                if (!$isSender) {
                    $item->action_type = $isTicket ? 'Upload' : 'Download';
                } else {
                    $item->action_type = 'Sent';
                }
            }
            $item->is_outbound = $isSender;
            return $item;
        };

        // Combine for Recent Activity Log
        $allInbound = $receivedFiles->concat($receivedTickets)->concat($receivedMails);
        $allOutbound = $sentFiles->concat($sentTickets)->concat($sentMails);

        $recentLogs = $allInbound->concat($allOutbound)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->map($mapItem);

        // Load relationships conditionally to avoid errors on mixed collections
        $recentLogs->filter(fn($i) => $i instanceof \App\Models\SentMail)->loadMissing(['sender:id,name']);
        $recentLogs->filter(fn($i) => !($i instanceof \App\Models\SentMail))->loadMissing(['sender:id,name', 'receiver:id,name']);

        return Inertia::render('ExternalDashboard', [
            'stats' => [
                'sent_total' => $sentTotal,
                'received_total' => $receivedTotal,
            ],
            'recentLogs' => $recentLogs
        ]);
    }
}
