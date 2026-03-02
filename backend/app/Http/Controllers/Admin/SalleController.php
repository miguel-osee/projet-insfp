<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    // Récupérer la liste des salles
    public function index()
    {
        return response()->json(Salle::all());
    }

    // Créer une nouvelle salle
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:salles,nom|max:50'
        ]);

        $salle = Salle::create([
            'nom' => $request->nom
        ]);

        return response()->json($salle, 201);
    }
    
    // Supprimer une salle
    public function destroy($id)
    {
        Salle::destroy($id);
        return response()->json(['message' => 'Salle supprimée']);
    }
}