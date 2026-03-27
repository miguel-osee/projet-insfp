import { useEffect, useState, useMemo } from "react";
import { 
  FileText, Download, Calendar, FolderOpen, 
  Search, Loader2, BookOpen, FileLock2, Info, BookMarked, ChevronDown
} from "lucide-react";
import api from "../../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // 💾 Récupération des infos
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = JSON.parse(localStorage.getItem("stagiaire_info")) || user.stagiaire || {};
  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  useEffect(() => {
    let isMounted = true;
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/stagiaire/documents");
        if (isMounted) setDocuments(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erreur documents:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDocuments();
    return () => { isMounted = false; };
  }, []);

  // 🎨 Configuration des badges
  const getCategoryConfig = (type) => {
    switch (type?.toLowerCase()) {
      case "reglement": 
        return { icon: <FileLock2 size={16} strokeWidth={2.5}/>, label: "Règlement", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
      case "pedagogique": 
        return { icon: <BookOpen size={16} strokeWidth={2.5}/>, label: "Cours", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
      case "calendrier": 
        return { icon: <Calendar size={16} strokeWidth={2.5}/>, label: "Planning", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
      case "examen": 
        return { icon: <FileText size={16} strokeWidth={2.5}/>, label: "Examen", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" };
      default: 
        return { icon: <FolderOpen size={16} strokeWidth={2.5}/>, label: "Autre", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" };
    }
  };

  // 🚀 LOGIQUE DE FILTRAGE
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // 1. Doit appartenir à la formation du stagiaire (ou être général)
      const matchesFormation = !doc.formation_id || String(doc.formation_id) === String(info.formation_id);
      
      // 2. Recherche Texte
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = (doc.titre || "").toLowerCase().includes(searchStr);
      
      // 3. Filtre Catégorie
      const matchesCategory = activeCategory === "all" ? true : (doc.type || "").toLowerCase() === activeCategory;

      return matchesFormation && matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, info.formation_id, activeCategory]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">

{/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookMarked size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Mes Documents
            </h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Retrouvez l'ensemble des ressources pédagogiques et administratives liées à votre cursus.
            </p>
          </div>
        </div>
      </div>

      {/* ===== CONTENEUR PRINCIPAL ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ET FILTRES ===== */}
        <div className="z-10 flex flex-col gap-3 p-3 bg-white border-b md:flex-row md:items-center md:justify-between md:p-4 shrink-0 border-black/5">
            
            <div className="flex items-center w-full gap-3 md:w-auto">
              
              {/* Sélecteur de catégorie (Mobile uniquement) */}
              <div className="relative w-1/3 md:hidden shrink-0">
                <select 
                  value={activeCategory} 
                  onChange={e => setActiveCategory(e.target.value)} 
                  className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-3 pr-8 rounded-xl text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="all">Tous</option>
                  <option value="pedagogique">Cours</option>
                  <option value="examen">Examens</option>
                  <option value="calendrier">Plannings</option>
                  <option value="reglement">Règlements</option>
                </select>
                <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none right-2 top-1/2 text-black/40"/>
              </div>

              {/* Recherche */}
              <div className="relative flex-1 md:w-64 group shrink-0">
                <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
                <input 
                  type="text" 
                  placeholder="Chercher un document..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                />
              </div>

            </div>

            {/* Filtres de catégories (Desktop) & Compteur */}
            <div className="items-center justify-end hidden w-full gap-2 md:flex overflow-x-auto [scrollbar-width:none]">
              {[
                { id: "all", label: "Tous" },
                { id: "pedagogique", label: "Cours" },
                { id: "examen", label: "Examens" },
                { id: "calendrier", label: "Plannings" },
                { id: "reglement", label: "Règlements" }
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                    ? "bg-secondary text-white shadow-sm" 
                    : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              
              <div className="ml-2 px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filteredDocs.length} <span className="hidden lg:inline">Document(s)</span>
              </div>
            </div>
        </div>

        {/* ===== ZONE DE CONTENU ===== */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/[0.01] md:bg-white">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full py-24 text-center bg-white">
                <Loader2 className="mx-auto mb-3 animate-spin text-primary" size={40}/>
                <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Recherche de documents...</p>
             </div>
          ) : filteredDocs.length > 0 ? (
            <>
              {/* === VERSION DESKTOP (Tableau) === */}
              <table className="hidden md:table w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Titre du document</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Filière</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Catégorie</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center">Semestre</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Date d'ajout</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredDocs.map((doc) => {
                    const config = getCategoryConfig(doc.type);
                    const numSemestre = doc.semestre?.numero || doc.semestre_numero || "-";

                    return (
                      <tr key={doc.id} className="transition-colors bg-white hover:bg-black/[0.01] group">
                        
                        <td className="px-6 py-4 w-[35%]">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-12 h-12 transition-transform rounded-xl shrink-0 group-hover:scale-105 border ${config.bg} ${config.color} ${config.border}`}>
                              {config.icon}
                            </div>
                            <span className="text-sm font-bold leading-snug text-black transition-colors group-hover:text-primary line-clamp-2" title={doc.titre}>
                              {doc.titre}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg bg-black/5 text-black/60 border-black/10">
                            {doc.formation_id ? (info.formation?.nom || "Spécialité") : "Général"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-md ${config.bg} ${config.color} ${config.border}`}>
                            {config.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {numSemestre !== "-" ? (
                            <span className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-primary uppercase border border-primary/20 rounded-lg bg-primary/10">
                              S{numSemestre}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-black/30 px-3 py-1.5 bg-black/[0.02] rounded-lg border border-black/5 uppercase tracking-widest">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-[11px] font-medium text-black/50 flex items-center gap-1.5">
                            <Calendar size={12} className="opacity-70" />
                            {new Date(doc.created_at || Date.now()).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <a 
                            href={doc.fichier?.startsWith('http') ? doc.fichier : `${backendUrl}${doc.fichier}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-all bg-white border shadow-sm rounded-xl text-black border-black/10 hover:text-primary hover:bg-primary/5 hover:border-primary/30 active:scale-95" 
                            title="Ouvrir le document"
                          >
                            <Download size={16} strokeWidth={2.5} />
                            Ouvrir
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* === VERSION MOBILE (Cartes) === */}
              <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
                {filteredDocs.map((doc) => {
                  const config = getCategoryConfig(doc.type);
                  const numSemestre = doc.semestre?.numero || doc.semestre_numero || "-";

                  return (
                    <div key={doc.id} className="flex flex-col gap-3 p-4 bg-white border shadow-sm border-black/5 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl border shrink-0 ${config.bg} ${config.color} ${config.border}`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* NOUVEAU BADGE FILIÈRE SUR MOBILE */}
                            <span className="inline-block px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border bg-black/5 text-black/60 border-black/10">
                              {doc.formation_id ? (info.formation?.nom || "Spécialité") : "Général"}
                            </span>
                            <span className={`inline-block px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                              {config.label}
                            </span>
                            {numSemestre !== "-" && (
                               <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border bg-primary/10 text-primary border-primary/20">
                                 S{numSemestre}
                               </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold leading-tight text-secondary line-clamp-2">{doc.titre}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 mt-1 border-t border-black/5">
                        <span className="text-[10px] font-medium text-black/40 flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-70" />
                          {new Date(doc.created_at || Date.now()).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                        
                        <a 
                          href={doc.fichier?.startsWith('http') ? doc.fichier : `${backendUrl}${doc.fichier}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all bg-white border shadow-sm rounded-lg text-primary border-primary/20 bg-primary/5 active:scale-95" 
                        >
                          <Download size={14} strokeWidth={2.5} />
                          Ouvrir
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center bg-white">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-black/[0.02] border border-dashed rounded-full border-black/10">
                 <Info className="text-black/20" size={32} />
              </div>
              <h3 className="text-sm font-bold text-black/50">Aucun document trouvé.</h3>
              <p className="max-w-xs mx-auto mt-1 text-xs font-medium text-black/40">Modifiez vos filtres de recherche ou vérifiez plus tard.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}