import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/logo-insfp.svg";
import Button from "./Buttons.jsx";
import { FaUserGraduate, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  // Gère l'état ouvert/fermé du menu mobile
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Tableau regroupant tes liens pour un code plus propre
  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Institut", path: "/institut" },
    { name: "Formations", path: "/formations" },
    { name: "Actualités", path: "/Actualites" },
    { name: "Galerie", path: "/galerie" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <nav className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        
        {/* Logo */}
        <NavLink to="/" onClick={closeMenu}>
          <img
            src={logo}
            alt="Logo INSFP"
            className="w-auto h-10"
          />
        </NavLink>

        {/* --- MENU DESKTOP --- */}
        <ul className="items-center hidden gap-8 text-sm md:flex text-secondary">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive 
                    ? "text-primary font-bold" 
                    : "hover:text-primary transition-colors"
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bouton connexion Desktop */}
        <Link to="/login-stagiaire" className="hidden md:inline-block">
          <Button>
            <FaUserGraduate className="inline mr-2" />
            Espace stagiaire
          </Button>
        </Link>

        {/* --- BOUTON MENU MOBILE --- */}
        <button
          onClick={toggleMenu}
          className="text-2xl transition-transform duration-300 md:hidden text-primary focus:outline-none"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* --- MENU MOBILE (S'affiche uniquement si isOpen est true) --- */}
      {isOpen && (
        <div className="absolute left-0 w-full border-t border-gray-100 shadow-xl top-full bg-background md:hidden">
          <ul className="flex flex-col items-center gap-6 py-6 text-sm text-secondary">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  onClick={closeMenu} // Referme le menu au clic
                  className={({ isActive }) =>
                    isActive 
                      ? "text-primary font-bold text-lg" 
                      : "hover:text-primary text-lg"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            {/* Bouton connexion Mobile */}
            <li className="mt-4">
              <Link to="/login-stagiaire" onClick={closeMenu}>
                <Button>
                  <FaUserGraduate className="inline mr-2" />
                  Espace stagiaire
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}