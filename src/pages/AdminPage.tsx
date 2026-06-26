import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminStore, pgQuestions, essayQuestions } from "@/store/useTestStore";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-idn.png";
import { 
  LogOut, 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  RefreshCw, 
  Upload, 
  FileSpreadsheet, 
  Search,
  Filter,
  Users,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  MapPin,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";

const AdminPage = () => {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    results, 
    fetchResults, 
    logout, 
    syncToServer,
    exportToCSV,
    lastSyncTime,
    isLoading 
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [filterPredikat, setFilterPredikat] = useState("all");

  useEffect(() => {
    if (!isAdmin) { 
      navigate("/login"); 
      return; 
    }
    fetchResults();
  }, [isAdmin, navigate, fetchResults]);

  // Export to Excel V2 (Including identity details)
  const exportExcel = () => {
    const data = results.map((r) => ({
      Nama: r.nama,
      Email: r.email,
      WhatsApp: r.hp,
      Instansi: r.instansi,
      Kota: r.kota,
      Posisi: r.posisi,
      "Skor PG (30%)": r.skorPG,
      "Skor Essay (70%)": r.skorEssay.toFixed(1),
      "Nilai Akhir": r.nilaiAkhir,
      Predikat: r.predikat,
      Waktu: new Date(r.timestamp).toLocaleString("id-ID"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Tes");
    XLSX.writeFile(wb, `hasil-assessment-idn-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Generate and Download PDF Report
  const downloadRapor = async (resultId: string) => {
    const result = results.find(r => r.id === resultId);
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
    y += 8;

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentW, 42, 3, 3, "F");
    
    // Identity on PDF
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter & Search Logic
  const filteredResults = results.filter(r => {
    const matchesSearch = 
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(search.toLowerCase())) ||
      (r.instansi && r.instansi.toLowerCase().includes(search.toLowerCase())) ||
      (r.kota && r.kota.toLowerCase().includes(search.toLowerCase()));

    if (filterPredikat === "all") return matchesSearch;
    return matchesSearch && r.predikat.toLowerCase() === filterPredikat.toLowerCase();
  });

  // Calculate Competency Category Scores (Recharts analytics)
  const getCategoryAnalytics = () => {
    if (results.length === 0) return [];
    
    const categories = {
      "Pengetahuan": { total: 0, count: 0 },
      "Sistem": { total: 0, count: 0 },
      "Troubleshooting": { total: 0, count: 0 },
      "Programming": { total: 0, count: 0 }
    };

    results.forEach(res => {
      essayQuestions.forEach((eq, idx) => {
        const score = res.essayScores?.[idx] ?? res.essayAutoScores?.[idx] ?? 0;
        const cat = eq.category as keyof typeof categories;
        if (categories[cat]) {
          categories[cat].total += score;
          categories[cat].count += 1;
        }
      });
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      average: Number((data.count > 0 ? (data.total / data.count) : 0).toFixed(2))
    }));
  };

  // Calculate Predicate Distribution (Pie chart data)
  const getPredicateData = () => {
    const distribution = {
      "Sangat Kompeten": 0,
      "Kompeten": 0,
      "Cukup Kompeten": 0,
      "Belum Kompeten": 0
    };

    results.forEach(r => {
      const pred = r.predikat as keyof typeof distribution;
      if (distribution[pred] !== undefined) {
        distribution[pred]++;
      } else {
        distribution["Belum Kompeten"]++;
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);
  };

  const categoryData = getCategoryAnalytics();
  const predicateData = getPredicateData();
  const COLORS = ["#16a34a", "#2563eb", "#ea580c", "#dc2626"];

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* NAVBAR */}
      <nav className="glass-card border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IDN Logo" className="h-8" />
          <div className="leading-none">
            <span className="font-extrabold text-foreground text-base">Assessment Portal</span>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Assessor Dashboard V2</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {lastSyncTime && (
            <span className="text-[10px] text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-full">
              Sync Terakhir: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchResults} disabled={isLoading} className="gap-1.5 h-9 rounded-xl text-xs font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={syncToServer} className="gap-1.5 h-9 rounded-xl text-xs font-semibold">
            <Upload className="w-3.5 h-3.5" /> Sync Drafts
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-1.5 h-9 rounded-xl text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Eksport CSV
          </Button>
          <Link to="/admin/rubric">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" /> Edit Rubrik
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-1.5 h-9 rounded-xl text-xs font-semibold">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </Button>
        </div>
      </nav>

      {/* CORE WRAPPER */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* KPI COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Pelamar Ujian", value: results.length, icon: Users, color: "text-primary bg-primary/10 border-primary/20" },
            { label: "Rata-rata Nilai Akhir", value: results.length ? Math.round(results.reduce((a, r) => a + r.nilaiAkhir, 0) / results.length) : 0, icon: TrendingUp, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { label: "Kandidat Kompeten (>=75)", value: results.filter(r => r.nilaiAkhir >= 75).length, icon: Award, color: "text-success bg-success/10 border-success/20" },
            { label: "Belum Kompeten (<60)", value: results.filter(r => r.nilaiAkhir < 60).length, icon: AlertTriangle, color: "text-danger bg-danger/10 border-danger/20" },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-extrabold text-foreground mt-0.5 leading-none">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ANALYTICS SECTION (CHARTS) */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Predicate Distribution Chart */}
            <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                📊 Sebaran Predikat Kelulusan
              </h3>
              <div className="h-[220px] flex items-center justify-center">
                {predicateData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={predicateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {predicateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Peserta`, "Jumlah"]} />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Data distribusi kosong.</p>
                )}
              </div>
            </div>

            {/* Average Competency Category Score */}
            <div className="glass-card rounded-2xl p-5 border bg-white dark:bg-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                📈 Nilai Rata-rata Rubrik Kompetensi Essay (Skala 0-4)
              </h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 4]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} formatter={(value) => [value, "Rata-rata Skor"]} />
                    <Bar dataKey="average" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* SEARCH, FILTER & ACTION BAR */}
        <div className="glass-card rounded-2xl p-4 border bg-white dark:bg-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama, email, instansi, atau kota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-primary w-full"
            />
          </div>
          
          <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
            <Select value={filterPredikat} onValueChange={setFilterPredikat}>
              <SelectTrigger className="h-10 rounded-xl text-xs border-slate-200 w-full sm:w-[160px]">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Semua Predikat" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Predikat</SelectItem>
                <SelectItem value="Sangat Kompeten">Sangat Kompeten</SelectItem>
                <SelectItem value="Kompeten">Kompeten</SelectItem>
                <SelectItem value="Cukup Kompeten">Cukup Kompeten</SelectItem>
                <SelectItem value="Belum Kompeten">Belum Kompeten</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportExcel} variant="outline" className="h-10 rounded-xl text-xs font-semibold gap-1.5 w-full sm:w-auto">
              <Download className="w-3.5 h-3.5" /> Ekspor Excel
            </Button>
          </div>
        </div>

        {/* PARTICIPANTS TABLE */}
        <div className="glass-card rounded-2xl border bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b text-xs font-extrabold text-muted-foreground uppercase">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Kandidat & Kontak</th>
                  <th className="p-4">Instansi & Lokasi</th>
                  <th className="p-4 text-center">PG (30%)</th>
                  <th className="p-4 text-center">Essay (70%)</th>
                  <th className="p-4 text-center">Skor Akhir</th>
                  <th className="p-4 text-center">Predikat</th>
                  <th className="p-4 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs italic">
                      {isLoading ? "Menghubungkan ke Google Sheets..." : "Tidak ada data peserta yang cocok dengan kriteria."}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-center font-semibold text-muted-foreground">{i + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-foreground">{r.nama}</div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {r.email || "-"}</span>
                          <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {r.hp || "-"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-muted-foreground" /> {r.instansi || "-"}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {r.kota || "-"}</div>
                      </td>
                      <td className="p-4 text-center font-mono font-semibold">{r.skorPG}</td>
                      <td className="p-4 text-center font-mono font-semibold">{r.skorEssay.toFixed(1)}</td>
                      <td className="p-4 text-center font-mono font-extrabold text-primary text-base">{r.nilaiAkhir}</td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wider ${
                          r.nilaiAkhir >= 75 ? "bg-success/10 text-success border border-success/20" : 
                          r.nilaiAkhir >= 60 ? "bg-warning/10 text-warning border border-warning/20" : 
                          "bg-danger/10 text-danger border border-danger/20"
                        }`}>
                          {r.predikat}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/admin/detail/${r.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1 h-8 rounded-lg text-xs font-semibold">
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadRapor(r.id)} 
                            className="gap-1 h-8 rounded-lg text-xs font-semibold text-primary hover:text-primary hover:bg-primary/5"
                          >
                            <FileText className="w-3.5 h-3.5" /> Rapor
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1 bg-accent/40 py-2.5 rounded-xl border border-dashed">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Data disinkronkan langsung dari Google Spreadsheet & di-cache di penyimpanan lokal
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
