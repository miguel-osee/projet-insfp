import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Loader2, Info, CalendarDays } from "lucide-react";
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

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!info.formation_id) {
        setLoading(false);
        return;
      }
      try {
        // Plus de calcul compliqué ! On demande juste le planning du semestre administratif
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

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <CalendarDays size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Mon Emploi du Temps
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              {info.formation?.nom || "Formation"} 
              <span className="mx-2 opacity-30">•</span> 
              <span className="font-bold text-white">Semestre {semestreReel}</span>
            </p>
          </div>

          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10">
             <div className="text-right">
                <span className="block text-6xl font-bold leading-none tracking-tighter text-white">
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

      {/* ===== ZONE DE CONTENU (Scrollable interne) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Mise à jour du planning...</p>
          </div>
        ) : joursAvecCours.length > 0 ? (
          <div className="pb-4 space-y-4">
            {joursAvecCours.map((jour) => {
              const seances = planning[jour];
              const isToday = jour === nomJourAujourdhui;
              const seancesTriees = [...seances].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

              return (
                <div
                  key={jour}
                  className={`p-4 md:p-6 bg-white border shadow-sm transition-all rounded-2xl ${
                    isToday ? "border-primary/40 ring-1 ring-primary/5" : "border-black/5"
                  }`}
                >
                  <div className="flex flex-col gap-6 lg:flex-row">
                    
                    {/* --- Partie Gauche : Badge du Jour --- */}
                    <div className="flex items-center gap-4 lg:w-48 lg:shrink-0">
                      <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl font-bold text-sm md:text-base uppercase tracking-wider shrink-0 transition-all ${
                        isToday ? "bg-primary text-white shadow-lg" : "bg-black/5 text-black/30"
                      }`}>
                        {jour.substring(0, 3)}
                      </div>
                      
                      <div>
                        <h2 className={`text-base font-bold ${isToday ? "text-primary" : "text-black"}`}>
                          {jour}
                        </h2>
                        {isToday && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Aujourd'hui</p>
                        )}
                      </div>
                    </div>

                    {/* --- Partie Droite : Liste des Séances --- */}
                    <div className="flex-1 space-y-3 lg:pl-6 lg:border-l lg:border-black/5">
                      {seancesTriees.map((s, i) => (
                        <div 
                          key={i} 
                          className="flex flex-col items-start gap-3 p-4 transition-all bg-black/[0.02] border border-black/5 sm:flex-row sm:items-center rounded-xl hover:border-primary/20 hover:bg-white"
                        >
                          {/* Horaires */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/5 rounded-lg text-[10px] md:text-[11px] font-bold text-black shrink-0 shadow-sm">
                            <Clock size={14} className="text-primary" /> 
                            {s.heure_debut} - {s.heure_fin}
                          </div>
                          
                          {/* Module */}
                          <div className="flex-1 text-sm font-bold text-black line-clamp-1">
                            {s.module?.nom}
                          </div>
                          
                          {/* Salle */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] md:text-[11px] font-bold shrink-0">
                            <MapPin size={14} /> 
                            Salle {s.salle?.nom}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center border-2 border-dashed border-black/5 rounded-3xl bg-black/[0.01]">
            <Info className="mb-4 text-black/20" size={48} />
            <h3 className="text-sm font-bold text-black/50">Aucun planning disponible</h3>
            <p className="mt-1 text-xs text-black/30">Les cours n'ont pas encore été publiés pour le semestre {semestreReel}.</p>
          </div>
        )}
      </div>
    </div>
  );
}