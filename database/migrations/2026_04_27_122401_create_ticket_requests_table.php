<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'rejected', 'closed'])->default('pending');
            $table->string('uploaded_file_path')->nullable();
            $table->boolean('is_uploaded')->default(false);
            $table->text('message')->nullable();
            $table->string('secure_token', 64)->nullable()->unique();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE ticket_requests ADD file_data LONGBLOB NULL AFTER uploaded_file_path");
        DB::statement("ALTER TABLE ticket_requests ADD mime_type VARCHAR(255) NULL AFTER file_data");
        DB::statement("ALTER TABLE ticket_requests ADD file_size BIGINT NULL AFTER mime_type");
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_requests');
    }
};
