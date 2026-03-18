import Hero from "../../components/Hero";
import About from "../../components/About";
import FormationsPreview from "../../components/FormationsPreview";
import Footer from "../../components/Footer";
import Stats from "../../components/Stat";
import NewsPreview from"../../components/ActualitesPreview"
import Faq from"../../components/Faq";
import InscriptionMini from "../../components/InscriptionMini";
import Testimonials from "../../components/testimonals";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FormationsPreview />
      <InscriptionMini/>
      <NewsPreview/>
      <Testimonials/>
      <Faq/>
  
      
      
    </>
  );
}
