<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailApprovalTracker extends Model
{
    protected $fillable = [
        'mid',
        'mail_id',
        'level',
        'name',
        'email',
        'status',
        'last_approved',
    ];

    protected $casts = [
        'last_approved' => 'datetime',
    ];

    public function sentMail(): BelongsTo
    {
        return $this->belongsTo(SentMail::class, 'mid');
    }
}
