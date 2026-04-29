<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalSequence extends Model
{
    protected $fillable = ['category_id', 'user_id', 'order_position'];

    public function category()
    {
        return $this->belongsTo(ApprovalCategory::class, 'category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
