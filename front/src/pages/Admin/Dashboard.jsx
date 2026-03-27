import { useEffect, useState } from "react";
import { 
  Users, GraduationCap, BookOpen, Calendar, 
  ArrowRight, LayoutDashboard, Newspaper, FileUp, 
  Loader2, Activity, CheckCircle2, ChevronRight, Pencil
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    stagiaires: 0, formations: 0, documents: 0, actualites: 0, themes: 0 
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [allFormations, setAllFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  // Fonction pour retirer les balises HTML de la description
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [resStats, resArticles, resFormations] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/actualites").catch(() => ({ data: [] })),
          api.get("/admin/formations").catch(() => ({ data: [] }))
        ]);
        
        if (isMounted) {
          setStats(resStats.data);
          setRecentArticles(Array.isArray(resArticles.data) ? resArticles.data.slice(0, 3) : []);
          setAllFormations(Array.isArray(resFormations.data) ? resFormations.data : []);
        }
      } catch (error) {
        console.error("Erreur dashboard :", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    // 🔓 Scroll naturel activé
    <div className="container mx-auto flex flex-col gap-4 md:gap-6 p-3 md:p-5 min-h-[calc(100dvh-70px)] md:min-h-[calc(100vh-80px)] bg-background font-sans pb-10">
      
      {/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[200px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <LayoutDashboard size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">Bonjour, {user.prenom || "Admin"}</h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Vous pilotez actuellement <span className="font-bold text-white">{stats.stagiaires} stagiaires</span> répartis sur <span className="font-bold text-white">{stats.formations} spécialités</span>.
            </p>
          </div>
          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10 shrink-0">
            <div className="text-right">
              <span className="block text-5xl font-bold leading-none tracking-tighter">{new Date().getDate()}</span>
            </div>
            <div className="flex flex-col justify-center pl-5 border-l border-white/10">
              <span className="text-sm font-bold tracking-widest uppercase">{new Date().toLocaleDateString("fr-FR", { month: "short" })}</span>
              <span className="text-xs tracking-widest uppercase text-white/50">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MILIEU : ACTIONS & ARTICLES ===== */}
      <div className="grid items-start grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        
        {/* ACTIONS RAPIDES */}
        <div className="h-full overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between p-4 border-b md:p-5 border-black/5 bg-black/[0.01]">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-black uppercase">
               <Activity className="w-4 h-4 text-primary" /> Raccourcis de gestion
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-black/5">
            <QuickAction to="/DashAdmin/Stagiaires" icon={Users} title="Inscriptions" label="Effectifs" />
            <QuickAction to="/DashAdmin/EmploisDuTemps" icon={Calendar} title="Planning" label="Emplois" />
            <QuickAction to="/DashAdmin/Documents" icon={FileUp} title="Publication" label="Ressources" />
            <QuickAction to="/DashAdmin/Articles" icon={Newspaper} title="Actualités" label="Articles" />
          </div>
        </div>

        {/* ARTICLES RÉCENTS */}
        <div className="h-full overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between p-4 border-b md:p-5 border-black/5 bg-black/[0.01]">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-black uppercase">
               <Newspaper className="w-4 h-4 text-primary" /> Dernières annonces
            </h2>
            <Link to="/DashAdmin/Articles" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Voir tout</Link>
          </div>
          <div className="flex flex-col gap-3 p-4 md:p-5">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary/20" /></div>
            ) : recentArticles.length > 0 ? recentArticles.map(art => (
              <div key={art.id} className="flex items-center justify-between p-3 transition-colors bg-black/[0.02] border border-black/5 rounded-xl group hover:border-primary/20 hover:bg-white">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg bg-black/5 shrink-0">
                    {art.image ? <img src={art.image.startsWith('http') ? art.image : `${backendUrl}${art.image}`} className="object-cover w-full h-full" alt="" /> : <Newspaper className="w-5 h-5 text-black/20" />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold truncate transition-colors text-secondary group-hover:text-primary">{art.titre}</span>
                    <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-0.5">{new Date(art.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-black/10 group-hover:text-primary" />
              </div>
            )) : <div className="py-10 text-xs font-bold tracking-widest text-center uppercase text-black/20">Aucun article récent</div>}
          </div>
        </div>
      </div>

      {/* ===== BAS : CATALOGUE DES FORMATIONS ===== */}
      <div className="overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        <div className="flex items-center justify-between p-4 border-b md:p-5 border-black/5 bg-black/[0.01]">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-black uppercase">
             <GraduationCap className="w-4 h-4 text-primary" /> Catalogue des Formations
          </h2>
          <Link to="/DashAdmin/Formations" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
            Gérer tout le catalogue
          </Link>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="flex justify-center py-10 col-span-full"><Loader2 className="animate-spin text-primary/20" /></div>
            ) : allFormations.length > 0 ? allFormations.map(form => (
              <div key={form.id} className="relative flex flex-col gap-3 p-4 transition-all border border-black/5 rounded-2xl bg-black/[0.01] hover:bg-white hover:shadow-md hover:border-primary/20 group">
                
                {/* En-tête : Image + Titre + Bouton */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 overflow-hidden transition-colors border shrink-0 bg-black/5 rounded-xl border-black/5 group-hover:border-primary/20">
                    {form.image ? (
                      <img src={form.image.startsWith('http') ? form.image : `${backendUrl}${form.image}`} className="object-cover w-full h-full" alt={form.nom} />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-black/20" />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0 pt-1">
                    <h4 className="text-sm font-bold tracking-tight truncate transition-colors text-secondary group-hover:text-primary">
                      {form.nom}
                    </h4>
                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-0.5">
                      Spécialité
                    </span>
                  </div>
                  
                  <Link 
                    to="/DashAdmin/Formations" 
                    className="p-2 transition-all bg-white border shadow-sm shrink-0 border-black/5 text-black/40 rounded-xl hover:text-primary hover:border-primary/30 hover:bg-primary/5"
                    title="Modifier cette formation"
                  >
                    <Pencil size={14} />
                  </Link>
                </div>

                {/* Description sur 2 lignes */}
                <p className="text-xs leading-relaxed text-black/50 line-clamp-2">
                  {stripHtml(form.description) || "Aucune description renseignée pour cette formation."}
                </p>

              </div>
            )) : (
              <div className="py-10 text-center border-2 border-dashed col-span-full border-black/5 rounded-2xl">
                <p className="text-xs font-bold tracking-widest uppercase text-black/20">Aucune formation disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// Composant Interne pour les tuiles de raccourcis
function QuickAction({ to, icon: Icon, title, label }) {
  return (
    <Link to={to} className="flex flex-col items-start p-4 transition-colors bg-white md:p-6 hover:bg-primary/[0.02] group">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="p-2.5 rounded-xl bg-secondary text-white shadow-sm group-hover:scale-110 transition-transform"><Icon size={20} /></div>
        <ArrowRight size={16} className="transition-all text-black/10 group-hover:text-primary group-hover:translate-x-1" />
      </div>
      <h3 className="mb-1 text-sm font-bold text-black">{title}</h3>
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={10} /> {label}
      </div>
    </Link>
  );
}