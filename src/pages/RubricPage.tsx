import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminStore, essayQuestions, pgQuestions } from "@/store/useTestStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, RefreshCw, CheckCircle, XCircle } from "lucide-react";

const RubricPage = () => {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    customRubrics, 
    updateRubric, 
    syncRubricsToServer, 
    fetchCustomRubrics,
    updateRubricToServer 
  } = useAdminStore();
  
  const [editing, setEditing] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<string>("");
  const [rubricDescs, setRubricDescs] = useState<string[]>(["", "", "", ""]);
  const [activeTab, setActiveTab] = useState<"pg" | "essay">("essay");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: "" });

  useEffect(() => {
    if (!isAdmin) navigate("/login");
    else {
      // Load custom rubrics from server when component mounts
      fetchCustomRubrics();
    }
  }, [isAdmin, navigate, fetchCustomRubrics]);

  const showStatus = (success: boolean, message: string) => {
    setSyncStatus({ show: true, success, message });
    setTimeout(() => setSyncStatus({ show: false, success: false, message: "" }), 3000);
  };

  const startEdit = (id: number) => {
    const q = essayQuestions.find(e => e.id === id)!;
    const custom = customRubrics[id];
    setKeywords((custom?.keywords || q.keywords).join(", "));
    setRubricDescs((custom?.rubric || q.rubric).map(r => r.desc));
    setEditing(id);
  };

  const saveEdit = async () => {
    if (editing === null) return;
    
    const newRubric = [4, 3, 2, 1].map((s, i) => ({ score: s, desc: rubricDescs[i] }));
    const newKeywords = keywords.split(",").map(k => k.trim()).filter(Boolean);
    
    // Update local state
    updateRubric(editing, newRubric, newKeywords);
    
    // Sync to server
    const success = await updateRubricToServer(editing, newRubric, newKeywords);
    
    if (success) {
      showStatus(true, `Rubrik Essay ${editing} berhasil disimpan!`);
    } else {
      showStatus(false, `Gagal menyimpan rubrik. Data tersimpan di lokal.`);
    }
    
    setEditing(null);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    const success = await syncRubricsToServer();
    if (success) {
      showStatus(true, "Semua rubrik berhasil disinkronkan ke server!");
    } else {
      showStatus(false, "Gagal sinkronisasi rubrik ke server.");
    }
    setIsSyncing(false);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await fetchCustomRubrics();
    showStatus(true, "Data rubrik berhasil dimuat ulang dari server!");
    setIsSyncing(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Status Toast */}
      {syncStatus.show && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          syncStatus.success ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {syncStatus.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{syncStatus.message}</span>
        </div>
      )}

      <nav className="glass-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Kembali
          </Link>
          <span className="font-bold text-foreground">Edit Rubrik Penilaian</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="gap-2 gradient-primary"
          >
            {isSyncing ? "Menyinkronkan..." : "Sync All ke Server"}
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 animate-fade-in">
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-white/50 dark:bg-slate-900/50 p-1 rounded-lg">
          <Button
            variant={activeTab === "pg" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("pg")}
            className={`flex-1 ${activeTab === "pg" ? "gradient-primary text-primary-foreground shadow-lg" : ""}`}
          >
            Pilihan Ganda ({pgQuestions.length})
          </Button>
          <Button
            variant={activeTab === "essay" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("essay")}
            className={`flex-1 ${activeTab === "essay" ? "gradient-primary text-primary-foreground shadow-lg" : ""}`}
          >
            Essay ({essayQuestions.length})
          </Button>
        </div>

        {/* PG Rubric (Read-only display) */}
        {activeTab === "pg" && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ Rubrik untuk soal Pilihan Ganda bersifat tetap (otomatis dinilai berdasarkan kunci jawaban).
              </p>
            </div>
            {pgQuestions.map((q) => (
              <div key={q.id} className="glass-card rounded-xl p-5 space-y-3 hover:shadow-lg transition-shadow">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">PG {q.id}</span>
                  <span className="text-xs text-muted-foreground ml-2">{q.category}</span>
                  <p className="text-sm font-medium mt-2">{q.question}</p>
                </div>
                <div className="space-y-1 border-t pt-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`text-xs flex gap-2 p-2 rounded-lg transition-colors ${i === q.answer ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" : "hover:bg-muted/50"}`}>
                      <span className={`font-bold w-5 ${i === q.answer ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={i === q.answer ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                        {opt} {i === q.answer && "✓ (Jawaban Benar)"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">📖 Penjelasan (HOTS):</p>
                  <p className="text-xs text-foreground">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Essay Rubric (Editable) */}
        {activeTab === "essay" && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                ✏️ Rubrik untuk soal Essay dapat diedit. Perubahan akan otomatis tersimpan ke server.
              </p>
            </div>
            {essayQuestions.map((q) => {
              const custom = customRubrics[q.id];
              const rubric = custom?.rubric || q.rubric;
              const kw = custom?.keywords || q.keywords;
              const isEditing = editing === q.id;

              return (
                <div key={q.id} className="glass-card rounded-xl p-5 space-y-3 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Essay {q.id}</span>
                      <span className="text-xs text-muted-foreground ml-2">{q.category}</span>
                      <p className="text-sm font-medium mt-2">{q.question}</p>
                    </div>
                    {!isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEdit(q.id)}
                        className="shrink-0"
                      >
                        Edit Rubrik
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 border-t pt-4 mt-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Keywords (pisahkan dengan koma)
                        </label>
                        <Input 
                          value={keywords} 
                          onChange={(e) => setKeywords(e.target.value)} 
                          className="mt-1"
                          placeholder="contoh: kata1, kata2, kata3"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Keywords digunakan untuk auto-scoring awal (1-4 poin)
                        </p>
                      </div>
                      
                      <div className="grid gap-3">
                        {[4, 3, 2, 1].map((s, i) => (
                          <div key={s} className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                s === 4 ? "bg-green-500 text-white" :
                                s === 3 ? "bg-blue-500 text-white" :
                                s === 2 ? "bg-yellow-500 text-white" :
                                "bg-red-500 text-white"
                              }`}>
                                {s}
                              </span>
                              Skor {s}
                            </label>
                            <Input 
                              value={rubricDescs[i]} 
                              onChange={(e) => { 
                                const n = [...rubricDescs]; 
                                n[i] = e.target.value; 
                                setRubricDescs(n); 
                              }} 
                              className="mt-1"
                              placeholder={`Deskripsi untuk skor ${s}`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button onClick={saveEdit} size="sm" className="gap-2 gradient-primary text-primary-foreground">
                          <Save className="w-4 h-4" />Simpan Rubrik
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 border-t pt-3">
                      <div className="grid gap-2">
                        {rubric.sort((a,b) => b.score - a.score).map((r) => (
                          <div key={r.score} className="text-xs flex gap-3 p-2 rounded-lg bg-muted/30">
                            <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                              r.score === 4 ? "bg-green-500 text-white" :
                              r.score === 3 ? "bg-blue-500 text-white" :
                              r.score === 2 ? "bg-yellow-500 text-white" :
                              "bg-red-500 text-white"
                            }`}>
                              {r.score}
                            </span>
                            <span className="text-foreground flex-1">{r.desc}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2 pt-1">
                        <span className="text-xs text-muted-foreground mr-1">🔑 Keywords:</span>
                        {kw.map((k, idx) => (
                          <span key={idx} className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RubricPage;
