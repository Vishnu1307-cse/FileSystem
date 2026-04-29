<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('approval_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('approval_categories')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('order_position');
            $table->timestamps();
        });

        Schema::create('request_approval_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->string('request_type'); // file_request or ticket_request
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['approved', 'rejected']);
            $table->integer('step');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_approval_logs');
        Schema::dropIfExists('approval_sequences');
        Schema::dropIfExists('approval_categories');
    }
};
