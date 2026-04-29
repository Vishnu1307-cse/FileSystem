<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use App\Models\TicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Fetch File Requests
        $receivedFiles = FileRequest::with(['sender', 'approver'])
            ->where('receiver_id', $user->id)
            ->get();
            
        $sentFiles = FileRequest::with(['receiver', 'approver'])
            ->where('sender_id', $user->id)
            ->get();

        // Fetch Ticket Requests
        $receivedTickets = TicketRequest::with(['sender', 'approver'])
            ->where('receiver_id', $user->id)
            ->get();

        $sentTickets = TicketRequest::with(['receiver', 'approver'])
            ->where('sender_id', $user->id)
            ->get();

        // Aggregate
        $received = $receivedFiles->concat($receivedTickets)->sortByDesc('created_at')->values()->map(function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            if (!$isTicket && $item->status === 'approved' && $item->secure_token) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            } elseif ($isTicket && $item->is_uploaded) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            }
            return $item;
        });

        $sent = $sentFiles->concat($sentTickets)->sortByDesc('created_at')->values()->map(function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            if (!$isTicket && $item->status === 'approved' && $item->secure_token) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            } elseif ($isTicket && $item->is_uploaded) {
                $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
            }
            return $item;
        });

        $teamSent = collect();
        $isHod = $user->role?->slug === 'hod';
        
        if ($isHod) {
            $teamFiles = FileRequest::with(['sender', 'receiver'])
                ->whereHas('sender', fn($q) => $q->where('hod_id', $user->id))
                ->get();
            $teamTickets = TicketRequest::with(['sender', 'receiver'])
                ->whereHas('sender', fn($q) => $q->where('hod_id', $user->id))
                ->get();
            $teamSent = $teamFiles->concat($teamTickets)->sortByDesc('created_at')->values()->map(function ($item) {
                $isTicket = $item instanceof \App\Models\TicketRequest;
                if (!$isTicket && $item->status === 'approved' && $item->secure_token) {
                    $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
                } elseif ($isTicket && $item->is_uploaded) {
                    $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
                }
                return $item;
            });
        }

        return Inertia::render('Inbox/Index', [
            'received' => $received,
            'sent' => $sent,
            'teamSent' => $teamSent,
            'isHod' => $isHod
        ]);
    }
}
