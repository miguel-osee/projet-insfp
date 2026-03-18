import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function LayoutDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Décalage selon largeur sidebar */}
      <main className="p-6 ml-16 md:ml-64 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
