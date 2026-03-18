import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  User, BookOpen, TrendingUp, Calendar, GraduationCap, 
  Clock, MapPin, Hash, ArrowRight, FileText, Award, CheckCircle2
} from "lucide-react";
import api from "../../services/api";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = user.stagiaire || JSON.parse(localStorage.getItem("stagiaire_info")) || {};
  
  const [todayClasses, setTodayClasses] = useState([]);
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
        
        const resAgenda = await api.get("/stagiaire/emploi-du-temps", {
          params: { formation_id: info.formation_id, semestre: semestreReel }
        });

        const allData = resAgenda.data || [];
        const filtered = allData.filter(seance => seance?.jour?.toLowerCase().trim() === jourAujourdhui.toLowerCase().trim());
        const sorted = filtered.sort((a, b) => (a.heure_debut || "00:00").localeCompare(b.heure_debut || "00:00"));
        
        if (isMounted) setTodayClasses(sorted);
      } catch (error) { 
        console.error("Erreur lors de la récupération de l'agenda:", error); 
        if (isMounted) setTodayClasses([]);
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };
    loadDashboardData();
    return () => { isMounted = false; };
  }, [info.formation_id, semestreReel]);

  const statCards = [
    { label: "Spécialité", value: info.formation?.nom || "Non affecté", icon: BookOpen, link: "/DashStagiaire/Profil" },
    { label: "Matricule", value: info.matricule || "S-0000", icon: Hash, link: "/DashStagiaire/Profil" },
    { label: "Niveau", value: `Semestre ${academicStatus.numero}`, icon: GraduationCap, link: "/DashStagiaire/SuiviSemestre" },
    { label: "Progression", value: `${Math.round(academicStatus.progression)}%`, icon: TrendingUp, link: "/DashStagiaire/SuiviSemestre" }
  ];

  return (
    // 🔒 L'overflow-hidden bloque strictement tout scroll de la page entière
    <div className="container mx-auto flex flex-col gap-3 md:gap-6 p-3 md:p-5 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background font-sans">
      
      {/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full h-[120px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Award size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Bonjour, {user.prenom || "Stagiaire"}
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              Bienvenue sur votre espace. Vous avez <span className="font-bold text-white">{todayClasses.length} cours</span> prévu(s) aujourd'hui.
            </p>
          </div>

          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10">
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

      {/* ===== CARTES KPIs ===== */}
      <div className="grid grid-cols-2 gap-2 shrink-0 md:grid-cols-4 md:gap-5">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="flex flex-col justify-between p-2.5 md:p-5 transition-all bg-white border shadow-sm border-black/5 group rounded-xl md:rounded-2xl hover:shadow-md hover:border-primary/30">
            <div className="flex items-start justify-between mb-1.5 md:mb-4">
              <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <ArrowRight className="w-4 h-4 transition-all md:w-4 md:h-4 text-black/20 group-hover:text-primary" />
            </div>
            <div>
              {/* MODIFICATION ICI : text-xs md:text-lg au lieu de text-sm md:text-2xl */}
              <h3 className="text-xs font-bold leading-tight text-black truncate md:text-lg">
                {loading ? "..." : stat.value}
              </h3>
              <p className="text-[8px] md:text-[10px] tracking-widest text-black/60 uppercase mt-0.5 md:mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== LAYOUT DU BAS (Split 50/50 Mobile & Desktop) ===== */}
      <div className="flex flex-col flex-1 min-h-0 gap-3 pb-1 lg:flex-row md:gap-6 md:pb-2">
        
        {/* === AGENDA DU JOUR === */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between p-3 border-b md:p-6 shrink-0 border-black/5 bg-black/[0.01]">
            <h2 className="flex items-center gap-2 text-xs font-bold text-black md:text-lg">
               <Calendar className="w-4 h-4 text-primary md:w-5 md:h-5" /> Agenda du jour
            </h2>
          </div>

          <div className="flex-1 p-3 overflow-y-auto md:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {todayClasses.length > 0 ? (
              todayClasses.map((seance, i) => (
                <div key={i} className="flex gap-3 mb-3 md:gap-4 group md:mb-4 last:mb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 mt-1 md:mt-1.5 rounded-full bg-primary ring-4 ring-primary/10 relative z-10" />
                    {i !== todayClasses.length - 1 && <div className="w-[2px] flex-1 bg-black/5 my-1" />}
                  </div>
                  <div className="flex-1 pb-2 md:pb-4">
                    <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 md:mb-2 bg-primary/10 px-2 md:px-2.5 py-0.5 md:py-1 rounded inline-block">
                      {seance.heure_debut} - {seance.heure_fin}
                    </p>
                    <h4 className="text-xs font-bold leading-snug text-black transition-colors md:text-base group-hover:text-primary">
                      {seance.module?.nom}
                    </h4>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-2 text-[9px] md:text-xs font-medium text-black/60">
                      <MapPin className="w-3 h-3 md:w-3 md:h-3" /> Salle {seance.salle?.nom}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-4 md:py-8 text-center border-2 border-dashed border-black/5 rounded-xl md:rounded-2xl bg-black/[0.02]">
                <Clock className="w-6 h-6 mb-2 md:w-10 md:h-10 md:mb-3 text-black/20" />
                <h3 className="text-xs font-bold text-black/60 md:text-sm">Quartier libre aujourd'hui</h3>
              </div>
            )}
          </div>
        </div>

        {/* === ACTIONS RAPIDES === */}
        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid h-full grid-cols-2 gap-2 md:gap-4">
            <ActionRow to="/DashStagiaire/SuiviSemestre" icon={TrendingUp} title="Notes" label="Résultats" />
            <ActionRow to="/DashStagiaire/Documents" icon={FileText} title="Fichiers" label="Documents" />
            <ActionRow to="/DashStagiaire/EmploiDuTemps" icon={Calendar} title="Agenda" label="Planning" />
            <ActionRow to="/DashStagiaire/Profil" icon={User} title="Compte" label="Profil" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Composant Bouton d'Action
function ActionRow({ to, icon: Icon, title, label }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center h-full gap-1.5 p-2 md:p-5 md:gap-3 transition-all xl:flex-row xl:justify-start bg-white shadow-sm border border-black/5 rounded-xl md:rounded-2xl hover:border-primary/30 hover:shadow-md group">
      <div className="relative flex items-center justify-center w-8 h-8 text-white transition-transform rounded-lg shadow-md md:w-12 md:h-12 md:rounded-xl bg-secondary group-hover:scale-105 shrink-0">
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 text-center xl:items-start xl:text-left">
        {/* MODIFICATION ICI : text-[10px] sm:text-[11px] md:text-xs */}
        <h2 className="text-[10px] sm:text-[11px] md:text-xs font-bold text-black transition-colors group-hover:text-primary leading-tight line-clamp-1">{title}</h2>
        <div className="flex items-center gap-1 mt-1 md:mt-1.5 px-1.5 md:px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-wider w-fit bg-primary/10 text-primary">
          <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> {label}
        </div>
      </div>
      <ArrowRight size={18} className="hidden transition-all xl:block text-black/10 group-hover:text-primary group-hover:translate-x-1" />
    </Link>
  );
}