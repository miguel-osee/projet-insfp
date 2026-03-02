<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MoyenneSemestre extends Model
{
    protected $table = 'moyennes_semestre';

    protected $fillable = [
        'valeur',
        'appreciation',
        'stagiaire_id',
        'semestre_id'
    ];

    public function stagiaire()
    {
        return $this->belongsTo(Stagiaire::class);
    }

    public function semestre()
    {
        return $this->belongsTo(Semestre::class);
    }
}
