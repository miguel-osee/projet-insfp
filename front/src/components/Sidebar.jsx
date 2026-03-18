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
  FileSignature, // Pour les Notes
  Images,        // Pour la Galerie
  ClipboardList, 
  Book, 
  Newspaper,     // Pour les Articles
  Files          // Pour les Ressources/Documents
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
    // --- Vue Générale
    { label: "Dashboard", icon: LayoutDashboard, to: "/DashAdmin/Dashboard" }, 
    
    // --- Pédagogie & Étudiants
    { label: "Formations", icon: GraduationCap, to: "/DashAdmin/Formations" },
    { label: "Stagiaires", icon: Users, to: "/DashAdmin/Stagiaires" },
    { label: "Notes", icon: FileSignature, to: "/DashAdmin/Notes" },
    { label: "Plannings", icon: ClipboardList, to: "/DashAdmin/EmploisDuTemps" },
    
    // --- Ressources
    { label: "Bibliothèque", icon: Book, to: "/DashAdmin/Bibliotheque" },
    { label: "Ressources", icon: Files, to: "/DashAdmin/Documents" },
    
    // --- Communication (Site Web)
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

  const handleLogout = () => {
    localStorage.clear();
    navigate(role === "ADMIN" ? "/login-admin" : "/");
  };

  return (
    <aside className="fixed top-0 left-0 z-40 flex flex-col w-20 h-screen transition-all duration-300 bg-white border-r border-gray-100 shadow-sm md:w-64">
      
      {/* ===== LOGO ===== */}
      <div className="flex items-center justify-center h-24 px-2 border-b border-gray-50 md:justify-start md:px-6">
        <img 
          src={logo} 
          alt="Logo INSFP" 
          className="object-contain w-auto h-12 md:h-10" 
        />
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {currentMenu.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 ${
                  isActive 
                    ? "bg-jaune/5 text-jaune font-bold" 
                    : "text-secondary hover:bg-secondary/5 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icône */}
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive ? "text-jaune" : "text-secondary"
                    }`} 
                  />
                  
                  {/* Texte */}
                  <span className="hidden text-sm md:block">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ===== FOOTER DÉCONNEXION ===== */}
      <div className="p-4 mt-auto border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-4 px-3 py-3 text-sm font-medium transition-colors duration-200 text-secondary rounded-xl md:justify-start hover:bg-red-50 hover:text-red-600 group"
        >
          <LogOut size={22} className="transition-colors text-secondary group-hover:text-red-600" />
          <span className="hidden md:inline">
            Déconnexion
          </span>
        </button>
      </div>

    </aside>
  );
}