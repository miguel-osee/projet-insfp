<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    /**
     * Récupérer tous les thèmes (pour le tableau React)
     */
    public function index()
    {
        // 🚀 AJOUT : "with('formation')" pour envoyer le nom de la filière à React
        $themes = Theme::with('formation')->orderBy('created_at', 'desc')->get();
        
        return response()->json($themes);
    }

    /**
     * Créer un nouveau thème
     */
    public function store(Request $request)
    {
        // 🚀 AJOUT : Validation de formation_id
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'formation_id' => 'required|exists:formations,id' 
        ]);

        $theme = Theme::create($validated);

        return response()->json($theme, 201);
    }

    /**
     * Mettre à jour un thème existant
     */
    public function update(Request $request, $id)
    {
        $theme = Theme::findOrFail($id);

        // 🚀 AJOUT : Validation de formation_id
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'formation_id' => 'required|exists:formations,id' 
        ]);

        $theme->update($validated);

        return response()->json($theme);
    }

    /**
     * Supprimer un thème
     */
    public function destroy($id)
    {
        $theme = Theme::findOrFail($id);
        $theme->delete();

        return response()->json(['message' => 'Thème supprimé avec succès']);
    }
}