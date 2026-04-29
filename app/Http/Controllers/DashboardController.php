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

        $sentFiles = FileRequest::where('sender_id', $user->id)->get();
        $sentTickets = TicketRequest::where('sender_id', $user->id)->get();
        $allSent = $sentFiles->concat($sentTickets);

        $sentStats = [
            'total' => $allSent->count(),
            'pending' => $allSent->where('status', 'pending')->count(),
            'approved' => $allSent->where('status', 'approved')->count(),
            'rejected' => $allSent->where('status', 'rejected')->count(),
        ];

        // Approval stats for specialists/HOD
        $pendingApprovalsCount = FileRequest::where('approver_id', $user->id)->where('status', 'pending')->count() +
                               TicketRequest::where('approver_id', $user->id)->where('status', 'pending')->count();

        $receivedTotal = FileRequest::where('receiver_id', $user->id)->count() + 
                         TicketRequest::where('receiver_id', $user->id)->count();

        $recentLogs = $allSent->sortByDesc('updated_at')->take(10)->values()->map(function ($item) {
            if ($item instanceof \App\Models\FileRequest && $item->status === 'approved' && $item->secure_token) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            }
            return $item;
        });
        // Manually load relations for recentLogs since it's an aggregated collection
        $recentLogs->load(['receiver:id,name']);

        return Inertia::render('EmployeeDashboard', [
            'sentStats' => $sentStats,
            'receivedTotal' => $receivedTotal,
            'pendingApprovalsCount' => $pendingApprovalsCount,
            'recentLogs' => $recentLogs
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
