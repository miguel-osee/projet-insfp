<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'nom',
        'prenoms',
        'email',
        'telephone',
        'message',
        'date_envoi',
        'statut'
    ];
}
