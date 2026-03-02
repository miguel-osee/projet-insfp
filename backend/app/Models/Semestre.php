<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Module;
use App\Models\Stagiaire;
use App\Models\MoyenneSemestre;
use App\Models\Formation;



class Semestre extends Model
{
    protected $fillable = [
        'numero',
        'formation_id'
    ];

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function stagiaires()
    {
        return $this->hasMany(Stagiaire::class);
    }

    public function moyennes()
    {
        return $this->hasMany(MoyenneSemestre::class);
    }
}
