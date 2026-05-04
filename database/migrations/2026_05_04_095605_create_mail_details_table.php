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
        Schema::create('mail_detail', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('send_file_id');
            $table->string('code');
            $table->unsignedInteger('level');
            $table->string('approver_email');
            $table->string('subject');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            $table->foreign('send_file_id')->references('id')->on('send_files')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mail_detail');
    }
};
