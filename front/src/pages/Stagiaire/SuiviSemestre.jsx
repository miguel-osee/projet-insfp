import { useEffect, useState } from "react";
import { 
  CheckCircle, Clock, Lock, Award, Loader2, AlertCircle, HelpCircle
} from "lucide-react";
import api from "../../services/api";

export default function Semestres() {
  const totalSemestres = 5;
  
  const [semestreActuelAdministratif, setSemestreActuelAdministratif] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const info = JSON.parse(localStorage.getItem("stagiaire_info")) || user.stagiaire || {};
    return parseInt(info.semestre?.numero || 1);
  });
  
  const [loading, setLoading] = useState(true);
  const [notesData, setNotesData] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const syncAndFetch = async () => {
      try {
        try {
          const userRes = await api.get("/user"); 
          const freshUser = userRes.data;
          const freshStagiaire = freshUser.stagiaire || freshUser.stagiaires; 
          
          if (isMounted && freshStagiaire) {
            const vraiSemestre = parseInt(freshStagiaire.semestre?.numero || 1);
            setSemestreActuelAdministratif(vraiSemestre);
            localStorage.setItem("user", JSON.stringify(freshUser));
            localStorage.setItem("stagiaire_info", JSON.stringify(freshStagiaire));
          }
        } catch (syncError) { console.warn("Erreur synchro:", syncError); }

        const resNotes = await api.get("/stagiaire/moyennes");
        const moyennes = resNotes.data || [];
        
        const fetchedNotes = {};
        if (moyennes.length > 0) {
          moyennes.forEach(m => {
            const num = parseInt(m.semestre?.numero || m.semestre_id);
            if (num) fetchedNotes[num] = m; 
          });
        }
        if (isMounted) setNotesData(fetchedNotes);
        
      } catch (error) {
        console.error("Erreur globale:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncAndFetch();
    return () => { isMounted = false; };
  }, []);

  // 🚀 NOUVELLE LOGIQUE VISUELLE
  const generateSemestres = () => {
    return Array.from({ length: totalSemestres }, (_, i) => {
      const num = i + 1;
      const note = notesData[num];
      
      let statut = "";
      let progression = 0;

      if (num === semestreActuelAdministratif) {
        // --- ON EST DANS SON VRAI NIVEAU ---
        if (note) {
           // S'il a une note dans son semestre actuel, c'est forcément qu'il a raté (< 10) 
           // Sinon le serveur l'aurait déjà promu au semestre suivant !
           statut = "actuel_rattrapage";
           progression = 100;
        } else {
           statut = "en cours";
           progression = 65; 
        }
      } else if (num < semestreActuelAdministratif) {
        // --- SEMESTRES DANS LE PASSÉ ---
        if (note) {
          statut = parseFloat(note.valeur) >= 10 ? "validé" : "rattrapage";
          progression = 100;
        } else {
          statut = "manquant";
          progression = 100;
        }
      } else {
        // --- SEMESTRES FUTURS (Même si on a supprimé une note) ---
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
      case "actuel_rattrapage": // <-- LE NOUVEAU BADGE SUPER CLAIR
        return { label: "Semestre Actuel (Rattrapage)", icon: <AlertCircle size={14} />, bgColor: "bg-red-50", textColor: "text-red-600", barColor: "bg-red-500", containerBorder: "border-red-300" };
      case "en cours":
        return { label: "Semestre Actuel", icon: <Clock size={14} />, bgColor: "bg-black/5", textColor: "text-black", barColor: "bg-black/80", containerBorder: "border-black/20" };
      case "manquant":
        return { label: "En attente de note", icon: <HelpCircle size={14} />, bgColor: "bg-black/[0.02]", textColor: "text-black/50", barColor: "bg-black/20", containerBorder: "border-black/10" };
      default:
        return { label: "Verrouillé", icon: <Lock size={14} />, bgColor: "bg-black/[0.02]", textColor: "text-black/30", barColor: "bg-black/5", containerBorder: "border-black/5" };
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Award size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Progression du Cursus
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              Niveau actuel : <span className="font-bold text-white">Semestre {semestreActuelAdministratif}</span>
            </p>
          </div>
          
          <div className="items-center hidden gap-5 px-8 py-5 border md:flex bg-white/5 backdrop-blur-md rounded-2xl border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Avancement</span>
              <span className="block text-6xl font-bold leading-none tracking-tighter text-white">
                {progressionGlobale}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        <div className="flex-1 p-2 space-y-0 overflow-y-auto md:p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : (
            <div className="divide-y divide-black/5">
              {semestres.map((semestre) => {
                const config = getStatusConfig(semestre.statut);
                const isLocked = semestre.statut === "à venir";

                return (
                  <div key={semestre.numero} className="group relative p-4 md:p-6 transition-all hover:bg-black/[0.01]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      
                      <div className="flex items-center flex-1 gap-4 md:gap-6">
                        <div className={`relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl font-bold text-lg md:text-xl shrink-0 transition-all border ${
                          isLocked ? "bg-black/[0.02] text-black/20 border-black/5" : `bg-white text-secondary shadow-sm ${config.containerBorder} group-hover:scale-105`
                        }`}>
                          S{semestre.numero}
                          {!isLocked && (
                            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${config.barColor}`} />
                          )}
                        </div>
                        
                        <div>
                          <h2 className={`text-base md:text-lg font-bold transition-colors ${isLocked ? "text-black/30" : "text-black"}`}>
                            Semestre {semestre.numero}
                          </h2>
                          <div className={`flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider w-fit ${config.bgColor} ${config.textColor}`}>
                            {config.icon}
                            {config.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-start pl-16 sm:pl-0 sm:justify-end sm:w-1/3">
                        {semestre.note ? (
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Moyenne</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-xl md:text-2xl font-bold ${config.textColor}`}>
                                {semestre.note.valeur}
                              </span>
                              <span className="text-xs font-bold md:text-sm text-black/30">/ 20</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 max-w-[150px]">
                            <div className="flex justify-between mb-1.5">
                              <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest">Complété</span>
                              <span className={`text-[10px] md:text-xs font-bold ${isLocked ? "text-black/20" : "text-black/60"}`}>{semestre.progression}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                              <div className={`h-1.5 transition-all duration-700 rounded-full ${config.barColor}`} style={{ width: `${semestre.progression}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
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