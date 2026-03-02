<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Semestre;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FormationController extends Controller
{
    /**
     * 📌 Liste des formations
     */
    public function index()
    {
        return response()->json(
            Formation::with('semestres.modules')
                ->latest()
                ->get()
        );
    }

    /**
     * 📌 Afficher une seule formation (utile pour l'édition)
     */
    public function show($id)
    {
        return response()->json(
            Formation::with('semestres.modules')->findOrFail($id)
        );
    }

    /**
     * 📌 Créer une formation
     */
    public function store(Request $request)
    {
        // 1. Validation
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'modules' => 'nullable|array',
            'modules.*.nom' => 'required|string|max:255',
            'modules.*.semestre_numero' => 'required|integer|min:1|max:5'
        ]);

        // 2. Upload Image
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('formations', 'public');
        }

        // 3. Création Formation
        $formation = Formation::create([
            'nom' => $request->nom,
            'description' => $request->description,
            'image' => $imagePath
        ]);

        // 4. Création Semestres (1 à 5)
        $semestres = [];
        for ($i = 1; $i <= 5; $i++) {
            $semestre = Semestre::create([
                'numero' => $i,
                'formation_id' => $formation->id
            ]);
            $semestres[$i] = $semestre->id;
        }

        // 5. Création Modules
        if ($request->modules) {
            foreach ($request->modules as $module) {
                if (isset($semestres[$module['semestre_numero']])) {
                    Module::create([
                        'nom' => $module['nom'],
                        'formation_id' => $formation->id,
                        'semestre_id' => $semestres[$module['semestre_numero']]
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Formation créée avec succès'], 201);
    }

    /**
     * 📌 Mettre à jour une formation (C'est la méthode qui te manquait)
     */
    public function update(Request $request, $id)
    {
        $formation = Formation::findOrFail($id);

        // 1. Validation
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'modules' => 'nullable|array',
            'modules.*.nom' => 'required|string|max:255',
            'modules.*.semestre_numero' => 'required|integer|min:1|max:5'
        ]);

        // 2. Gestion Image (Remplacement)
        $imagePath = $formation->image;
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne
            if ($formation->image && Storage::disk('public')->exists($formation->image)) {
                Storage::disk('public')->delete($formation->image);
            }
            // Mettre la nouvelle
            $imagePath = $request->file('image')->store('formations', 'public');
        }

        // 3. Update Formation
        $formation->update([
            'nom' => $request->nom,
            'description' => $request->description,
            'image' => $imagePath
        ]);

        // 4. Gestion des modules (On supprime les anciens et on recrée les nouveaux)
        if ($request->has('modules')) {
            // Récupérer les IDs des semestres existants
            $semestres = Semestre::where('formation_id', $formation->id)
                ->pluck('id', 'numero'); // [Numero => ID]

            // Supprimer les modules existants pour éviter les doublons
            Module::where('formation_id', $formation->id)->delete();

            // Recréer les modules envoyés par le formulaire
            foreach ($request->modules as $module) {
                if (isset($semestres[$module['semestre_numero']])) {
                    Module::create([
                        'nom' => $module['nom'],
                        'formation_id' => $formation->id,
                        'semestre_id' => $semestres[$module['semestre_numero']]
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Formation mise à jour avec succès']);
    }

    /**
     * 📌 Supprimer une formation
     */
    public function destroy($id)
    {
        $formation = Formation::findOrFail($id);

        if ($formation->image) {
            Storage::disk('public')->delete($formation->image);
        }

        $formation->delete();

        return response()->json(['message' => 'Formation supprimée avec succès']);
    }
}