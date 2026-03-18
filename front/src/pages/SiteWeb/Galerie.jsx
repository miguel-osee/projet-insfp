// src/pages/Galerie.jsx
import { useEffect, useState } from "react";
import HeroSection from "../../components/HeroSecondary";
import { Loader2, Camera, X, Maximize2 } from "lucide-react"; 
import api from "../../services/api";
import galerieBg from "../../assets/images/galerie-bg.jpg";

export default function Galerie() {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTitre, setSelectedTitre] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ URL de base dynamique
  const STORAGE_URL = "https://api.insfp-ouledfayet.com/storage/";

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await api.get("/galerie"); 
        setPhotos(res.data || []);
      } catch (error) {
        console.error("Erreur chargement galerie :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  return (
    <>
      <HeroSection
        title="Galerie"
        subtitle="Moments et activités de l’INSFP Audiovisuel"
        background={galerieBg}
      />

      <section className="px-4 py-16 mx-auto sm:px-6 max-w-7xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="mb-4 animate-spin text-primary" size={40} />
            <p className="font-medium">Chargement des souvenirs...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
            {photos.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden shadow-xl cursor-pointer group sm:rounded-3xl rounded-xl aspect-[4/3] bg-slate-200"
                onClick={() => {
                  setSelectedImage(item.image);
                  setSelectedTitre(item.titre || "Sans titre");
                }}
              >
                <img
                  src={`${STORAGE_URL}${item.image}`}
                  alt={item.titre}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Image+Indisponible"; }}
                />

                <div className="absolute inset-0 flex flex-col justify-end p-3 transition-all duration-500 opacity-0 sm:p-6 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:opacity-100">
                  <div className="flex items-center justify-between gap-2">
                     <p className="text-xs font-black tracking-wider text-white uppercase transition-transform duration-500 translate-y-4 sm:text-sm group-hover:translate-y-0 line-clamp-1">
                       {item.titre || "Moment INSFP"}
                     </p>
                     <div className="hidden p-2 text-white rounded-full sm:block bg-white/20 backdrop-blur-md">
                        <Maximize2 size={16} />
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <Camera size={64} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg italic font-medium">La galerie est vide pour le moment.</p>
          </div>
        )}
      </section>

      {/* MODAL LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-5xl duration-300 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-0 p-3 transition-all rounded-full -top-14 text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>

            <img
              src={`${STORAGE_URL}${selectedImage}`}
              alt={selectedTitre}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            <div className="mt-6 text-center sm:mt-8">
              <h3 className="text-lg font-black tracking-widest text-white uppercase sm:text-xl">
                {selectedTitre}
              </h3>
              <div className="w-12 h-1 mx-auto mt-3 rounded-full sm:mt-4 bg-primary"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}