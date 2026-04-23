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
        Schema::create('incident__user', function (Blueprint $table) {
            $table->id();
            $table->foreignId("incidentId")->constrained("incidents");
            $table->foreignId("userId")->constrained("users");
            $table->enum("involvement",["reporter","resolver","both"]);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident__user');
    }
};
