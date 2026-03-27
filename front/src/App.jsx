import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/LayoutPublic";
import DashboardLayout from "./layouts/LayoutDashboard";

// Pages publiques
import Home from "./pages/SiteWeb/Home";
import Contact from "./pages/SiteWeb/Contact";
import Institut from "./pages/SiteWeb/Institut";
import Galerie from "./pages/SiteWeb/Galerie";
import Formations from "./pages/SiteWeb/Formations";
import FormationDetails from "./pages/SiteWeb/FormationDetails";
import Actualites from "./pages/SiteWeb/Actualites";
import ActualitesDetails from "./pages/SiteWeb/ActualitesDetails";

// Auth
import LoginStagiaire from "./pages/LoginStagiaire";
import LoginAdmin from "./pages/LoginAdmin";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard stagiaire
import Dashboard from "./pages/Stagiaire/Index";
import Semestres from "./pages/Stagiaire/SuiviSemestre";
import Documents from "./pages/Stagiaire/Documents";
import EmploiDuTemps from "./pages/Stagiaire/Emploi";
import Profil from "./pages/Stagiaire/Profil";
//  Ajout : Import de la page Bibliothèque pour le stagiaire (Vérifie bien le chemin)
import StagiaireBibliotheque from "./pages/Stagiaire/BibliothequeStagiaire"; 

// Dashboard admin
import AdminStagiaires from "./pages/Admin/Stagiaires";
import AdminFormations from "./pages/Admin/Formations";
import AdminEmploisDuTemps from "./pages/Admin/EmploisDuTemps";
import AdminNotes from "./pages/Admin/Moyenne";
import AdminArticles from "./pages/Admin/Articles";
import AdminGalerie from "./pages/Admin/Galerie";
import AdminDocuments from "./pages/Admin/Document"; 
import AdminDashboard from "./pages/Admin/Dashboard"; 
//  Ajout : Import de la page Bibliothèque pour l'admin (Vérifie bien le chemin)
import AdminBibliotheque from "./pages/Admin/BibliothequeAdmin"; 

export default function App() {
  return (
    <Routes>

      {/*  Site public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/institut" element={<Institut />} />
        <Route path="/galerie" element={<Galerie />} />
        <Route path="/formations" element={<Formations />} />
        <Route path="/formations/:slug" element={<FormationDetails />} />
        <Route path="/actualites" element={<Actualites />} />
        <Route path="/actualites/:id" element={<ActualitesDetails />} />
      </Route>

      {/* Auth */}
      <Route path="/login-stagiaire" element={<LoginStagiaire />} />
      <Route path="/login-admin" element={<LoginAdmin />} />

      {/*  Dashboard STAGIAIRE */}
      <Route
        path="/DashStagiaire"
        element={
          <ProtectedRoute allowedRole="STAGIAIRE">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="Index" element={<Dashboard />} />
        <Route path="SuiviSemestre" element={<Semestres />} />
        <Route path="Documents" element={<Documents />} /> 
        <Route path="EmploiDuTemps" element={<EmploiDuTemps />} />
        <Route path="Profil" element={<Profil />} />
        {/*  Ajout de la route Bibliothèque Stagiaire */}
        <Route path="Bibliotheque" element={<StagiaireBibliotheque />} />
      </Route>

      {/*  Dashboard ADMIN */}
      <Route
        path="/DashAdmin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="Stagiaires" element={<AdminStagiaires />} />
        <Route path="Formations" element={<AdminFormations />} />
        <Route path="EmploisDuTemps" element={<AdminEmploisDuTemps />} />
        <Route path="Notes" element={<AdminNotes />} />
        <Route path="Articles" element={<AdminArticles />} />
        <Route path="Galerie" element={<AdminGalerie />} />
        <Route path="Documents" element={<AdminDocuments />} />
        <Route path="Dashboard" element={<AdminDashboard />} />
        {/* 🚀 Ajout de la route Bibliothèque Admin */}
        <Route path="Bibliotheque" element={<AdminBibliotheque />} />
      </Route>

    </Routes>
  );
}