import { useEffect, useState, useMemo } from "react";
import { 
  Plus, Calendar, Clock, MapPin, Loader2, X, ChevronDown, 
  ChevronUp, Trash2, Building, CalendarDays 
} from "lucide-react";
import api from "../../services/api";

export default function AdminEmplois() {
  const [formations, setFormations] = useState([]);
  const [salles, setSalles] = useState([]); 
  const [selectedFormationId, setSelectedFormationId] = useState("");
  const [selectedSemestre, setSelectedSemestre] = useState(1);
  const [emplois, setEmplois] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false); 
  const [showSalleModal, setShowSalleModal] = useState(false); 
  const [saving, setSaving] = useState(false);

  // Jour ouvert par défaut (Aujourd'hui)
  const joursOrdre = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const jourActuel = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][new Date().getDay()];
  const [openDays, setOpenDays] = useState([joursOrdre.includes(jourActuel) ? jourActuel : "Lundi"]);

  const [formData, setFormData] = useState({
    jour: "Lundi",
    heure_debut: "08:30",
    heure_fin: "10:30",
    module_id: "",
    salle_id: "" 
  });

  const [newSalle, setNewSalle] = useState("");

  // ================= FETCH DATA =================
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [resFormations, resSalles] = await Promise.all([
            api.get("/admin/formations"),
            api.get("/admin/salles")
        ]);
        if (!isMounted) return;
        
        const data = resFormations.data || [];
        setFormations(data);
        setSalles(resSalles.data || []);
        if (data.length > 0) setSelectedFormationId(data[0].id);
      } catch (error) { console.error("Erreur chargement", error); }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedFormationId) return;
    let isMounted = true;

    const fetchEmplois = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/emplois`, {
          params: { formation_id: selectedFormationId, semestre: selectedSemestre }
        });
        if (!isMounted) return;
        const sortedEmplois = (res.data || []).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
        setEmplois(sortedEmplois);
      } catch (error) { console.error(error); } 
      finally { if (isMounted) setLoading(false); }
    };

    fetchEmplois();
    return () => { isMounted = false; };
  }, [selectedFormationId, selectedSemestre]);

  // ================= ACTIONS =================
  const toggleDay = (jour) => {
    setOpenDays(prev => prev.includes(jour) ? prev.filter(d => d !== jour) : [...prev, jour]);
  };

  const createSeance = async (e) => {
    e.preventDefault();
    if (!formData.module_id || !formData.salle_id || !formData.heure_debut || !formData.heure_fin) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/admin/emplois", {
        ...formData,
        formation_id: selectedFormationId,
        semestre: selectedSemestre
      });
      const res = await api.get(`/admin/emplois`, { params: { formation_id: selectedFormationId, semestre: selectedSemestre } });
      setEmplois((res.data || []).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)));
      
      setShowModal(false);
      if(!openDays.includes(formData.jour)) setOpenDays([...openDays, formData.jour]);
      setFormData(prev => ({ ...prev, module_id: "", salle_id: "" })); 
    } catch (error) { alert("Erreur lors de l'ajout."); } 
    finally { setSaving(false); }
  };

  const deleteSeance = async (id) => {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await api.delete(`/admin/emplois/${id}`);
      setEmplois(prev => prev.filter(e => e.id !== id));
    } catch (error) { alert("Erreur suppression."); }
  };

  const createSalle = async () => {
    if (!newSalle.trim()) return;
    try {
        setSaving(true);
        const res = await api.post("/admin/salles", { nom: newSalle });
        setSalles([...salles, res.data]);
        setNewSalle("");
    } catch (error) { alert("Erreur"); } 
    finally { setSaving(false); }
  };

  const deleteSalle = async (id) => {
    if (!window.confirm("Supprimer cette salle ?")) return;
    try {
        await api.delete(`/admin/salles/${id}`);
        setSalles(salles.filter(s => s.id !== id));
    } catch (error) { alert("Erreur"); }
  }

  const activeFormation = formations.find(f => f.id === Number(selectedFormationId));
  const currentModules = useMemo(() => {
    return activeFormation?.semestres?.find(s => s.numero === selectedSemestre)?.modules || [];
  }, [activeFormation, selectedSemestre]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE D'EN-TÊTE ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <CalendarDays size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Planification des Cours
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">
              Gérez les emplois du temps hebdomadaires et l'occupation des salles.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowSalleModal(true)} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
            >
              <Building size={18} /> <span className="hidden md:inline">Salles</span>
            </button>
            <button 
              onClick={() => setShowModal(true)} 
              disabled={!selectedFormationId} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white  bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 disable:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">Nouveau cours</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENEUR DU PLANNING ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* BARRE DE FILTRES (FIXE EN HAUT) */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:p-4 shrink-0 border-black/5">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            
            {/* Select Formation */}
            <div className="relative w-full sm:w-64 shrink-0">
              <select 
                value={selectedFormationId}
                onChange={(e) => setSelectedFormationId(Number(e.target.value))}
                className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold outline-none cursor-pointer"
              >
                {formations.length === 0 && <option>Chargement...</option>}
                {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
              <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
            </div>

            {/* Select Semestre */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSemestre(s)} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSemestre === s 
                      ? "bg-secondary text-white shadow-sm" 
                      : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ZONE DU PLANNING (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full py-12 text-black/40">
               <Loader2 className="mb-3 text-primary animate-spin" size={32}/>
               <p className="text-[10px] font-bold tracking-widest uppercase">Chargement du planning...</p>
             </div>
          ) : (
            <div className="divide-y divide-black/5">
              {joursOrdre.map((jour) => {
                const coursDuJour = emplois.filter(e => e.jour === jour);
                const isOpen = openDays.includes(jour);
                
                // CORRECTION ICI : Utilisation de "jourActuel" au lieu de "nomJourAujourdhui"
                const isToday = jour === jourActuel; 
                
                return (
                  <div key={jour} className="transition-all duration-300 group">
                    <button 
                      onClick={() => toggleDay(jour)}
                      className={`flex items-center justify-between w-full px-4 md:px-6 py-4 transition-colors ${isOpen ? 'bg-primary/5' : 'bg-white hover:bg-black/[0.02]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${isOpen ? 'bg-primary text-white shadow-sm' : 'bg-black/5 text-black/40 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                          <Calendar size={18}/>
                        </div>
                        <div className="text-left">
                          <h3 className={`text-sm md:text-base font-bold tracking-tight uppercase ${isOpen || isToday ? 'text-black' : 'text-black/60'}`}>
                            {jour}
                          </h3>
                          <p className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest">{coursDuJour.length} séance(s)</p>
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-4 py-4 border-t border-black/5 bg-black/[0.01] md:px-6">
                        {coursDuJour.length > 0 ? (
                          <div className="space-y-3">
                            {coursDuJour.map((seance) => (
                              <div key={seance.id} className="flex flex-col items-start gap-4 p-3 transition-colors bg-white border shadow-sm sm:flex-row sm:items-center border-black/5 rounded-xl hover:border-primary/30 group/seance">
                                
                                <div className="flex items-center gap-2 min-w-[120px] px-3 py-1.5 bg-black/[0.02] border border-black/5 rounded-lg shrink-0 text-black font-bold text-xs">
                                  <Clock size={14} className="transition-colors text-primary"/>
                                  {seance.heure_debut} - {seance.heure_fin}
                                </div>

                                <div className="flex-1 text-sm font-bold text-black transition-colors group-hover/seance:text-primary line-clamp-1">
                                  {seance.module?.nom || "Module non défini"}
                                </div>

                                <div className="flex items-center w-full gap-3 sm:w-auto">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                    <MapPin size={14} /> 
                                    <span className="text-[10px] md:text-xs font-bold">Salle {seance.salle?.nom || "N/A"}</span>
                                  </div>
                                  <button 
                                    onClick={() => deleteSeance(seance.id)} 
                                    className="p-1.5 ml-auto sm:ml-0 text-black/30 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                    title="Supprimer la séance"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-6 bg-white border border-dashed border-black/5 rounded-xl">
                            <span className="text-xs font-medium text-black/40">Aucun cours planifié pour ce jour.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL AJOUT COURS ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg overflow-hidden bg-white border shadow-2xl border-black/5 rounded-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-black/[0.02]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                <Calendar size={20} className="text-primary" /> Planifier un cours
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5"><X size={20}/></button>
            </div>
            
            <form onSubmit={createSeance} className="p-6 space-y-5 md:p-8">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Jour de la semaine</label>
                <div className="relative">
                  <select value={formData.jour} onChange={e => setFormData({...formData, jour: e.target.value})} className="w-full px-4 py-3 text-sm font-bold text-black bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {joursOrdre.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Heure de début</label>
                  <input type="time" required value={formData.heure_debut} onChange={e => setFormData({...formData, heure_debut: e.target.value})} className="w-full px-4 py-3 text-sm font-bold text-black bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Heure de fin</label>
                  <input type="time" required value={formData.heure_fin} onChange={e => setFormData({...formData, heure_fin: e.target.value})} className="w-full px-4 py-3 text-sm font-bold text-black bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Module enseigné</label>
                <div className="relative">
                  <select required value={formData.module_id} onChange={e => setFormData({...formData, module_id: e.target.value})} className="w-full px-4 py-3 text-sm font-bold text-black bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">Sélectionner un module...</option>
                    {currentModules.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Salle de cours</label>
                <div className="relative">
                    <select required value={formData.salle_id} onChange={e => setFormData({...formData, salle_id: e.target.value})} className="w-full px-4 py-3 text-sm font-bold text-black bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="">Choisir une salle...</option>
                        {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-black/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-black bg-white border border-black/5 rounded-xl hover:bg-black/5 transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null} Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL GESTION SALLES ================= */}
      {showSalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSalleModal(false)}>
           <div className="w-full max-w-sm overflow-hidden bg-white border shadow-2xl border-black/5 rounded-3xl" onClick={e => e.stopPropagation()}>
             <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-black/[0.02]">
               <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                 <Building size={20} className="text-secondary" /> Gestion des Salles
               </h2>
               <button onClick={() => setShowSalleModal(false)} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5"><X size={20}/></button>
             </div>
             
             <div className="p-6 space-y-5 md:p-8">
                <div className="pr-2 space-y-2 overflow-y-auto max-h-48 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {salles.length === 0 && <p className="py-4 text-[11px] italic text-center text-black/40">Aucune salle enregistrée.</p>}
                    {salles.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 text-sm font-bold text-black transition-colors border bg-black/[0.02] border-black/5 rounded-xl group hover:border-primary/30">
                            <span className="flex items-center gap-2"><MapPin size={14} className="text-black/30 group-hover:text-primary" /> {s.nom}</span>
                            <button onClick={() => deleteSalle(s.id)} className="p-1.5 text-black/30 hover:text-white hover:bg-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
                
                <div className="pt-5 border-t border-black/5">
                    <label className="ml-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Ajouter une salle</label>
                    <div className="flex gap-2 mt-2">
                        <input type="text" placeholder="Ex: Amphi B" value={newSalle} onChange={(e) => setNewSalle(e.target.value)} className="flex-1 px-4 py-2.5 text-sm font-bold text-black bg-white border border-black/10 shadow-sm outline-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        <button onClick={createSalle} disabled={!newSalle.trim() || saving} className="px-4 text-white transition-colors shadow-sm bg-secondary rounded-xl hover:bg-secondary/90 disabled:opacity-50">
                            <Plus size={20}/>
                        </button>
                    </div>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}