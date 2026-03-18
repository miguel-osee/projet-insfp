<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'image'
    ];
    
    public function semestres()
    {
        return $this->hasMany(Semestre::class);
    }

    
    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
