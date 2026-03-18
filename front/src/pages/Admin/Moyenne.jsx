import { useEffect, useState, useMemo } from "react";
import { Search, Save, Loader2, ChevronDown, AlertCircle, FileSpreadsheet, CheckCircle2, Trash2 } from "lucide-react";
import api from "../../services/api";

export default function AdminNotes() {
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [selectedSemestreNum, setSelectedSemestreNum] = useState(1);
  const [semestreId, setSemestreId] = useState(null);
  
  const [stagiaires, setStagiaires] = useState([]);
  const [originalStagiaires, setOriginalStagiaires] = useState([]); 
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get("/admin/formations").then(res => {
      if (!isMounted) return;
      const data = res.data || [];
      setFormations(data);
      if (data.length > 0) setSelectedFormation(data[0].id);
    }).catch(err => console.error(err));
    return () => { isMounted = false; };
  }, []);

  const fetchNotesData = async () => {
    if (!selectedFormation) return;
    setLoading(true);
    try {
      const res = await api.get("/admin/moyennes", {
        params: { formation_id: selectedFormation, semestre_numero: selectedSemestreNum }
      });
      
      setSemestreId(res.data.semestre_id);
      
      if (res.data.stagiaires && Array.isArray(res.data.stagiaires)) {
        const formatted = res.data.stagiaires.map(s => {
          const nom = s.nom || s.user?.nom || "Inconnu";
          const prenom = s.prenom || s.user?.prenom || "";
          const moyenneObj = s.moyennes && s.moyennes.length > 0 ? s.moyennes[0] : null;

          return {
            id: s.id,
            nom,
            prenom,
            matricule: s.matricule || "N/A",
            niveau_actuel_num: s.semestre ? parseInt(s.semestre.numero) : 1,
            valeur: moyenneObj ? moyenneObj.valeur : "",
            appreciation: moyenneObj ? moyenneObj.appreciation : "",
            moyenne_id: moyenneObj ? moyenneObj.id : null 
          };
        });
        setStagiaires(formatted);
        setOriginalStagiaires(JSON.parse(JSON.stringify(formatted))); 
      } else {
        setStagiaires([]);
        setOriginalStagiaires([]);
      }
    } catch (e) {
      setStagiaires([]);
      setOriginalStagiaires([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesData();
  }, [selectedFormation, selectedSemestreNum]);

  const modifiedStagiaires = useMemo(() => {
    return stagiaires.filter(s => {
      const orig = originalStagiaires.find(o => o.id === s.id);
      if (!orig) return false;
      return orig.valeur !== s.valeur || orig.appreciation !== s.appreciation;
    });
  }, [stagiaires, originalStagiaires]);

  const hasChanges = modifiedStagiaires.length > 0;

  const handleTabChange = (setter, value) => {
    if (hasChanges && !window.confirm("Certaines notes n'ont pas été publiées. Quitter sans enregistrer ?")) return;
    setter(value);
  };

  const handleInputChange = (id, field, value) => {
    setStagiaires(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveAllNotes = async () => {
    if (!hasChanges || !semestreId) return;
    setIsSavingGlobal(true);

    try {
      await Promise.all(modifiedStagiaires.map(async (stagiaire) => {
        const orig = originalStagiaires.find(o => o.id === stagiaire.id);
        
        if (stagiaire.valeur === "" || stagiaire.valeur === null) {
          if (orig && orig.moyenne_id) await api.delete(`/admin/moyennes/${orig.moyenne_id}`);
        } else {
          await api.post("/admin/moyennes", {
            stagiaire_id: stagiaire.id,
            semestre_id: semestreId,
            valeur: stagiaire.valeur,
            appreciation: stagiaire.appreciation
          });
        }
      }));
      
      await fetchNotesData(); 
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Erreur lors de la publication.");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const resetSemesterNotes = async () => {
    const avecNotes = originalStagiaires.filter(s => s.moyenne_id);
    if (avecNotes.length === 0) return alert("Aucune note à supprimer.");
    if (!window.confirm(`Supprimer TOUTES les notes du S${selectedSemestreNum} pour cette formation ?`)) return;

    setIsSavingGlobal(true);
    try {
      await Promise.all(avecNotes.map(s => api.delete(`/admin/moyennes/${s.moyenne_id}`)));
      await fetchNotesData(); 
    } catch (error) { alert("Erreur."); } 
    finally { setIsSavingGlobal(false); }
  };

  const resetSingleNote = async (s) => {
    if (!s.moyenne_id && s.valeur === "") return;
    if (!window.confirm(`Supprimer la note de ${s.nom} ?`)) return;
    try {
      if (s.moyenne_id) await api.delete(`/admin/moyennes/${s.moyenne_id}`);
      fetchNotesData();
    } catch (e) { alert("Erreur."); }
  };

  const filtered = stagiaires.filter(s => 
    `${s.nom} ${s.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.matricule && s.matricule.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE (AVEC BOUTONS D'ACTION) ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <FileSpreadsheet size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">Gestion des Notes</h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">Saisissez les notes. Le niveau s'ajuste automatiquement.</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* BOUTON VIDER */}
            <button 
              onClick={resetSemesterNotes} 
              disabled={isSavingGlobal || originalStagiaires.filter(s => s.moyenne_id).length === 0} 
              className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 text-sm font-bold transition-all bg-white/5 border border-white/10 text-white hover:bg-red-500 hover:border-red-500 rounded-xl md:rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed" 
              title="Vider l'onglet"
            >
              <Trash2 size={18}/>
            </button>
            
            {/* BOUTON PUBLIER */}
            <button 
              onClick={saveAllNotes} 
              disabled={!hasChanges || isSavingGlobal} 
              className={`flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold shadow-sm rounded-xl md:rounded-2xl transition-all
                ${saveSuccess 
                  ? "bg-white text-secondary" 
                  : hasChanges 
                    ? "bg-primary text-white hover:opacity-90 active:scale-95" 
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }
              `}
            >
              {isSavingGlobal ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18}/> : <Save size={18}/>}
              <span className="hidden sm:inline">
                {isSavingGlobal ? "Publication..." : saveSuccess ? "Publié avec succès" : `Publier les notes (${modifiedStagiaires.length})`}
              </span>
              <span className="sm:hidden">
                {isSavingGlobal ? "Envoi..." : saveSuccess ? "OK" : `Publier`}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:p-4 shrink-0 border-black/5">
          <div className="flex flex-col items-center justify-between gap-4 xl:flex-row">
            
            {/* LIGNE 1 : FILTRES */}
            <div className="flex flex-col items-center w-full gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-64 shrink-0">
                <select value={selectedFormation} onChange={e => handleTabChange(setSelectedFormation, e.target.value)} className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold outline-none cursor-pointer">
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
              </div>
              <div className="relative w-full sm:w-64 shrink-0 group">
                <Search size={16} className="absolute -translate-y-1/2 text-black/40 left-3 top-1/2" />
                <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-medium outline-none"/>
              </div>
            </div>

            {/* LIGNE 2 : ONGLETS SEMESTRES ET COMPTEUR */}
            <div className="flex items-center justify-between w-full gap-4 xl:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} onClick={() => handleTabChange(setSelectedSemestreNum, num)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${selectedSemestreNum === num ? "bg-secondary text-white" : "bg-black/[0.02] text-black/60 hover:text-black"}`}>
                    S{num}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filtered.length} <span className="hidden sm:inline">Stagiaire(s)</span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Stagiaire</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center w-32">Niveau Actuel</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center w-32">Moyenne S{selectedSemestreNum}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Appréciation</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="mx-auto mb-3 animate-spin text-primary" size={32}/><p className="text-[10px] font-bold uppercase text-black/40">Synchronisation...</p></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(s => {
                  const isModified = originalStagiaires.find(o => o.id === s.id)?.valeur !== s.valeur || originalStagiaires.find(o => o.id === s.id)?.appreciation !== s.appreciation;
                  const initiales = `${s.nom ? s.nom[0] : ''}${s.prenom ? s.prenom[0] : ''}`.toUpperCase();

                  return (
                    <tr key={s.id} className="transition-colors hover:bg-black/[0.01] group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center text-[11px] font-bold rounded-xl w-9 h-9 border shrink-0 bg-black/[0.02] text-black/40 border-black/5`}>
                            {initiales || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">{s.nom} {s.prenom}</p>
                            <p className="text-[10px] text-black/40 font-mono">{s.matricule}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider bg-black/5 text-black/60 border-black/10`}>
                          S{s.niveau_actuel_num}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input type="number" max="20" min="0" step="0.01" value={s.valeur} onChange={e => handleInputChange(s.id, 'valeur', e.target.value)} className={`w-20 mx-auto border rounded-lg px-2 py-2 text-center text-sm font-bold outline-none transition-all ${isModified ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-black/[0.02] border-black/5 text-black'}`}/>
                      </td>
                      <td className="px-6 py-3">
                        <input type="text" placeholder="Appréciation..." value={s.appreciation} onChange={e => handleInputChange(s.id, 'appreciation', e.target.value)} className={`w-full px-4 py-2 text-sm font-medium transition-all border rounded-lg outline-none ${isModified ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-black/[0.02] border-transparent text-black'}`}/>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isModified ? (
                            <div className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase text-primary bg-primary/10 rounded-md">
                              <span className="relative flex w-1.5 h-1.5"><span className="absolute w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span><span className="relative w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                              MàJ
                            </div>
                          ) : (
                            <button onClick={() => resetSingleNote(s)} disabled={!s.moyenne_id && s.valeur === ""} className="transition-colors text-black/20 hover:text-red-500 disabled:opacity-0"><Trash2 size={16}/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="5" className="py-24 text-center bg-black/[0.01]"><AlertCircle size={40} className="mx-auto mb-3 text-black/20"/><h3 className="text-sm font-bold text-black/50">Aucun stagiaire trouvé</h3></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}