import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Plus, Edit, Trash2, Loader2, X, FolderOpen, AlertCircle, ChevronDown } from 'lucide-react';
import api from "../../services/api";

export default function AdminBibliotheque() {
  const [themes, setThemes] = useState([]);
  const [formations, setFormations] = useState([]); // 🚀 État pour stocker les filières
  
  // Filtres
  const [search, setSearch] = useState("");
  const [selectedFormationFilter, setSelectedFormationFilter] = useState("Tous");
  
  const [loading, setLoading] = useState(true);

  // Gestion de la modale (Ajout / Modification)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 🚀 Ajout de formation_id dans le formulaire
  const [formData, setFormData] = useState({ id: null, titre: "", description: "", formation_id: "" });

  // ==========================================
  // 1. CHARGEMENT DES DONNÉES (Thèmes + Formations)
  // ==========================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // On charge les thèmes et les formations en même temps
      const [themesRes, formationsRes] = await Promise.all([
        api.get("/admin/themes"),
        api.get("/admin/formations")
      ]);
      setThemes(themesRes.data);
      setFormations(formationsRes.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // 2. SAUVEGARDE (AJOUT OU MODIFICATION)
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim()) return alert("Le titre est obligatoire.");
    if (!formData.formation_id) return alert("Veuillez sélectionner une filière."); // 🚀 Sécurité
    
    setIsSaving(true);
    try {
      if (formData.id) {
        await api.put(`/admin/themes/${formData.id}`, formData);
      } else {
        await api.post("/admin/themes", formData);
      }
      setIsModalOpen(false);
      fetchData(); // Recharger la liste
    } catch (error) {
      alert("Erreur lors de la sauvegarde du thème.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 3. SUPPRESSION
  // ==========================================
  const handleDelete = async (id, titre) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le thème "${titre}" ?`)) return;
    try {
      await api.delete(`/admin/themes/${id}`);
      fetchData();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  // ==========================================
  // 4. GESTION DE LA MODALE
  // ==========================================
  const openModal = (theme = null) => {
    if (theme) {
      setFormData({ 
        id: theme.id, 
        titre: theme.titre, 
        description: theme.description || "",
        formation_id: theme.formation_id || "" // 🚀 On charge la filière si c'est une modif
      });
    } else {
      setFormData({ id: null, titre: "", description: "", formation_id: "" });
    }
    setIsModalOpen(true);
  };

  // ==========================================
  // 5. FILTRAGE RECHERCHE + FILIÈRE
  // ==========================================
  const filteredThemes = useMemo(() => {
    return themes.filter(t => {
      // Filtre par texte
      const matchSearch = t.titre.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      
      // 🚀 Filtre par filière
      const matchFormation = selectedFormationFilter === "Tous" || t.formation_id == selectedFormationFilter;

      return matchSearch && matchFormation;
    });
  }, [themes, search, selectedFormationFilter]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">Gestion de la Bibliothèque</h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">Ajoutez, modifiez et classez les thèmes de soutenance par filière.</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => openModal()} 
              className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold bg-primary text-white hover:opacity-90 active:scale-95 shadow-sm rounded-xl md:rounded-2xl transition-all"
            >
              <Plus size={18}/>
              <span className="hidden sm:inline">Ajouter un thème</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== ZONE DE CONTENU ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* Barre de recherche et Filtre */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:p-4 shrink-0 border-black/5">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            
            <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto">
              {/* 🚀 Nouveau filtre par Filière */}
              <div className="relative w-full sm:w-56 shrink-0">
                <select 
                  value={selectedFormationFilter} 
                  onChange={e => setSelectedFormationFilter(e.target.value)} 
                  className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="Tous">Toutes les filières</option>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
              </div>

              <div className="relative w-full sm:w-64 group">
                <Search size={16} className="absolute -translate-y-1/2 text-black/40 left-3 top-1/2" />
                <input 
                  type="text" 
                  placeholder="Rechercher un thème..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {filteredThemes.length} <span className="hidden sm:inline">Thème(s)</span>
            </div>
          </div>
        </div>

        {/* Tableau des thèmes */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Thème de soutenance</th>
                {/* 🚀 Nouvelle colonne Filière */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Filière</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan="4" className="py-24 text-center"><Loader2 className="mx-auto mb-3 animate-spin text-primary" size={32}/><p className="text-[10px] font-bold uppercase text-black/40">Chargement...</p></td></tr>
              ) : filteredThemes.length > 0 ? (
                filteredThemes.map(theme => (
                  <tr key={theme.id} className="transition-colors hover:bg-black/[0.01] group">
                    <td className="w-1/3 px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <FolderOpen size={16} strokeWidth={2.5}/>
                        </div>
                        <p className="text-sm font-bold leading-snug text-secondary">{theme.titre}</p>
                      </div>
                    </td>
                    <td className="w-1/4 px-6 py-4 align-top">
                      {/* 🚀 Affichage du nom de la filière */}
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/5 text-black/60">
                        {theme.formation ? theme.formation.nom : "Non assignée"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="max-w-xl text-xs font-medium leading-relaxed text-black/60">
                        {theme.description || <span className="italic opacity-50">Aucune description</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center justify-center gap-1 transition-opacity opacity-100 sm:opacity-0 group-hover:opacity-100">
                        <button 
                          onClick={() => openModal(theme)} 
                          className="p-2 transition-colors rounded-lg text-black/40 hover:text-primary hover:bg-primary/10" 
                          title="Modifier"
                        >
                          <Edit size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(theme.id, theme.titre)} 
                          className="p-2 transition-colors rounded-lg text-black/40 hover:text-red-500 hover:bg-red-50" 
                          title="Supprimer"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="py-24 text-center bg-black/[0.01]"><AlertCircle size={40} className="mx-auto mb-3 text-black/20"/><h3 className="text-sm font-bold text-black/50">Aucun thème trouvé</h3></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FENÊTRE MODALE (AJOUT / MODIFICATION) ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-3xl">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
              <h2 className="text-lg font-bold text-secondary">
                {formData.id ? "Modifier le thème" : "Nouveau thème de soutenance"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 transition-colors rounded-full text-black/40 hover:text-black hover:bg-black/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5 p-6">
              
              {/* 🚀 NOUVEAU CHAMP : Choix de la filière */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-black/50">
                  Filière / Formation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    required
                    value={formData.formation_id} 
                    onChange={e => setFormData({ ...formData, formation_id: e.target.value })}
                    className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-bold text-secondary outline-none appearance-none cursor-pointer focus:border-primary focus:bg-white transition-all"
                  >
                    <option value="" disabled>Sélectionner une filière</option>
                    {formations.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-black/50">
                  Titre du thème <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Montage Vidéo & Post-production..." 
                  value={formData.titre} 
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-bold text-secondary outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-black/50">
                  Description
                </label>
                <textarea 
                  rows="4"
                  placeholder="Brève description des sujets abordés dans ce thème..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-medium text-black/70 outline-none focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-bold transition-colors text-black/50 hover:text-black hover:bg-black/5 rounded-xl"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all bg-primary hover:bg-primary/90 active:scale-95 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                  {isSaving ? "Enregistrement..." : formData.id ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}