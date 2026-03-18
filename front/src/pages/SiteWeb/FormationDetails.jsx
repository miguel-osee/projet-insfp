import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../../services/api";
import HeroSection from "../../components/HeroSecondary";

export default function FormationDetails() {
  const { slug } = useParams();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.insfp-ouledfayet.com';

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await api.get(`/formations/${slug}`);
        setFormation(response.data);
      } catch (error) {
        console.error("Erreur chargement détail :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 bg-white text-center px-6">
        <p className="text-lg font-medium text-gray-500">Cette formation n'est plus disponible.</p>
        <Link to="/formations" className="px-6 py-2.5 text-sm font-bold text-white transition-all rounded-full bg-secondary hover:bg-black hover:scale-105 shadow-sm">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <HeroSection
        title={formation.nom}
        subtitle="Programme et détails de la spécialité"
        background={
          formation.image
            ? `${backendUrl}/storage/${formation.image}`
            : null
        }
      />

      <section className="container px-5 py-12 mx-auto md:py-20 max-w-7xl">
        <div className="max-w-3xl mx-auto">
          
          {/* Header de l'article */}
          <div className="flex flex-col gap-8 mb-12">
            <Link 
              to="/formations" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-black group w-fit"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
              Retour aux formations
            </Link>

            {/* Image de présentation pro */}
            {formation.image && (
              <div className="relative w-full overflow-hidden shadow-xl rounded-3xl h-60 md:h-[400px] bg-gray-50">
                <img
                  src={`${backendUrl}/storage/${formation.image}`}
                  alt={formation.nom}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Corps du programme */}
          {formation.description ? (
            <div 
              className="w-full overflow-hidden leading-relaxed prose prose-lg break-words prose-slate max-w-none md:prose-xl prose-headings:text-black prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-primary prose-img:rounded-2xl prose-img:max-w-full prose-strong:text-black"
              dangerouslySetInnerHTML={{ __html: formation.description }}
            />
          ) : (
            <div className="py-16 text-center border border-gray-100 border-dashed rounded-3xl bg-gray-50/50">
              <p className="text-sm italic font-medium text-gray-400">Le programme détaillé de cette formation sera bientôt disponible.</p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}   