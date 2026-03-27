import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Loader2, Newspaper, Send, Megaphone, X, Search, AlertCircle } from "lucide-react";
import api from "../../services/api";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

export default function AdminArticles() {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState(""); 
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  // ✨ FONCTION MAGIQUE : Transforme le HTML en texte brut pour les aperçus
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const fetchActualites = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/actualites");
      let data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setActualites(data);
    } catch (error) {
      console.error("Erreur chargement :", error);
      setActualites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActualites(); }, []);

  const handleImageChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitre("");
    setContenu("");
    setImage(null);
    setImagePreview(null);
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("titre", titre);
    
    // On envoie le HTML brut tel quel à la base de données
    const isActuallyEmpty = stripHtml(contenu).trim() === "";
    formData.append("contenu", isActuallyEmpty ? "" : contenu);

    if (image) formData.append("image", image);

    try {
      if (editId) {
        await api.post(`/admin/actualites/${editId}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/actualites", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      fetchActualites();
    } catch (error) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (actu) => {
    setEditId(actu.id);
    setTitre(actu.titre || "");
    setContenu(actu.contenu || "");
    if (actu.image) {
      setImagePreview(actu.image.startsWith('http') ? actu.image : `${backendUrl}${actu.image}`);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    try {
      await api.delete(`/admin/actualites/${id}`);
      setActualites(prev => prev.filter(a => a.id !== id));
    } catch (error) { console.error(error); }
  };

  const filteredActualites = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return actualites.filter(a => a.titre?.toLowerCase().includes(term));
  }, [actualites, searchTerm]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background font-sans">
      
      {/* BANNIÈRE HERO */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
            <Megaphone size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">Actualités</h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Gérez les annonces et les publications du site vitrine de l'institut.
            </p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> <span>Nouvel Article</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* BARRE D'OUTILS */}
        <div className="flex flex-col justify-between gap-3 p-3 bg-white border-b xl:flex-row xl:items-center md:p-4 shrink-0 border-black/5">
            <div className="flex items-center w-full gap-3 xl:w-auto">
              <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64 lg:w-80 group">
                <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
                <input 
                  type="text" 
                  placeholder="Rechercher un article..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                />
              </div>
              <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex xl:hidden items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-primary shadow-sm rounded-xl hover:opacity-90 active:scale-95 shrink-0"
              >
                <Plus size={16} strokeWidth={3} /> Ajouter
              </button>
            </div>
            <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {filteredActualites.length} <span className="hidden xl:inline">Article(s)</span>
            </div>
        </div>

        {/* LISTE DES ARTICLES */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-black/[0.01]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Chargement...</p>
             </div>
          ) : filteredActualites.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredActualites.map((actu) => (
                <div key={actu.id} className="flex flex-col overflow-hidden transition-all bg-white border shadow-sm border-black/5 rounded-2xl group hover:border-primary/30 hover:shadow-md">
                  <div className="relative overflow-hidden aspect-video bg-black/[0.03]">
                    {actu.image ? (
                      <img src={actu.image.startsWith('http') ? actu.image : `${backendUrl}${actu.image}`} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" alt={actu.titre} />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-black/20"><Newspaper size={40} /></div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="mb-2 text-sm font-bold leading-tight text-secondary line-clamp-2">{actu.titre}</h3>
                    {/* ✨ CORRECTION ICI : On utilise stripHtml pour n'afficher que le texte sans les balises dans la carte */}
                    <p className="mb-4 text-[11px] leading-relaxed text-black/50 line-clamp-3">
                      {stripHtml(actu.contenu)}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-3 mt-auto border-t border-black/5">
                        <button onClick={() => handleEdit(actu)} className="p-2 transition-all bg-white border rounded-lg text-black/40 hover:text-primary hover:border-primary/20"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(actu.id)} className="p-2 transition-all bg-white border rounded-lg text-black/40 hover:text-red-500 hover:border-red-200"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center border-2 border-dashed border-black/5 rounded-3xl">
              <AlertCircle className="mb-4 text-black/20" size={48} />
              <h3 className="text-sm font-bold text-black/50">Aucun résultat</h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={resetForm}>
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-black/[0.01]">
              <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                <Newspaper className="text-primary" size={24}/> {editId ? "Modifier" : "Nouveau"}
              </h2>
              <button onClick={resetForm} className="p-2 transition-colors rounded-full text-black/40 hover:text-black hover:bg-black/5"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 p-6 space-y-6 overflow-y-auto md:p-8 [scrollbar-width:none]">
                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                  <div className="w-full md:w-56 shrink-0">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1 block mb-2">Image</label>
                    <div className="relative aspect-square md:aspect-[3/4] rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center overflow-hidden hover:border-primary/40 transition-colors bg-black/[0.02]">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 z-10 opacity-0 cursor-pointer" />
                        {imagePreview ? (
                          <img src={imagePreview} className="object-cover w-full h-full opacity-90" alt="Preview" />
                        ) : (
                          <ImagePlus className="text-black/20" size={32} />
                        )}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1 block">Titre</label>
                        <input 
                          required type="text" 
                          value={titre} 
                          onChange={e => setTitre(e.target.value)} 
                          className="w-full px-4 py-3.5 text-sm font-bold bg-black/[0.03] border-none outline-none rounded-2xl focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1 block mb-1.5">Contenu</label>
                        {/* ✨ STYLE DE L'ÉDITEUR : Pour qu'il ressemble à ton design */}
                        <div className="flex-1 overflow-hidden transition-all bg-white border border-black/10 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20">
                          <style>{`
                            .ql-container { border: none !important; font-family: inherit; font-size: 14px; }
                            .ql-toolbar { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; background: #f9f9f9; }
                            .ql-editor { min-height: 200px; }
                          `}</style>
                          <ReactQuill theme="snow" value={contenu} onChange={setContenu} modules={quillModules} className="h-full" />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-black/5 bg-black/[0.01]">
                <button type="button" onClick={resetForm} className="flex-1 py-4 text-sm font-bold text-black transition-all bg-white border rounded-2xl hover:bg-black/5">Annuler</button>
                <button type="submit" disabled={saving} className="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all shadow-lg bg-primary rounded-2xl active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  <span>{editId ? "Enregistrer" : "Publier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}