import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, FolderOpen, Loader2, AlertCircle, MapPin } from 'lucide-react';
import api from "../../services/api";

export default function StagiaireBibliotheque() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 💾 1. Récupération des infos de l'étudiant depuis le localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = JSON.parse(localStorage.getItem("stagiaire_info")) || user.stagiaire || {};
  const stagiaireFormationId = info.formation_id;

  useEffect(() => {
    let isMounted = true;
    const fetchThemes = async () => {
      try {
        const res = await api.get("/stagiaire/themes"); 
        if (isMounted) setThemes(res.data);
      } catch (error) {
        console.error("Erreur de chargement des thèmes :", error.response || error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchThemes();
    return () => { isMounted = false; };
  }, []);

  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      
      // 🚀 2. FILTRE FILIÈRE : On garde si c'est la bonne filière OU si c'est un thème "général" (formation_id null)
      const isMyFormation = !theme.formation_id || String(theme.formation_id) === String(stagiaireFormationId);
      
      // Si ce n'est pas sa filière, on éjecte directement l'élément du filtre
      if (!isMyFormation) return false;

      // 3. FILTRE RECHERCHE (Titre, Description ou Nom de la formation)
      const titreSafe = theme.titre || ""; 
      const descSafe = theme.description || "";
      const formationSafe = theme.formation?.nom || "";
      
      const searchStr = search.toLowerCase();
      
      return titreSafe.toLowerCase().includes(searchStr) || 
             descSafe.toLowerCase().includes(searchStr) ||
             formationSafe.toLowerCase().includes(searchStr);
    });
  }, [search, themes, stagiaireFormationId]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE HERO ===== */}
      {/* MODIFICATION : Changement de h-[120px] à min-h-[120px] et h-auto pour le mobile pour éviter les coupures */}
{/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Catalogue de la Bibliothèque
            </h1>
            {/* MODIFICATION ICI : max-w-sm sur mobile, mais max-w-full sur desktop pour garantir 1 seule ligne */}
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Consultez l'index des thèmes de soutenance de votre filière.
            </p>
          </div>
        </div>
      </div>

      {/* ===== ZONE DE CONTENU ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ===== */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:p-4 shrink-0 border-black/5">
          <div className="flex flex-row items-center justify-between w-full gap-3">
            
            {/* Barre de Recherche */}
            <div className="relative flex-1 max-w-md group">
              <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Chercher un thème, un mot-clé..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
              />
            </div>

            {/* Compteur de résultats */}
            <div className="px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {filteredThemes.length} <span className="hidden sm:inline">Archive(s)</span>
            </div>

          </div>
        </div>

        {/* ===== LISTE DES THÈMES ===== */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/[0.01] md:bg-white">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-24 bg-white">
              <Loader2 className="mb-3 animate-spin text-primary" size={40}/>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Recherche dans les archives...</p>
            </div>
          ) : filteredThemes.length > 0 ? (
            <>
              {/* VERSION DESKTOP (Tableau) */}
              <table className="hidden md:table w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Thème de soutenance</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Filière</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center w-32">Disponibilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredThemes.map(theme => (
                    <tr key={theme.id} className="transition-colors hover:bg-black/[0.01] group">
                      <td className="w-1/3 px-6 py-4 align-top">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-black/[0.03] border border-black/5 text-black/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <FolderOpen size={18}/>
                          </div>
                          <p className="mt-2 text-sm font-bold leading-snug text-secondary">{theme.titre}</p>
                        </div>
                      </td>
                      <td className="w-1/4 px-6 py-4 pt-6 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-black/5 text-[10px] font-bold uppercase tracking-wider bg-black/5 text-black/60">
                          {theme.formation ? theme.formation.nom : "Toutes filières"}
                        </span>
                      </td>
                      <td className="px-6 py-4 pt-6 align-top">
                        <p className="max-w-xl text-xs font-medium leading-relaxed text-black/60">
                          {theme.description || <span className="italic opacity-50">Aucune description</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 pt-6 text-center align-top">
                        <div className="inline-flex items-center justify-center g p-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 shadow-sm">
                          <MapPin size={12} />
                          Sur&nbsp;place
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* VERSION MOBILE (Cartes) */}
              <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
                {filteredThemes.map(theme => (
                  <div key={theme.id} className="flex flex-col gap-3 p-4 bg-white border shadow-sm border-black/5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-black/[0.03] border border-black/5 text-primary">
                        <FolderOpen size={20} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        
                        <div className="flex items-center gap-1.5 mb-1.5 w-full">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-black/5 text-black/60 border border-black/5 truncate max-w-[65%]">
                            {theme.formation ? theme.formation.nom : "Toutes filières"}
                          </span>
                          
                          <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20 shrink-0 whitespace-nowrap">
                            <MapPin size={10} /> Sur place
                          </span>
                        </div>

                        <h3 className="text-sm font-bold leading-tight text-secondary">{theme.titre}</h3>
                      </div>
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-black/60 line-clamp-3 bg-black/[0.02] p-3 rounded-xl border border-black/5">
                      {theme.description || <span className="italic opacity-50">Aucune description disponible pour ce thème.</span>}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center bg-white">
              <AlertCircle size={48} className="mx-auto mb-4 text-black/20"/>
              <h3 className="text-sm font-bold text-black/50">Aucun thème trouvé</h3>
              <p className="mt-1 text-xs text-black/40">Aucun projet archivé pour votre filière.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}