import { useEffect, useState } from "react";
import { 
  Users, GraduationCap, BookOpen, Calendar, 
  ArrowRight, LayoutDashboard, Newspaper, FileUp, 
  Loader2, Activity, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    stagiaires: 0,
    formations: 0,
    documents: 0,
    actualites: 0,
    themes: 0 // Préparé au cas où tu ajoutes cette stat dans ton backend plus tard !
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats"); 
        if (isMounted) setStats(res.data);
      } catch (error) {
        console.error("Erreur chargement stats :", error.response);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const statCards = [
    { label: "Stagiaires", value: stats.stagiaires, icon: Users, link: "/DashAdmin/Stagiaires" },
    { label: "Formations", value: stats.formations, icon: GraduationCap, link: "/DashAdmin/Formations" },
    { label: "Documents", value: stats.documents, icon: BookOpen, link: "/DashAdmin/Documents" },
    { label: "Articles", value: stats.actualites, icon: Newspaper, link: "/DashAdmin/Articles" }
  ];

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background font-sans">
      
      {/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <LayoutDashboard size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Bonjour, {user.prenom || "Admin"}
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              Interface d'administration. Vous gérez <span className="font-bold text-white">{stats.stagiaires} stagiaires</span>.
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
      <div className="grid grid-cols-2 gap-3 shrink-0 md:grid-cols-4 md:gap-5">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="flex flex-col justify-between p-3 transition-all bg-white border shadow-sm md:p-5 border-black/5 group rounded-xl md:rounded-2xl hover:shadow-md hover:border-primary/30">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <stat.icon size={18} className="md:w-[22px] md:h-[22px]" />
              </div>
              <ArrowRight size={16} className="transition-all text-black/20 group-hover:text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight text-black truncate md:text-2xl">
                {loading ? "..." : stat.value}
              </h3>
              <p className="text-[9px] md:text-[10px] tracking-widest text-black/60 uppercase mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== LAYOUT DU BAS (Pleine largeur) ===== */}
      <div className="flex flex-col flex-1 min-h-0 pb-1 md:pb-2">
        
        {/* Actions (Scrollable) */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between p-4 border-b md:p-6 shrink-0 border-black/5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-black md:text-lg">
               <Activity className="text-primary" size={20} /> Actions Rapides
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* 🚀 Grille ajustée pour 4 éléments : 1 colonne (mobile), 2 (tablette), 4 (ordinateur) */}
            <div className="grid grid-cols-1 divide-y divide-black/5 md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
              <ActionRow to="/DashAdmin/Stagiaires" icon={Users} title="Inscrire un stagiaire" label="Effectifs" />
              <ActionRow to="/DashAdmin/EmploisDuTemps" icon={Calendar} title="Planifier les cours" label="Planning" />
              <ActionRow to="/DashAdmin/Documents" icon={FileUp} title="Publier un document" label="Ressources" />
              {/* 🚀 Nouvelle Action Rapide ajoutée ici */}
              <ActionRow to="/DashAdmin/Bibliotheque" icon={BookOpen} title="Gérer les thèmes" label="Bibliothèque" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ActionRow({ to, icon: Icon, title, label }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-4 p-6 transition-all sm:flex-row sm:justify-start md:p-8 hover:bg-black/[0.01] group h-full">
      <div className="relative flex items-center justify-center text-white transition-transform shadow-md w-14 h-14 rounded-2xl bg-secondary group-hover:scale-105 shrink-0">
        <Icon size={24} />
      </div>
      <div className="flex flex-col items-center flex-1 text-center sm:items-start sm:text-left">
        <h2 className="text-base font-bold text-black transition-colors group-hover:text-primary">{title}</h2>
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit bg-primary/10 text-primary">
          <CheckCircle2 size={12} /> {label}
        </div>
      </div>
      <ArrowRight size={20} className="hidden transition-all sm:block text-black/10 group-hover:text-primary group-hover:translate-x-1" />
    </Link>
  );
}