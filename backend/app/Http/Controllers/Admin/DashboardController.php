<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stagiaire;
use App\Models\Formation;
use App\Models\Document;
use App\Models\Actualite; // Vérifie le nom de ton modèle d'actualités

class DashboardController extends Controller
{
    public function getStats()
    {
        // On retourne les vrais comptes de la base de données
        return response()->json([
            'stagiaires' => Stagiaire::count(),
            'formations' => Formation::count(),
            'documents'  => Document::count(),
            'actualites' => Actualite::count(),
        ]);
    }
}