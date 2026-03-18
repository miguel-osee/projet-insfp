import { useRef, useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaClock, FaPaperPlane, FaSpinner } from "react-icons/fa";
import HeroSection from "../../components/HeroSecondary";
import contactBg from "../../assets/images/contact-bg.jpg";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import emailjs from '@emailjs/browser';

export default function Contact() {
  const formRef = useRef();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    const SERVICE_ID = "service_z7svxln";
    const TEMPLATE_ID = "template_i2dlapr";
    const PUBLIC_KEY = "lnEO9LYw-swEhnSDS";

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then((result) => {
          console.log(result.text);
          toast.success("✅ Votre message a été envoyé avec succès !");
          e.target.reset(); // Vide les champs du formulaire après soumission
      }, (error) => {
          console.error(error.text);
          toast.error("❌ Une erreur est survenue lors de l'envoi.");
      })
      .finally(() => {
          setIsSending(false);
      });
  };

  // Variantes pour l'animation en cascade des cartes d'informations
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <HeroSection
        title="Contact"
        subtitle="Contactez l’INSFP Audiovisuel"
        background={contactBg}
      />

      <section className="container my-16 bg-background">
        <div className="grid items-stretch grid-cols-1 gap-12 md:grid-cols-2">
          
          {/* MAP */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full h-full overflow-hidden border shadow-sm border-secondary rounded-2xl min-h-[300px]"
          >
            <iframe
              title="Carte de localisation INSFP"
              src="https://www.google.com/maps/embed?pb=!4v1769451606244!6m8!1m7!1sCAoSHENJQUJJaERGNGlyNVJNaWZuU2RhTWdhcHVRU0c.!2m2!1d36.73106224048661!2d2.952321519025761!3f200.63757!4f0!5f0.7820865974627469"
              className="w-full h-full border-0"
              loading="lazy"
              aria-hidden="false"
            ></iframe>
          </motion.div>

          {/* FORMULAIRE */}
          <motion.form
            ref={formRef} // Ajout de la référence
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between w-full h-full gap-6 p-8 bg-white border shadow-lg rounded-2xl border-primary/20"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="nom" className="text-sm font-medium">Nom</label>
                <input
                  id="nom"
                  name="nom" // Ajout de l'attribut name
                  type="text"
                  placeholder="Votre nom"
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="prenom" className="text-sm font-medium">Prénoms</label>
                <input
                  id="prenom"
                  name="prenom" // Ajout de l'attribut name
                  type="text"
                  placeholder="Vos prénoms"
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                name="email" // Ajout de l'attribut name
                type="email"
                placeholder="exemple@email.com"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <small className="text-xs text-gray-500">Nous ne partagerons jamais votre email.</small>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="tel" className="text-sm font-medium">Téléphone (optionnel)</label>
              <input
                id="tel"
                name="tel" // Ajout de l'attribut name
                type="tel"
                placeholder="Votre numéro"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea
                id="message"
                name="message" // Ajout de l'attribut name
                rows="4"
                placeholder="Votre message..."
                required
                className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSending} // Désactivation pendant l'envoi
              className="flex items-center justify-center w-full gap-2 py-3 mt-2 font-semibold text-white transition rounded-full bg-primary hover:bg-primary/90 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} 
              {isSending ? " Envoi..." : " Envoyer"}
            </button>
          </motion.form>
        </div>

        {/* INFOS CONTACT */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
            
            {/* EMAIL */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 p-6 transition bg-white shadow-sm rounded-xl hover:shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <FaEnvelope className="text-xl text-primary" />
              </div>
              <p className="text-sm font-medium">Email</p>
              <a href="mailto:insfp.of@gmail.com" className="font-normal transition text-primary hover:underline">
                insfp.of@gmail.com
              </a>
            </motion.div>

            {/* TÉLÉPHONE */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 p-6 transition bg-white shadow-sm rounded-xl hover:shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <FaPhoneAlt className="text-xl text-primary" />
              </div>
              <p className="text-sm font-medium">Téléphone</p>
              <a href="tel:020314570" className="font-normal transition text-primary hover:underline">
                020 31 45 70
              </a>
            </motion.div>

            {/* HORAIRES */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 p-6 transition bg-white shadow-sm rounded-xl hover:shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <FaClock className="text-xl text-primary" />
              </div>
              <p className="text-sm font-medium">Horaires</p>
              <p className="font-normal text-center text-primary">
                Dimanche – Jeudi <br/> 08h00 – 16h00
              </p>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Toast container */}
      <Toaster position="bottom-right" />
    </>
  );
}