import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  User, TrendingUp, Calendar, Clock, MapPin, 
  ArrowRight, FileText, Award, CheckCircle2, Download
} from "lucide-react";
import api from "../../services/api";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = user.stagiaire || JSON.parse(localStorage.getItem("stagiaire_info")) || {};
  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";
  
  const [todayClasses, setTodayClasses] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const totalSemestres = 5; 
  const semestreReel = parseInt(info.semestre?.numero || 1, 10);

  const academicStatus = useMemo(() => {
    return {
      numero: semestreReel,
      progression: Math.min(((semestreReel - 1) / totalSemestres) * 100, 100)
    };
  }, [semestreReel]);

  useEffect(() => {
    let isMounted = true; 
    const loadDashboardData = async () => {
      if (!info.formation_id) {
        setLoading(false);
        return;
      }
      try {
        const joursFr = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const jourAujourdhui = joursFr[new Date().getDay()];
        
        // Appel groupé pour l'agenda ET les documents
        const [resAgenda, resDocs] = await Promise.all([
          api.get("/stagiaire/emploi-du-temps", { params: { formation_id: info.formation_id, semestre: semestreReel } }),
          api.get("/stagiaire/documents").catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        // Traitement Agenda
        const allData = resAgenda.data || [];
        const filtered = allData.filter(seance => seance?.jour?.toLowerCase().trim() === jourAujourdhui.toLowerCase().trim());
        const sorted = filtered.sort((a, b) => (a.heure_debut || "00:00").localeCompare(b.heure_debut || "00:00"));
        setTodayClasses(sorted);

        // Traitement Documents (On garde les 3 derniers)
        const docs = Array.isArray(resDocs.data) ? resDocs.data : [];
        setRecentDocs(docs.slice(0, 3));

      } catch (error) { 
        console.error("Erreur lors de la récupération des données:", error); 
        if (isMounted) setTodayClasses([]);
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };
    loadDashboardData();
    return () => { isMounted = false; };
  }, [info.formation_id, semestreReel]);

  return (
    <div className="container mx-auto flex flex-col gap-4 md:gap-6 p-3 md:p-5 min-h-[calc(100dvh-70px)] md:min-h-[calc(100vh-80px)] bg-background font-sans pb-8">
      
      {/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Award size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Bonjour, {user.prenom || "Stagiaire"}
            </h1>
            <p className="max-w-xl text-xs font-medium leading-relaxed md:text-sm text-white/80">
              Bienvenue sur votre espace. Vous avez <span className="font-bold text-white">{todayClasses.length} cours</span> prévu(s) aujourd'hui.
            </p>
          </div>

          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10 shrink-0">
            <div className="text-right">
              <span className="block text-6xl font-bold leading-none tracking-tighter">
                {new Date().getDate()}
              </span>
            </div>
            <div className="flex flex-col justify-center pl-5 border-l border-white/10">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                {new Date().toLocaleDateString("fr-FR", { month: "long" })}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/50 mt-0.5">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LAYOUT DU BAS ===== */}
      <div className="flex flex-col items-start w-full gap-4 lg:flex-row md:gap-6">
        
        {/* === AGENDA DU JOUR (Moitié Gauche) === */}
        <div className="flex flex-col w-full overflow-hidden bg-white border shadow-sm lg:w-1/2 border-black/5 rounded-2xl md:rounded-3xl">
          
          {/* En-tête harmonisé */}
          <div className="flex items-center justify-between p-4 border-b md:p-5 border-black/5 bg-black/[0.01] shrink-0">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-black uppercase md:text-sm">
               <Calendar className="w-4 h-4 text-primary" /> Aujourd'hui
            </h2>
          </div>

          {/* Contenu harmonisé */}
          <div className="flex flex-col gap-3 p-4 md:p-5">
            {todayClasses.length > 0 ? (
              todayClasses.map((seance, i) => (
                <div key={i} className="flex items-center justify-between p-3 md:p-4 transition-colors bg-black/[0.02] border border-black/5 rounded-xl group hover:border-primary/20 hover:bg-white">
                  <div className="flex flex-col">
                     <h4 className="text-xs font-bold leading-snug text-black transition-colors md:text-sm group-hover:text-primary">
                       {seance.module?.nom}
                     </h4>
                     <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">
                          <Clock size={12} /> {seance.heure_debut} - {seance.heure_fin}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-black/50 uppercase tracking-widest">
                          <MapPin size={12} /> Salle {seance.salle?.nom}
                        </span>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-black/5 rounded-xl bg-black/[0.01]">
                <Clock className="w-8 h-8 mb-3 text-black/20" />
                <h3 className="text-xs font-bold tracking-widest uppercase text-black/50">Quartier libre</h3>
              </div>
            )}
          </div>
        </div>

        {/* === COLONNE DE DROITE (Moitié Droite : Actions + Documents) === */}
        <div className="flex flex-col w-full gap-4 lg:w-1/2 md:gap-6">
          
          {/* Actions Rapides Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ActionRow to="/DashStagiaire/SuiviSemestre" icon={TrendingUp} title="Notes" label="Résultats" />
            <ActionRow to="/DashStagiaire/Documents" icon={FileText} title="Fichiers" label="Documents" />
            <ActionRow to="/DashStagiaire/EmploiDuTemps" icon={Calendar} title="Agenda" label="Planning" />
            <ActionRow to="/DashStagiaire/Profil" icon={User} title="Compte" label="Profil" />
          </div>

          {/* Documents Récents */}
          <div className="flex flex-col overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
            
            {/* En-tête harmonisé */}
            <div className="flex items-center justify-between p-4 border-b md:p-5 border-black/5 bg-black/[0.01] shrink-0">
              <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-black uppercase">
                 <FileText className="w-4 h-4 text-primary" /> Récents
              </h2>
              <Link to="/DashStagiaire/Documents" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                Voir tout
              </Link>
            </div>
            
            {/* Contenu harmonisé */}
            <div className="flex flex-col gap-3 p-4 md:p-5">
              {recentDocs.length > 0 ? (
                recentDocs.map(doc => (
                  <a 
                    key={doc.id}
                    href={doc.fichier?.startsWith('http') ? doc.fichier : `${backendUrl}${doc.fichier}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 md:p-4 transition-colors bg-black/[0.02] border border-black/5 rounded-xl hover:border-primary/30 hover:bg-primary/5 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <FileText size={16} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate transition-colors text-secondary md:text-sm group-hover:text-primary">
                          {doc.titre}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest mt-0.5">
                          {new Date(doc.created_at || Date.now()).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <Download size={16} className="ml-2 transition-colors text-black/20 group-hover:text-primary shrink-0" />
                  </a>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-black/5 rounded-xl bg-black/[0.01]">
                  <FileText className="w-8 h-8 mb-3 text-black/20" />
                  <h3 className="text-xs font-bold tracking-widest uppercase text-black/50">Aucun document récent</h3>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Composant Bouton d'Action
function ActionRow({ to, icon: Icon, title, label }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center h-20 gap-1 p-3 transition-all bg-white border shadow-sm md:h-24 border-black/5 rounded-xl md:rounded-2xl hover:border-primary/30 hover:shadow-md group">
      <div className="flex items-center justify-between w-full px-1 md:px-2">
         <div className="relative flex items-center justify-center w-8 h-8 text-white transition-transform rounded-lg shadow-md md:w-9 md:h-9 bg-secondary group-hover:scale-105 shrink-0">
           <Icon className="w-4 h-4" />
         </div>
         <ArrowRight size={14} className="transition-all text-black/10 group-hover:text-primary group-hover:translate-x-1" />
      </div>
      <div className="flex flex-col items-start w-full px-1 md:px-2 mt-1.5">
        <h2 className="text-[11px] md:text-xs font-bold text-black transition-colors group-hover:text-primary leading-tight line-clamp-1 uppercase tracking-wider">{title}</h2>
        <div className="flex items-center gap-1 mt-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-primary/70 transition-colors">
          <CheckCircle2 size={10} /> {label}
        </div>
      </div>
    </Link>
  );
}