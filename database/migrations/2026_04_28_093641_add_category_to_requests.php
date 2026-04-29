<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('file_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('file_requests', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('approver_id')->constrained('approval_categories')->onDelete('set null');
            }
            if (!Schema::hasColumn('file_requests', 'current_step')) {
                $table->integer('current_step')->default(1)->after('category_id');
            }
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('ticket_requests', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('approver_id')->constrained('approval_categories')->onDelete('set null');
            }
            if (!Schema::hasColumn('ticket_requests', 'current_step')) {
                $table->integer('current_step')->default(1)->after('category_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('file_requests', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'current_step']);
        });

        Schema::table('ticket_requests', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'current_step']);
        });
    }
};
