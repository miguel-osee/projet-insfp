import { useEffect, useState } from "react";
import { 
  CheckCircle, Clock, Lock, Award, Loader2, AlertCircle, HelpCircle
} from "lucide-react";
import api from "../../services/api";

export default function Semestres() {
  const totalSemestres = 5;
  
  const [semestreActuelAdministratif, setSemestreActuelAdministratif] = useState(() => {
    const userStr = localStorage.getItem("user");
    const infoStr = localStorage.getItem("stagiaire_info");
    
    let user = {};
    let info = {};

    try {
      if (userStr) user = JSON.parse(userStr);
      if (infoStr) info = JSON.parse(infoStr);
    } catch (e) {
      console.error("Erreur parsing localStorage", e);
    }

    const stagiaireData = info.semestre ? info : (user.stagiaire || {});
    return parseInt(stagiaireData.semestre?.numero || 1);
  });
  
  const [loading, setLoading] = useState(true);
  const [notesData, setNotesData] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const fetchMoyennes = async () => {
      setLoading(true);
      try {
        const resNotes = await api.get("/stagiaire/moyennes");
        const moyennes = resNotes.data || [];
        
        const fetchedNotes = {};
        if (moyennes.length > 0) {
          moyennes.forEach(m => {
            const num = parseInt(m.semestre?.numero || m.semestre_id);
            if (num) fetchedNotes[num] = m; 
          });
        }
        
        if (isMounted) {
          setNotesData(fetchedNotes);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des notes:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMoyennes();
    
    return () => { isMounted = false; };
  }, []);

  const generateSemestres = () => {
    return Array.from({ length: totalSemestres }, (_, i) => {
      const num = i + 1;
      const note = notesData[num];
      
      let statut = "";
      let progression = 0;

      if (num === semestreActuelAdministratif) {
        if (note) {
           statut = "actuel_rattrapage";
           progression = 100;
        } else {
           statut = "en cours";
           progression = 65; 
        }
      } else if (num < semestreActuelAdministratif) {
        if (note) {
          statut = parseFloat(note.valeur) >= 10 ? "validé" : "rattrapage";
          progression = 100;
        } else {
          statut = "manquant";
          progression = 100;
        }
      } else {
        statut = "à venir";
        progression = 0;
      }

      return { numero: num, statut, progression, note };
    });
  };

  const semestres = generateSemestres();
  const progressionGlobale = Math.round(((semestreActuelAdministratif - 1) / totalSemestres) * 100);

  const getStatusConfig = (statut) => {
    switch (statut) {
      case "validé":
        return { label: "Validé", icon: <CheckCircle size={14} />, bgColor: "bg-primary/10", textColor: "text-primary", barColor: "bg-primary", containerBorder: "border-primary/20" };
      case "rattrapage":
        return { label: "En Rattrapage", icon: <AlertCircle size={14} />, bgColor: "bg-amber-50", textColor: "text-amber-600", barColor: "bg-amber-500", containerBorder: "border-amber-200" };
      case "actuel_rattrapage":
        return { label: "Actuel (Rattrapage)", icon: <AlertCircle size={14} />, bgColor: "bg-red-50", textColor: "text-red-600", barColor: "bg-red-500", containerBorder: "border-red-300" };
      case "en cours":
        return { label: "En cours", icon: <Clock size={14} />, bgColor: "bg-black/5", textColor: "text-black", barColor: "bg-black/80", containerBorder: "border-black/20" };
      case "manquant":
        return { label: "En attente", icon: <HelpCircle size={14} />, bgColor: "bg-black/[0.02]", textColor: "text-black/50", barColor: "bg-black/20", containerBorder: "border-black/10" };
      default:
        return { label: "Verrouillé", icon: <Lock size={14} />, bgColor: "bg-black/[0.02]", textColor: "text-black/30", barColor: "bg-black/5", containerBorder: "border-black/5" };
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
{/* ===== BANNIÈRE HERO ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Award size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Progression du Cursus
            </h1>
            <p className="max-w-xl text-xs font-medium leading-relaxed md:text-sm text-white/80">
              Niveau actuel : <span className="font-bold text-white">Semestre {semestreActuelAdministratif}</span>.
              Suivez votre avancée académique.
            </p>
          </div>
          
          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10 shrink-0">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Avancement</span>
              <span className="block text-5xl font-bold leading-none tracking-tighter text-white md:text-6xl">
                {progressionGlobale}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ZONE DE CONTENU ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        <div className="flex-1 p-2 space-y-0 overflow-y-auto md:p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : (
            <div className="flex flex-col justify-between h-full divide-y divide-black/5">
              {semestres.map((semestre) => {
                const config = getStatusConfig(semestre.statut);
                const isLocked = semestre.statut === "à venir";

                return (
                  // MODIFICATION ICI : flex-row forcé et align-center pour compacter la ligne
                  <div key={semestre.numero} className="group relative flex flex-row items-center justify-between p-3.5 md:p-6 transition-colors hover:bg-black/[0.02] bg-white flex-1">
                    
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className={`relative flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl font-bold text-base md:text-xl shrink-0 transition-transform shadow-sm border ${
                        isLocked ? "bg-black/[0.02] text-black/20 border-black/5 shadow-none" : `bg-white text-secondary ${config.containerBorder} group-hover:scale-105`
                      }`}>
                        S{semestre.numero}
                        {!isLocked && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow-sm ${config.barColor}`} />
                        )}
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h2 className={`text-sm md:text-base font-bold transition-colors ${isLocked ? "text-black/30" : "text-black"}`}>
                          Semestre {semestre.numero}
                        </h2>
                        <div className={`flex items-center gap-1.5 mt-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider w-fit border border-transparent ${config.bgColor} ${config.textColor}`}>
                          {config.icon}
                          {config.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      {semestre.note ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Moyenne</span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-lg md:text-2xl font-bold ${config.textColor}`}>
                              {semestre.note.valeur}
                            </span>
                            <span className="text-[10px] font-bold md:text-sm text-black/30">/ 20</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 sm:w-32">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest">Comp.</span>
                            <span className={`text-[9px] md:text-xs font-bold ${isLocked ? "text-black/20" : "text-black/60"}`}>{semestre.progression}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                            <div className={`h-1.5 transition-all duration-700 rounded-full ${config.barColor}`} style={{ width: `${semestre.progression}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}