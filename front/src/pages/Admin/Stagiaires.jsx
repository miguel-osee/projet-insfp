import { useEffect, useState, useMemo } from "react";
import { 
  UserPlus, Search, Edit3, Trash2, X, GraduationCap, 
  Mail, Hash, ChevronDown, Loader2, UserCircle, ShieldAlert, Users, Send, Lock, Key 
} from "lucide-react";
import api from "../../services/api";

export default function AdminStagiaires() {
  const [stagiaires, setStagiaires] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Filtres
  const [search, setSearch] = useState("");
  const [activeSemestre, setActiveSemestre] = useState("all");

  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", matricule: "", formation_id: "", semestre_id: "", semestre_numero: 1
  });

  useEffect(() => {
    fetchStagiaires();
    fetchFormations();
  }, []);

  const fetchStagiaires = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stagiaires");
      setStagiaires(res.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchFormations = async () => {
    try {
      const res = await api.get("/admin/formations");
      setFormations(res.data || []);
    } catch (error) { console.error(error); }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === "formation_id") {
      setFormData(prev => ({ ...prev, formation_id: value, semestre_id: "" }));
      
      if (value) {
        try {
          const response = await api.get(`/admin/formations/${value}/semestres`);
          const fetchedSemestres = response.data || [];
          const s1 = fetchedSemestres.find(s => parseInt(s.numero) === 1);
          if (s1) {
            setFormData(prev => ({ ...prev, semestre_id: s1.id, semestre_numero: 1 }));
          }
        } catch (error) { console.error(error); }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/stagiaires/${editId}`, formData);
      } else {
        const response = await api.post("/admin/stagiaires", formData);
        alert(`Succès ! Mot de passe généré : ${response.data.generated_password}`);
      }
      closeModal();
      fetchStagiaires();
    } catch (error) {
      alert("Erreur lors de l'enregistrement. Vérifiez que l'email ou le matricule n'est pas déjà utilisé.");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (stagiaire) => {
    setFormData({
      nom: stagiaire.user?.nom || "",
      prenom: stagiaire.user?.prenom || "",
      email: stagiaire.user?.email || "",
      matricule: stagiaire.matricule || "",
      formation_id: stagiaire.formation_id,
      semestre_id: stagiaire.semestre_id,
      semestre_numero: stagiaire.semestre?.numero || 1 
    });
    setEditId(stagiaire.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ nom: "", prenom: "", email: "", matricule: "", formation_id: "", semestre_id: "", semestre_numero: 1 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier stagiaire ? Cette action est irréversible.")) return;
    try {
      await api.delete(`/admin/stagiaires/${id}`);
      fetchStagiaires();
    } catch (error) { console.error(error); }
  };

  // NOUVELLE FONCTION : Réinitialisation du mot de passe
  const handleResetPassword = async (stagiaireId) => {
    if (!window.confirm("Voulez-vous générer un nouveau mot de passe provisoire pour ce stagiaire ?")) return;
    
    try {
      // Assurez-vous que cette route correspond à celle créée dans le contrôleur Laravel
      const response = await api.post(`/admin/stagiaires/${stagiaireId}/reset-password`);
      alert(`✅ Succès ! Le nouveau mot de passe du stagiaire est : ${response.data.new_password}`);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la réinitialisation du mot de passe.");
    }
  };

  const filteredStagiaires = useMemo(() => {
    return stagiaires.filter(s => {
      const searchString = search.toLowerCase();
      const nomComplet = `${s.user?.nom || ''} ${s.user?.prenom || ''}`.toLowerCase();
      const matricule = (s.matricule || '').toLowerCase();
      const matchesSearch = nomComplet.includes(searchString) || matricule.includes(searchString);
      
      const niveauActuel = parseInt(s.semestre?.numero || 1);
      const matchesSemestre = activeSemestre === "all" ? true : niveauActuel === activeSemestre;

      return matchesSearch && matchesSemestre;
    });
  }, [stagiaires, search, activeSemestre]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Users size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Annuaire des Stagiaires
            </h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Gérez les inscriptions et les profils. Le niveau (Semestre) est géré automatiquement par les notes.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <UserPlus size={18} strokeWidth={3} /> <span>Nouveau dossier</span>
          </button>
        </div>
      </div>

      {/* ===== LISTE ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ET FILTRES (1 LIGNE SUR DESKTOP) ===== */}
        <div className="flex flex-col justify-between gap-3 p-3 bg-white border-b xl:flex-row xl:items-center md:gap-4 md:p-4 shrink-0 border-black/5">
            
            {/* GROUPE GAUCHE : Recherche + Bouton Ajouter */}
            <div className="flex items-center w-full gap-3 xl:w-auto">
              <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64 lg:w-72 group">
                <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
                <input 
                  type="text" placeholder="Rechercher par nom ou matricule..." 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                />
              </div>
              
              {/* Bouton Ajouter : Uniquement sur Mobile */}
              <button 
                onClick={() => setShowModal(true)}
                className="flex md:hidden items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-primary shadow-sm rounded-xl hover:opacity-90 active:scale-95 shrink-0"
              >
                <UserPlus size={16} strokeWidth={3} /> Ajouter
              </button>
            </div>
            
            {/* GROUPE DROITE : Filtres Semestres + Compteur */}
            <div className="flex items-center justify-between w-full xl:w-auto gap-4 overflow-x-auto [scrollbar-width:none]">
              
              {/* Sélecteur de Semestres */}
              <div className="flex items-center gap-1.5 shrink-0 pb-1 sm:pb-0">
                {["all", 1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSemestre(s)}
                    className={`px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeSemestre === s 
                      ? "bg-secondary text-white shadow-sm" 
                      : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    {s === "all" ? "Tous" : `S ${s}`}
                  </button>
                ))}
              </div>

              {/* Compteur de résultats */}
              <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filteredStagiaires.length} <span className="hidden xl:inline">Stagiaire(s)</span>
              </div>

            </div>
        </div>

        {/* Tableau Responsive */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-black/40">Identité & Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-black/40 text-center">Matricule</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-black/40">Spécialité</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-black/40 text-center">Niveau Actuel</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-black/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="mx-auto mb-3 animate-spin text-primary" size={32}/><p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Chargement...</p></td></tr>
              ) : filteredStagiaires.length > 0 ? (
                filteredStagiaires.map((s) => {
                  const initiales = `${s.user?.nom ? s.user.nom[0] : ''}${s.user?.prenom ? s.user.prenom[0] : ''}`.toUpperCase();
                  
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-black/[0.01] group">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center text-[11px] font-bold rounded-xl w-10 h-10 border shrink-0 bg-black/[0.02] text-black/40 border-black/5 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                            {initiales || <UserCircle size={20}/>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">{s.user?.nom} {s.user?.prenom}</p>
                            <p className="text-[10px] text-black/40 font-medium mt-0.5">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 font-mono text-[10px] md:text-xs font-bold rounded-lg border bg-black/5 text-black/60 border-black/10">
                          {s.matricule}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <p className="text-xs font-bold text-black/80">{s.formation?.nom || "Non affecté"}</p>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[10px] md:text-xs font-bold tracking-wider text-primary uppercase border border-primary/20 rounded-lg bg-primary/10">
                          S{s.semestre?.numero || "?"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* BOUTON RÉINITIALISER LE MOT DE PASSE */}
                          <button 
                            onClick={() => handleResetPassword(s.id)} 
                            className="p-2 transition-colors border border-transparent rounded-lg text-black/30 hover:text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200" 
                            title="Réinitialiser le mot de passe"
                          >
                            <Key size={16} />
                          </button>

                          <button onClick={() => openEditModal(s)} className="p-2 transition-colors border border-transparent rounded-lg text-black/30 hover:text-primary hover:bg-primary/10 hover:border-primary/20" title="Modifier">
                            <Edit3 size={16} />
                          </button>
                          
                          <button onClick={() => handleDelete(s.id)} className="p-2 transition-colors border border-transparent rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 hover:border-red-200" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="5" className="py-24 text-center bg-black/[0.01]"><ShieldAlert className="mx-auto mb-3 text-black/20" size={40} /><p className="text-sm font-bold text-black/50">Aucun stagiaire trouvé.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL FORMULAIRE ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="w-full max-w-2xl overflow-hidden duration-200 bg-white shadow-2xl rounded-[2rem] animate-in zoom-in-95 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-black/[0.01] shrink-0">
              <h3 className="flex items-center gap-2 text-xl font-bold text-black">
                <GraduationCap className="text-primary" size={24} /> 
                {editId ? "Dossier Stagiaire" : "Nouvelle inscription"}
              </h3>
              <button onClick={closeModal} className="p-2 transition-colors rounded-full text-black/40 hover:text-black hover:bg-black/5">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 p-6 space-y-5 overflow-y-auto [scrollbar-width:none] md:p-8">
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Nom</label>
                    <input name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-bold transition-all bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Prénom</label>
                    <input name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-bold transition-all bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 ml-1 text-[10px] font-bold tracking-widest uppercase text-black/40"><Mail size={12}/> Email professionnel</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-bold transition-all bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 ml-1 text-[10px] font-bold tracking-widest uppercase text-black/40"><Hash size={12}/> Numéro Matricule</label>
                    <input name="matricule" value={formData.matricule} onChange={handleChange} className="w-full px-4 py-3.5 font-mono text-sm font-bold transition-all bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Formation suivie</label>
                    <div className="relative">
                      <select name="formation_id" value={formData.formation_id} onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-bold transition-all bg-black/[0.03] border-none outline-none appearance-none cursor-pointer rounded-2xl focus:ring-2 focus:ring-primary/20" required>
                        <option value="">Sélectionner une spécialité...</option>
                        {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Niveau Actuel</label>
                    <div className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold bg-black/[0.02] border border-black/5 rounded-2xl text-black/40 cursor-not-allowed">
                      {formData.semestre_numero ? `Semestre ${formData.semestre_numero}` : "Recherche en cours..."}
                      <Lock size={14} className="opacity-30" />
                    </div>
                  </div>
                </div>

                {!editId && formData.formation_id && (
                  <div className="p-4 mt-2 text-xs font-bold text-center border rounded-2xl bg-primary/5 text-primary border-primary/20">
                    Le niveau du stagiaire évoluera automatiquement en fonction de ses notes.
                  </div>
                )}
              </div>

              {/* FOOTER MODAL */}
              <div className="flex flex-col-reverse items-center justify-between gap-3 p-6 border-t sm:flex-row border-black/5 bg-black/[0.01] shrink-0">
                
                {/* Bouton Supprimer (Visible uniquement en édition) */}
                <div className="w-full sm:w-auto">
                  {editId && (
                    <button 
                      type="button" 
                      onClick={() => { closeModal(); handleDelete(editId); }}
                      className="flex items-center justify-center w-full gap-2 px-6 py-4 text-sm font-bold text-red-500 transition-all bg-white border shadow-sm border-black/5 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 active:scale-95"
                    >
                      <Trash2 size={18} /> Supprimer
                    </button>
                  )}
                </div>

                {/* Groupe Annuler / Publier */}
                <div className="flex items-center w-full gap-3 sm:w-auto">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 text-sm font-bold text-black transition-colors bg-white border shadow-sm sm:flex-none border-black/5 rounded-2xl hover:bg-black/5">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving || !formData.semestre_id} className="flex items-center justify-center flex-1 gap-2 px-8 py-4 text-sm font-bold text-white transition-all shadow-lg sm:flex-none bg-primary rounded-2xl shadow-primary/20 hover:opacity-90 active:scale-95 disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {editId ? "Enregistrer" : "Inscrire"}
                  </button>
                </div>

              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}