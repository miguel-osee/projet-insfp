import shape from "../assets/images/about.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="container py-16">
      <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
        
        {/* Image animée */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="flex items-center justify-center order-1 w-full h-full lg:order-2"
            >
              <img
                src={shape}
                alt="Bâtiment de l'INSFP Audiovisuel"
                loading="lazy"
                className="object-contain w-full h-auto max-w-lg drop-shadow-2xl"
              />
            </motion.div>

        {/* Contenu texte animée en décalé */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
            L'excellence au service de l'audiovisuel
          </h2>
          
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              L’Institut National Spécialisé de Formation Professionnelle (INSFP) – 
              Centre Audiovisuel d’Ouled Fayet est un établissement public algérien 
              placé sous la tutelle du Ministère de la Formation et de l’Enseignement 
              Professionnels.
            </p>
            <p>
              Il a pour vocation de former des techniciens spécialisés dans les métiers 
              de l’audiovisuel, du multimédia et du développement numérique, en réponse 
              aux besoins du marché du travail.
            </p>
          </div>

          <div className="mt-8">
            <Link
              to="/formations"
              className="inline-flex items-center gap-2 font-semibold transition-colors text-primary hover:text-primary/80 group"
            >
              En savoir plus 
              <span className="transition-transform group-hover:translate-x-1">➜</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}