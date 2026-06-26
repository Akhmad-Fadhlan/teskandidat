import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTestStore } from "@/store/useTestStore";
import logo from "@/assets/logo-idn.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Chrome, 
  Wifi, 
  Maximize2, 
  Monitor, 
  Check, 
  Lock, 
  FileText, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const reset = useTestStore((s) => s.reset);
  const setIdentity = useTestStore((s) => s.setIdentity);
  const setStepStore = useTestStore((s) => s.setStep);
  
  // Wizard steps: 0 = Landing, 1 = Identity Form, 2 = Instruction, 3 = Browser Check
  const [step, setStep] = useState(0);

  // Form State
  const [form, setForm] = useState({
    nama: "",
    email: "",
    hp: "",
    instansi: "",
    kota: "",
    posisi: "Guru Robotik & IoT"
  });
  
  // Validation checks
  const [agreed, setAgreed] = useState(false);
  const [browserChecks, setBrowserChecks] = useState({
    isChrome: false,
    isOnline: false,
    isFullscreenSupported: false,
    isResolutionOk: false
  });
  const [checking, setChecking] = useState(false);

  // Reset store on mount
  useEffect(() => {
    reset();
  }, [reset]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStartOnboarding = () => {
    setStep(1);
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.email.trim() || !form.hp.trim() || !form.instansi.trim() || !form.kota.trim()) {
      return;
    }
    setStep(2);
  };

  const handleInstructionSubmit = () => {
    if (!agreed) return;
    setStep(3);
    runBrowserChecks();
  };

  const runBrowserChecks = () => {
    setChecking(true);
    setTimeout(() => {
      const userAgent = navigator.userAgent;
      const isChrome = /Chrome/.test(userAgent) || /Safari/.test(userAgent);
      const isOnline = navigator.onLine;
      const isFullscreenSupported = !!document.documentElement.requestFullscreen || !!(document.documentElement as any).webkitRequestFullscreen;
      const isResolutionOk = window.innerWidth >= 1024 || window.screen.width >= 1024; // Desktop/Laptop friendly

      setBrowserChecks({
        isChrome,
        isOnline,
        isFullscreenSupported,
        isResolutionOk
      });
      setChecking(false);
    }, 1500);
  };

  const enterFullscreenAndStart = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen permission error:", err);
    }
    
    // Save to Zustand
    setIdentity({
      nama: form.nama.trim(),
      email: form.email.trim(),
      hp: form.hp.trim(),
      instansi: form.instansi.trim(),
      kota: form.kota.trim(),
      posisi: form.posisi.trim()
    });
    setStepStore(4); // Start test phase in store
    navigate("/test");
  };

  const renderStepLanding = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <img src={logo} alt="IDN Boarding School" className="h-16 sm:h-20 mx-auto transform hover:scale-105 transition-transform duration-300" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">AI Assessment Center</h1>
        <p className="text-sm text-muted-foreground font-medium bg-secondary/50 py-1.5 px-3 rounded-full inline-block">
          Guru Robotik & IoT — IDN Boarding School
        </p>
      </div>

      <div className="glass-card border rounded-2xl p-6 bg-white/50 dark:bg-black/20 shadow-sm space-y-4">
        <h2 className="font-bold text-foreground text-lg">Informasi Assessment</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { text: "25 Soal Ujian", desc: "10 PG + 15 Essay", icon: "📝" },
            { text: "60 Menit Durasi", desc: "Timer otomatis", icon: "⏳" },
            { text: "Auto Save Aktif", desc: "Backup otomatis", icon: "💾" },
            { text: "AI Evaluasi", desc: "Analisis real-time", icon: "🤖" },
            { text: "Mode Fullscreen", desc: "Keamanan ketat", icon: "🔒" },
            { text: "Sertifikat", desc: "Kompetensi digital", icon: "🏆" }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-accent/40 border border-transparent hover:border-accent hover:bg-accent/60 transition-all">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-foreground leading-none mb-0.5">{item.text}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Persyaratan Sistem</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 border border-primary/20">
              <Monitor className="w-3.5 h-3.5" /> Laptop / PC
            </span>
            <span className="bg-success/10 text-success px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 border border-success/20">
              <Chrome className="w-3.5 h-3.5" /> Google Chrome
            </span>
            <span className="bg-warning/10 text-warning px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 border border-warning/20">
              <Wifi className="w-3.5 h-3.5" /> Koneksi Stabil
            </span>
          </div>
        </div>

        <Button 
          onClick={handleStartOnboarding} 
          className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl mt-2"
        >
          Mulai Assessment
        </Button>
      </div>
    </div>
  );

  const renderStepIdentity = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setStep(0)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">Langkah 1 dari 3</span>
      </div>

      <div className="glass-card border rounded-2xl p-6 bg-white/50 dark:bg-black/20 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="font-extrabold text-foreground text-xl">Data Diri Peserta</h2>
          <p className="text-xs text-muted-foreground">Silakan isi formulir identitas Anda untuk pencatatan di Google Sheets dan Rapor.</p>
        </div>

        <form onSubmit={handleIdentitySubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-xs font-bold text-foreground">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="nama"
                placeholder="Contoh: Akhmad Fadhlan"
                required
                value={form.nama}
                onChange={e => handleInputChange("nama", e.target.value)}
                className="pl-9 h-11 rounded-lg border-muted-foreground/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  required
                  value={form.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  className="pl-9 h-11 rounded-lg border-muted-foreground/20 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hp" className="text-xs font-bold text-foreground">No. WhatsApp/HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hp"
                  placeholder="0812xxxx"
                  required
                  value={form.hp}
                  onChange={e => handleInputChange("hp", e.target.value)}
                  className="pl-9 h-11 rounded-lg border-muted-foreground/20 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instansi" className="text-xs font-bold text-foreground">Instansi / Asal Sekolah</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="instansi"
                  placeholder="Contoh: IDN Boarding School"
                  required
                  value={form.instansi}
                  onChange={e => handleInputChange("instansi", e.target.value)}
                  className="pl-9 h-11 rounded-lg border-muted-foreground/20 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kota" className="text-xs font-bold text-foreground">Kota / Domisili</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="kota"
                  placeholder="Contoh: Jakarta"
                  required
                  value={form.kota}
                  onChange={e => handleInputChange("kota", e.target.value)}
                  className="pl-9 h-11 rounded-lg border-muted-foreground/20 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="posisi" className="text-xs font-bold text-foreground">Posisi yang Dilamar</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="posisi"
                readOnly
                value={form.posisi}
                className="pl-9 h-11 rounded-lg border-muted-foreground/10 bg-muted/30 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-all rounded-lg mt-2 flex items-center justify-center gap-1.5"
          >
            Lanjut ke Aturan <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  const renderStepInstruction = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">Langkah 2 dari 3</span>
      </div>

      <div className="glass-card border rounded-2xl p-6 bg-white/50 dark:bg-black/20 shadow-sm space-y-5">
        <div className="space-y-1">
          <h2 className="font-extrabold text-foreground text-xl">Aturan & Petunjuk Ujian</h2>
          <p className="text-xs text-muted-foreground">Harap baca dengan teliti sebelum memulai ujian kompetensi.</p>
        </div>

        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 text-xs leading-relaxed text-muted-foreground border-y py-3">
          {[
            "1. Durasi pengerjaan adalah 60 menit semenjak tombol mulai ditekan.",
            "2. Anda dilarang membuka tab baru, browser lain, ataupun aplikasi lain selama ujian.",
            "3. Sistem memiliki detektor fokus. Jika Anda meninggalkan halaman ini sebanyak 2 kali, jawaban akan otomatis tersimpan dan Anda didiskualifikasi.",
            "4. Sistem dilarang mengambil tangkapan layar (screenshot), melakukan print, serta copy-paste teks soal/jawaban.",
            "5. Jawaban Anda disimpan secara berkala ke database online. Jika koneksi terputus, jawaban akan disimpan di penyimpanan lokal dan disinkronkan saat koneksi aktif kembali.",
            "6. Kerjakan secara mandiri. AI Assessment System akan menganalisis kecocokan konsep jawaban Anda dengan rubrik kelulusan secara objektif."
          ].map((rule, idx) => (
            <p key={idx} className="bg-accent/20 p-2 rounded-lg border border-transparent hover:border-accent transition-colors text-foreground">{rule}</p>
          ))}
        </div>

        <div className="flex items-start gap-2.5 p-1">
          <Checkbox 
            id="agreement" 
            checked={agreed} 
            onCheckedChange={(checked) => setAgreed(!!checked)}
            className="mt-0.5 rounded"
          />
          <Label htmlFor="agreement" className="text-xs font-medium text-muted-foreground select-none cursor-pointer leading-tight">
            Saya memahami seluruh aturan di atas dan bersedia didiskualifikasi jika terdeteksi melakukan kecurangan.
          </Label>
        </div>

        <Button 
          onClick={handleInstructionSubmit}
          disabled={!agreed}
          className="w-full h-11 text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-all rounded-lg flex items-center justify-center gap-1.5"
        >
          Lanjut ke Cek Sistem <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStepBrowserCheck = () => {
    const allChecksOk = browserChecks.isOnline && browserChecks.isFullscreenSupported && browserChecks.isResolutionOk;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">Langkah 3 dari 3</span>
        </div>

        <div className="glass-card border rounded-2xl p-6 bg-white/50 dark:bg-black/20 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="font-extrabold text-foreground text-xl">Uji Kelayakan Sistem</h2>
            <p className="text-xs text-muted-foreground">Verifikasi hardware dan software Anda sebelum memasuki layar ujian.</p>
          </div>

          {checking ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs text-muted-foreground font-semibold">Menganalisis konfigurasi sistem browser Anda...</p>
            </div>
          ) : (
            <div className="space-y-3 border-y py-3">
              {[
                { 
                  name: "Browser Kompatibel (Chrome / Safari)", 
                  valid: browserChecks.isChrome, 
                  desc: browserChecks.isChrome ? "Browser terdeteksi kompatibel" : "Gunakan Google Chrome atau Safari", 
                  icon: Chrome,
                  critical: false
                },
                { 
                  name: "Koneksi Internet", 
                  valid: browserChecks.isOnline, 
                  desc: browserChecks.isOnline ? "Online" : "Internet terputus", 
                  icon: Wifi,
                  critical: true
                },
                { 
                  name: "Mode Layar Penuh (Fullscreen)", 
                  valid: browserChecks.isFullscreenSupported, 
                  desc: browserChecks.isFullscreenSupported ? "Didukung" : "Browser tidak mendukung fullscreen", 
                  icon: Maximize2,
                  critical: true
                },
                { 
                  name: "Resolusi Layar (Desktop Mode)", 
                  valid: browserChecks.isResolutionOk, 
                  desc: browserChecks.isResolutionOk ? "Memenuhi standar (>= 1024px)" : "Disarankan layar lebar / Laptop", 
                  icon: Monitor,
                  critical: false
                }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-transparent">
                    <div className="flex gap-2.5 items-center">
                      <div className={`p-1.5 rounded-md ${item.valid ? "bg-success/10 text-success" : item.critical ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-none mb-0.5">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground leading-none">{item.desc}</p>
                      </div>
                    </div>
                    <div>
                      {item.valid ? (
                        <span className="text-xs text-success bg-success/15 px-2 py-0.5 rounded-full font-bold">✓ LOLOS</span>
                      ) : item.critical ? (
                        <span className="text-xs text-danger bg-danger/15 px-2 py-0.5 rounded-full font-bold">✗ GAGAL</span>
                      ) : (
                        <span className="text-xs text-warning bg-warning/15 px-2 py-0.5 rounded-full font-bold">⚠ REKOMENDASI</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!allChecksOk && !checking && (
            <div className="flex gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>
                <strong>Sistem Belum Layak!</strong> Ujian memerlukan koneksi internet aktif untuk inisialisasi dan dukungan mode fullscreen. Hubungkan internet dan jalankan ulang verifikasi.
              </p>
            </div>
          )}

          <div className="flex gap-2.5">
            <Button 
              variant="outline"
              onClick={runBrowserChecks}
              disabled={checking}
              className="flex-1 h-11 text-xs font-semibold rounded-lg"
            >
              Ulangi Verifikasi
            </Button>
            <Button 
              onClick={enterFullscreenAndStart}
              disabled={checking || !browserChecks.isOnline || !browserChecks.isFullscreenSupported}
              className="flex-[2] h-11 text-xs font-bold bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50 transition-all rounded-lg flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Masuk & Mulai Ujian
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveStep = () => {
    switch (step) {
      case 0:
        return renderStepLanding();
      case 1:
        return renderStepIdentity();
      case 2:
        return renderStepInstruction();
      case 3:
        return renderStepBrowserCheck();
      default:
        return renderStepLanding();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="w-full max-w-lg animate-fade-in py-8">
        {renderActiveStep()}
      </div>
    </div>
  );
};

export default Index;
