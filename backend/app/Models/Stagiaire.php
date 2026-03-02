<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Semestre;
use App\Models\Formation;



class Stagiaire extends Model
{
    protected $fillable = [
        'user_id',
        'matricule',
        'formation_id',
        'semestre_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function semestre()
    {
        return $this->belongsTo(Semestre::class);
    }

    public function emploiDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }

    public function moyennes()
    {
        return $this->hasMany(MoyenneSemestre::class);
    }
}
