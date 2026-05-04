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
        Schema::create('send_files', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('subject');
            $table->text('cc')->nullable();
            $table->longText('body');
            $table->string('approval_table_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('send_files');
    }
};
