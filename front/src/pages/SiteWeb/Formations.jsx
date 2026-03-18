import { useEffect, useState } from "react";
import api from "../../services/api";
import HeroSection from "../../components/HeroSecondary";
import FormationBg from "../../assets/images/galerie-4.jpg";
import FormationCard from "../../components/FormationCard";

export default function Formations() {

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Charger depuis backend
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await api.get("/formations");
        setFormations(response.data);
      } catch (error) {
        console.error("Erreur chargement formations :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  return (
    <>
      {/* HERO */}
      <HeroSection
        title="Nos formations"
        subtitle="Découvrez nos formations professionnelles"
        background={FormationBg}
      />

      <section className="container py-16">


        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : formations.length === 0 ? (
          <p className="text-center">Aucune formation disponible.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {formations.map((formation) => (
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
        )}
      </section>
    </>
  );
}
