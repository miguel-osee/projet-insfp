<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StagiaireController extends Controller
{
    /**
     * Liste tous les stagiaires avec leurs relations
     */
    public function index()
    {
        return response()->json(
            Stagiaire::with(['user', 'formation', 'semestre'])
                ->latest()
                ->get()
        );
    }

    /**
     * Création d'un nouveau stagiaire et de son compte utilisateur
     */
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

        // Format de mot de passe à l'inscription
        $generatedPassword = 'INSFP' . rand(1000, 9999);

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
            'stagiaire' => $stagiaire->load(['user', 'formation', 'semestre']),
            'generated_password' => $generatedPassword
        ], 201);
    }

    /**
     * Mise à jour des informations du stagiaire
     */
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
            $stagiaire->load(['user', 'formation', 'semestre'])
        );
    }

    /**
     * Suppression du stagiaire et de son compte
     */
    public function destroy($id)
    {
        $stagiaire = Stagiaire::with('user')->findOrFail($id);

        if ($stagiaire->user) {
            $stagiaire->user->delete();
        }
        
        $stagiaire->delete();

        return response()->json([
            'message' => 'Stagiaire supprimé avec succès'
        ]);
    }

    /**
     * 🔐 RÉINITIALISATION DU MOT DE PASSE (Format INSFP0000)
     */
    public function resetPassword($id)
    {
        // On récupère le stagiaire et son utilisateur
        $stagiaire = Stagiaire::with('user')->findOrFail($id);
        $user = $stagiaire->user;

        if (!$user) {
            return response()->json(['message' => 'Compte utilisateur introuvable'], 404);
        }

        // Génération du nouveau mot de passe (Format demandé)
        $newPassword = 'INSFP' . rand(1000, 9999);

        // Mise à jour hachée en base de données
        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        // Retour du mot de passe en clair pour l'alerte React
        return response()->json([
            'message' => 'Mot de passe réinitialisé',
            'new_password' => $newPassword
        ], 200);
    }

    /**
     * Mise à jour du niveau (Semestre) uniquement
     */
    public function updateNiveau(Request $request, $id)
    {
        $request->validate([
            'semestre_id' => 'required|exists:semestres,id'
        ]);

        $stagiaire = Stagiaire::findOrFail($id);
        
        $stagiaire->update([
            'semestre_id' => $request->semestre_id
        ]);

        return response()->json([
            'message' => 'Niveau du stagiaire mis à jour avec succès',
            'stagiaire' => $stagiaire->load('semestre')
        ]);
    }
}