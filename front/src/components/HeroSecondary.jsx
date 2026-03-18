import { Link } from "react-router-dom";

export default function Heroseco({ title, subtitle, background, breadcrumbs }) {
  // Si aucun chemin n'est fourni, on génère un chemin par défaut : Accueil > Titre
  const paths = breadcrumbs || [
    { label: "Accueil", path: "/" },
    { label: title, path: null },
  ];

  return (
    <section
      className="relative flex items-center justify-center pt-16 text-white min-h-[40vh]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre pour bien faire ressortir le texte */}
      <div className="absolute inset-0 bg-secondary/80"></div>

      {/* Contenu */}
      <div className="relative z-10 px-6 text-center">
        
        {/* Fil d'Ariane (Chemin des pages) */}
        <nav aria-label="Breadcrumb" className="flex justify-center mb-4 text-sm font-medium text-gray-300 md:text-base">
          <ol className="flex items-center gap-2">
            {paths.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.path ? (
                  <Link 
                    to={item.path} 
                    className="transition-colors rounded-sm hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white" aria-current="page">
                    {item.label}
                  </span>
                )}

                {/* Séparateur (sauf pour le dernier élément) */}
                {index < paths.length - 1 && (
                  <span className="text-gray-400">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

     

        {/* Sous-titre optionnel */}
        {subtitle && (
          <p className="max-w-2xl mx-auto mt-4 text-lg font-light text-gray-200 drop-shadow-sm md:text-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}