<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('file_transfer_ccs');
        Schema::dropIfExists('files');
        Schema::dropIfExists('file_transfers');
    }

    public function down(): void
    {
        // No easy rollback for drop
    }
};
