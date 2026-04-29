<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileRequest extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'approver_id',
        'type',
        'status',
        'file_path',
        'message',
        'view_count',
        'download_count',
        'file_data',
        'mime_type',
        'file_size',
        'secure_token',
        'current_step',
        'category_id',
        'callback_url',
        'subject',
        'body',
        'cc_ids',
    ];

    protected $casts = [
        'message' => 'encrypted',
        'cc_ids' => 'array',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function category()
    {
        return $this->belongsTo(ApprovalCategory::class, 'category_id');
    }

    public function approvalLogs()
    {
        return $this->hasMany(RequestApprovalLog::class, 'request_id')->where('request_type', 'file_request');
    }

    public function logs()
    {
        return $this->hasMany(FileLog::class, 'request_id')->where('request_type', 'file_request');
    }
}
