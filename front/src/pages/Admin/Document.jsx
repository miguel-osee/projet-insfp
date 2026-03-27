import { useState, useEffect, useMemo } from "react";
import { 
  FileText, Plus, Search, Trash2, Download, 
  FileUp, Loader2, X, FolderOpen, BookOpen, 
  FileLock2, Calendar, ChevronDown, CheckCircle2, AlertCircle
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

  const handleFormationChange = async (e) => {
    const val = e.target.value;
    setNewDoc(prev => ({ ...prev, formation_id: val, semestre_id: "" }));
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
    if (newDoc.formation_id) formData.append("formation_id", newDoc.formation_id);
    if (newDoc.semestre_id) formData.append("semestre_id", newDoc.semestre_id);

    try {
      await api.post("/admin/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setShowModal(false);
      await fetchDocs();
      setNewDoc({ titre: "", type: "pedagogique", formation_id: "", semestre_id: "" });
      setSelectedFile(null);
    } catch (e) { alert("Erreur lors de l'envoi."); } 
    finally { setUploading(false); }
  };

  const deleteDoc = async (id) => {
    if(!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e) { console.error(e); }
  };

  const getCategoryStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "reglement": return { icon: <FileLock2 size={14} />, bg: "bg-black/[0.04] text-black border-black/5", label: "Règlement" };
      case "pedagogique": return { icon: <BookOpen size={14} />, bg: "bg-primary/10 text-primary border-primary/20", label: "Cours" };
      case "calendrier": return { icon: <Calendar size={14} />, bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Planning" };
      case "examen": return { icon: <FileText size={14} />, bg: "bg-secondary/10 text-secondary border-secondary/20", label: "Examen" };
      default: return { icon: <FileText size={14} />, bg: "bg-black/5 text-black/60 border-black/5", label: "Autre" };
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = (d.titre || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFormation = selectedFormationFilter ? String(d.formation_id) === String(selectedFormationFilter) : true;
      let docSemNum = d.semestre?.numero || d.semestre_numero;
      if (!docSemNum && d.semestre_id) {
         const form = formations.find(f => String(f.id) === String(d.formation_id));
         docSemNum = form?.semestres?.find(s => String(s.id) === String(d.semestre_id))?.numero;
      }
      const matchesSemestre = activeSemestre === "all" ? true : parseInt(docSemNum) === parseInt(activeSemestre);
      return matchesSearch && matchesFormation && matchesSemestre;
    });
  }, [documents, searchTerm, selectedFormationFilter, activeSemestre, formations]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-3 md:p-5 md:gap-6 h-[calc(100dvh-70px)] md:h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* ===== BANNIÈRE (HERO) ===== */}
      <div className="relative w-full min-h-[120px] h-auto md:h-[220px] shrink-0 p-5 md:p-10 overflow-hidden text-white bg-secondary rounded-2xl md:rounded-3xl border border-black/5 flex items-center">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
          <FolderOpen size={250} className="md:w-[350px] md:h-[350px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full h-full gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold tracking-tight md:mb-2 md:text-4xl">
              Gestion Documentaire
            </h1>
            <p className="max-w-sm text-xs font-medium leading-relaxed md:text-sm text-white/80 md:max-w-full">
              Publiez et organisez les ressources pédagogiques de l'institut.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white transition-all bg-primary shadow-sm rounded-xl md:rounded-2xl hover:opacity-90 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> <span>Publier un fichier</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl md:rounded-3xl">
        
        {/* ===== BARRE D'OUTILS ET FILTRES ===== */}
        <div className="flex flex-col justify-between gap-3 p-3 bg-white border-b xl:flex-row xl:items-center md:gap-4 md:p-4 shrink-0 border-black/5">
            
            {/* GROUPE GAUCHE : Recherche + Spécialités */}
            <div className="flex flex-col items-center w-full gap-3 sm:flex-row xl:w-auto">
              
              {/* Barre de Recherche (réduite) */}
              <div className="flex items-center w-full gap-3 sm:w-auto">
                <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64 lg:w-72 group">
                  <Search size={18} className="absolute transition-colors -translate-y-1/2 text-black/40 left-4 top-1/2 group-focus-within:text-primary" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un document..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2.5 pl-11 pr-4 text-xs md:text-sm font-medium transition-all bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white"
                  />
                </div>
                
                {/* Bouton Ajouter : Uniquement sur Mobile */}
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex sm:hidden items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-primary shadow-sm rounded-xl hover:opacity-90 active:scale-95 shrink-0"
                >
                  <Plus size={16} strokeWidth={3} /> Ajouter
                </button>
              </div>

              {/* Sélecteur de Spécialités */}
              <div className="relative w-full sm:w-56 shrink-0">
                <select 
                  value={selectedFormationFilter} 
                  onChange={e => setSelectedFormationFilter(e.target.value)} 
                  className="w-full appearance-none bg-black/[0.02] border border-black/5 text-black py-2.5 pl-4 pr-10 rounded-xl text-xs md:text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Toutes les spécialités</option>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
              </div>
            </div>

            {/* GROUPE DROITE : Semestres + Compteur */}
            <div className="flex items-center justify-between w-full xl:w-auto gap-4 overflow-x-auto [scrollbar-width:none]">
              
              {/* Sélecteur de Semestres */}
              <div className="flex items-center gap-1.5 shrink-0 pb-1 sm:pb-0">
                {["all", 1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num} 
                    onClick={() => setActiveSemestre(num)} 
                    className={`px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeSemestre === num 
                      ? "bg-secondary text-white shadow-sm" 
                      : "bg-black/[0.02] border border-black/5 text-black/60 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    {num === "all" ? "Tous" : `S${num}`}
                  </button>
                ))}
              </div>
              
              {/* Compteur de résultats */}
              <div className="hidden sm:block px-3 py-2 text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase bg-black/[0.02] border border-black/5 rounded-xl whitespace-nowrap shrink-0">
                {filteredDocs.length} <span className="hidden xl:inline">Résultat(s)</span>
              </div>

            </div>
        </div>

        {/* ===== LISTE DES DOCUMENTS ===== */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] p-4 md:p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <Loader2 className="mb-3 animate-spin text-primary" size={40}/>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Chargement...</p>
            </div>
          ) : filteredDocs.length > 0 ? (
            <>
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md border-black/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Document</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Catégorie</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-black/[0.01]">
                  {filteredDocs.map((doc) => {
                    const style = getCategoryStyle(doc.type);
                    return (
                      <tr key={doc.id} className="transition-colors hover:bg-black/[0.02] bg-white group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 transition-all rounded-xl bg-black/5 text-black/40 group-hover:bg-primary/10 group-hover:text-primary">
                              <FileText size={18} />
                            </div>
                            <span className="text-sm font-bold text-black line-clamp-1">{doc.titre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase border rounded-lg ${style.bg}`}>
                            {style.icon} {style.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`${backendUrl}${doc.fichier}`} target="_blank" rel="noreferrer" className="p-2 transition-all bg-white border rounded-lg shadow-sm border-black/5 text-black/40 hover:text-primary hover:border-primary/20"><Download size={16} /></a>
                            <button onClick={() => deleteDoc(doc.id)} className="p-2 transition-all bg-white border rounded-lg shadow-sm border-black/5 text-black/40 hover:text-red-500 hover:border-red-200"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredDocs.map(doc => {
                  const style = getCategoryStyle(doc.type);
                  const formation = formations.find(f => String(f.id) === String(doc.formation_id));
                  return (
                    <div key={doc.id} className="flex flex-col gap-3 p-4 bg-white border shadow-sm border-black/5 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${style.bg}`}>
                            {style.icon}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-sm font-bold leading-tight truncate text-secondary">{doc.titre}</h3>
                            <p className="text-[9px] font-bold text-black/40 mt-1 uppercase truncate tracking-widest">{formation?.nom || "Tous publics"}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-2">
                          <a href={`${backendUrl}${doc.fichier}`} target="_blank" rel="noreferrer" className="p-2 bg-white border rounded-lg shadow-sm border-black/5 text-black/40 hover:text-primary"><Download size={16}/></a>
                          <button onClick={() => deleteDoc(doc.id)} className="p-2 text-red-400 bg-white border rounded-lg shadow-sm border-black/5 hover:bg-red-50"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center border-2 border-dashed border-black/5 rounded-3xl bg-black/[0.02]">
              <AlertCircle className="mb-4 text-black/20" size={48} />
              <h3 className="text-sm font-bold text-black/50">Aucun résultat</h3>
              <p className="mt-1 text-xs text-black/30">Aucun document ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL D'AJOUT ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-black/[0.02]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-secondary"><FileUp className="text-primary" size={20}/> Nouveau Document</h2>
              <button onClick={() => setShowModal(false)} className="p-2 transition-colors rounded-full text-black/30 hover:text-black hover:bg-black/5"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Titre</label>
                <input type="text" required value={newDoc.titre} onChange={e => setNewDoc({...newDoc, titre: e.target.value})} className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Maintenance Électronique S2..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Type</label>
                  <div className="relative">
                    <select value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})} className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-bold outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="pedagogique">Cours</option>
                      <option value="calendrier">Planning</option>
                      <option value="reglement">Règlement</option>
                      <option value="examen">Examen</option>
                    </select>
                    <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-black/40 tracking-widest ml-1">Formation</label>
                  <div className="relative">
                    <select value={newDoc.formation_id} onChange={handleFormationChange} className="w-full px-4 py-3.5 bg-black/[0.03] border-none rounded-2xl text-sm font-bold outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="">Général</option>
                      {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-black/40"/>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className={`relative border-2 border-dashed rounded-[1.5rem] p-8 transition-all flex flex-col items-center justify-center text-center ${selectedFile ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'border-black/10 bg-black/[0.01] hover:border-primary/40 hover:bg-white'}`}>
                  {selectedFile ? (
                    <><CheckCircle2 size={32} className="mb-2 text-primary" /><span className="w-full px-4 text-xs font-bold truncate text-primary">{selectedFile.name}</span></>
                  ) : (
                    <><FileUp size={32} className="mb-2 text-black/20" /><span className="text-xs font-bold text-black/40">Cliquez ou glissez un fichier ici</span></>
                  )}
                  <input type="file" required onChange={e => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-black transition-colors bg-white border shadow-sm border-black/5 rounded-2xl hover:bg-black/5">Annuler</button>
                <button type="submit" disabled={uploading || !selectedFile} className="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all shadow-lg bg-primary rounded-2xl shadow-primary/20 active:scale-95 disabled:opacity-50">
                  {uploading ? <Loader2 className="animate-spin" size={20}/> : <FileUp size={20}/>}
                  {uploading ? "Envoi en cours..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}