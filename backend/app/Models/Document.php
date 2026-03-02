<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'titre',
        'type',
        'fichier',
        'formation_id', // 🚀 Ajouté
        'semestre_id'   // 🚀 Ajouté
    ];

    // Relation avec la Formation
    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    // Relation avec le Semestre
    public function semestre()
    {
        return $this->belongsTo(Semestre::class);
    }
}