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
        'credential_password',
        'plain_credential_password',
        'reply_to_id',
    ];

    protected $casts = [
        'attachments' => 'array',
        'download_otp_expires_at' => 'datetime',
    ];

    protected $appends = ['is_expired'];

    public function getIsExpiredAttribute()
    {
        return $this->isExpired();
    }

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

    public function replies(): HasMany
    {
        return $this->hasMany(SentMail::class, 'reply_to_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(SentMail::class, 'reply_to_id');
    }

    public function isExpired()
    {
        $settings = \App\Models\SiteSetting::first();
        if (!$settings || ($settings->file_expiration_days == 0 && $settings->file_expiration_hours == 0)) {
            return false;
        }

        $expiryTime = $this->created_at->addDays($settings->file_expiration_days)
                                       ->addHours($settings->file_expiration_hours);
        
        return $expiryTime->isPast();
    }
}
