import { Link } from "react-router-dom";
import Button from "./Buttons.jsx";
import heroImage from "../assets/images/image-a.png";

export default function Hero() {
  return (
    <section
      className="relative h-[60vh] flex items-center mt-16 justify-center text-white bg-fixed"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

      {/* Contenu principal */}  
      <div className="relative z-10 max-w-2xl px-6 text-center">
        <h1 className="text-2xl font-bold leading-tight ">
          ici, votre avenir dans l’audiovisuel
        </h1>

        <p className="mt-6 text-lg text-gray-200">
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