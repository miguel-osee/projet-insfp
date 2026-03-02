<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MoyenneSemestre;
use App\Models\Stagiaire;
use App\Models\Semestre;
use Illuminate\Http\Request;

class MoyenneController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'semestre_numero' => 'required|integer'
        ]);

        $semestre = Semestre::where('formation_id', $request->formation_id)
                            ->where('numero', $request->semestre_numero)
                            ->first();

        if (!$semestre) {
            return response()->json(['semestre_id' => null, 'stagiaires' => []]);
        }

        $stagiaires = Stagiaire::where('formation_id', $request->formation_id)
            ->with('semestre') 
            ->with(['moyennes' => function($query) use ($semestre) {
                $query->where('semestre_id', $semestre->id);
            }])
            ->get();

        return response()->json([
            'semestre_id' => $semestre->id,
            'stagiaires' => $stagiaires
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'semestre_id'  => 'required|exists:semestres,id',
            'valeur'       => 'required|numeric|min:0|max:20',
            'appreciation' => 'nullable|string|max:255'
        ]);

        $moyenne = MoyenneSemestre::updateOrCreate(
            ['stagiaire_id' => $request->stagiaire_id, 'semestre_id' => $request->semestre_id],
            ['valeur' => $request->valeur, 'appreciation' => $request->appreciation]
        );

        // 🚀 AUTO-CALCUL DU NIVEAU APRÈS SAUVEGARDE
        $this->recalculerNiveau($request->stagiaire_id);

        return response()->json($moyenne);
    }

    public function destroy($id)
    {
        $moyenne = MoyenneSemestre::findOrFail($id);
        $stagiaire_id = $moyenne->stagiaire_id;
        $moyenne->delete();

        // 🚀 AUTO-CALCUL DU NIVEAU APRÈS SUPPRESSION
        $this->recalculerNiveau($stagiaire_id);

        return response()->json(['message' => 'Moyenne supprimée avec succès']);
    }

    public function getStagiaireMoyennes(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->stagiaire) return response()->json([], 404);

        $moyennes = MoyenneSemestre::where('stagiaire_id', $user->stagiaire->id)
            ->with('semestre') 
            ->get();

        return response()->json($moyennes);
    }

   // =========================================================
    // 🧠 MOTEUR D'INTELLIGENCE : CALCUL DU NIVEAU STRICT
    // =========================================================
    private function recalculerNiveau($stagiaire_id)
    {
        $stagiaire = Stagiaire::with('moyennes.semestre')->find($stagiaire_id);
        if (!$stagiaire) return;

        $maxSemestreNum = 0;
        $valeurMaxSemestre = null;

        // 1. On cherche le semestre le plus élevé où une note a été saisie
        foreach ($stagiaire->moyennes as $m) {
            if ($m->valeur !== null && $m->valeur !== '') {
                $numero = (int) $m->semestre->numero;
                if ($numero > $maxSemestreNum) {
                    $maxSemestreNum = $numero;
                    $valeurMaxSemestre = (float) $m->valeur;
                }
            }
        }

        // S'il n'a AUCUNE note, on ne touche à rien (permet à l'admin de l'inscrire manuellement au niveau qu'il veut au départ)
        if ($maxSemestreNum === 0) {
            return; 
        }

        // 2. DÉCISION PÉDAGOGIQUE STRICTE
        if ($valeurMaxSemestre >= 10) {
            // SUCCÈS : Il a la moyenne, il passe au semestre supérieur !
            $nouveauNiveauNum = $maxSemestreNum + 1;
        } else {
            // ÉCHEC / RATTRAPAGE : Il a moins de 10, ON LE BLOQUE dans ce semestre !
            $nouveauNiveauNum = $maxSemestreNum;
        }

        // On bloque au maximum de l'école (ex: 5)
        if ($nouveauNiveauNum > 5) {
            $nouveauNiveauNum = 5;
        }

        // 3. Mise à jour en Base de données
        $nouveauSemestre = Semestre::where('formation_id', $stagiaire->formation_id)
                                   ->where('numero', $nouveauNiveauNum)
                                   ->first();

        if ($nouveauSemestre && $stagiaire->semestre_id !== $nouveauSemestre->id) {
            $stagiaire->update(['semestre_id' => $nouveauSemestre->id]);
        }
    }
}