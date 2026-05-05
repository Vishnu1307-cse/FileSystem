<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExternalFileLog extends Model
{
    protected $fillable = [
        'user_id',
        'sent_mail_id',
        'action',
        'ip_address',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sentMail(): BelongsTo
    {
        return $this->belongsTo(SentMail::class, 'sent_mail_id');
    }
}
