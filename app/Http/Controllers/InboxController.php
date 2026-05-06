<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use App\Models\TicketRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function inbox(Request $request)
    {
        $user = $request->user();

        // Fetch Received File Requests
        $receivedFiles = FileRequest::with(['sender', 'approver'])
            ->where('receiver_id', $user->id)
            ->where('status', 'approved')
            ->get();
            
        // Fetch Received Ticket Requests
        $receivedTickets = TicketRequest::with(['sender', 'approver'])
            ->where('receiver_id', $user->id)
            ->where('status', 'approved')
            ->get();

        // Fetch Received SentMails
        $receivedMails = \App\Models\SentMail::with(['sender', 'trackers'])
            ->where(function($q) use ($user) {
                $q->where('receiver', $user->email)
                  ->orWhere('cc', 'LIKE', '%' . $user->email . '%');
            })
            ->where('overall_status', 'approved')
            ->get();

        $mapItem = function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;

            if ($isMail) {
                $item->is_mail = true;
                $item->status = $item->overall_status;
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

        $received = $receivedFiles->concat($receivedTickets)->concat($receivedMails)->sortByDesc('created_at')->values()->map($mapItem);

        if (in_array($user->role?->slug, ['vendor', 'customer'])) {
            return Inertia::render('ExternalPortal/Inbox', [
                'received' => $received,
            ]);
        }

        return Inertia::render('Inbox/Inbox', [
            'received' => $received,
        ]);
    }

    public function sent(Request $request)
    {
        $user = $request->user();

        // Fetch Sent File Requests
        $sentFiles = FileRequest::with(['receiver', 'approver'])
            ->where('sender_id', $user->id)
            ->get();

        // Fetch Sent Ticket Requests
        $user = Auth::user();
        $mapItem = function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;

            if ($isMail) {
                $item->is_mail = true;
                $item->is_ticket = false;
                $item->status = $item->overall_status;
            } else {
                $item->is_mail = false;
                $item->is_ticket = $isTicket;
            }
            return $item;
        };

        // My Sent Items
        $sentFiles = FileRequest::with(['sender', 'receiver'])->where('sender_id', $user->id)->get();
        $sentTickets = TicketRequest::with(['sender', 'receiver'])->where('sender_id', $user->id)->get();
        $sentMails = \App\Models\SentMail::with(['sender', 'trackers'])->where('sender_id', $user->id)->get();

        $sent = $sentFiles->concat($sentTickets)->concat($sentMails)->sortByDesc('created_at')->values()->map($mapItem);

        if (in_array($user->role?->slug, ['vendor', 'customer'])) {
            return Inertia::render('ExternalPortal/Sent', [
                'sent' => $sent,
            ]);
        }

        return Inertia::render('Inbox/Sent', [
            'sent' => $sent,
        ]);
    }

    public function teamSent(Request $request)
    {
        $user = Auth::user();
        $mapItem = function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;

            if ($isMail) {
                $item->is_mail = true;
                $item->is_ticket = false;
                $item->status = $item->overall_status;
            } else {
                $item->is_mail = false;
                $item->is_ticket = $isTicket;
            }
            return $item;
        };

        $isAdmin = $user->role?->slug === 'admin';
        $isHr = $user->role?->slug === 'hr';
        $isHod = $user->role?->slug === 'hod';
        
        $query = function($model) use ($user, $isAdmin, $isHr, $isHod) {
            $q = $model::with(['sender', 'receiver']);
            if (!$isAdmin && ($isHr || $isHod)) {
                // For HOD/HR, show items from employees reporting to them
                $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->id));
            } elseif (!$isAdmin) {
                // Regular employees might see items from their own HOD's group if requested?
                // The user said: "if i enable it to an emploeyee, it shows all the transaction that are done under an hod under who that employee is"
                $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->hod_id));
            }
            return $q->get();
        };

        $teamFiles = $query(FileRequest::class);
        $teamTickets = $query(TicketRequest::class);
        $teamMails = \App\Models\SentMail::with(['sender', 'trackers'])
            ->when(!$isAdmin && ($isHr || $isHod), function($q) use ($user) {
                $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->id));
            })
            ->when(!$isAdmin && !$isHr && !$isHod, function($q) use ($user) {
                $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->hod_id));
            })
            ->get();

        // Customer Responses (replies to team mails)
        $teamResponses = \App\Models\SentMail::with(['sender', 'parent.sender'])
            ->whereNotNull('reply_to_id')
            ->whereHas('parent', function($q) use ($user, $isAdmin, $isHr, $isHod) {
                if (!$isAdmin && ($isHr || $isHod)) {
                    $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->id));
                } elseif (!$isAdmin) {
                    $q->whereHas('sender', fn($sub) => $sub->where('hod_id', $user->hod_id));
                }
            })
            ->get()
            ->map(function($item) use ($mapItem) {
                $item = $mapItem($item);
                $item->is_response = true;
                $item->parent_subject = $item->parent?->subject;
                return $item;
            });

        $teamSent = $teamFiles->concat($teamTickets)->concat($teamMails)->map($mapItem)
            ->concat($teamResponses)
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('Inbox/TeamSent', [
            'teamSent' => $teamSent,
        ]);
    }

    public function responses(Request $request)
    {
        $user = $request->user();
        
        // Mails sent by external users (role 4: vendor, 5: customer)
        $query = \App\Models\SentMail::with(['sender', 'parent'])
            ->whereHas('sender', function($q) {
                $q->whereIn('role_id', [4, 5]);
            })
            ->where('overall_status', 'approved')
            ->latest();

        // If not admin, only show responses meant for this user
        if ($user->role?->slug !== 'admin') {
            $query->where('receiver', $user->email);
        }

        return \Inertia\Inertia::render('Inbox/Responses', [
            'responses' => $query->get()
        ]);
    }
}
