import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo-insfp.png";
import {
  LayoutDashboard, 
  BookOpen, 
  FolderOpen, 
  Calendar,
  User, 
  LogOut, 
  Users, 
  GraduationCap, 
  FileSignature, 
  Images,        
  ClipboardList, 
  Book, 
  Newspaper,     
  Files          
} from "lucide-react";

const MENUS = {
  STAGIAIRE: [
    { label: "Tableau de bord", icon: LayoutDashboard, to: "/DashStagiaire/Index" },
    { label: "Suivi semestres", icon: BookOpen, to: "/DashStagiaire/SuiviSemestre" },
    { label: "Planning", icon: Calendar, to: "/DashStagiaire/EmploiDuTemps" },
    { label: "Bibliothèque", icon: Book, to: "/DashStagiaire/Bibliotheque" },
    { label: "Mes Documents", icon: FolderOpen, to: "/DashStagiaire/Documents" },
    { label: "Mon Profil", icon: User, to: "/DashStagiaire/Profil" }
  ],
  ADMIN: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/DashAdmin/Dashboard" }, 
    { label: "Formations", icon: GraduationCap, to: "/DashAdmin/Formations" },
    { label: "Stagiaires", icon: Users, to: "/DashAdmin/Stagiaires" },
    { label: "Notes", icon: FileSignature, to: "/DashAdmin/Notes" },
    { label: "Plannings", icon: ClipboardList, to: "/DashAdmin/EmploisDuTemps" },
    { label: "Bibliothèque", icon: Book, to: "/DashAdmin/Bibliotheque" },
    { label: "Ressources", icon: Files, to: "/DashAdmin/Documents" },
    { label: "Articles", icon: Newspaper, to: "/DashAdmin/Articles" },
    { label: "Galerie", icon: Images, to: "/DashAdmin/Galerie" }
  ]
};

export default function Sidebar() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role?.toUpperCase() || "";

  const currentMenu = MENUS[role] || [];

  // ==========================================
  // PRÉPARATION DES LIENS POUR LE MOBILE
  // ==========================================
  const mobileBottomLinks = currentMenu.filter(item => item.label !== "Mon Profil");
  const profileLink = currentMenu.find(item => item.label === "Mon Profil");

  const handleLogout = () => {
    localStorage.clear();
    navigate(role === "ADMIN" ? "/login-admin" : "/");
  };

  return (
    <>
      {/* ============================================================== */}
      {/* VERSION DESKTOP (Sidebar classique - cachée sur mobile) */}
      {/* ============================================================== */}
      <aside className="fixed top-0 left-0 z-40 flex-col hidden w-64 h-screen transition-all duration-300 bg-white border-r border-gray-100 shadow-sm md:flex">
        
        <div className="flex items-center justify-start h-24 px-6 border-b border-gray-50">
          <img src={logo} alt="Logo INSFP" className="object-contain w-auto h-10" />
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {currentMenu.map((item, i) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={i}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-200 ${
                    isActive 
                      ? "bg-jaune/5 text-jaune font-bold" 
                      : "text-secondary hover:bg-secondary/5 font-medium"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-jaune" : "text-secondary"} />
                    <span className="text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-start w-full gap-4 px-4 py-3 text-sm font-medium transition-colors duration-200 text-secondary rounded-xl hover:bg-red-50 hover:text-red-600 group"
          >
            <LogOut size={22} className="transition-colors text-secondary group-hover:text-red-600" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* VERSION MOBILE (Top Bar + Bottom Bar - cachées sur PC) */}
      {/* ============================================================== */}

      {/* TOP HEADER MOBILE */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b border-gray-100 shadow-sm md:hidden bg-white/90 backdrop-blur-md">
        <img src={logo} alt="Logo INSFP" className="object-contain h-8" />
        
        <div className="flex items-center gap-2">
          {profileLink && (
            <NavLink 
              to={profileLink.to}
              className={({ isActive }) => `p-2.5 rounded-full transition-colors ${isActive ? "bg-jaune/10 text-jaune" : "text-secondary hover:bg-black/5"}`}
            >
              <User size={20} strokeWidth={2.5} />
            </NavLink>
          )}
          
          <button 
            onClick={handleLogout}
            className="p-2.5 text-secondary hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-black/5 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] pb-1">
        <div className={`flex items-center h-[70px] w-full ${role === 'ADMIN' ? 'overflow-x-auto gap-2 px-3 [scrollbar-width:none]' : 'justify-between px-1'}`}>
          {mobileBottomLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={i}
                to={item.to}
                className={({ isActive }) =>
                  // CORRECTION ICI : flex-1 pour le stagiaire répartit équitablement l'espace.
                  `flex flex-col items-center justify-center h-full gap-1 p-1 rounded-xl transition-all ${
                    role === 'ADMIN' ? 'w-[72px] shrink-0' : 'flex-1'
                  } ${
                    isActive ? "text-jaune" : "text-black/40 hover:text-secondary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isActive ? "bg-jaune/10 text-jaune" : ""}`}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? "scale-110" : "scale-100"}`} />
                    </div>
                    <span className={`text-[9px] font-bold text-center truncate w-full px-1 ${isActive ? "text-jaune" : "text-black/50"}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}