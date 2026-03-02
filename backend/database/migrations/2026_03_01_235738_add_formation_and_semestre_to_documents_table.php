<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // On modifie juste la table existante (aucune suppression)
        Schema::table('documents', function (Blueprint $table) {
            // Le "nullable()" est la garantie que tes anciennes données ne planteront pas
            $table->foreignId('formation_id')->nullable()->constrained('formations')->nullOnDelete();
            $table->foreignId('semestre_id')->nullable()->constrained('semestres')->nullOnDelete();
        });
    }

    public function down()
    {
        // Ceci sert uniquement si tu veux annuler cette modification plus tard
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['formation_id']);
            $table->dropForeign(['semestre_id']);
            $table->dropColumn(['formation_id', 'semestre_id']);
        });
    }
};