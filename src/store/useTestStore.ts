import { create } from 'zustand'; 
   
export interface PGQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  category: string;
  explanation: string;
}
  
export interface EssayQuestion {
  id: number;
  question: string;
  category: string;
  rubric: { score: number; desc: string }[];
  keywords: string[];
}

export interface TestResult {
  id: string;
  nama: string;
  email: string;
  hp: string;
  instansi: string;
  kota: string;
  posisi: string;
  timestamp: string;
  pgAnswers: number[];
  essayAnswers: string[];
  pgScore: number;
  essayScores: number[];
  essayAutoScores: number[];
  skorPG: number;
  skorEssay: number;
  nilaiAkhir: number;
  predikat: string;
}

export const pgQuestions: PGQuestion[] = [
  { id: 1, question: "Sebuah robot autonomous harus menavigasi ruangan gelap dan menghindari rintangan. Kombinasi sensor mana yang paling efektif?", options: ["Sensor cahaya (LDR) + sensor suhu", "Sensor ultrasonik + sensor IR proximity", "Sensor kelembaban + sensor tekanan"], answer: 1, category: "Analisis Sistem", explanation: "Sensor ultrasonik mengukur jarak ke rintangan, sedangkan IR proximity mendeteksi objek dekat — kombinasi optimal untuk navigasi ruangan gelap." },
  { id: 2, question: "Saat mengintegrasikan modul WiFi ESP8266 dengan Arduino Uno, data sensor tiba-tiba corrupt. Analisis mana yang paling tepat?", options: ["Arduino tidak kompatibel dengan WiFi", "Konflik level tegangan 5V (Arduino) vs 3.3V (ESP8266) tanpa level shifter", "Sensor harus diganti dengan tipe digital"], answer: 1, category: "Analisis Troubleshooting", explanation: "ESP8266 beroperasi di 3.3V sementara Arduino Uno di 5V. Tanpa level shifter, sinyal data bisa terdistorsi menyebabkan data corrupt." },
  { id: 3, question: "Robot berlengan (arm robot) 3-DOF perlu mengambil objek di posisi tertentu. Konsep apa yang harus dikuasai untuk menghitung posisi end-effector?", options: ["Hukum Newton III", "Inverse kinematics", "Teori antrian"], answer: 1, category: "Penerapan Konsep", explanation: "Inverse kinematics menghitung sudut setiap joint agar end-effector mencapai posisi target — fundamental dalam robot arm." },
  { id: 4, question: "Dalam kompetisi, robot sumo Anda kalah karena selalu terdorong lawan. Evaluasi faktor desain mana yang paling kritis untuk diperbaiki?", options: ["Menambah lebih banyak sensor", "Menurunkan center of gravity dan menambah traksi roda", "Mengganti mikrokontroler ke yang lebih cepat"], answer: 1, category: "Evaluasi Desain", explanation: "Center of gravity rendah dan traksi roda menentukan kemampuan robot sumo menahan dorongan — ini masalah mekanik, bukan elektronik." },
  { id: 5, question: "Sebuah sistem IoT monitoring suhu greenhouse mengirim data setiap detik, namun server kewalahan. Solusi arsitektur mana yang paling tepat?", options: ["Ganti sensor dengan yang lebih lambat", "Implementasi edge computing: olah data lokal, kirim hanya jika ada perubahan signifikan", "Tambah bandwidth internet"], answer: 1, category: "Arsitektur IoT", explanation: "Edge computing memproses data di perangkat lokal dan hanya mengirim data yang relevan, mengurangi beban server secara drastis." },
  { id: 6, question: "Anda merancang robot pengantar barang di gudang. Metode lokalisasi mana yang paling cocok untuk lingkungan indoor tanpa GPS?", options: ["Menggunakan kompas digital saja", "Kombinasi odometry + RFID tag pada lantai", "Mengandalkan sensor cahaya"], answer: 1, category: "Analisis Sistem", explanation: "Odometry melacak perpindahan via encoder roda, dikombinasikan RFID tag di lantai sebagai checkpoint koreksi posisi — solusi indoor yang reliable." },
  { id: 7, question: "Pada sistem conveyor belt otomatis, produk cacat harus dipisahkan. Pendekatan mana yang menerapkan konsep computer vision paling efektif?", options: ["Sensor berat untuk menimbang setiap produk", "Kamera + algoritma image classification untuk deteksi visual cacat", "Sensor proximity untuk menghitung jumlah produk"], answer: 1, category: "Penerapan Teknologi", explanation: "Computer vision dengan image classification dapat mendeteksi cacat visual yang tidak bisa diidentifikasi sensor mekanik konvensional." },
  { id: 8, question: "Komunikasi antar dua Arduino menggunakan protokol I2C gagal. Setelah dicek, kabel SDA dan SCL sudah benar. Apa kemungkinan penyebab yang sering terlewat?", options: ["Arduino tidak mendukung I2C", "Tidak ada pull-up resistor pada jalur SDA dan SCL", "Kabel terlalu pendek"], answer: 1, category: "Analisis Troubleshooting", explanation: "I2C memerlukan pull-up resistor (biasanya 4.7kΩ) pada jalur SDA dan SCL agar komunikasi berjalan — sering terlewat oleh pemula." },
  { id: 9, question: "Robot Anda menggunakan 4 motor DC, 3 servo, dan 5 sensor. Saat semua aktif bersamaan, sistem reboot sendiri. Apa analisis yang paling tepat?", options: ["Program terlalu berat untuk mikrokontroler", "Total arus melebihi kapasitas power supply, menyebabkan voltage drop", "Sensor mengirim data terlalu cepat"], answer: 1, category: "Analisis Kelistrikan", explanation: "Banyak aktuator aktif bersamaan menarik arus besar. Jika melebihi kapasitas PSU, tegangan drop dan mikrokontroler reboot — perlu power budget calculation." },
  { id: 10, question: "Dalam proyek smart home IoT, Anda perlu memilih antara protokol MQTT dan HTTP untuk komunikasi sensor. Kapan MQTT lebih unggul?", options: ["Saat butuh transfer file besar", "Saat butuh komunikasi real-time, hemat bandwidth, dengan banyak perangkat", "Saat hanya ada satu perangkat yang berkomunikasi"], answer: 1, category: "Arsitektur IoT", explanation: "MQTT dirancang untuk IoT: lightweight, publish-subscribe model, persistent connection — ideal untuk banyak sensor dengan komunikasi real-time." },
];

export const essayQuestions: EssayQuestion[] = [
  { id: 1, question: "Jika kita memiliki baterai 2S dan baterai 1S, kemudian kita perlu menyalakan robot yang memerlukan tegangan 12V. Apa yang harus dilakukan?", category: "Pengetahuan", rubric: [{ score: 4, desc: "Menjelaskan seri/paralel + solusi boost converter" }, { score: 3, desc: "Menyebut solusi tanpa detail" }, { score: 2, desc: "Jawaban sebagian benar" }, { score: 1, desc: "Salah" }], keywords: ["seri", "paralel", "tegangan", "boost", "step-up"] },
  { id: 2, question: "Bagaimana cara kerja motor driver?", category: "Sistem", rubric: [{ score: 4, desc: "Menjelaskan arah + kecepatan + PWM" }, { score: 3, desc: "Menyebut fungsi utama" }, { score: 2, desc: "Kurang lengkap" }, { score: 1, desc: "Salah" }], keywords: ["arah", "kecepatan", "pwm", "motor"] },
  { id: 3, question: "Sebutkan mikrokontroler yang sering dipakai? Jelaskan!", category: "Pengetahuan", rubric: [{ score: 4, desc: "Contoh + fungsi" }, { score: 3, desc: "Contoh saja" }, { score: 2, desc: "Tidak lengkap" }, { score: 1, desc: "Salah" }], keywords: ["arduino", "esp32", "kontrol"] },
  { id: 4, question: "Apa perbedaan sensor analog dan digital? Bisa beri contoh masing-masing?", category: "Pengetahuan", rubric: [{ score: 4, desc: "Perbedaan + contoh" }, { score: 3, desc: "Salah satu benar" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["analog", "digital", "kontinu", "high", "low"] },
  { id: 5, question: "Jika sensor tidak membaca data dengan benar, langkah apa yang akan Anda lakukan?", category: "Troubleshooting", rubric: [{ score: 4, desc: "Sistematis (cek kabel, kalibrasi, noise)" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Tidak runtut" }, { score: 1, desc: "Salah" }], keywords: ["kabel", "kalibrasi", "noise"] },
  { id: 6, question: "Jika saat lomba robot tiba-tiba tidak berfungsi, apa yang akan Anda prioritaskan untuk diperiksa terlebih dahulu? Dan bagaimana caranya?", category: "Troubleshooting", rubric: [{ score: 4, desc: "Prioritas power → koneksi → program" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Tidak sistematis" }, { score: 1, desc: "Salah" }], keywords: ["power", "baterai", "koneksi"] },
  { id: 7, question: "Sensor apa saja yang sering digunakan pada robot (misalnya robot line follower atau robot pengantar makanan)?", category: "Sistem", rubric: [{ score: 4, desc: "Menyebut + fungsi" }, { score: 3, desc: "Menyebut saja" }, { score: 2, desc: "Tidak lengkap" }, { score: 1, desc: "Salah" }], keywords: ["ir", "ultrasonic", "sensor"] },
  { id: 8, question: "Bagaimana cara Anda merancang robot untuk melakukan tugas tertentu?", category: "Sistem", rubric: [{ score: 4, desc: "Input → proses → output" }, { score: 3, desc: "Sebagian" }, { score: 2, desc: "Kurang jelas" }, { score: 1, desc: "Salah" }], keywords: ["input", "proses", "output"] },
  { id: 9, question: "Bahasa pemrograman apa yang dikuasai untuk mengontrol mikrokontroler?", category: "Programming", rubric: [{ score: 4, desc: "Bahasa + penggunaan" }, { score: 3, desc: "Menyebut saja" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["c", "arduino", "python"] },
  { id: 10, question: "Bagaimana cara Anda menulis program sederhana (misal untuk membaca sensor jarak dan menggerakkan motor)?", category: "Programming", rubric: [{ score: 4, desc: "Input → logika → output" }, { score: 3, desc: "Sebagian" }, { score: 2, desc: "Tidak jelas" }, { score: 1, desc: "Salah" }], keywords: ["if", "kondisi", "motor"] },
  { id: 11, question: "Bagaimana cara mengkalibrasi sensor agar lebih akurat?", category: "Troubleshooting", rubric: [{ score: 4, desc: "Sistematis + detail" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["threshold", "tuning"] },
  { id: 12, question: "Jika robot bergerak terlalu lambat, komponen mana yang biasanya perlu disesuaikan?", category: "Sistem", rubric: [{ score: 4, desc: "PWM + tegangan + penjelasan" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["pwm", "tegangan"] },
  { id: 13, question: "Apa saja yang Anda periksa ketika robot tidak sesuai dengan program yang sudah di-upload?", category: "Troubleshooting", rubric: [{ score: 4, desc: "Kode + wiring + logika" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["kode", "upload", "wiring"] },
  { id: 14, question: "Ceritakan langkah troubleshooting yang biasa Anda lakukan ketika robot tidak bergerak?", category: "Troubleshooting", rubric: [{ score: 4, desc: "Power → hardware → software" }, { score: 3, desc: "Sebagian benar" }, { score: 2, desc: "Kurang tepat" }, { score: 1, desc: "Salah" }], keywords: ["power", "hardware", "software"] },
  { id: 15, question: "Apakah Anda pernah membuat desain PCB? Software apa yang Anda gunakan? Ceritakan yang pernah Anda buat!", category: "Sistem", rubric: [{ score: 4, desc: "Pernah + software (KiCad/Eagle)" }, { score: 3, desc: "Pernah saja" }, { score: 2, desc: "Tahu saja" }, { score: 1, desc: "Tidak tahu" }], keywords: ["pcb", "kicad", "eagle"] },
];

function autoScoreEssay(answer: string, keywords: string[]): number {
  const lower = answer.toLowerCase();
  const matched = keywords.filter(k => lower.includes(k.toLowerCase()));
  const percent = matched.length / keywords.length;
  if (percent >= 0.8) return 4;
  if (percent >= 0.6) return 3;
  if (percent >= 0.4) return 2;
  return 1;
}

function hitungNilaiAkhir(skorPG: number, skorEssay: number): number {
  return Math.round((skorPG * 0.3) + (skorEssay * 0.7));
}

function getPredikat(nilai: number): string {
  if (nilai >= 90) return "Sangat Kompeten";
  if (nilai >= 75) return "Kompeten";
  if (nilai >= 60) return "Cukup Kompeten";
  return "Belum Kompeten";
}

interface TestState {
  nama: string;
  email: string;
  hp: string;
  instansi: string;
  kota: string;
  posisi: string;
  currentPG: number;
  pgAnswers: number[];
  currentEssay: number;
  essayAnswers: string[];
  isSubmitting: boolean;
  step: number;
  timeLeft: number;
  autosaveStatus: 'saved' | 'saving' | 'offline';
  isOnline: boolean;
  isPassedQuestion: Record<number, boolean>;
  setIdentity: (identity: { nama: string; email: string; hp: string; instansi: string; kota: string; posisi: string }) => void;
  setPGAnswer: (idx: number, ans: number) => void;
  setEssayAnswer: (idx: number, ans: string) => void;
  nextPG: () => void;
  prevPG: () => void;
  nextEssay: () => void;
  prevEssay: () => void;
  submitTest: () => Promise<void>;
  reset: () => void;
  setStep: (s: number) => void;
  setTimeLeft: (t: number | ((prev: number) => number)) => void;
  setAutosaveStatus: (s: 'saved' | 'saving' | 'offline') => void;
  setIsOnline: (b: boolean) => void;
  markQuestionPassed: (idx: number) => void;
  saveToLocalStorage: () => void;
}

interface AdminState {
  isAdmin: boolean;
  results: TestResult[];
  isLoading: boolean;
  lastSyncTime: string | null;
  customRubrics: Record<number, { rubric: { score: number; desc: string }[]; keywords: string[] }>;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  fetchResults: () => Promise<void>;
  updateEssayScore: (resultId: string, essayIdx: number, score: number) => Promise<void>;
  updateRubric: (essayId: number, rubric: { score: number; desc: string }[], keywords: string[]) => void;
  syncRubricsToServer: () => Promise<boolean>;
  fetchCustomRubrics: () => Promise<void>;
  updateRubricToServer: (essayId: number, rubric: { score: number; desc: string }[], keywords: string[]) => Promise<boolean>;
  syncToServer: () => Promise<void>;
  exportToCSV: () => void;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzeipFfwIPYdro4fc9Gcr_aLX23It-OH-qIANB23pk3v7zCfPx4IrQsHbWelgk4b9GV/exec";

export const useTestStore = create<TestState>((set, get) => ({
  nama: "",
  email: "",
  hp: "",
  instansi: "",
  kota: "",
  posisi: "",
  currentPG: 0,
  pgAnswers: Array(10).fill(-1),
  currentEssay: 0,
  essayAnswers: Array(15).fill(""),
  isSubmitting: false,
  step: 0,
  timeLeft: 3600,
  autosaveStatus: 'saved',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isPassedQuestion: {},
  setIdentity: (id) => set({ ...id }),
  setPGAnswer: (idx, ans) => {
    const arr = [...get().pgAnswers];
    arr[idx] = ans;
    set({ pgAnswers: arr });
    get().saveToLocalStorage();
  },
  setEssayAnswer: (idx, ans) => {
    const arr = [...get().essayAnswers];
    arr[idx] = ans;
    set({ essayAnswers: arr });
    get().saveToLocalStorage();
  },
  nextPG: () => set((s) => ({ currentPG: Math.min(s.currentPG + 1, 9) })),
  prevPG: () => set((s) => ({ currentPG: Math.max(s.currentPG - 1, 0) })),
  nextEssay: () => set((s) => ({ currentEssay: Math.min(s.currentEssay + 1, 14) })),
  prevEssay: () => set((s) => ({ currentEssay: Math.max(s.currentEssay - 1, 0) })),
  setStep: (s) => set({ step: s }),
  setTimeLeft: (t) => set((s) => ({ timeLeft: typeof t === 'function' ? t(s.timeLeft) : t })),
  setAutosaveStatus: (status) => set({ autosaveStatus: status }),
  setIsOnline: (online) => set({ isOnline: online }),
  markQuestionPassed: (idx) => set((s) => ({
    isPassedQuestion: { ...s.isPassedQuestion, [idx]: true }
  })),
  
  saveToLocalStorage: () => {
    const { nama, email, hp, instansi, kota, posisi, pgAnswers, essayAnswers, timeLeft } = get();
    const draft = { nama, email, hp, instansi, kota, posisi, pgAnswers, essayAnswers, timeLeft, timestamp: Date.now() };
    localStorage.setItem("exam_draft", JSON.stringify(draft));
    set({ autosaveStatus: 'saved' });
  },

  submitTest: async () => {
    set({ isSubmitting: true });
    const { nama, email, hp, instansi, kota, posisi, pgAnswers, essayAnswers } = get();
    
    const pgScore = pgAnswers.reduce((acc, a, i) => acc + (a === pgQuestions[i].answer ? 1 : 0), 0);
    const skorPG = (pgScore / 10) * 100;
    
    const essayAutoScores = essayAnswers.map((ans, i) => autoScoreEssay(ans, essayQuestions[i].keywords));
    const totalEssayMentah = essayAutoScores.reduce((a, b) => a + b, 0);
    const skorEssay = (totalEssayMentah / 60) * 100;
    
    const nilaiAkhir = hitungNilaiAkhir(skorPG, skorEssay);
    const predikat = getPredikat(nilaiAkhir);

    const result: TestResult = {
      id: Date.now().toString(),
      nama,
      email,
      hp,
      instansi,
      kota,
      posisi,
      timestamp: new Date().toISOString(),
      pgAnswers,
      essayAnswers,
      pgScore,
      essayScores: essayAutoScores,
      essayAutoScores,
      skorPG,
      skorEssay,
      nilaiAkhir,
      predikat,
    };

    const formattedAnswers = [
      ...pgAnswers.map((answer, idx) => ({
        no_soal: idx + 1,
        jawaban: answer !== -1 ? pgQuestions[idx].options[answer] : "Tidak dijawab",
        skor_auto: answer === pgQuestions[idx].answer ? 1 : 0,
        skor_final: answer === pgQuestions[idx].answer ? 1 : 0,
        aspek: pgQuestions[idx].category,
        tipe: "pg"
      })),
      ...essayAnswers.map((answer, idx) => ({
        no_soal: idx + 1,
        jawaban: answer || "Tidak dijawab",
        skor_auto: essayAutoScores[idx],
        skor_final: essayAutoScores[idx],
        aspek: essayQuestions[idx].category,
        tipe: "essay"
      }))
    ];

    const submitData = {
      action: "submitTest",
      id: result.id,
      nama: nama,
      email: email,
      hp: hp,
      instansi: instansi,
      kota: kota,
      posisi: posisi,
      timestamp: result.timestamp,
      skor_pg: skorPG,
      skor_essay: skorEssay,
      nilai_akhir: nilaiAkhir,
      predikat: predikat,
      pg_benar: pgScore,
      bobot_essay: 70,
      bobot_pg: 30,
      answers: formattedAnswers
    };

    const existing = JSON.parse(localStorage.getItem("testResults") || "[]");
    existing.push(result);
    localStorage.setItem("testResults", JSON.stringify(existing));
    
    const pendingSync = JSON.parse(localStorage.getItem("pendingSync") || "[]");
    pendingSync.push(result.id);
    localStorage.setItem("pendingSync", JSON.stringify(pendingSync));

    localStorage.removeItem("exam_draft");

    try {
      set({ autosaveStatus: 'saving' });
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      
      const updatedQueue = JSON.parse(localStorage.getItem("pendingSync") || "[]");
      const filteredQueue = updatedQueue.filter((id: string) => id !== result.id);
      localStorage.setItem("pendingSync", JSON.stringify(filteredQueue));
      set({ autosaveStatus: 'saved' });
    } catch (e) {
      console.log("Data tersimpan di localStorage");
      set({ autosaveStatus: 'offline' });
    }

    set({ isSubmitting: false });
  },
  
  reset: () => set({
    nama: "",
    email: "",
    hp: "",
    instansi: "",
    kota: "",
    posisi: "",
    currentPG: 0,
    pgAnswers: Array(10).fill(-1),
    currentEssay: 0,
    essayAnswers: Array(15).fill(""),
    isSubmitting: false,
    step: 0,
    timeLeft: 3600,
    isPassedQuestion: {},
  }),
}));

const ADMIN_CREDS = [
  { user: "fadhlan", pass: "fadlan90" },
  { user: "idnbs", pass: "mudamendunia123" },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: localStorage.getItem("isAdmin") === "true",
  results: [],
  isLoading: false,
  lastSyncTime: localStorage.getItem("lastSyncTime"),
  customRubrics: JSON.parse(localStorage.getItem("customRubrics") || "{}"),
  
  login: (u, p) => {
    const valid = ADMIN_CREDS.some(c => c.user === u && c.pass === p);
    if (valid) {
      localStorage.setItem("isAdmin", "true");
      set({ isAdmin: true });
    }
    return valid;
  },
  
  logout: () => {
    localStorage.removeItem("isAdmin");
    set({ isAdmin: false });
  },
  
 fetchResults: async () => {
  set({ isLoading: true });
  
  try {
    console.log("🔄 Mengambil data dari server Google Sheets...");
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getResults&t=${Date.now()}`);
    const data = await response.json();
    console.log("📥 Raw data dari server:", JSON.stringify(data, null, 2));
    
    if (data.success && Array.isArray(data.results)) {
      const serverResults: TestResult[] = data.results.map((r: any) => {
        console.log(`Processing result for: ${r.nama}`);
        console.log("Raw pgAnswers from server (type):", typeof r.pgAnswers?.[0], r.pgAnswers);
        
        // === KONVERSI PG ANSWERS DARI TEKS KE INDEX ===
        let pgAnswersIndex: number[] = Array(10).fill(-1);
        
        // Ambil data teks dari pgAnswers (karena dari server berupa teks)
        const pgTextAnswers = r.pgAnswers || [];
        
        if (pgTextAnswers.length === 10) {
          pgAnswersIndex = pgTextAnswers.map((jawabanText: string, idx: number) => {
            // Jika tidak ada jawaban atau "Tidak dijawab"
            if (!jawabanText || jawabanText === "Tidak dijawab" || jawabanText === "") {
              console.log(`Soal ${idx + 1}: Tidak dijawab`);
              return -1;
            }
            
            // Cari index jawaban yang cocok dengan teks
            const question = pgQuestions[idx];
            if (question) {
              const foundIndex = question.options.findIndex(opt => opt === jawabanText);
              if (foundIndex !== -1) {
                console.log(`Soal ${idx + 1}: "${jawabanText}" -> index ${foundIndex}`);
                return foundIndex;
              } else {
                console.warn(`Soal ${idx + 1}: Tidak menemukan index untuk "${jawabanText}"`);
                console.log("Available options:", question.options);
                return -1;
              }
            }
            return -1;
          });
        }
        
        console.log("Converted pgAnswersIndex:", pgAnswersIndex);
        
        // Hitung ulang pgScore berdasarkan index yang ditemukan
        const calculatedPgScore = pgAnswersIndex.reduce((acc, answerIdx, i) => {
          const isCorrect = answerIdx === pgQuestions[i]?.answer;
          if (isCorrect) acc++;
          return acc;
        }, 0);
        
        const skorPG = (calculatedPgScore / 10) * 100;
        
        console.log(`Calculated: pgScore=${calculatedPgScore}, skorPG=${skorPG}`);
        
        // === ESSAY ANSWERS ===
        let essayAnswersArray: string[] = Array(15).fill("");
        let essayScoresArray: number[] = Array(15).fill(0);
        
        if (r.essayAnswers && Array.isArray(r.essayAnswers)) {
          essayAnswersArray = r.essayAnswers;
        }
        
        if (r.essayScores && Array.isArray(r.essayScores)) {
          essayScoresArray = r.essayScores;
        } else if (r.essayAutoScores && Array.isArray(r.essayAutoScores)) {
          essayScoresArray = r.essayAutoScores;
        }
        
        const finalResult: TestResult = {
          id: r.id || Date.now().toString(),
          nama: r.nama || "Unknown",
          email: r.email || "",
          hp: r.hp || "",
          instansi: r.instansi || "",
          kota: r.kota || "",
          posisi: r.posisi || "",
          timestamp: r.timestamp || new Date().toISOString(),
          pgAnswers: pgAnswersIndex, // SEKARANG ARRAY OF NUMBERS!
          essayAnswers: essayAnswersArray,
          pgScore: calculatedPgScore,
          essayScores: essayScoresArray,
          essayAutoScores: r.essayAutoScores || essayScoresArray,
          skorPG: skorPG,
          skorEssay: r.skorEssay || 0,
          nilaiAkhir: r.nilaiAkhir || 0,
          predikat: r.predikat || "Belum Kompeten",
        };
        
        console.log(`✅ Final result for ${finalResult.nama}:`, {
          pgAnswers: finalResult.pgAnswers,
          pgScore: finalResult.pgScore,
          skorPG: finalResult.skorPG
        });
        
        return finalResult;
      });
      
      // Simpan ke localStorage
      localStorage.setItem("testResults", JSON.stringify(serverResults));
      set({ results: serverResults, lastSyncTime: new Date().toISOString() });
      localStorage.setItem("lastSyncTime", new Date().toISOString());
      
      console.log(`✅ Berhasil mengambil ${serverResults.length} data dari server`);
      console.log("Sample first result pgAnswers (should be numbers):", serverResults[0]?.pgAnswers);
      
    } else {
      console.log("⚠️ Tidak ada data dari server, menggunakan data lokal");
      const localResults = JSON.parse(localStorage.getItem("testResults") || "[]");
      set({ results: localResults });
    }
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    const localResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    set({ results: localResults });
  }
  
  set({ isLoading: false });
},
  updateEssayScore: async (resultId, essayIdx, score) => {
    const results = [...get().results];
    const idx = results.findIndex(r => r.id === resultId);
    if (idx === -1) return;

    results[idx].essayScores[essayIdx] = score;
    const totalEssayMentah = results[idx].essayScores.reduce((a, b) => a + b, 0);
    const skorEssay = (totalEssayMentah / 60) * 100;
    results[idx].skorEssay = skorEssay;
    const nilaiAkhir = hitungNilaiAkhir(results[idx].skorPG, skorEssay);
    results[idx].nilaiAkhir = nilaiAkhir;
    results[idx].predikat = getPredikat(nilaiAkhir);

    set({ results });
    localStorage.setItem("testResults", JSON.stringify(results));

    try {
      const updateData = {
        action: "updateScore",
        id: resultId,
        essay_index: essayIdx,
        new_score: score,
        skor_essay: skorEssay,
        nilai_akhir: nilaiAkhir,
        predikat: results[idx].predikat,
      };

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      console.log("✅ Skor terupdate di server");
    } catch (e) {
      console.log("📌 Skor tersimpan di localStorage");
    }
  },
  
  updateRubric: (essayId, rubric, keywords) => {
    set((s) => ({ 
      customRubrics: { 
        ...s.customRubrics, 
        [essayId]: { rubric, keywords } 
      } 
    }));
    localStorage.setItem("customRubrics", JSON.stringify(get().customRubrics));
  },
  
  syncRubricsToServer: async () => {
    const { customRubrics } = get();
    
    const allKeywords: Record<number, string[]> = {};
    for (const [id, data] of Object.entries(customRubrics)) {
      const essayId = parseInt(id);
      const essay = essayQuestions.find(e => e.id === essayId);
      if (essay) {
        allKeywords[essayId] = data.keywords || essay.keywords;
      }
    }
    
    const syncData = {
      action: "syncRubrics",
      customRubrics: customRubrics,
      allKeywords: allKeywords
    };
    
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      });
      
      console.log("✅ Rubrics synced to server");
      localStorage.setItem("customRubricsLastSync", new Date().toISOString());
      return true;
    } catch (e) {
      console.error("❌ Failed to sync rubrics:", e);
      return false;
    }
  },
  
  fetchCustomRubrics: async () => {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getCustomRubrics`);
      const data = await response.json();
      
      if (data.success && data.customRubrics) {
        set({ customRubrics: data.customRubrics });
        localStorage.setItem("customRubrics", JSON.stringify(data.customRubrics));
        localStorage.setItem("customRubricsLastSync", new Date().toISOString());
        console.log("✅ Custom rubrics fetched from server");
      }
    } catch (e) {
      console.error("❌ Failed to fetch custom rubrics:", e);
      const saved = localStorage.getItem("customRubrics");
      if (saved) {
        try {
          set({ customRubrics: JSON.parse(saved) });
        } catch (parseError) {
          console.error("Failed to parse saved rubrics:", parseError);
        }
      }
    }
  },
  
  updateRubricToServer: async (essayId, rubric, keywords) => {
    const updateData = {
      action: "updateRubric",
      essayId: essayId,
      rubric: rubric,
      keywords: keywords
    };
    
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      console.log(`✅ Rubric for essay ${essayId} updated on server`);
      return true;
    } catch (e) {
      console.error(`❌ Failed to update rubric for essay ${essayId}:`, e);
      return false;
    }
  },
  
  syncToServer: async () => {
    const pendingSync = JSON.parse(localStorage.getItem("pendingSync") || "[]");
    const allResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    
    if (pendingSync.length === 0) {
      alert("Tidak ada data yang perlu disinkronkan");
      return;
    }
    
    let successCount = 0;
    
    for (const id of pendingSync) {
      const result = allResults.find((r: TestResult) => r.id === id);
      if (result) {
        try {
          const formattedAnswers = [
            ...result.pgAnswers.map((answer, idx) => ({
              no_soal: idx + 1,
              jawaban: answer !== -1 ? pgQuestions[idx].options[answer] : "Tidak dijawab",
              skor_auto: answer === pgQuestions[idx].answer ? 1 : 0,
              skor_final: answer === pgQuestions[idx].answer ? 1 : 0,
              aspek: pgQuestions[idx].category,
              tipe: "pg"
            })),
            ...result.essayAnswers.map((answer, idx) => ({
              no_soal: idx + 1,
              jawaban: answer || "Tidak dijawab",
              skor_auto: result.essayAutoScores[idx],
              skor_final: result.essayScores[idx] || result.essayAutoScores[idx],
              aspek: essayQuestions[idx].category,
              tipe: "essay"
            }))
          ];
          
          const submitData = {
            action: "submitTest",
            id: result.id,
            nama: result.nama,
            email: result.email || "",
            hp: result.hp || "",
            instansi: result.instansi || "",
            kota: result.kota || "",
            posisi: result.posisi || "",
            timestamp: result.timestamp,
            skor_pg: result.skorPG,
            skor_essay: result.skorEssay,
            nilai_akhir: result.nilaiAkhir,
            predikat: result.predikat,
            pg_benar: result.pgScore,
            bobot_essay: 70,
            bobot_pg: 30,
            answers: formattedAnswers
          };
          
          await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submitData),
          });
          
          successCount++;
        } catch (e) {
          console.log("Sync failed for", id, e);
        }
      }
    }
    
    localStorage.setItem("pendingSync", "[]");
    alert(`✅ Sinkronisasi selesai! ${successCount} data berhasil dikirim.`);
    await get().fetchResults();
  },
  
  exportToCSV: () => {
    const results = get().results;
    if (results.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }
    
    const headers = ["No", "Nama", "Timestamp", "Skor PG (30%)", "Skor Essay (70%)", "Nilai Akhir", "Predikat"];
    const rows = results.map((r, i) => [
      i + 1,
      r.nama,
      new Date(r.timestamp).toLocaleString("id-ID"),
      r.skorPG,
      r.skorEssay.toFixed(1),
      r.nilaiAkhir,
      r.predikat
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `hasil-tes-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
}));
