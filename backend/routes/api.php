<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Imports des Contrôleurs Admin
use App\Http\Controllers\Admin\FormationController;
use App\Http\Controllers\Admin\SemestreController;
use App\Http\Controllers\Admin\StagiaireController;
use App\Http\Controllers\Admin\ActualiteController;
use App\Http\Controllers\Admin\MoyenneController;
use App\Http\Controllers\Admin\EmploiDuTempsController;
use App\Http\Controllers\Admin\SalleController;
use App\Http\Controllers\Admin\GalerieController;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ThemeController; 

/*
|--------------------------------------------------------------------------
| 🔓 ROUTES PUBLIQUES
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{id}', [FormationController::class, 'show']);

Route::get('/actualites', [ActualiteController::class, 'index']);
Route::get('/actualites/{id}', [ActualiteController::class, 'show']);

Route::get('/galerie', [GalerieController::class, 'index']);

/*
|--------------------------------------------------------------------------
| 🛡️ ROUTES PROTÉGÉES (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);

    /* 🎓 Espace Stagiaire */
    Route::prefix('stagiaire')->group(function () {
        Route::get('/emploi-du-temps', [EmploiDuTempsController::class, 'index']);
        Route::get('/moyennes', [MoyenneController::class, 'getStagiaireMoyennes']);
        Route::get('/documents', [DocumentController::class, 'getStagiaireDocuments']);
        Route::get('/themes', [ThemeController::class, 'index']);
    });

    /* 🛠️ Espace Administrateur (Middleware 'admin' requis) */
    Route::prefix('admin')->middleware('admin')->group(function () {
        
        // Statistiques du Dashboard
        Route::get('/stats', [DashboardController::class, 'getStats']);

        // --- Gestion des Stagiaires ---
        Route::apiResource('stagiaires', StagiaireController::class);
        
        // ✅ LA ROUTE MANQUANTE : Réinitialisation du mot de passe
        Route::post('/stagiaires/{id}/reset-password', [StagiaireController::class, 'resetPassword']);
        
        // Mise à jour spécifique du niveau
        Route::patch('/stagiaires/{id}/niveau', [StagiaireController::class, 'updateNiveau']);

        // --- Autres Ressources ---
        Route::apiResource('formations', FormationController::class);
        Route::apiResource('semestres', SemestreController::class);
        Route::apiResource('actualites', ActualiteController::class);
        Route::apiResource('moyennes', MoyenneController::class);
        Route::apiResource('emplois', EmploiDuTempsController::class);
        Route::apiResource('salles', SalleController::class);
        Route::apiResource('galerie', GalerieController::class);
        Route::apiResource('documents', DocumentController::class);
        Route::apiResource('themes', ThemeController::class);

        // Récupérer les semestres d'une formation
        Route::get('/formations/{id}/semestres', function ($id) {
            return \App\Models\Semestre::where('formation_id', $id)->get();
        });
    });
});