import { Link } from "react-router-dom";

export default function FormationCard({ slug, titre, description, image }) {
  
  // 🚀 FONCTION MAGIQUE : Nettoie le HTML pour l'aperçu
  // On enlève les balises (ex: <p>) pour ne garder que le texte brut dans la carte
  const cleanDescription = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <Link 
      to={`/formations/${slug}`} 
      className="block outline-none group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
    >
      <article
        className="flex flex-col h-full overflow-hidden transition-all duration-500 ease-out bg-white border shadow-sm border-slate-100 rounded-2xl group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-primary/20"
      >
        {/* Image avec zoom progressif */}
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={titre}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Overlay dégradé pour le chic */}
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>
        </div>

        {/* Contenu textuel */}
        <div className="flex flex-col flex-grow p-6">
          <h3
            className="text-lg font-extrabold leading-tight transition-colors duration-300 text-secondary group-hover:text-primary line-clamp-2"
          >
            {titre}
          </h3>

          <p className="flex-grow mt-3 text-sm font-medium leading-relaxed text-slate-500 line-clamp-3">
            {cleanDescription(description)}
          </p>

          {/* Footer de la carte */}
          <div
            className="flex items-center justify-between pt-4 mt-6 border-t border-slate-50"
          >
            <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-transform duration-300 text-primary group-hover:translate-x-1">
              Voir le programme <span>→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}