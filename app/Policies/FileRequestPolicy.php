<?php

namespace App\Policies;

use App\Models\FileRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FileRequestPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, FileRequest $fileRequest): bool
    {
        \Illuminate\Support\Facades\Log::info('Policy Check', [
            'user_id' => $user->id,
            'receiver_id' => $fileRequest->receiver_id,
            'match' => $user->id === $fileRequest->receiver_id
        ]);

        return $user->role === 'admin' ||
               $user->id === $fileRequest->sender_id ||
               $user->id === $fileRequest->receiver_id ||
               $user->id === $fileRequest->approver_id ||
               ($user->role?->slug === 'hod' && $fileRequest->sender && $fileRequest->sender->hod_id === $user->id);
    }

    /**
     * Determine whether the user can download the file.
     */
    public function download(User $user, FileRequest $fileRequest): bool
    {
        // Same rules as viewing
        return $this->view($user, $fileRequest);
    }
}
