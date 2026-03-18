import { useEffect, useState, useRef } from "react";
import { UserGroupIcon, AcademicCapIcon, BriefcaseIcon, ClockIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// --- COMPOSANT ENFANT : Le compteur animé ---
const Counter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const duration = 2000;
    const finalValue = parseInt(value, 10);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setCount(Math.floor(easeProgress * finalValue));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="text-5xl font-extrabold tracking-tight text-secondary md:text-6xl">
      {count}
      {/* Le suffixe (+) en primary pour garder la charte graphique */}
      <span className="text-primary">{suffix}</span>
    </span>
  );
};

// --- COMPOSANT PARENT ---
export default function Stats() {
  const statsData = [
    { label: "Stagiaires formés", value: 1200, icon: UserGroupIcon, suffix: "+" },
    { label: "Formations", value: 25, icon: AcademicCapIcon, suffix: "" },
    { label: "Professeurs", value: 40, icon: BriefcaseIcon, suffix: "+" },
    { label: "Années d'expérience", value: 15, icon: ClockIcon, suffix: "" },
  ];

  return (
    <section className="py-20 mt-14">
      <div className="px-6 mx-auto max-w-7xl">
        
        {/* Le bloc unifié avec le fond JAUNE */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col overflow-hidden bg-secondary border border-transparent shadow-2xl md:flex-row rounded-[2.5rem] shadow-jaune/20 divide-y md:divide-y-0 md:divide-x divide-secondary/10"
        >
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center flex-1 p-10 transition-all duration-300 hover:brightness-95 group"
              >
                {/* Icône sur fond blanc pour bien contraster avec le jaune */}
                <div className="flex items-center justify-center w-12 h-12 mb-5 transition-transform duration-300 bg-white shadow-sm rounded-xl text- group-hover:scale-110">
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Le chiffre animé */}
                <Counter value={stat.value} suffix={stat.suffix} />
                
                {/* Le texte assombri pour être bien lisible sur le jaune */}
                <p className="mt-3 text-sm font-bold tracking-widest text-white uppercase ">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}