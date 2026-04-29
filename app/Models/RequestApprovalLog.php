<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestApprovalLog extends Model
{
    protected $fillable = ['request_id', 'request_type', 'user_id', 'status', 'step'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the owning request model.
     */
    public function request()
    {
        return $this->morphTo(null, 'request_type', 'request_id');
    }
}
