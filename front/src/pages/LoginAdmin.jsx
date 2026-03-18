import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import api from "../services/api";
import bgImage from "../assets/images/login-bg.png";
import logo from "../assets/images/logo-insfp.png";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/login", {
        login: email,
        password,
      });

      const { user, token } = response.data;

      if (user.role !== "ADMIN") {
        setError("Accès refusé : Espace réservé à l'administration.");
        setIsLoading(false);
        return;
      }

      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/DashAdmin/Stagiaires");

    } catch (err) {
      setError("Email ou mot de passe incorrect. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      className="relative flex items-center justify-center min-h-screen p-4 bg-center bg-cover sm:p-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* LE SECRET EST ICI : 
        - Sur mobile : Calque sombre (bg-black/60) pour voir l'image derrière.
        - Sur PC (lg) : Fond gris opaque (lg:bg-gray-50) pour un rendu corporate pur.
      */}
      <div className="absolute inset-0 transition-colors duration-300 bg-black/60 lg:bg-gray-50"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        // La carte s'adapte : max-w-md sur mobile, max-w-5xl sur PC
        className="relative z-10 flex w-full max-w-md overflow-hidden bg-white shadow-2xl lg:max-w-5xl rounded-[2rem] lg:min-h-[600px]"
      >
        
        {/* COLONNE GAUCHE : Image et Branding (Masquée sur mobile, visible sur PC) */}
        <div 
          className="relative hidden w-1/2 bg-center bg-cover lg:block"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Overlay dégradé pour que le texte soit lisible */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <h2 className="mb-4 text-4xl font-extrabold leading-tight">
              Système de <br/> Gestion Intégré.
            </h2>
            <p className="text-lg text-white/80">
              Gérez les formations, les stagiaires et les ressources pédagogiques de l'INSFP depuis un seul et même espace sécurisé.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE : Formulaire de connexion */}
        <div className="flex flex-col justify-center w-full p-8 sm:p-10 lg:w-1/2 lg:p-16">
          
          <div className="flex items-center justify-between mb-10">
            <NavLink to="/" className="block focus:outline-none">
              <img
                src={logo}
                alt="Logo INSFP Audiovisuel"
                className="object-contain h-10 transition-transform duration-300 hover:scale-105"
              />
            </NavLink>
            <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full text-primary bg-primary/10">
              Admin
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-secondary">
              Bon retour,
            </h1>
            <p className="mt-2 text-secondary/60">
              Veuillez saisir vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-secondary">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors pointer-events-none text-secondary/40 group-focus-within:text-primary">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@insfp.dz"
                  disabled={isLoading}
                  className="w-full py-3.5 pl-12 pr-4 text-sm transition-all border border-gray-200 bg-gray-50/50 rounded-xl text-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-secondary">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors pointer-events-none text-secondary/40 group-focus-within:text-primary">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full py-3.5 pl-12 pr-4 text-sm transition-all border border-gray-200 bg-gray-50/50 rounded-xl text-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Message d’erreur */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-3 p-4 text-sm text-red-700 border border-red-100 bg-red-50 rounded-xl"
              >
                <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full py-4 mt-4 text-sm font-bold text-white transition-all shadow-lg rounded-xl bg-secondary hover:bg-black hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Accéder au tableau de bord
                  <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </section>
  );
}