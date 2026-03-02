<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {

            $table->id();

            $table->string('nom');

            // 🔹 Relation avec formation
            $table->foreignId('formation_id')
                  ->constrained()
                  ->onDelete('cascade');

            // 🔹 Relation avec semestre
            $table->foreignId('semestre_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
