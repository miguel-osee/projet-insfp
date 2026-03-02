<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Actualite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ActualiteController extends Controller
{
    /**
     * 📌 Liste des actualités (publique + admin)
     */
    public function index()
    {
        return response()->json(
            Actualite::latest()->get()
        );
    }

    /**
     * 📌 Détail d'une actualité
     */
    public function show($id)
    {
        return response()->json(
            Actualite::findOrFail($id)
        );
    }

    /**
     * 📌 Créer une actualité
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre'   => 'required|string|max:255',
            'contenu' => 'required|string',
            'image'   => 'sometimes|file|mimes:jpg,jpeg,png|max:2048'
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('actualites', 'public');
        }

        $actualite = Actualite::create([
            'titre'            => $request->titre,
            'contenu'          => $request->contenu,
            'image'            => $imagePath,
            'date_publication' => now(),
        ]);

        return response()->json($actualite, 201);
    }

    /**
     * 📌 Mettre à jour une actualité
     */
    public function update(Request $request, $id)
    {
        $actualite = Actualite::findOrFail($id);

        $request->validate([
            'titre'   => 'required|string|max:255',
            'contenu' => 'required|string',
            'image'   => 'sometimes|file|mimes:jpg,jpeg,png|max:2048'
        ]);

        // 🔥 Si nouvelle image
        if ($request->hasFile('image')) {

            // Supprimer ancienne image
            if ($actualite->image && Storage::disk('public')->exists($actualite->image)) {
                Storage::disk('public')->delete($actualite->image);
            }

            $actualite->image = $request->file('image')->store('actualites', 'public');
        }

        $actualite->titre = $request->titre;
        $actualite->contenu = $request->contenu;

        $actualite->save();

        return response()->json($actualite);
    }

    /**
     * 📌 Supprimer une actualité
     */
    public function destroy($id)
    {
        $actualite = Actualite::findOrFail($id);

        // Supprimer image associée
        if ($actualite->image && Storage::disk('public')->exists($actualite->image)) {
            Storage::disk('public')->delete($actualite->image);
        }

        $actualite->delete();

        return response()->json([
            'message' => 'Actualité supprimée avec succès'
        ]);
    }
}
