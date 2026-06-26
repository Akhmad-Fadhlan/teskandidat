import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAdminStore, pgQuestions, essayQuestions } from "@/store/useTestStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo-idn.png";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Star, 
  Save, 
  User, 
  FileText, 
  BrainCircuit, 
  Wrench, 
  Camera, 
  CheckCircle,
  Video
} from "lucide-react";
import jsPDF from "jspdf";
import { Textarea } from "@/components/ui/textarea";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface PracticeGrading {
  codingScore: number;
  codingComment: string;
  wiringScore: number;
  wiringComment: string;
  troubleScore: number;
  troubleComment: string;
  hasAttachment: boolean;
  attachmentName: string;
}

const AdminDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { isAdmin, results, fetchResults, updateEssayScore } = useAdminStore();
  const printRef = useRef<HTMLDivElement>(null);

  // Practice grading state (persisted locally per candidate ID)
  const [practice, setPractice] = useState<PracticeGrading>({
    codingScore: 5,
    codingComment: "",
    wiringScore: 5,
    wiringComment: "",
    troubleScore: 5,
    troubleComment: "",
    hasAttachment: false,
    attachmentName: ""
  });
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<{ strengths: string; weaknesses: string; recommendation: string } | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/login"); return; }
    fetchResults();
  }, [isAdmin, navigate, fetchResults]);

  const result = results.find((r) => r.id === id);

  // Load practice grading from localStorage
  useEffect(() => {
    if (result) {
      const saved = localStorage.getItem(`practice_grading_${result.id}`);
      if (saved) {
        try {
          setPractice(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
      
      // Auto generate AI Report summary on load
      generateAIReport();
    }
  }, [result]);

  const generateAIReport = () => {
    if (!result) return;
    
    // Calculate category averages for this candidate
    const categoryScores = {
      "Pengetahuan": { total: 0, count: 0 },
      "Sistem": { total: 0, count: 0 },
      "Troubleshooting": { total: 0, count: 0 },
      "Programming": { total: 0, count: 0 }
    };

    essayQuestions.forEach((eq, idx) => {
      const score = result.essayScores?.[idx] ?? result.essayAutoScores?.[idx] ?? 0;
      const cat = eq.category as keyof typeof categoryScores;
      if (categoryScores[cat]) {
        categoryScores[cat].total += score;
        categoryScores[cat].count += 1;
      }
    });

    const averages = Object.entries(categoryScores).map(([name, data]) => ({
      name,
      avg: data.count > 0 ? (data.total / data.count) : 0
    }));

    // Find best and worst categories
    const sorted = [...averages].sort((a, b) => b.avg - a.avg);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    let strengths = "";
    let weaknesses = "";
    let recommendation = "";

    if (best.avg >= 3) {
      strengths = `Kandidat menunjukkan penguasaan teori dan logika berpikir yang matang pada modul kompetensi ${best.name} (Rata-rata skor: ${best.avg.toFixed(1)}/4). Jawaban essay terstruktur dengan keyword teknis relevan.`;
    } else {
      strengths = `Kandidat memiliki fondasi kualifikasi umum dasar. Modul terkuatnya berada pada area ${best.name} (Rata-rata skor: ${best.avg.toFixed(1)}/4).`;
    }

    if (worst.avg <= 2) {
      weaknesses = `Terdapat ruang improvisasi yang signifikan pada aspek ${worst.name} (Rata-rata skor: ${worst.avg.toFixed(1)}/4). Logika penyelesaian masalah dan pemahaman sintaksis dasar di area ini perlu diperkuat.`;
    } else {
      weaknesses = `Pemahaman kompetensi secara umum merata. Kelemahan minor terdeteksi di bidang ${worst.name} (Rata-rata skor: ${worst.avg.toFixed(1)}/4) namun masih dalam batas toleransi seleksi.`;
    }

    if (result.nilaiAkhir >= 75) {
      recommendation = `DIREKOMENDASIKAN (LULUS SELEKSI).\nKandidat memenuhi kualifikasi teknis Guru Robotik & IoT di IDN Boarding School. Disarankan langsung ditempatkan di laboratorium praktik dengan evaluasi berkala.`;
    } else if (result.nilaiAkhir >= 60) {
      recommendation = `DIPERTIMBANGKAN (LULUS BERSYARAT).\nKandidat memiliki potensi dasar namun memerlukan training intensif selama 1-2 bulan pertama, khususnya untuk pendalaman modul ${worst.name}.`;
    } else {
      recommendation = `TIDAK DIREKOMENDASIKAN.\nSkor gabungan (Nilai Akhir: ${result.nilaiAkhir}) belum mencapai standar kelulusan minimum kompetensi pengajar robotik.`;
    }

    setAiReport({ strengths, weaknesses, recommendation });
  };

  const handleSavePractice = () => {
    if (!result) return;
    localStorage.setItem(`practice_grading_${result.id}`, JSON.stringify(practice));
    toast({
      title: "Penilaian Praktik Disimpan",
      description: `Evaluasi praktik untuk ${result.nama} berhasil diperbarui secara lokal.`,
      variant: "default",
    });
  };

  const handleAttachMockFile = (type: 'photo' | 'video') => {
    setPractice(prev => ({
      ...prev,
      hasAttachment: true,
      attachmentName: type === 'photo' ? "WIRING_SETUP_MOCK.jpg" : "CODING_TEST_DEMO.mp4"
    }));
    toast({
      title: "Lampiran Mock Ditambahkan",
      description: `File ${type === 'photo' ? "gambar" : "video"} berhasil diunggah oleh asisten assessor.`,
    });
  };

  // Recharts Radar Data preparation
  const getRadarData = () => {
    if (!result) return [];
    const categories = {
      "Pengetahuan": { total: 0, count: 0 },
      "Sistem": { total: 0, count: 0 },
      "Troubleshooting": { total: 0, count: 0 },
      "Programming": { total: 0, count: 0 }
    };

    essayQuestions.forEach((eq, idx) => {
      const score = result.essayScores?.[idx] ?? result.essayAutoScores?.[idx] ?? 0;
      const cat = eq.category as keyof typeof categories;
      if (categories[cat]) {
        categories[cat].total += score;
        categories[cat].count += 1;
      }
    });

    return Object.entries(categories).map(([subject, data]) => ({
      subject,
      score: Number((data.count > 0 ? (data.total / data.count) : 0).toFixed(2)),
      fullMark: 4
    }));
  };

  const downloadPDF = async () => {
    if (!result) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = w - margin * 2;
    let y = margin;

    const addText = (text: string, x: number, yPos: number, size: number, style: "normal" | "bold" = "normal", color: [number, number, number] = [31, 41, 55]) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(...color);
      pdf.text(text, x, yPos);
    };

    const drawLine = (yPos: number) => {
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, w - margin, yPos);
    };

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logo;
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      pdf.addImage(img, "PNG", margin, y, 20, 20);
    } catch {}

    addText("IDN Boarding School", margin + 25, y + 8, 16, "bold", [37, 99, 235]);
    addText("AI Assessment Center Platform V2", margin + 25, y + 15, 10, "normal", [107, 114, 128]);
    y += 25;
    drawLine(y);
    y += 8;

    addText("RAPOR HASIL SELEKSI KOMPETENSI", w / 2 - 42, y, 13, "bold", [30, 41, 59]);
    y += 10;

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentW, 42, 3, 3, "F");
    
    // Identity
    addText("Nama Peserta", margin + 5, y + 8, 8, "normal", [107, 114, 128]);
    addText(result.nama, margin + 5, y + 14, 11, "bold");
    
    addText("Email / HP", margin + 5, y + 22, 8, "normal", [107, 114, 128]);
    addText(`${result.email} / ${result.hp}`, margin + 5, y + 28, 9, "normal");

    addText("Instansi / Kota", margin + 5, y + 36, 8, "normal", [107, 114, 128]);
    addText(`${result.instansi} (${result.kota})`, margin + 5, y + 40, 9, "normal");

    addText("Tanggal Ujian", margin + contentW / 2 + 10, y + 8, 8, "normal", [107, 114, 128]);
    addText(new Date(result.timestamp).toLocaleDateString("id-ID", { dateStyle: "long" }), margin + contentW / 2 + 10, y + 14, 9, "normal");
    
    addText("Posisi Lamaran", margin + contentW / 2 + 10, y + 22, 8, "normal", [107, 114, 128]);
    addText(result.posisi || "Guru Robotik & IoT", margin + contentW / 2 + 10, y + 28, 9, "normal");

    addText("NILAI AKHIR", margin + contentW - 35, y + 12, 9, "bold", [37, 99, 235]);
    addText(String(result.nilaiAkhir), margin + contentW - 32, y + 28, 24, "bold", result.nilaiAkhir >= 75 ? [22, 163, 74] : [220, 38, 38]);
    y += 48;

    const predColor: [number, number, number] = result.nilaiAkhir >= 90 ? [22, 163, 74] : result.nilaiAkhir >= 75 ? [22, 163, 74] : result.nilaiAkhir >= 60 ? [245, 158, 11] : [220, 38, 38];
    pdf.setFillColor(...predColor);
    pdf.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    addText(`Predikat: ${result.predikat.toUpperCase()}`, w / 2 - 25, y + 7, 11, "bold", [255, 255, 255]);
    y += 18;

    drawLine(y); y += 6;
    addText("RINCIAN SKOR DAN BOBOT", margin, y, 11, "bold", [37, 99, 235]);
    y += 8;

    const boxW = contentW / 3 - 4;
    const boxes = [
      { label: "Skor Pilihan Ganda (30%)", value: `${result.pgScore}/10 benar`, sub: `= ${result.skorPG} poin` },
      { label: "Skor Essay (70%)", value: result.skorEssay.toFixed(1), sub: "dari 100 poin" },
      { label: "Nilai Akhir Gabungan", value: String(result.nilaiAkhir), sub: "skala 100" },
    ];
    boxes.forEach((b, i) => {
      const bx = margin + i * (boxW + 6);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(bx, y, boxW, 22, 2, 2, "F");
      addText(b.label, bx + 4, y + 7, 7, "normal", [107, 114, 128]);
      addText(b.value, bx + 4, y + 14, 11, "bold", [30, 41, 59]);
      addText(b.sub, bx + 4, y + 19, 7, "normal", [37, 99, 235]);
    });
    y += 28;

    // AI summary card on PDF
    if (aiReport) {
      drawLine(y); y += 6;
      addText("ANALISIS KOMPETENSI ASSESSOR AI", margin, y, 10, "bold", [37, 99, 235]);
      y += 6;
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, y, contentW, 26, 2, 2, "F");
      addText("Kekuatan (Strengths):", margin + 4, y + 5, 7.5, "bold", [30, 41, 59]);
      addText(aiReport.strengths.substring(0, 110) + "...", margin + 4, y + 9, 7, "normal");
      
      addText("Rekomendasi Seleksi:", margin + 4, y + 16, 7.5, "bold", [37, 99, 235]);
      addText(aiReport.recommendation.split("\n")[0], margin + 4, y + 20, 7.5, "bold");
      y += 32;
    }

    // PG Detail Table on PDF
    drawLine(y); y += 6;
    addText("JAWABAN PILIHAN GANDA (1-10)", margin, y, 10, "bold", [30, 41, 59]);
    y += 6;

    const pgAnswersData = result.pgAnswers || [];
    for (let i = 0; i < pgQuestions.length; i++) {
      if (y > 270) { pdf.addPage(); y = margin; }
      const q = pgQuestions[i];
      const userAnswerIndex = pgAnswersData[i];
      const isCorrect = userAnswerIndex === q.answer;
      const isAnswered = userAnswerIndex !== undefined && userAnswerIndex !== null && userAnswerIndex !== -1;
      
      let answerText = "Tidak dijawab";
      if (isAnswered && typeof userAnswerIndex === 'number' && userAnswerIndex >= 0 && userAnswerIndex < q.options.length) {
        answerText = q.options[userAnswerIndex];
      }
      
      pdf.setFillColor(isCorrect ? 240 : 254, isCorrect ? 253 : 242, isCorrect ? 244 : 242);
      pdf.roundedRect(margin, y, contentW, 15, 1, 1, "F");
      
      addText(`${i + 1}. ${q.question.substring(0, 85)}${q.question.length > 85 ? "..." : ""}`, margin + 3, y + 5, 7, "normal");
      addText(`Jawaban: ${answerText.substring(0, 60)}`, margin + 3, y + 10, 6.5, "normal", isCorrect ? [22, 163, 74] : [220, 38, 38]);
      addText(isCorrect ? "✓ Benar" : "✗ Salah", margin + contentW - 20, y + 8, 8, "bold", isCorrect ? [22, 163, 74] : [220, 38, 38]);
      y += 17;
    }

    // Essay Section on PDF
    if (y > 240) { pdf.addPage(); y = margin; }
    y += 4;
    drawLine(y); y += 6;
    addText("JAWABAN ESSAY (11-25)", margin, y, 10, "bold", [30, 41, 59]);
    y += 6;

    const essayAnswers = result.essayAnswers || [];
    const essayScores = result.essayScores || result.essayAutoScores || [];
    for (let i = 0; i < essayQuestions.length; i++) {
      if (y > 260) { pdf.addPage(); y = margin; }
      const q = essayQuestions[i];
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, y, contentW, 20, 1, 1, "F");
      
      const qText = `${i + 11}. ${q.question.substring(0, 90)}${q.question.length > 90 ? "..." : ""}`;
      addText(qText, margin + 3, y + 5, 7.5, "normal");
      
      const essayScore = essayScores[i] || 0;
      addText(`Skor: ${essayScore}/4`, margin + contentW - 18, y + 5, 8, "bold", [37, 99, 235]);

      const answer = essayAnswers[i] || "Tidak dijawab";
      addText(answer.substring(0, 120) + (answer.length > 120 ? "..." : ""), margin + 3, y + 11, 7, "normal", [107, 114, 128]);
      
      const matchedKeywords = q.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase()));
      if (matchedKeywords.length > 0) {
        addText(`✓ Keywords: ${matchedKeywords.slice(0, 4).join(", ")}`, margin + 3, y + 16, 6.5, "normal", [22, 163, 74]);
      }
      y += 22;
    }

    if (y > 275) { pdf.addPage(); y = margin; }
    y += 6;
    drawLine(y); y += 8;
    addText("Laporan ini digenerate secara otomatis oleh AI Assessment Center IDN Boarding School", w / 2 - 62, y, 7, "normal", [156, 163, 175]);

    pdf.save(`rapor-assessment-${result.nama.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const reTriggerAIAnalysis = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      generateAIReport();
      setIsGeneratingAI(false);
      toast({
        title: "AI Analysis Re-generated",
        description: "AI berhasil melakukan re-evaluasi keyword dan scoring.",
        variant: "default",
      });
    }, 1200);
  };

  if (!isAdmin || !result) return <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900">Memuat detail assessment...</div>;

  const radarData = getRadarData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-12">
      
      {/* NAVBAR */}
      <nav className="glass-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <Link to="/admin" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <Button onClick={downloadPDF} size="sm" className="gap-1.5 gradient-primary text-primary-foreground h-9 rounded-xl text-xs font-semibold shadow">
          <Download className="w-4 h-4" /> Download PDF Rapor
        </Button>
      </nav>

      {/* BODY CONTAINER */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
        
        {/* CANDIDATE HEADER PROFILE */}
        <div className="glass-card rounded-2xl p-6 border bg-white dark:bg-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center text-3xl font-extrabold shadow-inner shrink-0">
            {result.nama.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <span className="text-[10px] font-extrabold bg-primary/15 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {result.posisi || "Guru Robotik & IoT"}
              </span>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">{result.nama}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium"><Mail className="w-4 h-4 text-primary" /> {result.email}</span>
              <span className="flex items-center gap-1.5 font-medium"><Phone className="w-4 h-4 text-primary" /> {result.hp}</span>
              <span className="flex items-center gap-1.5 font-medium"><Building2 className="w-4 h-4 text-primary" /> {result.instansi}</span>
              <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-primary" /> {result.kota}</span>
            </div>
          </div>

          <div className="text-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border min-w-[120px]">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Skor Gabungan</p>
            <div className="text-4xl font-extrabold text-primary mt-1 font-mono">{result.nilaiAkhir}</div>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide block mt-1.5 ${
              result.nilaiAkhir >= 75 ? "bg-success/15 text-success border border-success/20" : 
              "bg-danger/15 text-danger border border-danger/20"
            }`}>
              {result.predikat}
            </span>
          </div>
        </div>

        {/* RADAR CHART AND AI REPORT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* RADAR COMPETENCY CHART */}
          <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b pb-2 flex items-center gap-1">
              📊 Radar Kompetensi (Skala 0-4)
            </h2>
            <div className="h-[220px] flex items-center justify-center">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 9 }} />
                    <Radar name={result.nama} dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground italic">Kompetensi radar tidak dapat dimuat.</p>
              )}
            </div>
          </div>

          {/* AI DIAGNOSTIC REPORT */}
          <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  🤖 Analisis & Diagnostic AI
                </h2>
                <Button 
                  onClick={reTriggerAIAnalysis} 
                  disabled={isGeneratingAI} 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg flex items-center gap-1"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} /> 
                  {isGeneratingAI ? "Memproses..." : "Re-analisis"}
                </Button>
              </div>

              {aiReport ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h4 className="font-extrabold text-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" /> Kelebihan Utama</h4>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{aiReport.strengths}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-warning flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-warning" /> Bidang Perlu Bimbingan</h4>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{aiReport.weaknesses}</p>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                    <h4 className="font-extrabold text-primary">Rekomendasi Seleksi Assessor AI</h4>
                    <p className="text-foreground mt-1 font-semibold leading-relaxed whitespace-pre-line">{aiReport.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground italic">Menghitung diagnosa...</div>
              )}
            </div>
          </div>

        </div>

        {/* PRACTICE ASSESSMENT SECTION */}
        <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              ⭐ Uji Kompetensi Praktik (Ujian Mengajar & Wiring)
            </h2>
            <Button onClick={handleSavePractice} className="bg-success text-success-foreground hover:bg-success/90 h-8 rounded-xl text-xs font-bold gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" /> Simpan Penilaian Praktik
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Task 1: Coding & Logic */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 border rounded-xl">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-bold text-foreground">1. Kemampuan Coding & Logika</h3>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Skor Praktik (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setPractice(p => ({ ...p, codingScore: star }))}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= practice.codingScore ? "text-warning fill-warning" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="coding-comment" className="text-[10px] text-muted-foreground uppercase">Catatan Catatan</Label>
                <Textarea 
                  id="coding-comment"
                  placeholder="Catatan pengerjaan logika instruksi..."
                  value={practice.codingComment}
                  onChange={e => setPractice(p => ({ ...p, codingComment: e.target.value }))}
                  className="h-20 text-xs resize-none rounded-lg"
                />
              </div>
            </div>

            {/* Task 2: Wiring Circuit */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 border rounded-xl">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-bold text-foreground">2. Kerapian Wiring & Rangkaian</h3>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Skor Praktik (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setPractice(p => ({ ...p, wiringScore: star }))}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= practice.wiringScore ? "text-warning fill-warning" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="wiring-comment" className="text-[10px] text-muted-foreground uppercase">Catatan Catatan</Label>
                <Textarea 
                  id="wiring-comment"
                  placeholder="Catatan kerapian perangkaian kabel & sirkuit..."
                  value={practice.wiringComment}
                  onChange={e => setPractice(p => ({ ...p, wiringComment: e.target.value }))}
                  className="h-20 text-xs resize-none rounded-lg"
                />
              </div>
            </div>

            {/* Task 3: Troubleshooting */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 border rounded-xl">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-bold text-foreground">3. Kecepatan Troubleshooting</h3>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Skor Ujian (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setPractice(p => ({ ...p, troubleScore: star }))}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= practice.troubleScore ? "text-warning fill-warning" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="trouble-comment" className="text-[10px] text-muted-foreground uppercase">Catatan Catatan</Label>
                <Textarea 
                  id="trouble-comment"
                  placeholder="Catatan penanganan debugging error hardware..."
                  value={practice.troubleComment}
                  onChange={e => setPractice(p => ({ ...p, troubleComment: e.target.value }))}
                  className="h-20 text-xs resize-none rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ATTACHMENT BOX */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Lampiran Bukti Uji Praktik</p>
                <p className="text-[10px] text-muted-foreground">
                  {practice.hasAttachment ? `Terlampir: ${practice.attachmentName}` : "Belum ada lampiran file foto atau rekaman video pengajaran."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleAttachMockFile('photo')} variant="outline" size="sm" className="gap-1 rounded-lg text-xs font-semibold">
                <Camera className="w-3.5 h-3.5" /> Upload Foto Rangkaian
              </Button>
              <Button onClick={() => handleAttachMockFile('video')} variant="outline" size="sm" className="gap-1 rounded-lg text-xs font-semibold">
                <Video className="w-3.5 h-3.5" /> Upload Video Microteaching
              </Button>
            </div>
          </div>
        </div>

        {/* PILIHAN GANDA DETAIL CARD */}
        <div className="glass-card rounded-2xl p-6 border bg-white dark:bg-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-foreground text-base sm:text-lg border-b pb-2 flex items-center gap-1.5">
            📝 Jawaban Pilihan Ganda ({result.pgScore || 0}/10 Benar)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pgQuestions.map((q, i) => {
              const userAnswerIndex = result.pgAnswers?.[i];
              const isCorrect = userAnswerIndex === q.answer;
              const isAnswered = userAnswerIndex !== undefined && userAnswerIndex !== null && userAnswerIndex !== -1;
              
              let answerText = "Tidak dijawab";
              if (isAnswered && typeof userAnswerIndex === 'number' && userAnswerIndex >= 0 && userAnswerIndex < q.options.length) {
                answerText = q.options[userAnswerIndex];
              }
              
              return (
                <div key={i} className={`p-3.5 rounded-xl border text-xs leading-relaxed flex flex-col justify-between ${
                  isCorrect ? "bg-success/5 border-success/20 text-foreground" : 
                  isAnswered ? "bg-danger/5 border-danger/20 text-foreground" :
                  "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700"
                }`}>
                  <div>
                    <p className="font-extrabold text-xs">No. {i + 1} ({q.category})</p>
                    <p className="font-medium text-foreground mt-1">{q.question}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Kandidat: <strong className={isCorrect ? "text-success" : isAnswered ? "text-danger" : "text-muted-foreground"}>{answerText}</strong>
                    </span>
                    {!isCorrect && isAnswered && (
                      <span className="text-[10px] text-success font-bold">
                        ✓ Benar: {q.options[q.answer]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ESSAY DETAIL CARD */}
        <div className="glass-card rounded-2xl p-6 border bg-white dark:bg-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-foreground text-base sm:text-lg border-b pb-2">
            ✍️ Lembar Jawaban Essay
          </h2>
          <div className="space-y-4">
            {essayQuestions.map((q, i) => {
              const currentScore = result.essayScores?.[i] ?? result.essayAutoScores?.[i] ?? 0;
              return (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/20 dark:bg-slate-800/10 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-2">
                    <div className="flex-1">
                      <p className="font-extrabold text-xs text-primary flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Soal {i + 11} — Kategori: {q.category}
                      </p>
                      <p className="font-bold text-foreground text-sm leading-snug mt-1">{q.question}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Skor Assessor:</span>
                      <Select
                        value={String(currentScore)}
                        onValueChange={(v) => updateEssayScore(result.id, i, Number(v))}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs font-bold rounded-lg border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {[0, 1, 2, 3, 4].map((s) => (
                            <SelectItem key={s} value={String(s)}>{s} / 4</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3.5 border text-xs sm:text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {result.essayAnswers?.[i] || <span className="text-muted-foreground italic">Tidak dijawab</span>}
                  </div>

                  {/* KEYWORDS */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1 flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-primary" /> Keyword Match:</span>
                    {q.keywords.map((k) => {
                      const match = result.essayAnswers?.[i]?.toLowerCase().includes(k.toLowerCase());
                      return (
                        <span key={k} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          match ? "bg-success/15 text-success border border-success/35" : 
                          "bg-slate-100 text-muted-foreground dark:bg-slate-800"
                        }`}>
                          {k}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDetailPage;
