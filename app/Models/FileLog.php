<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileLog extends Model
{
    protected $fillable = [
        'request_id',
        'request_type',
        'action',
        'user_type',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
