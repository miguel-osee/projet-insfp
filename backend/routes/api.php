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
| 🔓 ROUTES PUBLIQUES (Accessibles sans connexion pour le Site Vitrine)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

// --- Formations ---
Route::get('/formations', [FormationController::class, 'index']); // Liste toutes les formations
Route::get('/formations/{id}', [FormationController::class, 'show']); // 🚀 NOUVEAU : Affiche les détails d'une formation

// --- Actualités ---
Route::get('/actualites', [ActualiteController::class, 'index']); // Liste toutes les actualités
Route::get('/actualites/{id}', [ActualiteController::class, 'show']); // 🚀 NOUVEAU : Affiche les détails d'une actualité

// --- Galerie ---
Route::get('/galerie', [GalerieController::class, 'index']);


/*
|--------------------------------------------------------------------------
| 🛡️ ROUTES PROTÉGÉES (Connexion requise : auth:sanctum)
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

        // Gestion des ressources (CRUD complet généré par apiResource)
        Route::apiResource('formations', FormationController::class);
        Route::apiResource('semestres', SemestreController::class);
        Route::apiResource('stagiaires', StagiaireController::class);
        Route::apiResource('actualites', ActualiteController::class);
        Route::apiResource('moyennes', MoyenneController::class);
        Route::apiResource('emplois', EmploiDuTempsController::class);
        Route::apiResource('salles', SalleController::class);
        Route::apiResource('galerie', GalerieController::class);
        Route::apiResource('documents', DocumentController::class);
        Route::apiResource('themes', ThemeController::class);
        
        // Mise à jour spécifique du niveau du stagiaire
        Route::patch('/stagiaires/{id}/niveau', [StagiaireController::class, 'updateNiveau']);

        // Récupérer les semestres spécifiques à une formation
        Route::get('/formations/{id}/semestres', function ($id) {
            return \App\Models\Semestre::where('formation_id', $id)->get();
        });
    });
});