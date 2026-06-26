import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTestStore, pgQuestions, essayQuestions } from "@/store/useTestStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Save, 
  Send,
  Eye,
  LogOut,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TestPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    nama,
    email,
    hp,
    instansi,
    kota,
    posisi,
    currentPG, 
    pgAnswers, 
    currentEssay, 
    essayAnswers, 
    setPGAnswer, 
    setEssayAnswer, 
    nextPG, 
    prevPG, 
    nextEssay, 
    prevEssay, 
    submitTest, 
    isSubmitting,
    reset,
    timeLeft,
    setTimeLeft,
    autosaveStatus,
    setAutosaveStatus,
    isOnline,
    setIsOnline,
    isPassedQuestion,
    markQuestionPassed,
    step
  } = useTestStore();
  
  const [phase, setPhase] = useState<"pg" | "essay">("pg");
  const [isReviewPhase, setIsReviewPhase] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<Record<number, string[]>>({});
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const warningCountRef = useRef(0);

  // Initialize and randomize options (once on mount)
  useEffect(() => {
    const shuffled: Record<number, string[]> = {};
    pgQuestions.forEach((q, idx) => {
      const optionsWithIndices = q.options.map((opt, optIdx) => ({ opt, originalIdx: optIdx }));
      for (let i = optionsWithIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
      }
      shuffled[idx] = optionsWithIndices.map(item => item.opt);
    });
    setShuffledOptions(shuffled);
    
    // Load draft if it exists and matches user
    const savedDraft = localStorage.getItem("exam_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.nama === nama) {
          useTestStore.setState({
            pgAnswers: parsed.pgAnswers || Array(10).fill(-1),
            essayAnswers: parsed.essayAnswers || Array(15).fill(""),
            timeLeft: parsed.timeLeft || 3600
          });
          toast({
            title: "Draft Dipulihkan",
            description: "Jawaban pengerjaan sebelumnya telah dipulihkan otomatis.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error("Gagal memuat draft:", err);
      }
    }
  }, []);

  // Check identity on load
  useEffect(() => {
    if (!nama) {
      navigate("/");
    }
  }, [nama, navigate]);

  // Mark current question as visited
  useEffect(() => {
    if (phase === "pg") {
      markQuestionPassed(currentPG);
    } else {
      markQuestionPassed(10 + currentEssay);
    }
  }, [phase, currentPG, currentEssay, markQuestionPassed]);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setAutosaveStatus("saving");
      // Simulate sync
      setTimeout(() => setAutosaveStatus("saved"), 1000);
      toast({
        title: "Koneksi Terhubung",
        description: "Anda kembali online. Sinkronisasi aktif.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setAutosaveStatus("offline");
      toast({
        title: "Koneksi Terputus",
        description: "Ujian berjalan dalam mode offline. Jawaban disimpan di browser.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline, setAutosaveStatus, toast]);

  // Timer Countdown logic
  useEffect(() => {
    if (isReviewPhase && hasAutoSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasAutoSubmitted) {
            handleTimeOutSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAutoSubmitted, isReviewPhase]);

  const handleTimeOutSubmit = async () => {
    setHasAutoSubmitted(true);
    toast({
      title: "Waktu Habis!",
      description: "Jawaban Anda akan dikirimkan otomatis sekarang.",
      variant: "destructive",
    });
    try {
      await submitTest();
    } catch (e) {
      console.error("Auto submit failed:", e);
    }
    reset();
    navigate("/finish", { replace: true });
  };

  // Fullscreen Mode Handler
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      if (!isFullscreen && !hasAutoSubmitted && !isReviewPhase) {
        // Enforce fullscreen re-entry
        setTimeout(() => enterFullscreen(), 200);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasAutoSubmitted, isReviewPhase]);

  // Tab switching / Blur check (Anti-Cheating)
  const autoSubmitAndExit = async () => {
    if (hasAutoSubmitted) return;
    setHasAutoSubmitted(true);
    
    try {
      await submitTest();
      toast({
        title: "Ujian Selesai",
        description: "Jawaban telah disimpan otomatis karena pelanggaran.",
        variant: "destructive",
      });
    } catch (e) {
      console.error("Auto-submit exit failed:", e);
    }
    reset();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isReviewPhase && !hasAutoSubmitted) {
        warningCountRef.current++;
        if (warningCountRef.current === 1) {
          alert("⚠️ PERINGATAN (1/2)!\nJangan tinggalkan halaman ujian. Jika Anda keluar lagi, ujian akan langsung dikirim dan selesai.");
        } else if (warningCountRef.current >= 2) {
          alert("❌ PELANGGARAN DETEKSI!\nUjian Anda telah dihentikan dan dikirim otomatis karena meninggalkan layar.");
          autoSubmitAndExit();
        }
      }
    };

    const handleBlur = () => {
      // Blur can sometimes trigger on dialogs, verify state
      if (!isReviewPhase && !hasAutoSubmitted) {
        // We use visibilityChange as the main source, but count blur for safety
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasAutoSubmitted) {
        e.preventDefault();
        e.returnValue = "Ujian Anda sedang berlangsung. Jika Anda keluar sekarang, jawaban akan disubmit otomatis.";
        autoSubmitAndExit();
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAutoSubmitted, isReviewPhase]);

  // Anti-Copy, Anti-Right Click, Anti-Screenshot
  useEffect(() => {
    const preventKeys = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert("Screenshot dilarang!");
      }
      // Ctrl+P (Print), Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      // F5, Ctrl+R (Refresh)
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        return false;
      }
    };

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', preventKeys);
    document.addEventListener('contextmenu', preventRightClick);
    return () => {
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, []);

  // Answer handlers
  const handlePGAnswer = (questionIdx: number, selectedOptionIdx: number) => {
    const selectedText = shuffledOptions[questionIdx]?.[selectedOptionIdx];
    const originalAnswerIndex = pgQuestions[questionIdx].options.findIndex(opt => opt === selectedText);
    setPGAnswer(questionIdx, originalAnswerIndex);
  };

  const isOptionSelected = (questionIdx: number, optionText: string) => {
    const currentAnswer = pgAnswers[questionIdx];
    if (currentAnswer === -1) return false;
    return pgQuestions[questionIdx].options[currentAnswer] === optionText;
  };

  const handleNavigatorClick = (idx: number) => {
    setIsReviewPhase(false);
    if (idx < 10) {
      setPhase("pg");
      useTestStore.setState({ currentPG: idx });
    } else {
      setPhase("essay");
      useTestStore.setState({ currentEssay: idx - 10 });
    }
  };

  // Helper to count answered questions
  const getProgressStats = () => {
    const pgCount = pgAnswers.filter(a => a !== -1).length;
    const essayCount = essayAnswers.filter(a => a.trim() !== "").length;
    const totalAnswered = pgCount + essayCount;
    const percentage = Math.round((totalAnswered / 25) * 100);
    return {
      answered: totalAnswered,
      empty: 25 - totalAnswered,
      percentage
    };
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setHasAutoSubmitted(true);
    
    // Save submission summary for FinishPage before reset
    const timeSpent = 3600 - timeLeft;
    localStorage.setItem("last_submission", JSON.stringify({
      id: Date.now().toString(),
      nama: nama,
      email: email,
      posisi: posisi,
      duration: timeSpent,
      timestamp: new Date().toISOString()
    }));

    // Exit fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.log("Exit fullscreen error:", err);
      }
    }

    await submitTest();
    reset();
    navigate("/finish", { replace: true });
  };

  if (!nama) return null;

  const stats = getProgressStats();
  const currentQIndex = phase === "pg" ? currentPG : 10 + currentEssay;

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* NAVBAR */}
      <header className="glass-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-primary text-xl tracking-tight">AI Assessment</span>
          <span className="text-xs font-semibold bg-danger/10 text-danger border border-danger/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            🔒 Mode Ujian Aktif
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {isOnline ? (
              <span className="text-success flex items-center gap-1 bg-success/10 px-2.5 py-1 rounded-full">
                <Wifi className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="text-danger flex items-center gap-1 bg-danger/10 px-2.5 py-1 rounded-full">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-foreground bg-accent py-1 px-3 rounded-lg">
            {nama}
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 gap-6">
        
        {/* SIDEBAR: PROGRESS, TIMER & NAVIGATOR (Visible except in review phase) */}
        {!isReviewPhase && (
          <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
            
            {/* TIMER CARD */}
            <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sisa Waktu</p>
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 ${timeLeft <= 300 ? "text-danger animate-pulse" : timeLeft <= 600 ? "text-warning" : "text-primary"}`} />
                  <span className={`text-2xl font-extrabold font-mono tracking-tight leading-none ${
                    timeLeft <= 300 ? "text-danger" : timeLeft <= 600 ? "text-warning" : "text-foreground"
                  }`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Draft Save</p>
                <div className="flex items-center gap-1 justify-end text-xs font-semibold mt-1">
                  {autosaveStatus === "saved" && (
                    <span className="text-success flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Tersimpan
                    </span>
                  )}
                  {autosaveStatus === "saving" && (
                    <span className="text-warning flex items-center gap-1 animate-pulse">
                      <Save className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </span>
                  )}
                  {autosaveStatus === "offline" && (
                    <span className="text-danger flex items-center gap-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Local Only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PROGRESS CARD */}
            <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm space-y-2.5">
              <div className="flex justify-between items-end text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-wider">Progress Soal</span>
                <span className="font-mono font-bold">{stats.answered} / 25 Terjawab</span>
              </div>
              <Progress value={stats.percentage} className="h-2 bg-accent" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{stats.percentage}% Selesai</span>
                <span>{stats.empty} kosong</span>
              </div>
            </div>

            {/* NAVIGATOR CARD */}
            <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Navigasi Soal</h3>
                <div className="space-y-3">
                  {/* PG Section */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase">Pilihan Ganda (1-10)</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {pgQuestions.map((_, i) => {
                        const isAns = pgAnswers[i] !== -1;
                        const isPassed = isPassedQuestion[i] === true;
                        const isActive = phase === "pg" && currentPG === i;
                        
                        let btnClass = "bg-slate-100 dark:bg-slate-800 text-muted-foreground";
                        if (isActive) btnClass = "bg-warning/20 text-warning border-2 border-warning shadow-sm font-extrabold";
                        else if (isAns) btnClass = "bg-success text-success-foreground font-bold";
                        else if (isPassed) btnClass = "bg-danger/10 text-danger border border-danger/30 font-bold";
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigatorClick(i)}
                            className={`w-9 h-9 rounded-xl text-xs transition-all ${btnClass}`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Essay Section */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase">Essay (11-25)</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {essayQuestions.map((_, i) => {
                        const actualIdx = 10 + i;
                        const isAns = essayAnswers[i] && essayAnswers[i].trim() !== "";
                        const isPassed = isPassedQuestion[actualIdx] === true;
                        const isActive = phase === "essay" && currentEssay === i;

                        let btnClass = "bg-slate-100 dark:bg-slate-800 text-muted-foreground";
                        if (isActive) btnClass = "bg-warning/20 text-warning border-2 border-warning shadow-sm font-extrabold";
                        else if (isAns) btnClass = "bg-success text-success-foreground font-bold";
                        else if (isPassed) btnClass = "bg-danger/10 text-danger border border-danger/30 font-bold";

                        return (
                          <button
                            key={actualIdx}
                            onClick={() => handleNavigatorClick(actualIdx)}
                            className={`w-9 h-9 rounded-xl text-xs transition-all ${btnClass}`}
                          >
                            {actualIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* LEGENDS */}
              <div className="grid grid-cols-2 gap-1.5 border-t pt-3 text-[9px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700"></div> Belum dibuka
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-warning/30 border border-warning"></div> Aktif
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-success"></div> Dijawab
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-danger/15 border border-danger/30"></div> Terlewati
                </div>
              </div>
            </div>
            
            {/* GO TO REVIEW BUTTON */}
            <Button
              onClick={() => setIsReviewPhase(true)}
              variant="outline"
              className="w-full h-11 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Tinjau Semua Jawaban
            </Button>
          </aside>
        )}

        {/* ACTIVE EXAM / QUESTION DISPLAY */}
        {!isReviewPhase ? (
          <main className="flex-1 space-y-6">
            
            {/* EXAM CONTENT CARD */}
            {phase === "pg" ? (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border bg-white dark:bg-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-md border border-primary/20">
                      PILIHAN GANDA
                    </span>
                    <h2 className="text-sm text-muted-foreground font-medium mt-1">Soal nomor {currentPG + 1} dari 10</h2>
                  </div>
                  <span className="text-xs font-semibold bg-accent px-2.5 py-1 rounded-md text-muted-foreground">
                    Bobot: 30% dari Nilai Akhir
                  </span>
                </div>
                
                <p className="text-lg font-bold text-foreground leading-relaxed">
                  {pgQuestions[currentPG].question}
                </p>
                
                <div className="space-y-3">
                  {(shuffledOptions[currentPG] || pgQuestions[currentPG].options).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePGAnswer(currentPG, i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center ${
                        isOptionSelected(currentPG, opt) 
                          ? "border-primary bg-primary/15 text-foreground font-semibold shadow-sm" 
                          : "border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:bg-accent/40 text-foreground"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center mr-3.5 transition-colors ${
                        isOptionSelected(currentPG, opt) 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-accent text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
                
                {/* FOOTER ACTIONS */}
                <div className="flex justify-between border-t pt-5">
                  <Button 
                    variant="outline" 
                    onClick={prevPG} 
                    disabled={currentPG === 0}
                    className="px-6 h-11 font-semibold rounded-xl"
                  >
                    ← Sebelumnya
                  </Button>
                  {currentPG < 9 ? (
                    <Button 
                      onClick={nextPG} 
                      className="gradient-primary text-primary-foreground px-8 h-11 font-semibold rounded-xl"
                    >
                      Selanjutnya →
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => { setPhase("essay"); }} 
                      className="gradient-primary text-primary-foreground px-8 h-11 font-semibold rounded-xl"
                    >
                      Ke Essay →
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border bg-white dark:bg-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-1 rounded-md border border-secondary/20 uppercase">
                      ESSAY : {essayQuestions[currentEssay].category}
                    </span>
                    <h2 className="text-sm text-muted-foreground font-medium mt-1">Soal nomor {10 + currentEssay + 1} dari 25</h2>
                  </div>
                  <span className="text-xs font-semibold bg-accent px-2.5 py-1 rounded-md text-muted-foreground">
                    Bobot: 70% dari Nilai Akhir
                  </span>
                </div>
                
                <p className="text-lg font-bold text-foreground leading-relaxed">
                  {essayQuestions[currentEssay].question}
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="essay-answer" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Jawaban Anda</Label>
                  <Textarea
                    id="essay-answer"
                    placeholder="Tulis jawaban Anda di sini secara sistematis, komprehensif, dan tunjukkan logika konsep Anda..."
                    value={essayAnswers[currentEssay]}
                    onChange={(e) => setEssayAnswer(currentEssay, e.target.value)}
                    className="min-h-[220px] text-sm resize-none rounded-xl p-4 border-slate-200 dark:border-slate-700 focus-visible:ring-primary leading-relaxed"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
                
                {/* FOOTER ACTIONS */}
                <div className="flex justify-between border-t pt-5">
                  <Button 
                    variant="outline" 
                    onClick={currentEssay === 0 ? () => setPhase("pg") : prevEssay}
                    className="px-6 h-11 font-semibold rounded-xl"
                  >
                    ← {currentEssay === 0 ? "Ke PG" : "Sebelumnya"}
                  </Button>
                  
                  {currentEssay < 14 ? (
                    <Button 
                      onClick={nextEssay} 
                      className="gradient-primary text-primary-foreground px-8 h-11 font-semibold rounded-xl"
                    >
                      Selanjutnya →
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setIsReviewPhase(true)}
                      className="bg-success text-success-foreground hover:bg-success/90 px-8 h-11 font-bold rounded-xl"
                    >
                      ✓ Tinjau Jawaban
                    </Button>
                  )}
                </div>
              </div>
            )}
          </main>
        ) : (
          /* REVIEW PHASE: SUMMARIZE AND SUBMIT */
          <main className="flex-1 space-y-6 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border bg-white dark:bg-slate-800 shadow-sm space-y-6">
              
              <div className="border-b pb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">Ringkasan Pengerjaan Ujian</h2>
                  <p className="text-xs text-muted-foreground">Silakan periksa kembali jawaban Anda sebelum dikirim.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-success bg-success/15 px-3 py-1.5 rounded-full">
                    {stats.answered} Terjawab
                  </span>
                  {stats.empty > 0 && (
                    <span className="text-xs font-bold text-danger bg-danger/15 px-3 py-1.5 rounded-full">
                      {stats.empty} Kosong
                    </span>
                  )}
                </div>
              </div>

              {/* GRID OF ALL 25 QUESTIONS FOR QUICK INSPECTION */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2">Soal Pilihan Ganda (1-10)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {pgQuestions.map((_, i) => {
                      const isAns = pgAnswers[i] !== -1;
                      return (
                        <button
                          key={i}
                          onClick={() => handleNavigatorClick(i)}
                          className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all hover:scale-[1.01] ${
                            isAns 
                              ? "bg-success/10 border-success/30 text-success" 
                              : "bg-danger/5 border-danger/20 text-danger"
                          }`}
                        >
                          <span className="text-xs font-bold">No. {i + 1}</span>
                          <span className="text-[10px] font-extrabold uppercase">
                            {isAns ? "Isi" : "Kosong"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Soal Essay (11-25)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {essayQuestions.map((q, i) => {
                      const actualIdx = 10 + i;
                      const isAns = essayAnswers[i] && essayAnswers[i].trim() !== "";
                      return (
                        <button
                          key={actualIdx}
                          onClick={() => handleNavigatorClick(actualIdx)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.01] ${
                            isAns 
                              ? "bg-success/10 border-success/30 text-success" 
                              : "bg-danger/5 border-danger/20 text-danger"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-bold">No. {actualIdx + 1}</span>
                            <span className="text-[10px] font-extrabold uppercase">
                              {isAns ? "Isi" : "Kosong"}
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground truncate mt-1 w-full uppercase font-medium">
                            {q.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleNavigatorClick(0)}
                  variant="outline"
                  className="flex-1 h-12 font-bold rounded-xl"
                >
                  Kembali ke Lembar Soal
                </Button>
                <Button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-success text-success-foreground hover:bg-success/90 font-extrabold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit Jawaban Ujian
                </Button>
              </div>

            </div>
          </main>
        )}

      </div>

      {/* CONFIRMATION SUBMIT DIALOG */}
      <AlertDialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold text-xl flex items-center gap-2">
              <AlertTriangle className="text-warning w-6 h-6" /> Kirim Lembar Jawaban?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm space-y-2 mt-2">
              <p>Apakah Anda benar-benar yakin ingin menyelesaikan ujian kompetensi ini?</p>
              
              {stats.empty > 0 ? (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold leading-none">Peringatan Soal Kosong!</p>
                    <p className="text-[11px] leading-tight mt-1 text-danger/80">Masih terdapat {stats.empty} soal yang belum Anda jawab. Kami menyarankan untuk melengkapinya terlebih dahulu.</p>
                  </div>
                </div>
              ) : (
                <p className="text-success font-semibold flex items-center gap-1.5 bg-success/10 p-2.5 rounded-lg text-xs">
                  <CheckCircle className="w-4 h-4" /> Selamat! Semua soal telah terisi dengan lengkap.
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">Setelah terkirim, jawaban Anda tidak dapat diubah kembali dan akan langsung masuk ke database panitia.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2.5">
            <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-success text-success-foreground hover:bg-success/90 font-bold"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestPage;
