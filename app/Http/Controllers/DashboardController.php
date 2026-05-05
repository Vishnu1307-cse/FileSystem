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
        $receivedTotal = \App\Models\FileRequest::where('receiver_id', $user->id)->count() + 
                         \App\Models\TicketRequest::where('receiver_id', $user->id)->count() +
                         \App\Models\SentMail::where('receiver', $user->email)->count();

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

        $receivedFiles = FileRequest::where('receiver_id', $user->id)->get();
        $receivedTickets = TicketRequest::where('receiver_id', $user->id)->get();

        $receivedStats = [
            'total' => $receivedFiles->count() + $receivedTickets->count(),
            'pending_upload' => $receivedTickets->where('status', 'approved')->where('is_uploaded', false)->count(),
            'downloadable' => $receivedFiles->where('status', 'approved')->count(),
        ];

        $recentLogs = $receivedFiles->concat($receivedTickets)->sortByDesc('updated_at')->take(10)->values()->map(function ($item) {
            if ($item instanceof \App\Models\FileRequest && $item->status === 'approved' && $item->secure_token) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            }
            return $item;
        });
        $recentLogs->load(['sender:id,name']);

        return Inertia::render('ExternalDashboard', [
            'receivedStats' => $receivedStats,
            'recentLogs' => $recentLogs
        ]);
    }
}
