<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    // =========================================================
    // PARTIE ADMIN
    // =========================================================

    // 1. Lister tous les documents
    public function index()
    {
        // 🚀 CRUCIAL : On ajoute with(['formation', 'semestre']) pour envoyer les noms à React
        $documents = Document::with(['formation', 'semestre'])->orderBy('created_at', 'desc')->get();
        return response()->json($documents);
    }

    // 2. Ajouter un nouveau document avec fichier
    public function store(Request $request)
    {
        // 🚀 On ajoute la validation pour formation_id et semestre_id
        $request->validate([
            'titre' => 'required|string|max:255',
            'type' => 'required|in:reglement,examen,calendrier,pedagogique',
            'fichier' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:10240', // 10MB max
            'formation_id' => 'nullable|exists:formations,id', // 🚀
            'semestre_id' => 'nullable|exists:semestres,id',   // 🚀
        ]);

        // Sauvegarde du fichier dans storage/app/public/documents
        $path = $request->file('fichier')->store('documents', 'public');

        // 🚀 On insère TOUTES les données dans la base de données
        $document = Document::create([
            'titre' => $request->titre,
            'type' => $request->type,
            'fichier' => $path,
            'formation_id' => $request->formation_id, // 🚀
            'semestre_id' => $request->semestre_id,   // 🚀
        ]);

        // On charge les relations avant de renvoyer la réponse pour que React l'affiche bien tout de suite
        $document->load(['formation', 'semestre']);

        return response()->json($document, 201);
    }

    // 3. Supprimer un document (DB + Fichier physique)
    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Supprimer le fichier physique s'il existe
        if (Storage::disk('public')->exists($document->fichier)) {
            Storage::disk('public')->delete($document->fichier);
        }

        $document->delete();

        return response()->json(['message' => 'Document supprimé avec succès']);
    }

    // =========================================================
    // PARTIE STAGIAIRE
    // =========================================================

    // 4. Nouvelle fonction pour envoyer les documents au Dashboard Stagiaire
    public function getStagiaireDocuments(Request $request)
    {
        // 🚀 On inclut aussi les relations ici au cas où le stagiaire a besoin de voir la spécialité
        $documents = Document::with(['formation', 'semestre'])->orderBy('created_at', 'desc')->get();

        return response()->json($documents);
    }
}