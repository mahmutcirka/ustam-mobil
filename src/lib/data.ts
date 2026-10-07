// Mock veri ve yardımcılar — ustalar, semtler, sorun şablonları (ileride bir API'den gelebilir)
import type { Aciliyet, Dil, Kategori, Konum, Semt, Usta, UstaDurumu, Yorum } from "../types/ustam";
import type { IkonAdi } from "./ikonlar";
import { fiyatHesapla, type FiyatDokumu } from "./kurallar";

export const kategoriler: Kategori[] = ["tesisat", "elektrik", "cilingir", "kombi", "beyaz-esya"];

export const kategoriIkon: Record<Kategori, IkonAdi> = {
  tesisat: "damla",
  elektrik: "simsek",
  cilingir: "anahtar",
  kombi: "alev",
  "beyaz-esya": "camasir",
};

export const kategoriSorunlari: Record<Kategori, string[]> = {
  tesisat: ["su-sizintisi", "tikali-gider", "musluk-ariza"],
  elektrik: ["sigorta-atiyor", "priz-yanik", "elektrik-yok"],
  cilingir: ["kapida-kaldim", "kilit-degisimi", "anahtar-kirildi"],
  kombi: ["sicak-su-yok", "basinc-dusuk", "petek-isinmiyor"],
  "beyaz-esya": ["camasir-makinesi", "buzdolabi", "bulasik-makinesi"],
};

export const aciliyetler: Aciliyet[] = ["hemen", "bugun", "randevu"];

// Her sorun için tahmini işçilik aralığı (TL) ve süresi (dk); "tehlikeli" sorunlarda uyarı vurgulanır
export const sorunBilgisi: Record<string, { iscilik: [number, number]; sureDk: number; tehlikeli?: boolean }> = {
  "su-sizintisi": { iscilik: [250, 600], sureDk: 60, tehlikeli: true },
  "tikali-gider": { iscilik: [200, 450], sureDk: 45 },
  "musluk-ariza": { iscilik: [150, 350], sureDk: 30 },
  "sigorta-atiyor": { iscilik: [200, 500], sureDk: 45 },
  "priz-yanik": { iscilik: [150, 400], sureDk: 40, tehlikeli: true },
  "elektrik-yok": { iscilik: [250, 700], sureDk: 60 },
  "kapida-kaldim": { iscilik: [300, 600], sureDk: 20 },
  "kilit-degisimi": { iscilik: [400, 900], sureDk: 40 },
  "anahtar-kirildi": { iscilik: [250, 500], sureDk: 30 },
  "sicak-su-yok": { iscilik: [300, 800], sureDk: 60 },
  "basinc-dusuk": { iscilik: [150, 350], sureDk: 30 },
  "petek-isinmiyor": { iscilik: [250, 600], sureDk: 60 },
  "camasir-makinesi": { iscilik: [300, 700], sureDk: 60 },
  buzdolabi: { iscilik: [400, 1200], sureDk: 75 },
  "bulasik-makinesi": { iscilik: [300, 800], sureDk: 60 },
};

// Ana sayfadaki "Acil mi?" kısayolları — en sık acil çağrı nedenleri
export const acilKisayollar: { sorun: string; kategori: Kategori }[] = [
  { sorun: "su-sizintisi", kategori: "tesisat" },
  { sorun: "elektrik-yok", kategori: "elektrik" },
  { sorun: "kapida-kaldim", kategori: "cilingir" },
  { sorun: "sicak-su-yok", kategori: "kombi" },
];

// Bugün / randevu için seçilebilen ziyaret saatleri
export const saatDilimleri = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

// Stilize harita üzerindeki semt merkezleri (UstaHaritasi.svelte ile aynı koordinat sistemi)
export const semtler: Record<Semt, Konum & { yaka: "avrupa" | "asya" }> = {
  Sarıyer: { x: 57, y: 14, yaka: "avrupa" },
  Beşiktaş: { x: 51, y: 50, yaka: "avrupa" },
  Şişli: { x: 42, y: 46, yaka: "avrupa" },
  Beyoğlu: { x: 44, y: 60, yaka: "avrupa" },
  Fatih: { x: 33, y: 70, yaka: "avrupa" },
  Bakırköy: { x: 14, y: 80, yaka: "avrupa" },
  Beykoz: { x: 78, y: 26, yaka: "asya" },
  Üsküdar: { x: 63, y: 60, yaka: "asya" },
  Kadıköy: { x: 60, y: 79, yaka: "asya" },
  Ataşehir: { x: 76, y: 70, yaka: "asya" },
  Maltepe: { x: 80, y: 88, yaka: "asya" },
  Kartal: { x: 92, y: 95, yaka: "asya" },
};

export const semtListesi = Object.keys(semtler) as Semt[];

const KM_BIRIM = 0.3; // harita biriminin yaklaşık kilometre karşılığı

const y = (ad: string, puan: number, dil: Dil, tarih: string, metin: string): Yorum => ({ ad, puan, dil, tarih, metin });

type UstaGirdisi = Omit<Usta, "sorunlar">;
const usta = (u: UstaGirdisi): Usta => ({ ...u, sorunlar: kategoriSorunlari[u.kategori] });

export const ustalar: Usta[] = [
  usta({
    id: 1, ad: "Hasan Yıldız", kategori: "tesisat", puan: 4.8, yorumSayisi: 212, musait: true, cikisUcreti: 350,
    deneyimYil: 15, tamamlananIs: 1240, semt: "Kadıköy", konum: { x: 61, y: 77 }, diller: ["tr"],
    rozetler: ["dogrulanmis", "sigortali"], yanitDk: 9, calisma: ["08:00", "22:00"],
    yorumlar: [
      y("Zeynep K.", 5, "tr", "2026-09-28", "Gece 11'de mutfakta boru patladı, 25 dakikada geldi. Çok temiz çalıştı."),
      y("Murat A.", 5, "tr", "2026-09-14", "Fiyatı baştan söyledi, sürpriz yok. Teşekkürler Hasan usta."),
      y("Daniel R.", 4, "en", "2026-08-30", "Fixed the leak quickly. We used gestures a bit, but the app's Turkish summary helped."),
    ],
  }),
  usta({
    id: 2, ad: "Mehmet Kaya", kategori: "elektrik", puan: 4.9, yorumSayisi: 318, musait: true, cikisUcreti: 300,
    deneyimYil: 12, tamamlananIs: 1580, semt: "Üsküdar", konum: { x: 64, y: 58 }, diller: ["tr", "en"],
    rozetler: ["dogrulanmis", "7-24", "hizli-yanit"], yanitDk: 6, calisma: "7-24",
    yorumlar: [
      y("Ayşe T.", 5, "tr", "2026-10-02", "Sigorta sürekli atıyordu, kaçak akımı buldu. Çok bilgili."),
      y("Sarah M.", 5, "en", "2026-09-21", "Speaks good English and explained everything. Highly recommended."),
      y("Kerem D.", 4, "tr", "2026-09-03", "İşini iyi yaptı, sadece 10 dk geç geldi."),
    ],
  }),
  usta({
    id: 3, ad: "Ali Demir", kategori: "cilingir", puan: 4.7, yorumSayisi: 156, musait: true, cikisUcreti: 400,
    deneyimYil: 9, tamamlananIs: 870, semt: "Beşiktaş", konum: { x: 50, y: 52 }, diller: ["tr"],
    rozetler: ["dogrulanmis", "7-24"], yanitDk: 11, calisma: "7-24",
    yorumlar: [
      y("Burcu S.", 5, "tr", "2026-09-30", "Gece 2'de kapıda kaldım, kilide zarar vermeden açtı."),
      y("Omar F.", 4, "ar", "2026-09-11", "جاء بسرعة وفتح الباب دون كسر القفل. شكرًا."),
    ],
  }),
  usta({
    id: 4, ad: "Emre Aksoy", kategori: "kombi", puan: 4.6, yorumSayisi: 98, musait: false, cikisUcreti: 450,
    deneyimYil: 8, tamamlananIs: 540, semt: "Ataşehir", konum: { x: 75, y: 72 }, diller: ["tr"],
    rozetler: ["sigortali"], yanitDk: 18, calisma: ["09:00", "19:00"],
    yorumlar: [
      y("Selin Ö.", 5, "tr", "2026-09-25", "Kombinin bakımını yaptı, petekler artık tıkır tıkır ısınıyor."),
      y("Hakan B.", 4, "tr", "2026-08-19", "İyi iş çıkardı ama randevu bulmak biraz zor."),
    ],
  }),
  usta({
    id: 5, ad: "Yusuf Şahin", kategori: "beyaz-esya", puan: 4.5, yorumSayisi: 74, musait: true, cikisUcreti: 380,
    deneyimYil: 10, tamamlananIs: 610, semt: "Maltepe", konum: { x: 81, y: 87 }, diller: ["tr", "ar"],
    rozetler: ["dogrulanmis"], yanitDk: 14, calisma: ["09:00", "20:00"],
    yorumlar: [
      y("Layla H.", 5, "ar", "2026-10-01", "يتحدث العربية بطلاقة، أصلح الغسالة في نصف ساعة."),
      y("Cemile Y.", 4, "tr", "2026-09-12", "Bulaşık makinesinin pompasını değiştirdi, temiz iş."),
    ],
  }),
  usta({
    id: 6, ad: "Murat Öztürk", kategori: "tesisat", puan: 4.4, yorumSayisi: 61, musait: false, cikisUcreti: 300,
    deneyimYil: 6, tamamlananIs: 320, semt: "Şişli", konum: { x: 41, y: 47 }, diller: ["tr"],
    rozetler: [], yanitDk: 22, calisma: ["08:00", "18:00"],
    yorumlar: [y("Gökhan E.", 4, "tr", "2026-09-08", "Tıkalı gideri açtı, uygun fiyatlı.")],
  }),
  usta({
    id: 7, ad: "Kemal Arslan", kategori: "elektrik", puan: 4.7, yorumSayisi: 140, musait: true, cikisUcreti: 320,
    deneyimYil: 20, tamamlananIs: 2100, semt: "Sarıyer", konum: { x: 56, y: 16 }, diller: ["tr"],
    rozetler: ["dogrulanmis", "sigortali"], yanitDk: 12, calisma: ["08:00", "21:00"],
    yorumlar: [
      y("Nur İ.", 5, "tr", "2026-09-27", "20 yıllık tecrübe kendini belli ediyor. Panoyu baştan düzenledi."),
      y("Tolga Ç.", 4, "tr", "2026-09-02", "Titiz ve dürüst bir usta."),
    ],
  }),
  usta({
    id: 8, ad: "Burak Çelik", kategori: "kombi", puan: 4.9, yorumSayisi: 233, musait: true, cikisUcreti: 500,
    deneyimYil: 14, tamamlananIs: 1320, semt: "Kadıköy", konum: { x: 58, y: 80 }, diller: ["tr", "en"],
    rozetler: ["dogrulanmis", "sigortali", "hizli-yanit"], yanitDk: 7, calisma: ["07:00", "23:00"],
    yorumlar: [
      y("Ece N.", 5, "tr", "2026-10-03", "Kış gelmeden kombiyi hallettik, basınç sorunu çözüldü."),
      y("Tom W.", 5, "en", "2026-09-18", "Explained the pressure issue clearly in English. Fair price."),
      y("Derya A.", 5, "tr", "2026-09-01", "Her yıl bakımı ona yaptırıyorum."),
    ],
  }),
  usta({
    id: 9, ad: "Ahmet Halil", kategori: "tesisat", puan: 4.8, yorumSayisi: 129, musait: true, cikisUcreti: 320,
    deneyimYil: 11, tamamlananIs: 760, semt: "Fatih", konum: { x: 34, y: 70 }, diller: ["tr", "ar"],
    rozetler: ["dogrulanmis", "7-24"], yanitDk: 10, calisma: "7-24",
    yorumlar: [
      y("Khaled S.", 5, "ar", "2026-10-04", "سبّاك ممتاز ويتكلم العربية. شرح لي المشكلة بوضوح."),
      y("Fadime K.", 5, "tr", "2026-09-22", "Gece yarısı geldi, su sızıntısını hemen durdurdu."),
      y("Mariam A.", 4, "ar", "2026-09-05", "عمل نظيف وسعر مناسب."),
    ],
  }),
  usta({
    id: 10, ad: "Reza Karimi", kategori: "elektrik", puan: 4.8, yorumSayisi: 88, musait: true, cikisUcreti: 340,
    deneyimYil: 9, tamamlananIs: 430, semt: "Beyoğlu", konum: { x: 45, y: 61 }, diller: ["fa", "tr", "en"],
    rozetler: ["dogrulanmis"], yanitDk: 13, calisma: ["09:00", "22:00"],
    yorumlar: [
      y("Neda R.", 5, "fa", "2026-09-29", "خیلی دقیق و مؤدب بود و فارسی صحبت می‌کرد. کار را سریع تمام کرد."),
      y("Can Y.", 5, "tr", "2026-09-16", "Priz yanık kokuyordu, kabloyu değiştirdi. Çok güvenilir."),
    ],
  }),
  usta({
    id: 11, ad: "Serkan Polat", kategori: "cilingir", puan: 4.6, yorumSayisi: 201, musait: true, cikisUcreti: 380,
    deneyimYil: 13, tamamlananIs: 1450, semt: "Kadıköy", konum: { x: 62, y: 81 }, diller: ["tr"],
    rozetler: ["7-24", "hizli-yanit"], yanitDk: 8, calisma: "7-24",
    yorumlar: [
      y("İrem G.", 5, "tr", "2026-10-05", "15 dakikada geldi, anahtarı kilitten çıkardı."),
      y("Lucas P.", 4, "en", "2026-09-09", "Quick and professional. The door code check felt very safe."),
    ],
  }),
  usta({
    id: 12, ad: "Elif Aydın", kategori: "beyaz-esya", puan: 4.9, yorumSayisi: 167, musait: true, cikisUcreti: 360,
    deneyimYil: 8, tamamlananIs: 690, semt: "Üsküdar", konum: { x: 61, y: 62 }, diller: ["tr", "en"],
    rozetler: ["dogrulanmis", "sigortali"], yanitDk: 15, calisma: ["09:00", "19:00"],
    yorumlar: [
      y("Hülya M.", 5, "tr", "2026-09-26", "Buzdolabının gazını doldurdu, her şeyi tek tek anlattı."),
      y("Anna K.", 5, "en", "2026-09-13", "Very knowledgeable and friendly. Fixed our dishwasher."),
    ],
  }),
  usta({
    id: 13, ad: "Okan Yılmaz", kategori: "kombi", puan: 4.5, yorumSayisi: 112, musait: true, cikisUcreti: 420,
    deneyimYil: 7, tamamlananIs: 480, semt: "Beşiktaş", konum: { x: 49, y: 48 }, diller: ["tr"],
    rozetler: ["sigortali"], yanitDk: 16, calisma: ["08:00", "20:00"],
    yorumlar: [y("Serap D.", 4, "tr", "2026-09-19", "Sıcak su sorununu çözdü, yedek parçayı yanında getirmişti.")],
  }),
  usta({
    id: 14, ad: "Cem Koç", kategori: "tesisat", puan: 4.6, yorumSayisi: 143, musait: true, cikisUcreti: 330,
    deneyimYil: 12, tamamlananIs: 980, semt: "Bakırköy", konum: { x: 15, y: 79 }, diller: ["tr", "en"],
    rozetler: ["dogrulanmis"], yanitDk: 12, calisma: ["08:00", "22:00"],
    yorumlar: [
      y("Pınar U.", 5, "tr", "2026-09-24", "Musluğu değiştirdi, eski parçaları da götürdü."),
      y("James O.", 4, "en", "2026-08-28", "Good work, arrived on time for the appointment."),
    ],
  }),
  usta({
    id: 15, ad: "Hüseyin Doğan", kategori: "elektrik", puan: 4.3, yorumSayisi: 52, musait: false, cikisUcreti: 280,
    deneyimYil: 5, tamamlananIs: 210, semt: "Kartal", konum: { x: 91, y: 94 }, diller: ["tr"],
    rozetler: [], yanitDk: 25, calisma: ["09:00", "18:00"],
    yorumlar: [y("Emine S.", 4, "tr", "2026-09-06", "Uygun fiyatlı, işini yaptı.")],
  }),
  usta({
    id: 16, ad: "Mustafa Rahimi", kategori: "cilingir", puan: 4.7, yorumSayisi: 64, musait: true, cikisUcreti: 360,
    deneyimYil: 10, tamamlananIs: 390, semt: "Beykoz", konum: { x: 77, y: 27 }, diller: ["fa", "tr"],
    rozetler: ["dogrulanmis", "7-24"], yanitDk: 14, calisma: "7-24",
    yorumlar: [
      y("Ali Reza M.", 5, "fa", "2026-10-02", "نیمه‌شب پشت در مانده بودم، خیلی زود آمد و قفل را باز کرد."),
      y("Oya B.", 4, "tr", "2026-09-15", "Kilit değişimini hızlıca yaptı."),
    ],
  }),
  usta({
    id: 17, ad: "Samir Haddad", kategori: "beyaz-esya", puan: 4.6, yorumSayisi: 59, musait: true, cikisUcreti: 350,
    deneyimYil: 9, tamamlananIs: 340, semt: "Ataşehir", konum: { x: 77, y: 68 }, diller: ["ar", "tr", "en"],
    rozetler: ["dogrulanmis"], yanitDk: 17, calisma: ["10:00", "20:00"],
    yorumlar: [
      y("Huda N.", 5, "ar", "2026-09-23", "فنّي محترم، أصلح الثلاجة وشرح لي بالعربية."),
      y("Ahmet T.", 4, "tr", "2026-09-04", "Çamaşır makinesinin pompası değişti, sorun kalmadı."),
    ],
  }),
];

export function ustaBul(id: number): Usta | undefined {
  return ustalar.find((u) => u.id === id);
}

// Kullanıcının semtinden ustaya kuş uçuşu mesafe (km, 0,1 hassasiyetle)
export function mesafeKm(u: Usta, semt: Semt): number {
  const s = semtler[semt];
  const km = Math.hypot(u.konum.x - s.x, u.konum.y - s.y) * KM_BIRIM;
  return Math.max(0.3, Math.round(km * 10) / 10);
}

// İstanbul trafiğinde tahmini varış süresi (dk): hazırlık + km başına ~2,2 dk
export function varisDk(km: number): number {
  return Math.round(8 + km * 2.2);
}

const dakika = (saat: string) => Number(saat.slice(0, 2)) * 60 + Number(saat.slice(3, 5));

// Çalışma saatleri (gece yarısını aşmayan aralıklar) ve meşguliyete göre anlık durum
export function ustaDurumu(u: Usta, simdi = new Date()): UstaDurumu {
  if (!u.musait) return { tur: "mesgul" };
  if (u.calisma === "7-24") return { tur: "musait" };
  const [ac, kapa] = u.calisma;
  const su = simdi.getHours() * 60 + simdi.getMinutes();
  return su >= dakika(ac) && su < dakika(kapa) ? { tur: "musait" } : { tur: "kapali", acilis: ac };
}

// Ortalama puandan 5→1 yıldız dağılımı (örnek veri için deterministik yaklaşım)
export function puanDagilimi(ortalama: number, sayi: number): number[] {
  const bes = Math.min(0.95, Math.max(0.05, (ortalama - 3.6) / 1.4));
  const dort = (1 - bes) * 0.65;
  const uc = (1 - bes - dort) * 0.6;
  const iki = (1 - bes - dort - uc) * 0.6;
  const oranlar = [bes, dort, uc, iki, 1 - bes - dort - uc - iki];
  const adetler = oranlar.map((o) => Math.round(o * sayi));
  adetler[0] += sayi - adetler.reduce((a, b) => a + b, 0);
  return adetler;
}

export const basHarfler = (ad: string) =>
  ad
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");

// Ekranda anlık gösterilen tahmin (TS kuralları); onayda kesin döküm Rust'tan alınır (motor.ts)
export function tahminiFiyat(u: Usta, sorun: string, aciliyet: Aciliyet, zaman: string): FiyatDokumu {
  const [iscilikMin, iscilikMax] = sorunBilgisi[sorun]?.iscilik ?? [0, 0];
  return fiyatHesapla({ cikisUcreti: u.cikisUcreti, aciliyet, zaman, iscilikMin, iscilikMax });
}

// Biçimlendirme yardımcıları — seçili dile göre para, sayı ve tarih
const yerel: Record<Dil, string> = { tr: "tr-TR", en: "en-GB", ar: "ar", fa: "fa-IR" };

export const paraYaz = (tutar: number, dil: Dil) =>
  tutar.toLocaleString(yerel[dil], { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export const sayiYaz = (n: number, dil: Dil) => n.toLocaleString(yerel[dil]);

export const tarihYaz = (iso: string, dil: Dil) =>
  new Date(iso).toLocaleString(yerel[dil], {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export const saatYaz = (iso: string, dil: Dil) =>
  new Date(iso).toLocaleTimeString(yerel[dil], { hour: "2-digit", minute: "2-digit" });

export const gunYaz = (iso: string, dil: Dil) =>
  new Date(iso).toLocaleDateString(yerel[dil], { day: "numeric", month: "long", year: "numeric" });

// "₺450" ya da "₺450 – ₺850"
export const aralikYaz = (min: number, max: number, dil: Dil) =>
  min === max ? paraYaz(min, dil) : `${paraYaz(min, dil)} – ${paraYaz(max, dil)}`;

// Yerel saatle "YYYY-MM-DDTHH:mm" (toISOString UTC verdiği için elle kurulur)
export function yerelIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
