import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Loader2, Info, CalendarDays, ChevronDown } from "lucide-react";
import api from "../../services/api";

export default function EmploiDuTemps() {
  const [planning, setPlanning] = useState({});
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = JSON.parse(localStorage.getItem("stagiaire_info")) || user.stagiaire || {};
  
  // LA SOURCE DE VÉRITÉ : Le semestre administratif défini par l'Admin
  const semestreReel = parseInt(info.semestre?.numero || 1);
  
  const joursOrdre = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const nomJourAujourdhui = joursOrdre[new Date().getDay()];

  // ÉTAT POUR L'ACCORDÉON : On ouvre le jour actuel par défaut
  const [openDay, setOpenDay] = useState(nomJourAujourdhui);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!info.formation_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/stagiaire/emploi-du-temps", {
          params: { formation_id: info.formation_id, semestre: semestreReel }
        });

        const grouped = res.data.reduce((acc, s) => {
          if (!acc[s.jour]) acc[s.jour] = [];
          acc[s.jour].push(s);
          return acc;
        }, {});
        
        if (isMounted) setPlanning(grouped);
      } catch (e) { 
        console.error(e); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [info.formation_id, semestreReel]);

  const joursAvecCours = joursOrdre.filter(jour => planning[jour] && planning[jour].length > 0);

  // Fonction pour basculer l'accordéon
  const toggleDay = (jour) => {
    setOpenDay(prev => prev === jour ? null : jour);
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
{/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <CalendarDays size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Mon Emploi du Temps
            </h1>
            <p className="max-w-xl text-xs font-medium leading-relaxed md:text-sm text-white/80">
              Le planning de vos cours pour le <span className="font-bold text-white">Semestre {semestreReel}</span>.
              Spécialité : {info.formation?.nom || "Non Définie"}
            </p>
          </div>

          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10 shrink-0">
             <div className="text-right">
                <span className="block text-5xl font-bold leading-none tracking-tighter text-white md:text-6xl">
                  {joursAvecCours.length}
                </span>
             </div>
             <div className="flex flex-col justify-center pl-5 border-l border-white/10">
                <span className="text-sm font-bold tracking-widest text-white uppercase">Jours</span>
                <span className="text-xs uppercase tracking-widest text-white/50 mt-0.5">Actifs</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* ===== ZONE DE CONTENU ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl p-3 md:p-6 bg-black/[0.01]">
        
        {/* Scrollable interne */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Mise à jour du planning...</p>
            </div>
          ) : joursAvecCours.length > 0 ? (
            <div className="pb-4 space-y-3 md:space-y-4">
              {joursAvecCours.map((jour) => {
                const seances = planning[jour];
                const isToday = jour === nomJourAujourdhui;
                const isOpen = openDay === jour;
                const seancesTriees = [...seances].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

                return (
                  <div
                    key={jour}
                    className={`bg-white border shadow-sm transition-all rounded-2xl overflow-hidden ${
                      isToday ? "border-primary/40 ring-1 ring-primary/5" : "border-black/5 hover:border-black/10"
                    }`}
                  >
                    {/* --- EN-TÊTE ACCORDÉON --- */}
                    <button 
                      onClick={() => toggleDay(jour)}
                      className={`flex items-center justify-between w-full p-4 md:p-6 transition-colors ${
                        isOpen ? 'bg-black/[0.02]' : 'bg-white hover:bg-black/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl font-bold text-sm md:text-base uppercase tracking-wider shrink-0 transition-all ${
                          isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : isOpen ? "bg-black/10 text-black" : "bg-black/5 text-black/40"
                        }`}>
                          {jour.substring(0, 3)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className={`text-base md:text-lg font-bold ${isToday ? "text-primary" : "text-secondary"}`}>
                              {jour}
                            </h2>
                            {isToday && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 rounded-md">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-0.5 md:mt-1">
                            {seancesTriees.length} séance(s)
                          </p>
                        </div>
                      </div>

                      {/* --- FLÈCHE --- */}
                      <div className={`text-black/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    {/* --- LISTE DES SÉANCES DÉROULANTE --- */}
                    {isOpen && (
                      <div className="flex flex-col gap-3 p-4 border-t md:p-6 lg:pl-24 lg:border-t-0 border-black/5 bg-black/[0.01]">
                        {seancesTriees.map((s, i) => (
                          <div 
                            key={i} 
                            className="flex flex-col items-start gap-3 p-3 transition-colors bg-white border shadow-sm border-black/5 sm:flex-row sm:items-center rounded-xl hover:border-primary/20 group"
                          >
                            {/* Horaires */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.02] border border-black/5 rounded-lg text-[10px] md:text-xs font-bold text-black shrink-0 transition-colors group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary">
                              <Clock size={14} className="transition-colors text-black/40 group-hover:text-primary" /> 
                              {s.heure_debut} - {s.heure_fin}
                            </div>
                            
                            {/* Module */}
                            <div className="flex-1 text-sm font-bold transition-colors text-secondary line-clamp-1 group-hover:text-primary">
                              {s.module?.nom}
                            </div>
                            
                            {/* Salle */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 text-black/60 rounded-lg text-[10px] md:text-xs font-bold shrink-0 transition-colors border border-transparent group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                              <MapPin size={14} /> 
                              Salle {s.salle?.nom}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center bg-white border border-dashed border-black/10 rounded-2xl md:rounded-3xl">
              <Info className="mb-4 text-black/20" size={48} />
              <h3 className="text-sm font-bold text-black/50">Aucun planning disponible</h3>
              <p className="max-w-xs mx-auto mt-1 text-xs font-medium text-black/40">Les cours n'ont pas encore été publiés pour le semestre {semestreReel}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}