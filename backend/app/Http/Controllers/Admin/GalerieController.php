<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Galerie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalerieController extends Controller
{
    public function index()
    {
        return response()->json(Galerie::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'nullable|string|max:100',
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $path = $request->file('image')->store('galerie', 'public');

        $photo = Galerie::create([
            'titre' => $request->titre,
            'image' => $path
        ]);

        return response()->json($photo, 201);
    }

    public function destroy($id)
    {
        $photo = Galerie::findOrFail($id);
        
        // Supprimer le fichier physique
        if (Storage::disk('public')->exists($photo->image)) {
            Storage::disk('public')->delete($photo->image);
        }

        $photo->delete();
        return response()->json(['message' => 'Photo supprimée']);
    }
}