<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semestre;
use Illuminate\Http\Request;

class SemestreController extends Controller
{
    // 📌 Liste des semestres
    public function index()
    {
        return response()->json(
            Semestre::with('formation')->get(),
            200
        );
    }

    // 📌 Créer un semestre
    public function store(Request $request)
    {
        $request->validate([
            'numero' => 'required|integer|min:1|max:5',
            'formation_id' => 'required|exists:formations,id'
        ]);

        $semestre = Semestre::create($request->all());

        return response()->json($semestre, 201);
    }

    // 📌 Afficher un semestre
    public function show($id)
    {
        $semestre = Semestre::with('formation')->find($id);

        if (!$semestre) {
            return response()->json([
                'message' => 'Semestre non trouvé'
            ], 404);
        }

        return response()->json($semestre, 200);
    }

    // 📌 Modifier un semestre
    public function update(Request $request, $id)
    {
        $semestre = Semestre::find($id);

        if (!$semestre) {
            return response()->json([
                'message' => 'Semestre non trouvé'
            ], 404);
        }

        $request->validate([
            'numero' => 'sometimes|integer|min:1|max:5',
            'formation_id' => 'sometimes|exists:formations,id'
        ]);

        $semestre->update($request->all());

        return response()->json($semestre, 200);
    }

    // 📌 Supprimer un semestre
    public function destroy($id)
    {
        $semestre = Semestre::find($id);

        if (!$semestre) {
            return response()->json([
                'message' => 'Semestre non trouvé'
            ], 404);
        }

        $semestre->delete();

        return response()->json([
            'message' => 'Semestre supprimé'
        ], 200);
    }
}
