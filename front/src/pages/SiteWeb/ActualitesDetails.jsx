import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"; // On harmonise avec lucide-react
import HeroSection from "../../components/HeroSecondary";
import api from "../../services/api";

export default function ActualiteDetail() {
  const { id } = useParams();
  const [actualite, setActualite] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.insfp-ouledfayet.com';

  useEffect(() => {
    const fetchActualite = async () => {
      try {
        const response = await api.get(`/actualites/${id}`);
        setActualite(response.data);
      } catch (error) {
        console.error("Erreur chargement détail :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActualite();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-xs font-bold tracking-widest text-gray-400 uppercase">Chargement de l'article...</p>
      </div>
    );
  }

  if (!actualite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 bg-white">
        <p className="text-lg font-medium text-gray-500">Cet article n'existe pas ou a été supprimé.</p>
        <Link to="/actualites" className="px-6 py-2.5 text-sm font-bold text-white transition-all rounded-full bg-secondary hover:bg-black shadow-sm">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section avec le titre de l'actu */}
      <HeroSection
        title="Actualité"
        subtitle={actualite.titre}
        background={actualite.image ? `${backendUrl}/storage/${actualite.image}` : null}
      />

      <section className="container px-5 py-12 mx-auto md:py-20 max-w-7xl">
        <div className="max-w-3xl mx-auto">
          
          {/* Barre d'infos supérieure */}
          <div className="flex flex-col gap-6 mb-12">
            <Link 
              to="/actualites" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-black group w-fit"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
              Retour aux actualités
            </Link>

            <div className="flex items-center gap-3 text-sm font-bold tracking-wider uppercase text-primary">
              <Calendar size={16} />
              {new Date(actualite.created_at || actualite.date_publication).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Image de couverture principale */}
          {actualite.image && (
            <div className="relative w-full overflow-hidden  rounded-3xl h-64 md:h-[450px] mb-12 bg-gray-50">
              <img
                src={`${backendUrl}/storage/${actualite.image}`}
                alt={actualite.titre}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Titre de l'article */}
          <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-black md:text-5xl">
            {actualite.titre}
          </h1>

          {/* 🚀 RENDU DU CONTENU (Supporte le HTML de Quill) */}
          {actualite.contenu ? (
            <div 
              className="w-full overflow-hidden leading-relaxed prose prose-lg break-words prose-slate max-w-none md:prose-xl prose-headings:text-black prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-primary prose-img:rounded-2xl prose-img:shadow-md prose-strong:text-black"
              dangerouslySetInnerHTML={{ __html: actualite.contenu }}
            />
          ) : (
            <p className="italic text-gray-400">Cet article ne contient aucun texte.</p>
          )}

          {/* Signature / Footer de l'article */}
          <div className="pt-12 mt-16 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-400">
              Publié par l'administration de l'INSFP
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}