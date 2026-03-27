import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Search, Plus, Edit, Trash2, Loader2, X, 
  FolderOpen, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import api from "../../services/api";

export default function AdminBibliotheque() {
  const [themes, setThemes] = useState([]);
  const [formations, setFormations] = useState([]);
  
  // État pour gérer l'expansion des cartes
  const [expanded, setExpanded] = useState(null);
  
  const [search, setSearch] = useState("");
  const [selectedFormationFilter, setSelectedFormationFilter] = useState("Tous");
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ id: null, titre: "", description: "", formation_id: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [themesRes, formationsRes] = await Promise.all([
        api.get("/admin/themes"),
        api.get("/admin/formations")
      ]);
      setThemes(themesRes.data);
      setFormations(formationsRes.data || []);
    } catch (error) {
      console.error("Erreur chargement", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpanded(expanded === id ? null : id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim() || !formData.formation_id) return;
    
    setIsSaving(true);
    try {
      if (formData.id) {
        await api.put(`/admin/themes/${formData.id}`, formData);
      } else {
        await api.post("/admin/themes", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur de sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e, id, titre) => {
    e.stopPropagation();
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le thème "${titre}" ?`)) return;
    try {
      await api.delete(`/admin/themes/${id}`);
      fetchData();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  const openModal = (e = null, theme = null) => {
    if (e) e.stopPropagation();
    if (theme) {
      setFormData({ 
        id: theme.id, 
        titre: theme.titre, 
        description: theme.description || "",
        formation_id: theme.formation_id || "" 
      });
    } else {
      setFormData({ id: null, titre: "", description: "", formation_id: "" });
    }
    setIsModalOpen(true);
  };

  const filteredThemes = useMemo(() => {
    return themes.filter(t => {
      const matchSearch = t.titre.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      const matchFormation = selectedFormationFilter === "Tous" || String(t.formation_id) === String(selectedFormationFilter);
      return matchSearch && matchFormation;
    });
  }, [themes, search, selectedFormationFilter]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background font-sans">
      
      {/* ===== BANNIÈRE (HERO) ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Bibliothèque des Thèmes
            </h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Gérez et archivez les sujets de soutenance par spécialité.
            </p>
          </div>
          
          <button 
            onClick={() => openModal()} 
            className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3}/> <span>Nouveau thème</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ET FILTRES (1 LIGNE SUR DESKTOP) ===== */}
        <div className="flex flex-col justify-between gap-3 p-3 bg-white border-b xl:flex-row xl:items-center md:gap-4 md:p-4 shrink-0 border-black/5">
            
            {/* GROUPE GAUCHE : Recherche + Spécialités */}
            <div className="flex flex-col items-center w-full gap-3 sm:flex-row xl:w-auto">
              
              {/* Barre de Recherche (réduite) */}
              <div className="flex items-center w-full gap-3 sm:w-auto">
                <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64 lg:w-72 group">
                  <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un thème..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                  />
                </div>
                
                {/* Bouton Ajouter : Uniquement sur Mobile */}
                <button 
                  onClick={() => openModal()}
                  className="flex sm:hidden items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-primary shadow-sm rounded-xl hover:opacity-90 active:scale-95 shrink-0"
                >
                  <Plus size={16} strokeWidth={3} /> Ajouter
                </button>
              </div>

              {/* Sélecteur de Spécialités (Liste déroulante comme demandé) */}
              <div className="relative w-full sm:w-56 shrink-0">
                <select 
                  value={selectedFormationFilter} 
                  onChange={e => setSelectedFormationFilter(e.target.value)} 
                  className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-xs md:text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="Tous">Toutes les spécialités</option>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
              </div>
            </div>

            {/* GROUPE DROITE : Compteur */}
            <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {filteredThemes.length} <span className="hidden xl:inline">Thème(s) trouvé(s)</span>
            </div>
        </div>

        {/* ===== LISTE DES THÈMES ===== */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/[0.01]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Chargement de la bibliothèque...</p>
            </div>
          ) : filteredThemes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredThemes.map((theme) => (
                <div key={theme.id} className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-black/5 rounded-2xl hover:border-primary/30 hover:shadow-sm">
                  <div onClick={(e) => theme.description && toggleExpand(e, theme.id)} className={`flex items-center gap-3 p-3 md:p-4 group ${theme.description ? 'cursor-pointer' : ''}`}>
                    <div className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-black/[0.03] border border-black/5 flex items-center justify-center transition-colors group-hover:bg-primary/5">
                      <FolderOpen size={22} className="transition-colors text-black/30 group-hover:text-primary" />
                    </div>

                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-black truncate transition-colors md:text-base group-hover:text-primary">{theme.titre}</h3>
                      <p className="text-[10px] md:text-xs font-medium text-black/50 truncate mt-0.5">{theme.formation?.nom || "Spécialité non assignée"}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 transition-opacity opacity-100 md:opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => openModal(e, theme)} className="p-2 text-black transition-colors rounded-lg bg-black/5 hover:text-primary hover:bg-primary/10" title="Modifier"><Edit size={14} /></button>
                        <button onClick={(e) => handleDelete(e, theme.id, theme.titre)} className="p-2 text-black transition-colors rounded-lg bg-black/5 hover:text-red-50 hover:bg-red-50" title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                      {theme.description && (
                        <div className={`p-1.5 rounded-lg transition-colors border ${expanded === theme.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-transparent border-transparent text-black/40 group-hover:text-primary"}`}>
                          {expanded === theme.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      )}
                    </div>
                  </div>

                  {expanded === theme.id && theme.description && (
                    <div className="p-4 pt-0 border-t md:p-5 border-black/5 bg-black/[0.01] animate-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Description du thème</h4>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-black/70">
                        {theme.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center border-2 border-dashed border-black/5 rounded-3xl bg-black/[0.02]">
              <AlertCircle className="mb-4 text-black/20" size={48} />
              <h3 className="text-sm font-bold text-black/50">Aucun thème</h3>
              <p className="mt-1 text-xs text-black/30">Aucun résultat pour cette recherche ou cette spécialité.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden duration-200 bg-white shadow-2xl rounded-[2rem] animate-in zoom-in-95 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-black/[0.01]">
              <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                <BookOpen size={24} className="text-primary" />
                {formData.id ? "Modifier le thème" : "Nouveau thème"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 transition-colors rounded-full text-black/40 hover:text-black hover:bg-black/5"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Spécialité concernée</label>
                <div className="relative">
                  <select 
                    required 
                    value={formData.formation_id} 
                    onChange={e => setFormData({ ...formData, formation_id: e.target.value })}
                    className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/30"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Titre du thème</label>
                <input 
                  type="text" required placeholder="Ex: Étude de l'architecture micro-services..." 
                  value={formData.titre} 
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Description (Optionnel)</label>
                <textarea 
                  rows="4" placeholder="Détaillez les objectifs ou le périmètre du sujet..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-black transition-colors bg-white border shadow-sm border-black/5 rounded-2xl hover:bg-black/5">Annuler</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={20}/> : <BookOpen size={20}/>}
                  {isSaving ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}