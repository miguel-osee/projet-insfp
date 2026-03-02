<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('emploi_du_temps', function (Blueprint $table) {
        $table->id();
        $table->string('jour');
        $table->time('heure_debut');
        $table->time('heure_fin');
        $table->integer('semestre'); // Le numéro (1, 2, 3...)
        
        // Liens
        $table->foreignId('formation_id')->constrained()->onDelete('cascade');
        $table->foreignId('module_id')->constrained()->onDelete('cascade');
        $table->foreignId('salle_id')->constrained()->onDelete('cascade');

        $table->timestamps();
    });
}
    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};
