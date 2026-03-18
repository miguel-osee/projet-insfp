<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
    {
        Schema::table('themes', function (Blueprint $table) {
            // On ajoute la colonne formation_id. 
            // nullable() évite les erreurs avec les thèmes que tu as déjà créés.
            // cascadeOnDelete() fait que si on supprime une formation, on supprime ses thèmes.
            $table->foreignId('formation_id')->nullable()->constrained('formations')->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::table('themes', function (Blueprint $table) {
            // Si on annule la migration, on retire la relation puis la colonne
            $table->dropForeign(['formation_id']);
            $table->dropColumn('formation_id');
        });
    }
};
