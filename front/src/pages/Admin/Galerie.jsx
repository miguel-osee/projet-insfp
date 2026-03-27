import { useEffect, useState, useMemo } from "react";
import { Trash2, ImagePlus, Loader2, ImageIcon, X, Send, Camera, Images, Plus, Search, AlertCircle } from "lucide-react";
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

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/galerie");
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setPhotos(data);
    } catch (e) {
      console.error("Erreur galerie", e);
      setPhotos([]);
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
      fetchPhotos();
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

  // Filtrage des photos basé sur le titre
  const filteredPhotos = useMemo(() => {
    return photos.filter(p => (p.titre || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [photos, searchTerm]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 min-h-[calc(100dvh-70px)] md:min-h-[calc(100vh-80px)] bg-background font-sans pb-10">
      
      {/* ===== BANNIÈRE D'EN-TÊTE (HERO) ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <Images size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Médiathèque & Galerie
            </h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Gérez les moments forts de l'établissement. Ces photos seront visibles sur la vitrine.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> <span>Ajouter une photo</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENEUR PRINCIPAL ===== */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS (HARMONISÉE - 1 LIGNE DESKTOP) ===== */}
        <div className="flex flex-col justify-between gap-3 p-3 bg-white border-b xl:flex-row xl:items-center md:p-4 shrink-0 border-black/5">
          
          <div className="flex items-center w-full gap-3 xl:w-auto">
            {/* Barre de Recherche réduite sur Desktop */}
            <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64 lg:w-80 group">
              <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Rechercher une photo..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
              />
            </div>
            
            {/* BOUTON PLUS : Uniquement sur Mobile */}
            <button 
              onClick={() => setShowModal(true)}
              className="flex xl:hidden items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-primary shadow-sm rounded-xl hover:opacity-90 active:scale-95 shrink-0"
            >
              <Plus size={16} strokeWidth={3} /> Ajouter
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
            <Camera size={14} className="text-black/40" />
            {filteredPhotos.length} <span className="hidden xl:inline">Photo(s) en ligne</span>
          </div>
        </div>

        {/* ===== ZONE DE GRILLE ===== */}
        <div className="flex-1 p-3 md:p-6 bg-black/[0.01]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Loader2 className="mx-auto mb-3 animate-spin text-primary" size={40}/>
              <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Synchronisation...</p>
            </div>
          ) : filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-4">
              {filteredPhotos.map(photo => (
                <div key={photo?.id || Math.random()} className="relative overflow-hidden transition-all bg-white border shadow-sm group aspect-square rounded-2xl border-black/5 hover:border-primary/30 hover:shadow-md">
                  
                  {photo?.image ? (
                    <img 
                      src={typeof photo.image === 'string' && photo.image.startsWith('http') ? photo.image : `${backendUrl}${photo.image}`} 
                      alt={photo?.titre || "Photo"}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
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
                    <p className="text-[10px] md:text-xs font-bold leading-tight text-white line-clamp-2 drop-shadow-md">
                      {photo?.titre || "Sans légende"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl border-black/5 bg-black/[0.02]">
              <AlertCircle size={48} className="mx-auto mb-4 text-black/20" />
              <h3 className="text-sm font-bold text-black/50">Galerie vide</h3>
              <p className="mt-1 text-xs text-black/40">Commencez par ajouter les premiers clichés de l'institut.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODAL D'AJOUT ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={resetForm}>
          <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[2rem] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-black/[0.01]">
              <h3 className="flex items-center gap-2 text-xl font-bold text-black">
                <ImagePlus className="text-primary" size={24} /> 
                Ajouter une photo
              </h3>
              <button onClick={resetForm} className="p-2 transition-colors rounded-full text-black/40 hover:text-black hover:bg-black/5">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-6 md:p-8">
                {/* Uploader Image (Carré centré) */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 cursor-pointer group sm:w-56 sm:h-56 shrink-0">
                    <div className={`w-full h-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all bg-black/[0.02] ${preview ? 'border-primary/50' : 'border-black/10 group-hover:border-primary/50 group-hover:bg-white'}`}>
                      {preview ? (
                        <>
                          <img src={preview} className="object-cover w-full h-full opacity-90" alt="Aperçu" />
                          <div className="absolute inset-0 z-10 flex items-center justify-center transition-opacity opacity-0 bg-black/40 backdrop-blur-sm group-hover:opacity-100">
                            <span className="px-4 py-2 text-xs font-bold tracking-widest text-black uppercase bg-white shadow-sm rounded-xl">Modifier</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center transition-colors text-black/30 group-hover:text-primary">
                          <ImagePlus size={32} strokeWidth={1.5} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Parcourir les fichiers</span>
                        </div>
                      )}
                    </div>
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer" accept="image/*" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Légende / Titre</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Laboratoire d'informatique..." 
                    value={titre}
                    onChange={e => setTitre(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm font-bold transition-all bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-black/5 bg-black/[0.01] shrink-0">
                <button type="button" onClick={resetForm} className="flex-1 py-4 text-sm font-bold text-black transition-colors bg-white border shadow-sm border-black/5 rounded-2xl hover:bg-black/5">
                  Annuler
                </button>
                <button type="submit" disabled={!image || !titre.trim() || uploading} className="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all shadow-lg bg-primary rounded-2xl shadow-primary/20 active:scale-95 disabled:opacity-50">
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  <span>{uploading ? "Envoi..." : "Publier la photo"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}