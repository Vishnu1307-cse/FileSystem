<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SentMail extends Model
{
    protected $fillable = [
        'type',
        'sender_id',
        'receiver',
        'cc',
        'subject',
        'body',
        'attachments',
        'overall_status',
        'upload_status',
        'approval_table_name',
        'download_otp',
        'download_otp_expires_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'download_otp_expires_at' => 'datetime',
    ];

    public function trackers(): HasMany
    {
        return $this->hasMany(MailApprovalTracker::class, 'mid');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function externalLogs(): HasMany
    {
        return $this->hasMany(ExternalFileLog::class, 'sent_mail_id');
    }
}
