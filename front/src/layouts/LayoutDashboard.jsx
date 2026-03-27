import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function LayoutDashboard() {
  return (
    // 1. h-[100dvh] fixe la hauteur à la taille EXACTE de l'écran mobile.
    // 2. overflow-hidden bloque définitivement le scroll de la page entière (le body).
    <div className="flex h-[100dvh] w-full overflow-hidden bg-gray-50">
      
      <Sidebar />
      
      {/* 3. On garde tes marges pour la Sidebar, mais on ajoute h-full et overflow-hidden 
             pour confiner le contenu strictement à l'écran. */}
      <main className="flex-1 w-full h-full pt-16 pb-20 overflow-hidden md:pt-0 md:pb-0 md:ml-64">
        
        {/* 4. L'ASTUCE : [&>*]:!h-full va cibler la page chargée dans <Outlet /> 
               et forcer sa hauteur à s'adapter parfaitement au Layout, 
               ignorant les "calc()" qu'on avait mis précédemment ! */}
        <div className="w-full h-full overflow-hidden [&>*]:!h-full [&>*]:!min-h-0">
          <Outlet /> 
        </div>

      </main>
      
    </div>
  );
}