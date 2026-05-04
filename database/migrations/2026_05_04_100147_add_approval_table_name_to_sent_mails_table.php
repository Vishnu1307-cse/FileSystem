<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sent_mails', function (Blueprint $table) {
            $table->string('approval_table_name')->nullable()->after('overall_status');
        });
    }

    public function down(): void
    {
        Schema::table('sent_mails', function (Blueprint $table) {
            $table->dropColumn('approval_table_name');
        });
    }
};
