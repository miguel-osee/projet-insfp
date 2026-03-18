import { useEffect, useState } from "react";
import api from "../../services/api";
import HeroSection from "../../components/HeroSecondary";
import ActualiteCard from "../../components/ActualitesCard";
import FormationBg from "../../assets/images/galerie-4.jpg";

export default function Actualites() {

  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const response = await api.get("/actualites");
        setActualites(response.data);
      } catch (error) {
        console.error("Erreur chargement actualités :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActualites();
  }, []);

  return (
    <>
      <HeroSection
        title="Actualités"
        subtitle="Restez informé des dernières nouvelles"
        background={FormationBg}
      />

      <section className="container py-16">
        
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : actualites.length === 0 ? (
          <p className="text-center">Aucune actualité disponible.</p>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {actualites.map((actu) => (
              <ActualiteCard
                key={actu.id}
                id={actu.id}
                titre={actu.titre}
                date={new Date(actu.date_publication).toLocaleDateString()}
                sousTitre={actu.contenu.substring(0, 80) + "..."}
                image={
                  actu.image
                    ? `https://api.insfp-ouledfayet.com/storage/${actu.image}`
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
