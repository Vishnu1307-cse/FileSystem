<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'api_url',
        'api_key',
        'cloudflare_url',
        'is_external_api_enabled',
    ];

    protected $casts = [
        'is_external_api_enabled' => 'boolean',
    ];
}
