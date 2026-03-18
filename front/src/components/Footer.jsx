import logo from "../assets/images/logo-white.png";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex p-6 text-white bg-secondary justify-cente ">
      <div className="container grid grid-cols-1 gap-5 text-sm md:grid-cols-3">
        
        {/* Bloc logo + infos */}
        <div>
          <img src={logo} alt="Logo INSFP" className="w-auto h-8 mb-2" />
          <p>Dimanche – Jeudi | 08h00 – 16h00</p>
          <p className="mt-1 text-xs">
            © 2026 INSFP Audiovisuel Echahid Ahmed Mehdi – Tous droits réservés
          </p>
        </div>

        {/* Liens rapides réduits */}
        <div className="md:ml-48">
          <h4 className="mb-2 font-semibold text-primary ">Liens rapides</h4>
          <ul className="space-y-1">
            <li><Link to="/formations">Formations</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login-stagiaire">Connexion stagiaire</Link></li>
          </ul>
        </div>

        {/* Réseaux sociaux avec noms */}
        <div className="md:ml-48">
          <h4 className="mb-2 font-semibold text-primary ">Réseaux sociaux</h4>
          <ul className="space-y-1">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <FaFacebook className="transition hover:text-blue-500" /> Facebook
              </a>
            </li>
            <li>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <FaYoutube className="transition hover:text-red-500" /> YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}