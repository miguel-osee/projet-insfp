<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    public function index(Request $request)
    {
        // On charge 'salle' et 'module' pour que React affiche seance.salle.nom
        $query = EmploiDuTemps::with(['module', 'salle']);

        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }
        if ($request->has('semestre')) {
            $query->where('semestre', $request->semestre);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        // ⚠️ C'est ici que l'erreur 422 arrivait
        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'module_id'    => 'required|exists:modules,id',
            'salle_id'     => 'required|exists:salles,id', // Laravel vérifie l'ID
            'semestre'     => 'required|integer',
            'jour'         => 'required|string',
            'heure_debut'  => 'required',
            'heure_fin'    => 'required|after:heure_debut',
        ]);

        $emploi = EmploiDuTemps::create($validated);
        
        // On renvoie l'objet chargé pour que React l'affiche direct
        return response()->json($emploi->load(['module', 'salle']), 201);
    }

    public function destroy($id)
    {
        EmploiDuTemps::destroy($id);
        return response()->json(['message' => 'Supprimé']);
    }
}