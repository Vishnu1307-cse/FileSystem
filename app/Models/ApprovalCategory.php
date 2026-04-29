<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalCategory extends Model
{
    protected $fillable = ['name'];

    public function sequences()
    {
        return $this->hasMany(ApprovalSequence::class, 'category_id')->orderBy('order_position');
    }
}
