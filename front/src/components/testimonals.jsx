import React, { memo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

// 🚀 TES IMPORTS D'IMAGES
import PhotoAmine from "../assets/images/chocolat.jpeg";
import PhotoSarah from "../assets/images/miguel.png";
import PhotoKarim from "../assets/images/karim.jpg";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Chocolat Jean-Raoul",
    role: "Stagiaire en Développment Web",
    content: "L'INSFP m'a permis de renforcer mes connaissances Développment Web. Les formateurs sont des experts.",
    image: PhotoAmine,
  },
  {
    id: 2,
    name: "Gbadou Miguel",
    role: "Stagiaire en Développment Web",
    content: "Une approche 100% pratique qui fait la différence. J'ai codé de vrais projets concrets en équipe.",
    image: PhotoSarah,
  },
  {
    id: 3,
    name: "Karim Benkaci",
    role: "Technicien Sup. en Ingénierie Son",
    content: "Une école qui prépare vraiment à la réalité pro. J'ai pu me créer un réseau solide avant mon diplôme.",
    image: PhotoKarim,
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const TestimonialCard = memo(({ testimonial }) => (
  <motion.div 
    variants={cardVariants}
    className="relative flex flex-col shrink-0 w-[85vw] max-w-[350px] md:w-auto [scroll-snap-align:center] md:[scroll-snap-align:start]"
  >
    {/* Bulle de témoignage */}
    <div className="relative flex-1 p-8 bg-primary rounded-[2rem] rounded-br-none shadow-sm">
      <Quote className="absolute w-12 h-12 text-white/10 top-6 right-6" />
      <p className="relative z-10 text-base font-medium leading-relaxed text-white md:text-lg">
        "{testimonial.content}"
      </p>
    </div>

    {/* Pointe de la bulle */}
    <div className="w-6 h-6 ml-10 bg-primary [clip-path:polygon(0_0,0_100%,100%_0)]" />

    {/* Informations du stagiaire */}
    <div className="flex items-center gap-4 px-4 pt-4">
      <div className="relative overflow-hidden bg-white border rounded-full w-14 h-14 shrink-0 border-black/5">
        <img 
          src={testimonial.image} 
          alt={testimonial.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      <div className="flex-1">
        <h4 className="text-base font-bold text-secondary">
          {testimonial.name}
        </h4>
        <p className="text-[10px] font-bold tracking-widest uppercase mt-1 opacity-70 text-secondary">
          {testimonial.role}
        </p>
      </div>

      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
  </motion.div>
));

TestimonialCard.displayName = "TestimonialCard";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    const scrollWidth = container.scrollWidth - container.clientWidth;
    if (scrollWidth <= 0) return;
    
    const scrollPercentage = container.scrollLeft / scrollWidth;
    const currentIndex = Math.round(scrollPercentage * (TESTIMONIALS.length - 1));
    setActiveIndex(currentIndex);
  };

  return (
    // 🚀 AJOUT DE `mx-auto` POUR CENTRER LE CONTENEUR GLOBAL
    <section className="container w-full pb-10 mx-auto overflow-hidden ">
      
      <div className="py-10">
            <h2 className="text-2xl font-semibold text-center">
Nos Success Stories

      </h2>

      <h3 className="mb-8 text-xl text-center">
La parole est à nos stagiaires      </h3>

</div>

      {/* 🚀 AJOUT DE `max-w-6xl mx-auto` POUR GARDER LES CARTES GROUPÉES ET CENTRÉES SUR DESKTOP */}
      <motion.div 
        ref={scrollRef}
        onScroll={handleScroll}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-row gap-10 px-6 pb-8 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:px-0 md:snap-none md:max-w-6xl md:mx-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </motion.div>

      {/* Pointillés de navigation réactifs */}
      <div className="flex items-center justify-center gap-2 mt-4 md:hidden">
        {TESTIMONIALS.map((_, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              width: activeIndex === index ? 24 : 8,
              opacity: activeIndex === index ? 1 : 0.3,
            }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut"   
            }}
            className="h-2 rounded-full bg-primary"
          />
        ))}
      </div>

    </section>
  );
}