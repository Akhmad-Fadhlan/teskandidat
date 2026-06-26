import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, User, Briefcase, FileSpreadsheet, Lock } from "lucide-react";
import logo from "@/assets/logo-idn.png";
import { Button } from "@/components/ui/button";

interface SubmissionSummary {
  id: string;
  nama: string;
  email: string;
  posisi: string;
  duration: number;
  timestamp: string;
}

const FinishPage = () => {
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);

  useEffect(() => {
    const lastSubmission = localStorage.getItem("last_submission");
    if (lastSubmission) {
      try {
        setSummary(JSON.parse(lastSubmission));
      } catch (err) {
        console.error("Gagal membaca ringkasan pengiriman:", err);
      }
    }
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0 detik";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} menit ${secs} detik`;
    }
    return `${secs} detik`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="w-full max-w-md animate-fade-in text-center">
        <div className="glass-card rounded-3xl p-8 space-y-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border shadow-lg">
          <img src={logo} alt="IDN Boarding School" className="h-16 mx-auto hover:scale-105 transition-transform" />
          
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center border border-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Assessment Selesai</h1>
            <p className="text-sm text-muted-foreground">Lembar jawaban Anda telah berhasil dikirim ke server.</p>
          </div>

          {summary ? (
            <div className="bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-5 border text-left space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1 border-b pb-2">Detail Pengerjaan</h3>
              
              <div className="flex items-center gap-2.5 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Nomor Assessment</p>
                  <p className="font-semibold text-foreground mt-0.5 font-mono">{summary.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <User className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Nama Peserta</p>
                  <p className="font-semibold text-foreground mt-0.5">{summary.nama}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Briefcase className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Posisi</p>
                  <p className="font-semibold text-foreground mt-0.5">{summary.posisi}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Durasi Ujian</p>
                  <p className="font-semibold text-foreground mt-0.5">{formatDuration(summary.duration)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Tanggal Ujian</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(summary.timestamp).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Status Hasil</span>
                <span className="text-[10px] font-extrabold bg-warning/15 text-warning border border-warning/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Menunggu Penilaian
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-4 border text-xs text-muted-foreground italic">
              Tidak ada detail pengerjaan aktif yang dapat ditampilkan.
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Link to="/">
              <Button className="w-full h-11 text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 rounded-xl transition-all">
                Kembali ke Beranda
              </Button>
            </Link>
            
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Portal Administrator
              </Button>
            </Link>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Hasil akhir seleksi akan dikirimkan oleh panitia IDN Boarding School melalui Email / WhatsApp terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinishPage;
