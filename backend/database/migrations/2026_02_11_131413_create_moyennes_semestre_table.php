<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moyennes_semestre', function (Blueprint $table) {
            $table->id();
            $table->float('valeur');
            $table->string('appreciation')->nullable();

            $table->foreignId('stagiaire_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->foreignId('semestre_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->unique(['stagiaire_id', 'semestre_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moyennes_semestre');
    }
};
