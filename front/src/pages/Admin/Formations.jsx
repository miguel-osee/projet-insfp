import { useEffect, useState, useMemo } from "react";
import { 
  Plus, Search, Trash2, ChevronDown, ChevronUp, Loader2, X, 
  Upload, Image as ImageIcon, Edit, GraduationCap, BookOpen, Layers
} from "lucide-react";
import api from "../../services/api";

// 🚀 1. NOUVEAUX IMPORTS : On utilise 'react-quill-new' pour éviter le crash findDOMNode
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// 🚀 2. La configuration de l'éditeur est bien EN DEHORS du composant
const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

export default function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSemestre, setActiveSemestre] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [modalActiveSemestre, setModalActiveSemestre] = useState(1);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({ nom: "", description: "", modules: [] });

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/formations");
      setFormations(res.data || []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFormations(); }, []);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpanded(expanded === id ? null : id);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addModule = () => {
    setFormData(prev => ({ 
      ...prev, 
      modules: [...prev.modules, { id: Date.now() + Math.random(), nom: "", semestre_numero: modalActiveSemestre }] 
    }));
  };

  const removeModule = (id) => setFormData(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
  
  const handleModuleChange = (id, value) => {
    setFormData(prev => ({ 
      ...prev, 
      modules: prev.modules.map(m => m.id === id ? { ...m, nom: value } : m) 
    }));
  };

  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      const matchesSearch = f?.nom?.toLowerCase().includes(search.toLowerCase().trim());
      const matchesSemestre = f?.semestres?.some(s => s.numero === activeSemestre);
      return matchesSearch && matchesSemestre;
    });
  }, [formations, search, activeSemestre]);

  const openEditModal = (e, formation) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentId(formation.id);
    setModalActiveSemestre(1); 
    
    const flatModules = [];
    if (formation.semestres) {
      formation.semestres.forEach(sem => {
        if (sem.modules) {
          sem.modules.forEach(mod => flatModules.push({ 
            id: mod.id || Date.now() + Math.random(), 
            nom: mod.nom, 
            semestre_numero: sem.numero 
          }));
        }
      });
    }

    setFormData({ nom: formation.nom, description: formation.description || "", modules: flatModules });

    if (formation.image) {
      const imageUrl = formation.image.startsWith('http') ? formation.image : `${import.meta.env.VITE_API_BASE_URL || 'https://api.insfp-ouledfayet.com'}/storage/${formation.image}`;
      setImagePreview(imageUrl);
    } else { setImagePreview(null); }
    
    setImageFile(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setModalActiveSemestre(1);
    setFormData({ nom: "", description: "", modules: [] });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ nom: "", description: "", modules: [] });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;
  
    try {
      setSaving(true);
      const data = new FormData();
      data.append("nom", formData.nom);
      
      // Sécurité : si le champ description est vide ou ne contient que des balises HTML vides (ex: <p><br></p>)
      const cleanDescription = formData.description.replace(/<[^>]*>?/gm, '').trim();
      data.append("description", cleanDescription === "" ? "" : formData.description);

      if (imageFile) data.append("image", imageFile);
  
      // Filtre anti-bug : on retire les modules vides
      const validModules = formData.modules.filter(m => m.nom && m.nom.trim() !== "");

      validModules.forEach((module, index) => {
        if (module.id && String(module.id).length < 10) {
           data.append(`modules[${index}][id]`, module.id);
        }
        data.append(`modules[${index}][nom]`, module.nom.trim());
        data.append(`modules[${index}][semestre_numero]`, module.semestre_numero);
      });

      if (isEditing) {
        data.append("_method", "PUT");
        await api.post(`/admin/formations/${currentId}`, data);
      } else {
        await api.post("/admin/formations", data);
      }
      await fetchFormations();
      closeModal();
    } catch (error) {
      alert(`Erreur: ${error.response?.data?.message || "Vérifiez les données"}`);
    } finally { setSaving(false); }
  };

  const deleteFormation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette formation et tous ses modules ?")) return;
    try {
      await api.delete(`/admin/formations/${id}`);
      setFormations(prev => prev.filter(f => f.id !== id));
    } catch (error) { alert("Erreur lors de la suppression"); }
  };

  return (
    // 🔒 Verrouillage de la page entière (overflow-hidden)
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== 1. BANNIÈRE D'EN-TÊTE (Figée avec shrink-0) ===== */}
      <div className="relative w-full h-[120px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <BookOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Catalogue Académique
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-1">
              Gérez les spécialités et les modules de formation.
            </p>
          </div>
          
          <button onClick={openCreateModal} className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0">
            <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">Nouvelle Formation</span><span className="md:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* ===== 2. CONTENEUR FLEXIBLE (Prend l'espace restant) ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== A. BARRE DE FILTRES (Figée avec shrink-0) ===== */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:flex-row md:items-center md:justify-between md:p-4 shrink-0 border-black/5">
          <div className="relative w-full md:max-w-xs group shrink-0">
            <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between w-full md:justify-end gap-4 overflow-x-auto [scrollbar-width:none]">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSemestre(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeSemestre === s 
                    ? "bg-secondary text-white shadow-sm" 
                    : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
            <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
              {filteredFormations.length} <span className="hidden lg:inline">Résultat(s)</span>
            </div>
          </div>
        </div>

        {/* ===== B. ZONE DE DÉFILEMENT (Liste qui scrolle à l'intérieur) ===== */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/[0.01]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/40">Chargement...</p>
            </div>
          ) : filteredFormations.length > 0 ? (
            
            <div className="flex flex-col gap-3">
              {filteredFormations.map((formation) => {
                const activeSemData = formation.semestres?.find(s => s.numero === activeSemestre);
                const modulesToList = activeSemData?.modules || [];

                return (
                  <div key={formation.id} className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-black/5 rounded-2xl hover:border-primary/30 hover:shadow-sm">
                    <div onClick={(e) => toggleExpand(e, formation.id)} className="flex items-center gap-3 p-3 cursor-pointer md:p-4 group">
                      <div className="relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-black/[0.03] border border-black/5 flex items-center justify-center">
                        {formation.image ? (
                          <img src={formation.image.startsWith('http') ? formation.image : `${import.meta.env.VITE_API_BASE_URL || 'https://api.insfp-ouledfayet.com'}/storage/${formation.image}`} alt={formation.nom} className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon size={20} className="text-black/20" />
                        )}
                      </div>

                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-black truncate transition-colors md:text-base group-hover:text-primary">{formation.nom}</h3>
                        <p className="text-[10px] md:text-xs font-medium text-black/50 truncate mt-0.5">{modulesToList.length} module(s) en Semestre {activeSemestre}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 transition-opacity opacity-100 md:opacity-0 group-hover:opacity-100">
                          <button onClick={(e) => openEditModal(e, formation)} className="p-2 text-black transition-colors rounded-lg bg-black/5 hover:text-primary hover:bg-primary/10" title="Modifier"><Edit size={14} /></button>
                          <button onClick={(e) => deleteFormation(e, formation.id)} className="p-2 text-black transition-colors rounded-lg bg-black/5 hover:text-red-500 hover:bg-red-50" title="Supprimer"><Trash2 size={14} /></button>
                        </div>
                        <div className={`p-1.5 rounded-lg transition-colors border ${expanded === formation.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-transparent border-transparent text-black/40 group-hover:text-primary"}`}>
                          {expanded === formation.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {expanded === formation.id && (
                      <div className="p-4 pt-0 border-t md:p-5 border-black/5 bg-black/[0.01] animate-in slide-in-from-top-2">
                        {formation.description && (
                          <div 
                            className="mb-5 text-sm font-medium leading-relaxed prose-sm prose text-black/70 max-w-none"
                            dangerouslySetInnerHTML={{ __html: formation.description }}
                          />
                        )}
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-bold tracking-widest text-primary uppercase"><Layers size={14} /> Modules - Semestre {activeSemestre}</div>
                        {modulesToList.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {modulesToList.map((mod) => (
                              <div key={mod.id} className="flex items-center gap-2.5 p-3 bg-white border border-black/5 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-xs font-bold leading-tight text-black/80">{mod.nom}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="p-3 text-[10px] italic text-center text-black/40 border border-dashed border-black/10 rounded-xl bg-white">Aucun module n'a été ajouté pour le Semestre {activeSemestre}.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center border-2 border-dashed border-black/5 rounded-3xl bg-black/[0.02]">
              <GraduationCap className="mb-4 text-black/20" size={48} />
              <h3 className="text-sm font-bold text-black/50">Aucun résultat</h3>
              <p className="mt-1 text-xs text-black/30">Aucune formation trouvée pour le Semestre {activeSemestre}.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="w-full max-w-2xl bg-white border border-black/5 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b md:px-8 border-black/5 bg-black/[0.02]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                <BookOpen size={20} className="text-primary" />
                {isEditing ? "Modifier la formation" : "Créer une formation"}
              </h2>
              <button onClick={closeModal} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5"><X size={20}/></button>
            </div>

            <form id="formationForm" onSubmit={handleSave} className="p-6 md:p-8 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div>
                <label className="block ml-1 mb-2 text-[10px] font-bold text-black/50 uppercase tracking-widest">Image de couverture</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer" />
                  <div className={`relative w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all bg-black/[0.02] overflow-hidden group ${imagePreview ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-primary/40 hover:bg-white'}`}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full opacity-90" />
                        <div className="absolute z-10 flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-black bg-white shadow-md bottom-3 right-3 rounded-xl pointer-events-none">
                           <Edit size={14} className="text-primary" /> Changer l'image
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <Upload size={24} className="mx-auto mb-2 transition-colors text-black/30 group-hover:text-primary" />
                        <p className="text-sm font-bold text-black/60">Glissez ou cliquez pour uploader une image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block ml-1 mb-1.5 text-[10px] font-bold text-black/50 uppercase tracking-widest">Intitulé de la formation</label>
                  <input type="text" required value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Ex: Master Audiovisuel..." />
                </div>
                
                {/* 🚀 L'ÉDITEUR REACT-QUILL-NEW */}
                <div className="flex flex-col">
                  <label className="block ml-1 mb-1.5 text-[10px] font-bold text-black/50 uppercase tracking-widest">Description</label>
                  <div className="overflow-hidden transition-all bg-white border shadow-sm border-black/10 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.description} 
                      onChange={content => setFormData({ ...formData, description: content })}
                      modules={quillModules}
                      placeholder="Décrivez les objectifs de la formation, le programme..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/5">
                 <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="ml-1 text-[10px] font-bold text-black/50 uppercase tracking-widest">Modules du programme</label>
                    <div className="flex gap-1 p-1 overflow-x-auto border bg-black/[0.02] border-black/5 rounded-xl [scrollbar-width:none]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setModalActiveSemestre(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${modalActiveSemestre === s ? "bg-white text-primary shadow-sm border border-black/5" : "text-black/50 hover:text-black hover:bg-black/5"}`}>S{s}</button>
                      ))}
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                   {formData.modules.filter(mod => mod.semestre_numero === modalActiveSemestre).map((mod, idx) => (
                       <div key={mod.id || idx} className="flex items-center gap-3 p-2 pl-3 transition-colors border border-black/5 bg-black/[0.02] rounded-xl group hover:border-primary/20 hover:bg-white">
                          <input required className="flex-1 w-full text-sm font-bold bg-transparent outline-none focus:text-primary" placeholder="Saisissez le nom du module..." value={mod.nom} onChange={e => handleModuleChange(mod.id, e.target.value)} />
                          <button type="button" onClick={() => removeModule(mod.id)} className="p-2 transition-colors bg-white border rounded-lg shadow-sm shrink-0 border-black/5 text-black/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50"><Trash2 size={16}/></button>
                       </div>
                     ))}
                   <button type="button" onClick={addModule} className="flex items-center justify-center w-full gap-2 p-3 text-xs font-bold transition-colors border border-dashed text-primary bg-primary/5 border-primary/20 rounded-xl hover:bg-primary/10">
                     <Plus size={16} strokeWidth={3} /> Ajouter un module au Semestre {modalActiveSemestre}
                   </button>
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 px-6 py-4 mt-auto border-t border-black/5 bg-black/[0.02]">
              <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-bold text-black bg-white border border-black/5 rounded-xl hover:bg-black/5 transition-colors shadow-sm">Annuler</button>
              <button type="submit" form="formationForm" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all shadow-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isEditing ? "Enregistrer" : "Créer la formation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}