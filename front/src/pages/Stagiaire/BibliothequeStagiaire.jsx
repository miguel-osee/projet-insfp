import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Folder, MapPin, Loader2 } from 'lucide-react';
import api from "../../services/api";

const THEME_COLORS = [
  { couleur: "text-blue-500", bg: "bg-blue-500/10" },
  { couleur: "text-purple-500", bg: "bg-purple-500/10" },
  { couleur: "text-yellow-600", bg: "bg-yellow-600/10" },
  { couleur: "text-green-500", bg: "bg-green-500/10" },
  { couleur: "text-red-500", bg: "bg-red-500/10" },
];

export default function StagiaireBibliotheque() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      const titreSafe = theme.titre || ""; 
      const descSafe = theme.description || "";
      return titreSafe.toLowerCase().includes(search.toLowerCase()) || descSafe.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, themes]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE ===== */}
      <div className="relative w-full h-[140px] md:h-[200px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Catalogue de la Bibliothèque
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">
              Consultez l'index des thèmes de soutenance et anciens projets archivés. Repérez les sujets qui vous intéressent pour aller les demander sur place à la bibliothèque.
            </p>
          </div>
        </div>
      </div>

      {/* ===== ZONE DE CONTENU ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* Barre d'outils */}
        <div className="flex items-center justify-between p-4 border-b shrink-0 border-black/5">
          <h2 className="hidden text-lg font-bold text-secondary sm:block">Archives disponibles</h2>
          
          <div className="relative w-full sm:w-72 group">
            <Search size={18} className="absolute -translate-y-1/2 text-black/40 left-3 top-1/2" />
            <input 
              type="text" 
              placeholder="Chercher un thème ou un mot-clé..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/[0.02] border border-black/5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Grille des Thèmes */}
        <div className="flex-1 p-4 overflow-y-auto md:p-6 [scrollbar-width:none]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-primary">
              <Loader2 size={40} className="mb-4 animate-spin" />
              <p className="text-sm font-bold tracking-widest uppercase text-black/40">Recherche dans les archives...</p>
            </div>
          ) : filteredThemes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredThemes.map((theme, index) => {
                const colorStyle = THEME_COLORS[index % THEME_COLORS.length];

                return (
                  <div 
                    key={theme.id} 
                    className="flex flex-col h-full p-5 transition-all bg-white border shadow-sm rounded-2xl border-black/5 hover:shadow-md hover:border-black/10 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorStyle.bg} ${colorStyle.couleur} transition-transform group-hover:scale-110 duration-300 shrink-0`}>
                        <Folder size={24} strokeWidth={2} />
                      </div>
                      
                      {/* 🚀 Le petit badge pour indiquer que c'est physique */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-black/[0.03] text-black/50 rounded-lg border border-black/5 shrink-0">
                        <MapPin size={12} />
                        Sur place
                      </div>
                    </div>
                    
                    <h3 className="mb-2 text-base font-bold text-secondary">
                      {theme.titre}
                    </h3>
                    
                    {/* J'ai retiré le line-clamp pour que le stagiaire puisse lire tout le résumé du thème directement ici */}
                    <p className="flex-1 mt-1 text-sm leading-relaxed text-black/60">
                      {theme.description || <span className="italic opacity-50">Aucun résumé disponible pour ce thème.</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <BookOpen size={48} className="mb-4 text-black/20" />
              <p className="text-lg font-bold text-secondary">Aucun thème trouvé</p>
              <p className="text-sm text-black/60">Essayez une autre recherche ou vérifiez auprès de l'administration.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}