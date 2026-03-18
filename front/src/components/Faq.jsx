import { useState } from "react";
import { faqData } from "../data/faq";
import faqImage from "../assets/images/faq.png";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

export default function FAQ() {
  const [activeId, setActiveId] = useState(1);

  return (
    <section className="container py-10 mx-auto">
      
      {/* En-tête de la section */}
      <div className="pb-10">
        <h2 className="text-2xl font-semibold text-center">
          Questions Fréquentes
        </h2>
        <p className="mb-8 text-xl text-center text-gray-600">
          Tout ce que vous devez savoir sur l'INSFP Audiovisuel.
        </p>
      </div>

      <div className="grid items-start grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">

        {/* Image avec légère animation d'entrée */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center order-1 md:order-2"
        >
          <img
            src={faqImage}
            alt="Illustration FAQ"
            className="w-full max-w-[300px] sm:max-w-[250px] md:max-w-md "
          />
        </motion.div>

        {/* Accordéon FAQ */}
        <div className="order-2 space-y-4 md:order-1">
          {faqData.map((item) => {
            const isOpen = activeId === item.id;

            return (
              <div
                key={item.id}
                className={`overflow-hidden transition-all duration-300 border rounded-2xl ${
                  isOpen 
                    ? "bg-white border-primary/30 shadow-md" 
                    : "bg-background border-transparent hover:border-gray-200"
                }`}
              >
                <button
                  onClick={() => setActiveId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex items-center justify-between w-full px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl group"
                >
                  <span 
                    className={`font-semibold text-lg transition-colors duration-300 pr-4 ${
                      isOpen ? "text-primary" : "text-secondary group-hover:text-primary"
                    }`}
                  >
                    {item.question}
                  </span>
                  
                  {/* Icône animée */}
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full transition-colors duration-300 ${
                      isOpen ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <FaChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                {/* Contenu de la réponse avec Framer Motion */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 leading-relaxed text-gray-600">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}