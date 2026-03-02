<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $table = "emploi_du_temps";

    protected $fillable = [
        'formation_id',
        'module_id',
        'salle_id',
        'semestre',   // 👈 Change "semestre_id" par "semestre"
        'jour',
        'heure_debut',
        'heure_fin'
    ];

    // Relations pour que le Frontend reçoive les noms des objets
    public function formation() { return $this->belongsTo(Formation::class); }
    public function module() { return $this->belongsTo(Module::class); }
    public function salle() { return $this->belongsTo(Salle::class); }
}