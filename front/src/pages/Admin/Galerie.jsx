import { useEffect, useState } from "react";
import { Trash2, ImagePlus, Loader2, ImageIcon, X, Send, Camera, Images, Plus } from "lucide-react";
import api from "../../services/api";

export default function AdminGalerie() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // États de la Modal
  const [showModal, setShowModal] = useState(false);
  const [titre, setTitre] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/galerie");
      // SÉCURITÉ : S'assurer que les données sont bien dans un tableau
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setPhotos(data);
    } catch (e) {
      console.error("Erreur galerie", e);
      setPhotos([]); // Évite le crash
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitre("");
    setImage(null);
    setPreview(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !titre.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("image", image);

    try {
      await api.post("/admin/galerie", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      resetForm();
      fetchPhotos(); // Rafraîchit la liste
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette photo définitivement ?")) return;
    try {
      await api.delete(`/admin/galerie/${id}`);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE D'EN-TÊTE ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Images size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Médiathèque & Galerie
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">
              Gérez les moments forts de l'établissement. Ces photos seront visibles sur la vitrine.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">Ajouter une photo</span><span className="md:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENEUR PRINCIPAL ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* BARRE D'OUTILS (Compteur) */}
        <div className="flex flex-row items-center justify-between gap-3 p-3 bg-white border-b md:p-4 shrink-0 border-black/5">
            <div className="flex items-center gap-2 text-black/60">
              <Camera size={18} />
              <span className="text-sm font-bold">Toutes les photos</span>
            </div>
            <div className="px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {photos?.length || 0} <span className="hidden sm:inline">Photo(s)</span>
            </div>
        </div>

        {/* ZONE DE GRILLE (Scrollable) */}
        <div className="flex-1 p-4 overflow-x-auto overflow-y-auto md:p-6 bg-black/[0.01] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Loader2 className="mx-auto mb-3 animate-spin text-primary" size={32}/>
              <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Chargement de la galerie...</p>
            </div>
          ) : photos?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-4">
              {photos.map(photo => (
                <div key={photo?.id || Math.random()} className="relative overflow-hidden transition-all bg-white border shadow-sm group aspect-square rounded-2xl border-black/5 hover:border-primary/30 hover:shadow-md">
                  
                  {photo?.image ? (
                    <img 
                      src={typeof photo.image === 'string' && photo.image.startsWith('http') ? photo.image : `${backendUrl}${photo.image}`} 
                      alt={photo?.titre || "Photo"}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-black/10 bg-black/5">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 flex flex-col justify-between p-3 transition-all duration-300 opacity-0 bg-black/50 backdrop-blur-[2px] group-hover:opacity-100">
                    <div className="flex justify-end">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                        className="p-2 transition-colors border shadow-sm bg-white/10 backdrop-blur-md border-white/20 text-white/80 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight text-white line-clamp-2 drop-shadow-md">
                        {photo?.titre || "Sans légende"}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center border-2 border-dashed rounded-3xl border-black/5 bg-black/[0.01]">
              <ImageIcon size={48} className="mx-auto mb-4 text-black/20" />
              <h3 className="text-sm font-bold text-black/50">Aucune photo publiée</h3>
              <p className="mt-1 text-xs text-black/40">Utilisez le bouton en haut à droite pour ajouter vos clichés.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODAL D'AJOUT ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={resetForm}>
          <div className="w-full max-w-lg overflow-hidden bg-white border shadow-2xl border-black/5 rounded-3xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-6 py-5 border-b md:px-8 border-black/5 bg-black/[0.02]">
              <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                <ImagePlus className="text-primary" size={20} /> 
                Ajouter une photo
              </h3>
              <button onClick={resetForm} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 md:p-8">
              
              {/* Uploader Image (Carré centré) */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48 cursor-pointer group sm:w-56 sm:h-56 shrink-0">
                  <div className={`w-full h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all bg-black/[0.02] ${preview ? 'border-primary/50' : 'border-black/10 group-hover:border-primary/50 group-hover:bg-white'}`}>
                    {preview ? (
                      <>
                        <img src={preview} className="object-cover w-full h-full opacity-90" alt="Aperçu" />
                        <div className="absolute inset-0 z-10 flex items-center justify-center transition-opacity opacity-0 bg-black/40 backdrop-blur-sm group-hover:opacity-100">
                          <span className="px-3 py-1.5 bg-white text-black rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-widest">Modifier</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center transition-colors text-black/30 group-hover:text-primary">
                        <ImagePlus size={32} strokeWidth={1.5} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Parcourir</span>
                      </div>
                    )}
                  </div>
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer" accept="image/*" required />
                </div>
              </div>

              {/* Champ Titre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Légende de la photo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Cérémonie de remise des diplômes..." 
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-black/5">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-bold text-black bg-white border border-black/10 rounded-xl hover:bg-black/5 transition-colors shadow-sm">
                  Annuler
                </button>
                <button type="submit" disabled={!image || !titre.trim() || uploading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {uploading ? "Envoi..." : "Publier la photo"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}