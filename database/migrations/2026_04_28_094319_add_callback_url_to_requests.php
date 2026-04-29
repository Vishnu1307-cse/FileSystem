<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('file_requests', function (Blueprint $table) {
            $table->string('callback_url')->nullable()->after('message');
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            $table->string('callback_url')->nullable()->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('file_requests', function (Blueprint $table) {
            $table->dropColumn('callback_url');
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            $table->dropColumn('callback_url');
        });
    }
};
