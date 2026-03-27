import { useEffect, useState, useMemo } from "react";
import { 
  Plus, Calendar, Clock, MapPin, Loader2, X, ChevronDown, 
  Trash2, Building, CalendarDays, Save
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

  const joursOrdre = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const jourActuel = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][new Date().getDay()];
  
  const [openDay, setOpenDay] = useState(joursOrdre.includes(jourActuel) ? jourActuel : "Lundi");

  const [formData, setFormData] = useState({
    formation_id: "",
    semestre: 1,
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
    setOpenDay(prev => prev === jour ? null : jour);
  };

  const handleOpenModal = () => {
    setFormData({
      formation_id: selectedFormationId || (formations.length > 0 ? formations[0].id : ""),
      semestre: selectedSemestre || 1,
      jour: openDay || "Lundi",
      heure_debut: "08:30",
      heure_fin: "10:30",
      module_id: "",
      salle_id: "" 
    });
    setShowModal(true);
  };

  const createSeance = async (e) => {
    e.preventDefault();
    if (!formData.formation_id || !formData.module_id || !formData.salle_id || !formData.heure_debut || !formData.heure_fin) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/admin/emplois", formData);
      
      if (Number(formData.formation_id) === Number(selectedFormationId) && Number(formData.semestre) === Number(selectedSemestre)) {
        const res = await api.get(`/admin/emplois`, { params: { formation_id: selectedFormationId, semestre: selectedSemestre } });
        setEmplois((res.data || []).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)));
        setOpenDay(formData.jour);
      }
      
      setShowModal(false);
    } catch (error) { alert("Erreur lors de l'ajout."); } 
    finally { setSaving(false); }
  };

  const deleteSeance = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;
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
    } catch (error) { alert("Erreur lors de l'ajout de la salle."); } 
    finally { setSaving(false); }
  };

  const deleteSalle = async (id) => {
    if (!window.confirm("Supprimer cette salle ? Les cours qui y sont affectés pourraient être impactés.")) return;
    try {
        await api.delete(`/admin/salles/${id}`);
        setSalles(salles.filter(s => s.id !== id));
    } catch (error) { alert("Erreur lors de la suppression."); }
  }

  const modalModules = useMemo(() => {
    const activeForm = formations.find(f => f.id === Number(formData.formation_id));
    return activeForm?.semestres?.find(s => s.numero === Number(formData.semestre))?.modules || [];
  }, [formations, formData.formation_id, formData.semestre]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background font-sans">
      
      {/* ===== HERO BANNER ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <CalendarDays size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:text-4xl">Planification des Cours</h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Gérez les emplois du temps hebdomadaires et l'occupation des salles.
            </p>
          </div>
          
          <div className="items-center hidden gap-3 md:flex shrink-0">
            <button 
              onClick={() => setShowSalleModal(true)} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold transition-all border bg-white/5 border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 active:scale-95"
            >
              <Building size={18} /> <span>Salles</span>
            </button>
            <button 
              onClick={handleOpenModal} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all shadow-sm bg-primary rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> <span>Nouveau cours</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ET FILTRES ===== */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:flex-row md:items-center md:justify-between md:p-4 shrink-0 border-black/5">
            
            <div className="flex items-center w-full gap-2 md:w-auto shrink-0">
              {/* MODIFICATION : sm:w-56 pour réduire la taille sur Desktop */}
              <div className="relative flex-1 sm:flex-none sm:w-56 shrink-0">
                <select 
                  value={selectedFormationId} 
                  onChange={(e) => setSelectedFormationId(Number(e.target.value))} 
                  className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-xs md:text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all "
                >
                  <option value="" disabled>Spécialité...</option>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
              </div>

              {/* BOUTONS MOBILE */}
              <div className="flex md:hidden items-center gap-1.5 shrink-0">
                 <button onClick={() => setShowSalleModal(true)} className="p-2.5 bg-black/[0.02] border border-black/5 text-black/60 hover:text-primary transition-colors rounded-xl shadow-sm"><Building size={18} /></button>
                 <button onClick={handleOpenModal} className="p-2.5 bg-primary text-white rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all"><Plus size={18} strokeWidth={3} /></button>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:justify-end gap-3 overflow-x-auto [scrollbar-width:none]">
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSemestre(s)} 
                    className={`px-4 py-2 sm:py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSemestre === s 
                      ? "bg-secondary text-white shadow-sm" 
                      : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    S{s}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl shrink-0 tracking-widest">
                {emplois.length} séance(s)
              </div>
            </div>
        </div>

        {/* ===== LISTE DES EMPLOIS DU TEMPS ===== */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] bg-black/[0.01]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full py-12">
               <Loader2 className="mb-3 text-primary animate-spin" size={40}/>
               <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Synchronisation...</p>
             </div>
          ) : (
            <div className="divide-y divide-black/5">
              {joursOrdre.map((jour) => {
                const coursDuJour = emplois.filter(e => e.jour === jour);
                const isOpen = openDay === jour;
                
                return (
                  <div key={jour}>
                    <button 
                      onClick={() => toggleDay(jour)} 
                      className={`flex items-center justify-between w-full px-4 md:px-6 py-4 transition-colors ${isOpen ? 'bg-black/[0.02]' : 'bg-white hover:bg-black/[0.02]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${isOpen ? 'bg-primary text-white shadow-sm' : 'bg-black/5 text-black/40'}`}>
                          <Calendar size={18}/>
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-bold tracking-tight uppercase md:text-base">{jour}</h3>
                          <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">{coursDuJour.length} séance(s)</p>
                        </div>
                      </div>
                      
                      <div className={`text-black/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} />
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-4 py-4 border-t border-black/5 bg-black/[0.02] md:px-6 space-y-3">
                        {coursDuJour.length > 0 ? (
                          coursDuJour.map((seance) => (
                            <div key={seance.id} className="flex flex-col gap-3 p-3 transition-colors bg-white border shadow-sm sm:flex-row sm:items-center border-black/5 rounded-2xl hover:border-primary/20 group">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-xl text-black font-bold text-xs shrink-0">
                                <Clock size={14} className="text-black/50" />
                                {seance.heure_debut} - {seance.heure_fin}
                              </div>
                              <div className="flex-1 text-sm font-bold text-secondary line-clamp-1">
                                {seance.module?.nom || "Module non défini"}
                              </div>
                              <div className="flex items-center justify-between gap-3 pt-2 mt-1 border-t shrink-0 sm:border-t-0 border-black/5 sm:pt-0 sm:mt-0">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold border border-primary/10">
                                    <MapPin size={14} /> {seance.salle?.nom}
                                  </div>
                                  <button onClick={() => deleteSeance(seance.id)} className="p-2 transition-colors rounded-lg bg-black/5 text-black/40 group-hover:text-red-500 hover:bg-red-50 hover:border-red-200">
                                    <Trash2 size={16}/>
                                  </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="p-4 text-[11px] font-medium text-center italic text-black/40 border border-dashed rounded-2xl border-black/10 bg-white">
                            Aucune séance programmée ce jour.
                          </p>
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

      {/* MODALE AJOUT ET SALLES RESTENT LES MÊMES */}
      {/* ... (Code des modales ici) */}
    </div>
  );
}