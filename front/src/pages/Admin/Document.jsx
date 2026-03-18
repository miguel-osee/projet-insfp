import { useState, useEffect, useMemo } from "react";
import { 
  FileText, Plus, Search, Trash2, Download, 
  FileUp, Loader2, X, FolderOpen, BookOpen, 
  FileLock2, Calendar, ChevronDown, CheckCircle2
} from "lucide-react";
import api from "../../services/api";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormationFilter, setSelectedFormationFilter] = useState("");
  const [activeSemestre, setActiveSemestre] = useState("all");
  
  // États d'ajout
  const [newDoc, setNewDoc] = useState({ titre: "", type: "pedagogique", formation_id: "", semestre_id: "" });
  const [semestresForm, setSemestresForm] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const backendUrl = "https://api.insfp-ouledfayet.com/storage/";

  useEffect(() => { 
    fetchDocs(); 
    fetchFormations();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get("/admin/documents");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setDocuments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchFormations = async () => {
    try {
      const res = await api.get("/admin/formations"); 
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setFormations(data);
    } catch (e) { console.error(e); }
  };

  // 🚀 Charger les semestres quand on choisit une formation dans le formulaire
  const handleFormationChange = async (e) => {
    const val = e.target.value;
    setNewDoc(prev => ({ ...prev, formation_id: val, semestre_id: "" })); // Reset du semestre
    
    if (val) {
      try {
        const res = await api.get(`/admin/formations/${val}/semestres`);
        setSemestresForm(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) { console.error(err); }
    } else {
      setSemestresForm([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Veuillez sélectionner un fichier.");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("titre", newDoc.titre);
    formData.append("type", newDoc.type);          
    formData.append("fichier", selectedFile);       
    
    // On s'assure d'envoyer les ID uniquement s'ils sont sélectionnés
    if (newDoc.formation_id) formData.append("formation_id", newDoc.formation_id);
    if (newDoc.semestre_id) formData.append("semestre_id", newDoc.semestre_id);

    try {
      await api.post("/admin/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setShowModal(false);
      await fetchDocs(); // Recharger les documents pour avoir les ID à jour
      
      setNewDoc({ titre: "", type: "pedagogique", formation_id: "", semestre_id: "" });
      setSelectedFile(null);
      setSemestresForm([]);
    } catch (e) { 
      console.error("Erreur d'envoi:", e.response?.data);
      alert("Erreur lors de l'envoi. Vérifiez que la base de données accepte ces champs."); 
    } finally { 
      setUploading(false); 
    }
  };

  const deleteDoc = async (id) => {
    if(!window.confirm("Supprimer ce document définitivement ?")) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e) { console.error(e); }
  };

  const getCategoryStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "reglement": return { icon: <FileLock2 size={14} />, bg: "bg-black/[0.02] text-black border-black/5", label: "Règlement" };
      case "pedagogique": return { icon: <BookOpen size={14} />, bg: "bg-primary/10 text-primary border-primary/20", label: "Cours" };
      case "calendrier": return { icon: <Calendar size={14} />, bg: "bg-black/5 text-black border-black/10", label: "Planning" };
      case "examen": return { icon: <FileText size={14} />, bg: "bg-secondary/10 text-secondary border-secondary/20", label: "Examen" };
      default: return { icon: <FileText size={14} />, bg: "bg-black/5 text-black/60 border-black/5", label: "Autre" };
    }
  };

  // 🚀 SYSTÈME DE FILTRES INTELLIGENT (Texte + Spécialité + Semestre)
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      // 1. Recherche Texte
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = (d.titre || "").toLowerCase().includes(searchStr) || (d.type || "").toLowerCase().includes(searchStr);
      
      // 2. Filtre Formation
      const matchesFormation = selectedFormationFilter ? String(d.formation_id) === String(selectedFormationFilter) : true;
      
      // 3. Filtre Semestre
      let docSemNum = 0;
      if (d.semestre?.numero) {
        docSemNum = parseInt(d.semestre.numero);
      } else if (d.semestre_id && formations.length > 0) {
        // Si l'API renvoie juste l'ID, on cherche le numéro dans la liste des formations
        const form = formations.find(f => String(f.id) === String(d.formation_id));
        const sem = form?.semestres?.find(s => String(s.id) === String(d.semestre_id));
        if (sem) docSemNum = parseInt(sem.numero);
      }
      
      const matchesSemestre = activeSemestre === "all" ? true : docSemNum === parseInt(activeSemestre);

      return matchesSearch && matchesFormation && matchesSemestre;
    });
  }, [documents, searchTerm, selectedFormationFilter, activeSemestre, formations]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE D'EN-TÊTE ===== */}
      <div className="relative w-full h-[130px] md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <FolderOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl line-clamp-1">
              Gestion des Documents
            </h1>
            <p className="max-w-xl text-xs font-medium md:text-sm text-white/80 line-clamp-2">
              Publiez et gérez les supports de cours, plannings et documents par semestre.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">Publier un fichier</span><span className="md:hidden">Publier</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENEUR PRINCIPAL ===== */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* BARRE D'OUTILS ET FILTRES */}
        <div className="flex flex-col gap-3 p-3 bg-white border-b md:flex-row md:items-center md:justify-between md:p-4 shrink-0 border-black/5">
            
            <div className="flex items-center w-full gap-3 md:w-auto">
              <div className="relative w-1/2 md:w-48 shrink-0">
                <select value={selectedFormationFilter} onChange={e => setSelectedFormationFilter(e.target.value)} className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-xs md:text-sm font-bold outline-none cursor-pointer transition-all">
                  <option value="">Toutes les spécialités</option>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-black/40"/>
              </div>
              <div className="relative w-1/2 md:w-48 shrink-0 group">
                <Search size={16} className="absolute transition-colors -translate-y-1/2 text-black/40 left-3 top-1/2 group-focus-within:text-primary" />
                <input 
                  type="text" placeholder="Rechercher..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-3 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:justify-end gap-3 overflow-x-auto [scrollbar-width:none]">
              <div className="flex items-center gap-1.5">
                {["all", 1, 2, 3, 4, 5].map(num => (
                  <button key={num} onClick={() => setActiveSemestre(num)} className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeSemestre === num ? "bg-secondary text-white shadow-sm" : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"}`}>
                    {num === "all" ? "Tous" : `S${num}`}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filteredDocs.length} <span className="hidden lg:inline">Document(s)</span>
              </div>
            </div>
        </div>

        {/* ZONE DU TABLEAU */}
        <div className="flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-white border-b border-black/5 backdrop-blur-md bg-white/90">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Document</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Catégorie</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Spécialité</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-center">Niveau Actuel</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Date d'ajout</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <Loader2 className="mx-auto mb-2 animate-spin text-primary" size={32}/>
                    <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Chargement des fichiers...</p>
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const style = getCategoryStyle(doc.type);
                  
                  // Croisement forcé pour retrouver le nom de la formation et du semestre
                  const formAssociee = formations.find(f => String(f.id) === String(doc.formation_id));
                  const nomFormation = doc.formation?.nom || formAssociee?.nom;
                  
                  const semAssocie = formAssociee?.semestres?.find(s => String(s.id) === String(doc.semestre_id));
                  const numSemestre = doc.semestre?.numero || doc.semestre_numero || semAssocie?.numero;

                  return (
                    <tr key={doc.id} className="transition-colors hover:bg-black/[0.01] group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 transition-all rounded-xl bg-black/5 text-black/40 shrink-0 group-hover:bg-primary/10 group-hover:text-primary">
                            <FileText size={18} />
                          </div>
                          <span className="text-sm font-bold text-black transition-colors group-hover:text-primary line-clamp-1">{doc.titre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg ${style.bg}`}>
                          {style.icon} {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-black/80 line-clamp-1">
                          {nomFormation || <span className="italic text-black/40">Général (Tous)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {numSemestre ? (
                          <span className="px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-wider text-primary uppercase border border-primary/20 rounded-lg bg-primary/10">
                            S{numSemestre}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-black/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-black/50 bg-black/[0.02] px-3 py-1.5 rounded-lg border border-black/5">
                          {new Date(doc.created_at || Date.now()).toLocaleDateString("fr-FR")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`${backendUrl}${doc.fichier}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 transition-all bg-white border rounded-lg shadow-sm text-black/40 border-black/5 hover:text-primary hover:bg-primary/5 hover:border-primary/20" 
                            title="Télécharger"
                          >
                            <Download size={16} />
                          </a>
                          <button 
                            onClick={() => deleteDoc(doc.id)} 
                            className="p-2 transition-all bg-white border rounded-lg shadow-sm text-black/40 border-black/5 hover:text-red-600 hover:bg-red-50 hover:border-red-200" 
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center text-black/40 bg-black/[0.01]">
                    <FolderOpen className="mx-auto mb-3 text-black/20" size={40} />
                    <p className="text-sm font-bold text-black/50">Aucun document trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL D'AJOUT ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg overflow-hidden bg-white border shadow-2xl border-black/5 rounded-3xl" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-black/[0.02]">
              <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                <FileUp className="text-primary" size={20} /> 
                Publier un document
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 transition-colors rounded-lg text-black/40 hover:text-black hover:bg-black/5">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-5 md:p-8 max-h-[80vh] overflow-y-auto [scrollbar-width:none]">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Titre du document</label>
                <input 
                  type="text" 
                  value={newDoc.titre} 
                  onChange={e => setNewDoc({...newDoc, titre: e.target.value})} 
                  placeholder="Ex: Règlement intérieur 2026..."
                  className="w-full px-4 py-3 text-sm font-bold transition-all bg-white border shadow-sm outline-none border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Type de document</label>
                  <div className="relative">
                    <select 
                      value={newDoc.type} 
                      onChange={e => setNewDoc({...newDoc, type: e.target.value})} 
                      className="w-full px-4 py-3 text-sm font-bold text-black transition-all bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="pedagogique">Cours</option>
                      <option value="calendrier">Emploi du temps</option>
                      <option value="reglement">Règlement</option>
                      <option value="examen">Examen</option>
                    </select>
                    <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-3 top-1/2"/>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Spécialité concernée</label>
                  <div className="relative">
                    <select 
                      value={newDoc.formation_id} 
                      onChange={handleFormationChange} 
                      className="w-full px-4 py-3 text-sm font-bold text-black transition-all bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Général (Tous)</option>
                      {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-3 top-1/2"/>
                  </div>
                </div>
              </div>

              <div className={`space-y-1.5 transition-all ${newDoc.formation_id ? 'opacity-100 block' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Niveau ciblé (Optionnel)</label>
                <div className="relative">
                  <select 
                    value={newDoc.semestre_id} 
                    onChange={e => setNewDoc({...newDoc, semestre_id: e.target.value})} 
                    disabled={!newDoc.formation_id}
                    className="w-full px-4 py-3 text-sm font-bold text-black transition-all bg-white border shadow-sm outline-none appearance-none cursor-pointer border-black/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-black/5"
                  >
                    <option value="">Tous les semestres</option>
                    {semestresForm.map(s => <option key={s.id} value={s.id}>Semestre {s.numero}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute -translate-y-1/2 pointer-events-none text-black/40 right-3 top-1/2"/>
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Fichier</label>
                <div className="relative cursor-pointer group">
                  <div className={`w-full p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all bg-black/[0.02] group-hover:bg-white group-hover:border-primary/50 ${selectedFile ? 'border-primary bg-primary/5' : 'border-black/10'}`}>
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-primary">
                        <CheckCircle2 size={32} className="mb-2 text-primary" />
                        <span className="text-sm font-bold line-clamp-1">{selectedFile.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-primary/70">Prêt à envoyer</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center transition-colors text-black/40 group-hover:text-primary">
                        <FileUp size={32} strokeWidth={1.5} className="mb-2" />
                        <span className="text-sm font-bold text-black/60 group-hover:text-primary">Sélectionner un fichier</span>
                        <span className="text-[10px] uppercase tracking-widest mt-1">PDF, DOCX, JPG, PNG</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-black/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-black bg-white border border-black/5 rounded-xl hover:bg-black/5 transition-colors shadow-sm">
                  Annuler
                </button>
                <button type="submit" disabled={uploading || !selectedFile} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                  {uploading ? "Envoi..." : "Publier"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}