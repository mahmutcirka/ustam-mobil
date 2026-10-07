// Mock veri — ustalar ve sorun şablonları (ileride bir API'den gelebilir)
import type { Aciliyet, Dil, Kategori, Usta } from "../types/ustam";
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

// Her sorun için tahmini işçilik aralığı (TL) ve süresi (dk); "tehlikeli" sorunlarda güvenlik uyarısı gösterilir
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

// Bugün / randevu için seçilebilen ziyaret saatleri
export const saatDilimleri = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

const usta = (u: Omit<Usta, "sorunlar">): Usta => ({ ...u, sorunlar: kategoriSorunlari[u.kategori] });

export const ustalar: Usta[] = [
  usta({ id: 1, ad: "Hasan Yıldız", kategori: "tesisat", puan: 4.8, yorumSayisi: 212, mesafeKm: 1.2, musait: true, cikisUcreti: 350, deneyimYil: 15, tamamlananIs: 1240, bolge: "Kadıköy" }),
  usta({ id: 2, ad: "Mehmet Kaya", kategori: "elektrik", puan: 4.9, yorumSayisi: 318, mesafeKm: 0.8, musait: true, cikisUcreti: 300, deneyimYil: 12, tamamlananIs: 1580, bolge: "Üsküdar" }),
  usta({ id: 3, ad: "Ali Demir", kategori: "cilingir", puan: 4.7, yorumSayisi: 156, mesafeKm: 2.5, musait: true, cikisUcreti: 400, deneyimYil: 9, tamamlananIs: 870, bolge: "Beşiktaş" }),
  usta({ id: 4, ad: "Emre Aksoy", kategori: "kombi", puan: 4.6, yorumSayisi: 98, mesafeKm: 3.1, musait: false, cikisUcreti: 450, deneyimYil: 8, tamamlananIs: 540, bolge: "Ataşehir" }),
  usta({ id: 5, ad: "Yusuf Şahin", kategori: "beyaz-esya", puan: 4.5, yorumSayisi: 74, mesafeKm: 4.0, musait: true, cikisUcreti: 380, deneyimYil: 10, tamamlananIs: 610, bolge: "Maltepe" }),
  usta({ id: 6, ad: "Murat Öztürk", kategori: "tesisat", puan: 4.4, yorumSayisi: 61, mesafeKm: 5.2, musait: false, cikisUcreti: 300, deneyimYil: 6, tamamlananIs: 320, bolge: "Şişli" }),
  usta({ id: 7, ad: "Kemal Arslan", kategori: "elektrik", puan: 4.7, yorumSayisi: 140, mesafeKm: 2.0, musait: true, cikisUcreti: 320, deneyimYil: 20, tamamlananIs: 2100, bolge: "Sarıyer" }),
  usta({ id: 8, ad: "Burak Çelik", kategori: "kombi", puan: 4.9, yorumSayisi: 233, mesafeKm: 1.7, musait: true, cikisUcreti: 500, deneyimYil: 14, tamamlananIs: 1320, bolge: "Kadıköy" }),
];

export function ustaBul(id: number): Usta | undefined {
  return ustalar.find((u) => u.id === id);
}

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

// Yerel saatle "YYYY-MM-DDTHH:mm" (toISOString UTC verdiği için elle kurulur)
export function yerelIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// "₺450" ya da "₺450 – ₺850"
export const aralikYaz = (min: number, max: number, dil: Dil) =>
  min === max ? paraYaz(min, dil) : `${paraYaz(min, dil)} – ${paraYaz(max, dil)}`;
