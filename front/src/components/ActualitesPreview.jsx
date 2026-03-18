import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ActualiteCard from "./ActualitesCard";
import FormationBg from "../assets/images/galerie-4.jpg";

export default function ActualitesPreview() {

  const [actualites, setActualites] = useState([]);

  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const response = await api.get("/actualites");
        setActualites(response.data);
      } catch (error) {
        console.error("Erreur chargement actualités :", error);
      }
    };

    fetchActualites();
  }, []);

  // 🚀 NOUVEAU : Fonction pour nettoyer les balises HTML de Quill
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <section className="container py-10 mx-auto">

    <div className="mb-12 md:mb-16">

  <div className="pb-10">
      <h2 className="text-2xl font-semibold text-center">
        Dernières actualités
      </h2>

      <h3 className="mb-8 text-xl text-center">
        Découvrez nos actualités phares
      </h3>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {actualites.slice(0, 3).map((actu) => (
          <ActualiteCard
            key={actu.id}
            id={actu.id}
            titre={actu.titre}
            date={
              actu.date_publication
                ? new Date(actu.date_publication).toLocaleDateString()
                : ""
            }
            // 🚀 CORRECTION : On nettoie le HTML avant de couper à 80 caractères
            sousTitre={stripHtml(actu.contenu).substring(0, 80) + "..."}
            image={
              actu.image
                ? `https://api.insfp-ouledfayet.com/storage/${actu.image}`
                : null
            }
          />
        ))}
      </div>
</div>
       <div className="flex justify-center mt-8">
  <Link
    to="/formations"
    className="inline-flex items-center gap-2 font-semibold transition-colors text-primary hover:text-primary/80 group"
  >
    En savoir plus 
    <span className="transition-transform group-hover:translate-x-1">➜</span>
  </Link>
</div>

    </section>
  );
}