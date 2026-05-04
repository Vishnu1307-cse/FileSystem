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

        // Fetch SentMails
        $receivedMails = \App\Models\SentMail::with(['sender', 'trackers'])
            ->where('receiver', $user->email)
            ->orWhere('cc', 'LIKE', '%' . $user->email . '%')
            ->get();

        $sentMails = \App\Models\SentMail::with(['sender', 'trackers'])
            ->where('sender_id', $user->id)
            ->get();

        $mapItem = function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;

            if ($isMail) {
                $item->is_mail = true;
                $item->status = $item->overall_status;
                // Standardize receiver object for frontend table compatibility
                $item->receiver = (object) ['email' => $item->getRawOriginal('receiver'), 'name' => 'External'];
            } else {
                $item->is_mail = false;
                if (!$isTicket && $item->status === 'approved' && $item->secure_token) {
                    $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
                } elseif ($isTicket && $item->is_uploaded) {
                    $item->download_url = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $item->id]);
                }
            }
            return $item;
        };

        // Aggregate
        $received = $receivedFiles->concat($receivedTickets)->concat($receivedMails)->sortByDesc('created_at')->values()->map($mapItem);
        $sent = $sentFiles->concat($sentTickets)->concat($sentMails)->sortByDesc('created_at')->values()->map($mapItem);

        $teamSent = collect();
        $isHod = $user->role?->slug === 'hod';
        
        if ($isHod) {
            $teamFiles = FileRequest::with(['sender', 'receiver'])
                ->whereHas('sender', fn($q) => $q->where('hod_id', $user->id))
                ->get();
            $teamTickets = TicketRequest::with(['sender', 'receiver'])
                ->whereHas('sender', fn($q) => $q->where('hod_id', $user->id))
                ->get();
            $teamMails = \App\Models\SentMail::with(['sender', 'trackers'])
                ->whereHas('sender', fn($q) => $q->where('hod_id', $user->id))
                ->get();

            $teamSent = $teamFiles->concat($teamTickets)->concat($teamMails)->sortByDesc('created_at')->values()->map($mapItem);
        }

        return Inertia::render('Inbox/Index', [
            'received' => $received,
            'sent' => $sent,
            'teamSent' => $teamSent,
            'isHod' => $isHod
        ]);
    }
}
