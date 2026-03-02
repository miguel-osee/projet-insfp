<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StagiaireController extends Controller
{
    public function index()
    {
        return response()->json(
            Stagiaire::with(['user','formation','semestre'])
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'matricule' => 'required|string',
            'formation_id' => 'required|exists:formations,id',
            'semestre_id' => 'required|exists:semestres,id',
        ]);

        $generatedPassword = 'INSFP' . rand(1000,9999);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($generatedPassword),
            'role' => 'STAGIAIRE'
        ]);

        $stagiaire = Stagiaire::create([
            'user_id' => $user->id,
            'matricule' => $request->matricule,
            'formation_id' => $request->formation_id,
            'semestre_id' => $request->semestre_id,
        ]);

        return response()->json([
            'stagiaire' => $stagiaire->load(['user','formation','semestre']),
            'generated_password' => $generatedPassword
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $stagiaire = Stagiaire::with('user')->findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $stagiaire->user->id,
            'matricule' => 'required|string',
            'formation_id' => 'required|exists:formations,id',
            'semestre_id' => 'required|exists:semestres,id',
        ]);

        $stagiaire->user->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
        ]);

        $stagiaire->update([
            'matricule' => $request->matricule,
            'formation_id' => $request->formation_id,
            'semestre_id' => $request->semestre_id,
        ]);

        return response()->json(
            $stagiaire->load(['user','formation','semestre'])
        );
    }

    public function destroy($id)
    {
        $stagiaire = Stagiaire::with('user')->findOrFail($id);

        $stagiaire->user->delete();
        $stagiaire->delete();

        return response()->json([
            'message' => 'Stagiaire supprimé'
        ]);
    }

    // =========================================================================
    // 🚀 NOUVELLE FONCTION : Permet de changer uniquement le niveau (Semestre)
    // Utilisée par la page AdminNotes pour promouvoir un étudiant
    // =========================================================================
    public function updateNiveau(Request $request, $id)
    {
        $request->validate([
            'semestre_id' => 'required|exists:semestres,id'
        ]);

        $stagiaire = Stagiaire::findOrFail($id);
        
        // On met à jour uniquement le semestre_id
        $stagiaire->update([
            'semestre_id' => $request->semestre_id
        ]);

        return response()->json([
            'message' => 'Niveau du stagiaire mis à jour avec succès',
            'stagiaire' => $stagiaire->load('semestre')
        ]);
    }
}