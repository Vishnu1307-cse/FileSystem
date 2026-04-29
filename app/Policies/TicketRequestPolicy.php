<?php

namespace App\Policies;

use App\Models\TicketRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TicketRequestPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TicketRequest $ticketRequest): bool
    {
        \Illuminate\Support\Facades\Log::info('Ticket Policy Check', [
            'user_id' => $user->id,
            'receiver_id' => $ticketRequest->receiver_id,
            'match' => $user->id === $ticketRequest->receiver_id
        ]);

        return $user->role === 'admin' ||
               $user->id === $ticketRequest->sender_id ||
               $user->id === $ticketRequest->receiver_id ||
               $user->id === $ticketRequest->approver_id ||
               ($user->role?->slug === 'hod' && $ticketRequest->sender && $ticketRequest->sender->hod_id === $user->id);
    }

    /**
     * Determine whether the user can download/upload for the ticket.
     */
    public function download(User $user, TicketRequest $ticketRequest): bool
    {
        return $this->view($user, $ticketRequest);
    }
    
    public function upload(User $user, TicketRequest $ticketRequest): bool
    {
        // Only the receiver can upload to fulfill the ticket, and only if not already uploaded
        return $user->id === $ticketRequest->receiver_id && !$ticketRequest->is_uploaded;
    }
}
