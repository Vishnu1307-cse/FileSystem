<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('type', ['software', 'hardware', 'others']);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('file_path')->nullable(); // Original name
            $table->text('message')->nullable();
            $table->unsignedBigInteger('view_count')->default(0);
            $table->unsignedBigInteger('download_count')->default(0);
            $table->string('secure_token', 64)->nullable()->unique();
            $table->timestamps();
        });

        // Add binary data separately to keep migration clean or include it here
        // User insisted on DB storage, so we'll add the longblob
        DB::statement("ALTER TABLE file_requests ADD file_data LONGBLOB NULL AFTER file_path");
        DB::statement("ALTER TABLE file_requests ADD mime_type VARCHAR(255) NULL AFTER file_data");
        DB::statement("ALTER TABLE file_requests ADD file_size BIGINT NULL AFTER mime_type");
    }

    public function down(): void
    {
        Schema::dropIfExists('file_requests');
    }
};
