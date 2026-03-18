import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Loader2, Newspaper, Send, Megaphone, X, Search } from "lucide-react";
import api from "../../services/api";

// 🚀 IMPORT DE LA BIBLIOTHÈQUE MISE À JOUR (Évite le crash findDOMNode)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// 🚀 CONFIGURATION DE L'ÉDITEUR (Sortie du composant pour la stabilité)
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
    
    // Nettoyage de sécurité pour le contenu vide
    const isActuallyEmpty = contenu.replace(/<[^>]*>?/gm, '').trim() === "";
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
    if (!window.confirm("Supprimer cet article ?")) return;
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
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* HEADER */}
      <div className="relative w-full h-[130px] md:h-[200px] shrink-0 p-6 overflow-hidden text-white bg-secondary rounded-3xl border border-black/5 flex items-center">
        <div className="absolute right-0 opacity-5 -bottom-10">
            <Megaphone size={300} />
        </div>
        <div className="relative z-10 flex flex-col w-full gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-4xl">Actualités</h1>
            <p className="text-xs opacity-80 md:text-sm">Gérez les publications du site vitrine.</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all bg-primary rounded-2xl hover:opacity-90 w-fit">
            <Plus size={18} /> Nouvel Article
          </button>
        </div>
      </div>

      {/* LISTE ET RECHERCHE */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-3xl">
        <div className="p-4 border-b border-black/5">
            <div className="relative max-w-md">
                <Search size={18} className="absolute -translate-y-1/2 text-black/30 left-4 top-1/2" />
                <input 
                    type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2.5 pl-12 pr-4 text-sm bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:border-primary"
                />
            </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto md:p-6 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40}/></div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredActualites.map((actu) => (
                <div key={actu.id} className="flex flex-col overflow-hidden transition-all bg-white border border-black/5 rounded-2xl group hover:border-primary/30">
                  <div className="overflow-hidden aspect-video bg-black/5">
                    <img src={actu.image?.startsWith('http') ? actu.image : `${backendUrl}${actu.image}`} className="object-cover w-full h-full transition-transform group-hover:scale-105" alt="" />
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="mb-2 text-sm font-bold line-clamp-2">{actu.titre}</h3>
                    <p className="mb-4 text-xs text-black/50 line-clamp-3">{actu.contenu?.replace(/<[^>]*>?/gm, '')}</p>
                    <div className="flex items-center justify-between pt-3 mt-auto border-t">
                        <button onClick={() => handleEdit(actu)} className="flex items-center gap-1 text-xs font-bold hover:text-primary"><Pencil size={14}/> Modifier</button>
                        <button onClick={() => handleDelete(actu.id)} className="transition-colors text-black/20 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL AVEC FIX DÉBORDEMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={resetForm}>
          <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <h3 className="flex items-center gap-2 text-lg font-bold"><Newspaper className="text-primary"/> {editId ? "Modifier l'article" : "Nouvel article"}</h3>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-black/5"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto md:p-8">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* IMAGE */}
                <div className="w-full md:w-48 shrink-0">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-2">Couverture</label>
                   <div className="relative aspect-square rounded-2xl border-2 border-dashed border-black/10 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors bg-black/[0.01]">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 z-10 opacity-0 cursor-pointer" />
                      {imagePreview ? <img src={imagePreview} className="object-cover w-full h-full" /> : <ImagePlus className="text-black/20" size={30} />}
                   </div>
                </div>

                {/* TEXTE AVEC MIN-W-0 POUR ÉVITER DÉBORDEMENT */}
                <div className="flex flex-col flex-1 min-w-0 gap-5">
                   <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-2">Titre</label>
                      <input required type="text" value={titre} onChange={e => setTitre(e.target.value)} className="w-full p-3 text-sm font-bold bg-white border outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20" />
                   </div>
                   
                   <div className="min-w-0">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-2">Contenu de l'article</label>
                      <div className="overflow-hidden border border-black/10 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20">
                        <style>{`.ql-container{border:none!important;font-size:14px;}.ql-toolbar{border:none!important;border-bottom:1px solid #f1f1f1!important;background:#fafafa;}.ql-editor{min-height:200px;word-break:break-word;}`}</style>
                        <ReactQuill theme="snow" value={contenu} onChange={setContenu} modules={quillModules} className="w-full" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-bold border rounded-xl hover:bg-black/5">Annuler</button>
                <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 