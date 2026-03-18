import { Link } from "react-router-dom";

export default function ActualiteCard({ id, titre, date, sousTitre, image }) {
  
  // 🚀 NETTOYAGE : Enlève les balises HTML et les entités comme &nbsp;
  const cleanExcerpt = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <article className="relative flex flex-col h-full group">
      
      <Link 
        to={`/actualites/${id}`} 
        className="flex flex-col w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
      >
        
        {/* IMAGE : Augmentation de l'arrondi pour un look plus moderne */}
        <div className="w-full overflow-hidden bg-slate-100 h-64 rounded-[2rem] relative z-0">
          <img
            src={image}
            alt={titre}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-black/5 group-hover:opacity-100"></div>
        </div>

        {/* CONTENU (La boîte flottante) */}
        <div 
          className="relative z-10 flex flex-col flex-grow p-6 mx-auto -mt-16 transition-all duration-500 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 w-[92%] rounded-3xl group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-primary/20"
        >
          {/* Badge Date minimaliste */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white rounded-lg bg-primary shadow-sm shadow-primary/30">
              {date}
            </span>
          </div>

          {/* Titre : break-words au lieu de break-all (plus propre) */}
          <h3 
            className="mb-3 text-lg font-extrabold leading-tight break-words transition-colors duration-300 text-secondary group-hover:text-primary line-clamp-2"
            title={titre}
          >
            {titre}
          </h3>

          {/* Sous-titre : Nettoyé du HTML et fluide */}
          <p className="flex-grow text-sm leading-relaxed break-words text-slate-500 line-clamp-3">
            {cleanExcerpt(sousTitre)}
          </p>

          {/* Appel à l'action stylisé */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary group-hover:gap-3 flex items-center gap-2 transition-all">
              Lire la suite <span className="text-lg">→</span>
            </span>
          </div>
        </div>
        
      </Link>
    </article>
  );
}