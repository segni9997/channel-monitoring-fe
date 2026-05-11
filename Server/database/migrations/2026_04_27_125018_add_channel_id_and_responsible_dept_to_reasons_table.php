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
        Schema::table('reasons', function (Blueprint $table) {
            $table->foreignId('channel_id')->nullable()->constrained('channels')->onDelete('cascade');
            $table->string('responsible_dept')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reasons', function (Blueprint $table) {
            $table->dropForeign(['channel_id']);
            $table->dropColumn(['channel_id', 'responsible_dept']);
        });
    }
};
