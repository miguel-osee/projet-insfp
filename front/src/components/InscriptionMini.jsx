import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "./Buttons.jsx";
// N'oublie pas de mettre le bon chemin vers ton image
import bgInscription from "../assets/images/image-b.jpg"; 

export default function InscriptionMini() {
  return (
    <section className="relative flex items-center justify-center py-20 mx-auto text-white bg-fixed bg-center bg-cover"
      style={{
        backgroundImage: `url(${bgInscription})`,
      }}
    >
      {/* Overlay sombre en dégradé (identique au Hero) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 "></div>

      {/* Contenu principal */}  
      <div className="relative z-10 max-w-2xl px-6 text-center">
        <h2 className="text-2xl font-bold leading-tight md:text-4xl">
          Inscription en ligne
        </h2>

        <p className="mt-6 text-lg text-gray-200">
          L’inscription aux formations de l’INSFP Audiovisuel se fait
          exclusivement via la plateforme nationale du Ministère de la
          Formation et de l’Enseignement Professionnels.
        </p>

        <div className="flex justify-center mt-10">
          <Button>
            <a
              href="https://takwin.dz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              S’inscrire
              <FaExternalLinkAlt className="text-sm" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}