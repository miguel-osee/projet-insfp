import React from 'react';
import { motion } from "framer-motion";
import { AcademicCapIcon, ComputerDesktopIcon, CameraIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Composants
import HeroSection from "../../components/HeroSecondary.jsx";
import ImageMarque from "../../components/ImageMarque.jsx";

// Images
import institutBg from "../../assets/images/institut-bg.jpg";
import shape from "../../assets/images/about.png";
import shape1 from "../../assets/images/image-d.png";
import galerie1 from "../../assets/images/galerie-1.jpg";
import galerie2 from "../../assets/images/galerie-2.jpg";
import galerie3 from "../../assets/images/galerie-3.jpg";
import galerie4 from "../../assets/images/galerie-4.jpg";

// Animation douce et minimaliste
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Institut() {
  return (
    <main className="min-h-screen bg-white text-secondary">
      
      {/* 1. HERO SECTION */}
      <HeroSection
        title="L’Institut"
        subtitle="Découvrez l’INSFP Audiovisuel d’Ouled Fayet"
        background={institutBg}
      />

      {/* 2. PRÉSENTATION */}
      <section className="py-24 bg-white md:py-32">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            
            {/* Colonne Texte + Chiffres (Passe en dessous sur mobile) */}
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col order-2 lg:order-1"
            >
              {/* Badge */}
              <div className="inline-flex self-start px-5 py-2 mb-8 text-xs font-bold tracking-wider uppercase border border-gray-200 rounded-full text-secondary">
                À propos de l'institut
              </div>

              <h2 className="mb-6 text-4xl font-semibold tracking-tight md:text-5xl text-secondary">
                L'excellence au service des <span className="text-primary">médias.</span>
              </h2>
              
              <div className="space-y-5 text-lg leading-relaxed text-gray-500">
                <p>
                  Établissement public de référence sous la tutelle du Ministère de la Formation et de l'Enseignement Professionnels, l'INSFP d'Ouled Fayet est le cœur battant de la formation audiovisuelle en Algérie.
                </p>
                <p>
                  Notre vocation est claire : transformer votre passion en une véritable carrière. Nous concevons des programmes immersifs qui répondent très précisément aux exigences des chaînes de télévision, des stations de radio, des boîtes de production et des agences de communication digitale.
                </p>
              </div>

              {/* Section Métriques */}
              <div className="flex flex-wrap gap-8 pt-10 mt-10 border-t border-gray-100 md:gap-16">
                <div>
                  <div className="text-4xl font-normal text-secondary">98%</div>
                  <div className="mt-2 text-xs font-medium leading-tight tracking-widest text-gray-400 uppercase">Insertion<br/>professionnelle</div>
                </div>
                <div>
                  <div className="text-4xl font-normal text-secondary">30+</div>
                  <div className="mt-2 text-xs font-medium leading-tight tracking-widest text-gray-400 uppercase">Ans d'innovation<br/>et d'expertise</div>
                </div>
                <div>
                  <div className="text-4xl font-normal text-secondary">100%</div>
                  <div className="mt-2 text-xs font-medium leading-tight tracking-widest text-gray-400 uppercase">Pratique sur<br/>matériel pro</div>
                </div>
              </div>
            </motion.div>

            {/* Image (Passe au-dessus sur mobile) */}
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

          </div>
        </div>
      </section>

      {/* 3. HISTOIRE / EXPERTISE */}
      <section className="py-24 bg-slate-50 md:py-32 rounded-[3rem] mx-4 md:mx-8 mb-24">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            
            {/* Image (Passe au-dessus sur mobile, Reste à gauche sur grand écran) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="flex items-center justify-center order-1 w-full h-full"
            >
              <img
                src={shape1}
                alt="Histoire de l'INSFP"
                loading="lazy"
                className="object-contain w-full h-auto max-w-lg drop-shadow-xl"
              />
            </motion.div>

            {/* Texte et liste (Passe en dessous sur mobile) */}
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col order-2"
            >
              {/* Badge */}
              <div className="inline-flex self-start px-5 py-2 mb-8 text-xs font-bold tracking-wider uppercase bg-white border border-gray-200 rounded-full text-secondary">
                Notre Expertise
              </div>

              <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl text-secondary">
                Débloquez votre potentiel pour réussir dans les médias.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-gray-500">
                L'industrie audiovisuelle évolue à une vitesse fulgurante. Pour rester compétitif, il faut maîtriser à la fois la technique pure et le sens artistique. Nos formations sont structurées autour de la réalité du terrain.
              </p>

              {/* Grille de checkmarks détaillée */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  {
                    title: "Corps professoral expert",
                    desc: "Apprenez avec des professionnels en activité."
                  },
                  {
                    title: "Pédagogie par le projet",
                    desc: "Réalisez de véritables courts-métrages et émissions."
                  },
                  {
                    title: "Studios ultra-modernes",
                    desc: "Plateaux TV et cabines d'enregistrement insonorisées."
                  },
                  {
                    title: "Insertion professionnelle",
                    desc: "Partenariats solides avec les chaînes nationales."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircleIcon className="w-6 h-6 mt-1 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold text-secondary">{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. INFRASTRUCTURES */}
      <section className="py-12 pb-32 bg-white">
        <div className="container px-6 mx-auto max-w-7xl">

          {/* En-tête de section asymétrique */}
          <div className="flex flex-col justify-between gap-8 mb-16 md:flex-row md:items-end">
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <div className="inline-flex self-start px-5 py-2 mb-6 text-xs font-bold tracking-wider uppercase border border-gray-200 rounded-full text-secondary">
                Infrastructures
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl text-secondary">
                Des équipements à la pointe de la technologie
              </h2>
            </motion.div>
            
            <p className="max-w-md text-lg leading-relaxed text-gray-500 md:text-right">
              Découvrez les environnements technologiques professionnels qui façonnent l'excellence et le savoir-faire de nos stagiaires au quotidien.
            </p>
          </div>

          {/* Grille de 3 Cartes avec images en arrière-plan et dégradé noir */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {/* CARTE 1 : Espaces d'apprentissage (Image galerie2 + Dégradé noir) */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col justify-between rounded-[2rem] min-h-[360px] overflow-hidden bg-cover bg-center shadow-2xl group border border-white/10"
              style={{ backgroundImage: `url(${galerie2})` }}
            >
              {/* Voile dégradé noir pour lisibilité (Overlay profond) */}
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
              
              {/* Contenu en blanc (z-10 pour être au-dessus de l'overlay) */}
              <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
                <div className="flex items-center justify-center w-16 h-16 mb-10 transition-transform duration-300 border rounded-full bg-white/10 border-white/10 backdrop-blur-sm group-hover:scale-110">
                  <AcademicCapIcon className="w-8 h-8 text-white" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-white">Espaces d'apprentissage</h3>
                  <p className="leading-relaxed text-white/90">
                    Salles de cours interactives pensées pour le travail collaboratif, accompagnées d'un studio pédagogique complet pour allier théorie et pratique.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARTE 2 : Locaux techniques (Image galerie3 + Dégradé noir) */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col justify-between rounded-[2rem] min-h-[360px] overflow-hidden bg-cover bg-center shadow-2xl group border border-white/10"
              style={{ backgroundImage: `url(${galerie3})` }}
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white transition-shadow duration-300 hover:shadow-primary/10">
                <div className="flex items-center justify-center w-16 h-16 mb-10 transition-transform duration-300 border rounded-full bg-white/10 border-white/10 backdrop-blur-sm group-hover:scale-110">
                  <ComputerDesktopIcon className="w-8 h-8 text-white" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-white">Locaux techniques</h3>
                  <p className="leading-relaxed text-white/90">
                    Laboratoires informatiques de dernière génération équipés des logiciels métiers, ateliers de post-production et zones de maintenance spécialisées.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARTE 3 : Matériel pro (Image galerie4 + Dégradé noir) */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col justify-between rounded-[2rem] min-h-[360px] overflow-hidden bg-cover bg-center shadow-2xl group border border-white/10"
              style={{ backgroundImage: `url(${galerie4})` }}
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white transition-shadow duration-300 hover:shadow-primary/10">
                <div className="flex items-center justify-center w-16 h-16 mb-10 transition-transform duration-300 border rounded-full bg-white/10 border-white/10 backdrop-blur-sm group-hover:scale-110">
                  <CameraIcon className="w-8 h-8 text-white" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-white">Matériel pro.</h3>
                  <p className="leading-relaxed text-white/90">
                    Caméras de cinéma numérique 4K, machinerie lourde, régie son et lumière broadcast, et stations d'étalonnage respectant les normes de l'industrie.
                  </p>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

    </main>
  );
}