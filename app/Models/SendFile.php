<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SendFile extends Model
{
    protected $table = 'send_files';

    protected $fillable = [
        'subject',
        'cc',
        'body',
        'approval_table_name',
    ];

    public function mailDetails(): HasMany
    {
        return $this->hasMany(MailDetail::class, 'send_file_id');
    }
}
