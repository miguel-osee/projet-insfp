import { useEffect, useState, useMemo } from "react";
import { 
  UserPlus, Search, Edit3, Trash2, X, GraduationCap, 
  Mail, Hash, ChevronDown, Loader2, UserCircle, ShieldAlert, Users, Send, Lock
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
      // 1. On met à jour la formation et on vide temporairement le semestre
      setFormData(prev => ({ ...prev, formation_id: value, semestre_id: "" }));
      
      // 2. 🛑 CORRECTION ICI : On a enlevé la condition "!editId". 
      // Si la filière change, on va chercher le S1 de la nouvelle filière dans tous les cas.
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
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Users size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Annuaire des Stagiaires
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">
              Gérez les inscriptions et les profils. Le niveau (Semestre) est géré automatiquement par les notes.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <UserPlus size={18} strokeWidth={3} /> <span className="hidden md:inline">Nouveau dossier</span><span className="md:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* ===== LISTE ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* BARRE D'OUTILS */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:flex-row md:items-center md:justify-between md:p-4 shrink-0 border-black/5">
            
            <div className="relative w-full md:max-w-xs group shrink-0">
              <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
              <input 
                type="text" placeholder="Rechercher un matricule ou nom..." 
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
              />
            </div>
            
            <div className="flex items-center justify-between w-full gap-4 md:justify-end overflow-x-auto [scrollbar-width:none]">
              <div className="flex items-center gap-2">
                {["all", 1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSemestre(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeSemestre === s 
                      ? "bg-secondary text-white shadow-sm" 
                      : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    {s === "all" ? "Tous" : `S${s}`}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filteredStagiaires.length} <span className="hidden lg:inline">Résultat(s)</span>
              </div>
            </div>
        </div>

        {/* Tableau */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Identité & Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center">Matricule</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Spécialité</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center">Niveau Actuel</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="mx-auto mb-3 animate-spin text-primary" size={32}/><p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Chargement...</p></td></tr>
              ) : filteredStagiaires.length > 0 ? (
                filteredStagiaires.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-black/[0.01] group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 transition-all rounded-full bg-black/5 text-black/40 shrink-0 group-hover:bg-primary/10 group-hover:text-primary">
                          <UserCircle size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">{s.user?.nom} {s.user?.prenom}</p>
                          <p className="text-[11px] font-medium text-black/50 mt-0.5">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 font-mono text-[10px] md:text-xs font-bold rounded-lg bg-black/5 border border-black/5 text-black">
                        {s.matricule}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-black/80 line-clamp-1">{s.formation?.nom || "Non affecté"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-wider text-primary uppercase border border-primary/20 rounded-lg bg-primary/10">
                        S{s.semestre?.numero || "?"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(s)} className="p-2 transition-all bg-white border rounded-lg shadow-sm text-black/40 border-black/5 hover:text-primary hover:bg-primary/5 hover:border-primary/20" title="Modifier">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 transition-all bg-white border rounded-lg shadow-sm text-black/40 border-black/5 hover:text-red-600 hover:bg-red-50 hover:border-red-200" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-24 text-center bg-black/[0.01]"><ShieldAlert className="mx-auto mb-3 text-black/20" size={40} /><p className="text-sm font-bold text-black/50">Aucun stagiaire trouvé.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL FORMULAIRE ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="w-full max-w-2xl overflow-hidden duration-200 bg-white border shadow-2xl border-black/5 rounded-3xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-6 py-5 border-b md:px-8 border-black/5 bg-black/[0.02]">
              <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                <GraduationCap className="text-primary" size={22} /> 
                {editId ? "Dossier Stagiaire" : "Nouvelle inscription"}
              </h3>
              <button onClick={closeModal} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Nom</label>
                  <input name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Prénom</label>
                  <input name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 ml-1 text-[10px] font-bold tracking-widest uppercase text-black/50"><Mail size={12}/> Email professionnel</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 ml-1 text-[10px] font-bold tracking-widest uppercase text-black/50"><Hash size={12}/> Numéro Matricule</label>
                  <input name="matricule" value={formData.matricule} onChange={handleChange} className="w-full px-4 py-3 font-mono text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Formation suivie</label>
                  <div className="relative">
                    <select name="formation_id" value={formData.formation_id} onChange={handleChange} className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                      <option value="">Sélectionner une spécialité...</option>
                      {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-4 top-1/2"/>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Niveau Actuel</label>
                  <div className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold bg-black/[0.03] border border-black/5 rounded-xl text-black/40 cursor-not-allowed">
                    {/* Affiche le nouveau semestre si la filière a été changée */}
                    {formData.semestre_numero ? `Semestre ${formData.semestre_numero}` : "Recherche en cours..."}
                    <Lock size={14} className="opacity-50" />
                  </div>
                </div>
              </div>

              {!editId && formData.formation_id && (
                <div className="p-3 mt-4 text-xs font-bold text-center border rounded-lg bg-primary/5 text-primary border-primary/20">
                  Le niveau du stagiaire évoluera automatiquement en fonction de ses notes.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-black/5">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-bold text-black bg-white border border-black/10 rounded-xl hover:bg-black/5 transition-colors shadow-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving || !formData.semestre_id} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {editId ? "Enregistrer" : "Valider l'inscription"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}