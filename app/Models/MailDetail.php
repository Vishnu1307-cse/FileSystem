<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailDetail extends Model
{
    protected $table = 'mail_detail';

    protected $fillable = [
        'send_file_id',
        'code',
        'level',
        'approver_email',
        'subject',
        'status',
    ];

    public function sendFile(): BelongsTo
    {
        return $this->belongsTo(SendFile::class, 'send_file_id');
    }
}
