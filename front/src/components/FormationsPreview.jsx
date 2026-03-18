import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import FormationCard from "./FormationCard";
import FormationBg from "../assets/images/galerie-4.jpg";

export default function FormationsPreview() {

  const [formations, setFormations] = useState([]);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await api.get("/formations");
        setFormations(response.data);
      } catch (error) {
        console.error("Erreur chargement formations :", error);
      }
    };

    fetchFormations();
  }, []);

  return (
    <section className="container pb-20 mx-auto">
      <div className="mb-12 md:mb-16">
          <div className="pb-10">


        {/* Titre */}
        <h2 className="text-2xl font-semibold text-center">
          Nos formations
        </h2>

        <h3 className="mb-8 text-xl text-center text-gray-600">
          Découvrez nos formations phares
        </h3>
</div>
        {/* Cartes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {formations.slice(0, 3).map((formation) => (
            <FormationCard
              key={formation.id}
              slug={formation.id}
              titre={formation.nom}
              description={formation.description}
              image={
                formation.image
                  ? `https://api.insfp-ouledfayet.com/storage/${formation.image}`
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
