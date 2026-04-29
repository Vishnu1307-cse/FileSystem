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
            $table->string('subject')->nullable()->after('category_id');
            $table->text('body')->nullable()->after('subject');
            $table->json('cc_ids')->nullable()->after('body');
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            $table->string('subject')->nullable()->after('category_id');
            $table->text('body')->nullable()->after('subject');
            $table->json('cc_ids')->nullable()->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('file_requests', function (Blueprint $table) {
            $table->dropColumn(['subject', 'body', 'cc_ids']);
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            $table->dropColumn(['subject', 'body', 'cc_ids']);
        });
    }
};
