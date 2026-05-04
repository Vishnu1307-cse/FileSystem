<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                'api_url'                 => 'https://workflow.mypricol.net.in/api/approvals',
                'api_key'                 => 'app_esNEsUZCRM2xaUXqkW7cEjUhJPBoB8UCice4iSnc',
                'cloudflare_url'          => 'https://placeholder-cloudflare.example.com',
                'is_external_api_enabled' => true,
            ]
        );
    }
}
