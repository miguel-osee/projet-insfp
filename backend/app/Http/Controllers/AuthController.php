<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * 🔐 LOGIN (Email ou Matricule)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required'
        ]);

        // 🔍 1. Chercher l'utilisateur (soit par email, soit par matricule via la relation)
        $user = User::where('email', $request->login)
            ->orWhereHas('stagiaire', function ($query) use ($request) {
                $query->where('matricule', $request->login);
            })->first();

        // ❌ 2. Vérification
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        // ✅ 3. Création du Token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 📦 4. Retourner l'utilisateur avec TOUTES les relations nécessaires
        // On charge stagiaire -> sa formation -> son semestre actuel
        return response()->json([
            'token' => $token,
            'user' => $user->load(['stagiaire.formation', 'stagiaire.semestre']),
        ], 200);
    }

    /**
     * 🚪 LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnecté'], 200);
    }
}