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
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId("createdBy")->constrained("users");
            $table->dateTime("downTimeStart");
            $table->dateTime("downTimeEnd")->nullable();
            $table->string("duration")->nullable();
            $table->string("remark")->nullable();
            $table->enum("status", ["completed", "inprogress"]);
            $table->enum("channel", ["USSD", "APP", "ATM", "IPS", "TOPUP", "IBANK", "LOROIB"]);
            $table->foreignId("reasonId")->constrained("reasons");
            $table->timestamps();
        });
    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
