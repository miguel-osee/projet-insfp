<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    // 1. On autorise Laravel à sauvegarder la filière
    protected $fillable = [
        'titre',
        'description',
        'formation_id' 
    ];

    // 2. On crée le lien avec la table Formations
    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }
}