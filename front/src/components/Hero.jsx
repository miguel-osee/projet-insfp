import { Link } from "react-router-dom";
import Button from "./Buttons.jsx";
import heroImage from "../assets/images/image-a.png";

export default function Hero() {
  return (
    <section className="relative h-[55vh] md:h-[65vh] flex items-center mt-16 justify-center text-white overflow-hidden bg-black">
      
      {/* IMAGE DE FOND OPTIMISÉE POUR MOBILE */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat 
                   /* Sur mobile : image fixe en largeur, pas de zoom sauvage */
                   bg-cover bg-scroll 
                   /* Sur PC : on réactive l'effet parallaxe */
                   md:bg-fixed md:bg-cover"
        style={{
          backgroundImage: `url(${heroImage})`,
          // Petite astuce de secours pour certains navigateurs mobiles
          backgroundSize: 'cover', 
        }}
      ></div>

      {/* OVERLAY SOMBRE (Améliore le contraste) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black/50"></div>

      {/* CONTENU TEXTE ET BOUTONS */}  
      <div className="relative z-10 max-w-2xl px-6 text-center">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
          Ici, votre avenir dans l’audiovisuel
        </h1>

        <p className="mt-4 text-base text-gray-200 md:text-lg">
          Rejoignez l’INSFP Ahmed Mehdi et développez vos compétences dans 
          les métiers de l’image, du son et de la production.
        </p>

         <div className="flex justify-center gap-6 mt-10">
          {/* Bouton principal */}
          <Link to="/formations">
            <Button variant="secondary1" >Découvrez</Button>
          </Link>
          {/* Bouton secondaire bien respecté */}
          <Link to="/contact">
            <Button variant="secondary">
              Contacts
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}