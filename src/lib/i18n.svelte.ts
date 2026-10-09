// Çok dil (TR · EN · AR · FA) — seçim localStorage'da saklanır, AR/FA'da <html dir="rtl">
import type { Dil } from "./types";
import { sozlukler, type Anahtar } from "./ceviriler";

export const diller: Dil[] = ["tr", "en", "ar", "fa"];

export const dilAdlari: Record<Dil, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  fa: "فارسی",
};

const RTL_DILLER: Dil[] = ["ar", "fa"];
const ANAHTAR = "dil";

export const yonu = (d: Dil) => (RTL_DILLER.includes(d) ? "rtl" : "ltr");

// Bilgi sayfaları her dilde ayrı rotadır: /hakkinda (TR), /en/hakkinda, /ar/hakkinda, /fa/hakkinda
export const bilgiSayfalari = ["hakkinda", "iletisim", "kosullar", "gizlilik"] as const;
export type BilgiSayfasi = (typeof bilgiSayfalari)[number];

export const sayfaYolu = (d: Dil, sayfa: BilgiSayfasi) => (d === "tr" ? `/${sayfa}` : `/${d}/${sayfa}`);

// "/ar/gizlilik" → "gizlilik"; bilgi sayfası değilse undefined
export function bilgiSayfasiBul(yol: string): BilgiSayfasi | undefined {
  const son = yol.replace(/\/+$/, "").split("/").pop();
  return bilgiSayfalari.find((s) => s === son);
}

function gecerli(d: string | null | undefined): d is Dil {
  return !!d && (diller as string[]).includes(d);
}

// Layout'taki inline script dili <html lang> üzerine yazar; store oradan okur
function sayfaDili(): Dil {
  if (typeof document === "undefined") return "tr";
  const d = document.documentElement.lang;
  return gecerli(d) ? d : "tr";
}

class DilYonetici {
  kod = $state<Dil>(sayfaDili());

  yon = $derived(yonu(this.kod));

  constructor() {
    // ClientRouter sayfa değiştirince <html> öznitelikleri yenilenir; store'u eşitle
    if (typeof document !== "undefined") {
      document.addEventListener("astro:after-swap", () => {
        this.kod = sayfaDili();
      });
    }
  }

  // t("kart.yorum", { n: 12 }) → "12 yorum"
  t(anahtar: Anahtar, degerler: Record<string, string | number> = {}): string {
    let metin = sozlukler[this.kod][anahtar] ?? sozlukler.tr[anahtar] ?? anahtar;
    for (const [k, v] of Object.entries(degerler)) metin = metin.replaceAll(`{${k}}`, String(v));
    return metin;
  }

  // Ustaya giden metin her zaman Türkçe
  tr(anahtar: Anahtar): string {
    return sozlukler.tr[anahtar];
  }

  degistir(d: Dil) {
    this.kod = d;
    if (typeof document !== "undefined") {
      document.documentElement.lang = d;
      document.documentElement.dir = yonu(d);
    }
    try {
      localStorage.setItem(ANAHTAR, d);
    } catch {
      // gizli sekme vb. — tercih yalnızca bu oturumda geçerli olur
    }
  }
}

export const dil = new DilYonetici();
