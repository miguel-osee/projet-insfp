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

    /**
     * 📚 Relation : Formation possède plusieurs semestres
     */
    public function semestres()
    {
        return $this->hasMany(Semestre::class);
    }

    /**
     * 📖 Relation : Formation possède plusieurs modules
     */
    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
