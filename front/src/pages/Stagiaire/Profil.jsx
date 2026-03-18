import { useState } from "react";
import {
  Mail, BookOpen, ShieldCheck, Bell, X, 
  UserCircle, BadgeCheck, Fingerprint, Award
} from "lucide-react";

export default function Profil() {
  const [showNotif, setShowNotif] = useState(true);

  // 💾 RÉCUPÉRATION BLINDÉE
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const info = JSON.parse(localStorage.getItem("stagiaire_info")) || user.stagiaire || {};

  // Initiales pour l'avatar
  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`;

  return (
    // 1. CONTAINER PRINCIPAL (Même structure que l'Index)
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden duration-500 animate-in fade-in bg-background">
      
      {/* ===== BANNIÈRE (Hauteur fixe identique aux autres pages) ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border-black/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Fingerprint size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Mon Identité Numérique
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              Gestion centralisée de vos informations personnelles et académiques.
            </p>
          </div>

          
        </div>
      </div>

      {/* ===== ZONE DE CONTENU (Scrollable interne) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-1 gap-4 pb-4 lg:grid-cols-3">
          
          {/* COLONNE GAUCHE : Avatar & Notif */}
          <div className="space-y-4 lg:col-span-1">
            <div className="p-6 text-center bg-white border shadow-sm md:p-8 border-black/5 rounded-2xl md:rounded-3xl">
              <div className="relative inline-block mx-auto mb-4">
                <div className="flex items-center justify-center w-24 h-24 text-3xl font-bold text-white border-4 shadow-inner md:w-32 md:h-32 md:text-4xl md:border-8 border-black/5 bg-secondary rounded-3xl">
                  {initials.toUpperCase() || <UserCircle size={60} />}
                </div>
                <div className="absolute bottom-1 right-1 p-1.5 bg-white rounded-xl shadow-sm border border-black/5">
                  <BadgeCheck className="text-primary" size={20} />
                </div>
              </div>
              <h2 className="text-lg font-bold uppercase md:text-2xl text-secondary">
                {user.prenom} {user.nom}
              </h2>
              <p className="mt-1 mb-6 text-[10px] font-bold tracking-widest text-black/40 uppercase">Matricule : {info.matricule}</p>
              
              <div className="flex items-center justify-center gap-2 py-3 border-t border-black/5">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Session Active</span>
              </div>
            </div>

            {showNotif && (
              <div className="p-5 border bg-primary/5 border-primary/10 rounded-2xl md:rounded-3xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Bell size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Scolarité</span>
                  </div>
                  <button onClick={() => setShowNotif(false)} className="transition-colors text-primary/40 hover:text-primary">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-black/70">
                  Toute modification de vos informations personnelles doit être validée par l'administration.
                </p>
              </div>
            )}
          </div>

          {/* COLONNE DROITE : Détails (Équitable) */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white border shadow-sm md:p-10 border-black/5 rounded-2xl md:rounded-3xl">
              
              {/* Section 1 : Parcours */}
              <div>
                <h3 className="mb-8 text-[10px] font-bold tracking-widest text-black/30 uppercase">
                  Parcours & Formation
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <DetailItem icon={BookOpen} label="Spécialité" value={info.formation?.nom} />
                  <DetailItem icon={Award} label="Niveau actuel" value={`Semestre ${info.semestre?.numero || "N/A"}`} highlight />
                </div>
              </div>

              <hr className="my-10 border-black/5" />

              {/* Section 2 : Contact */}
              <div>
                <h3 className="mb-8 text-[10px] font-bold tracking-widest text-black/30 uppercase">
                  Contact & Accès
                </h3>
                <div className="space-y-8">
                  <DetailItem icon={Mail} label="Email Institutionnel" value={user.email} />
                  
                  <div className="flex items-start gap-4 p-4 mt-4 border border-black/5 bg-black/[0.02] rounded-2xl">
                    <ShieldCheck className="shrink-0 text-black/20" size={20} />
                    <p className="text-[11px] font-medium leading-relaxed text-black/50">
                      Votre identité numérique est protégée. Pour toute réinitialisation de mot de passe, veuillez contacter le support technique.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Composant Item (Même style que l'Index)
function DetailItem({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`flex items-center justify-center w-12 h-12 border shadow-sm rounded-2xl shrink-0 transition-all ${
        highlight ? 'bg-primary/10 border-primary/20 text-primary' : 'text-black/30 border-black/5 bg-black/[0.02] group-hover:bg-white group-hover:border-black/10'
      }`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-secondary'}`}>
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );
}