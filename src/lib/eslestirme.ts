// "Önerilen" sıralamanın açık ve tutarlı kuralı. Yapay zekâ değildir: sabit ağırlıklarla puanlanır
// ve kullanıcıya hangi etkenlerin ne kadar katkı verdiği gösterilir ("Neden öneriyoruz?").
import type { Dil, Semt, Usta } from "../types/ustam";
import { mesafeKm, ustaDurumu, ustalar } from "./data";

export type NedenTuru = "musait" | "yakin" | "puan" | "hizli" | "dil" | "fiyat";

export interface Oneri {
  puan: number; // yüksek olan önce
  nedenler: NedenTuru[]; // kullanıcıya gösterilecek olumlu etkenler, en güçlüden zayıfa
}

export interface OneriBaglami {
  semt: Semt;
  dil: Dil;
  simdi: Date;
  ortalamaUcret?: number;
}

// Ağırlıklar — toplam en fazla ~100 puan
const AGIRLIK = { musait: 40, yakinlik: 20, puan: 20, yanit: 10, dil: 6, fiyat: 4 };

export const ORTALAMA_CIKIS = Math.round(ustalar.reduce((t, u) => t + u.cikisUcreti, 0) / ustalar.length);

export function oneriPuani(u: Usta, b: OneriBaglami, puanOrtalamasi = u.puan): Oneri {
  const km = mesafeKm(u, b.semt);
  const ortalama = b.ortalamaUcret ?? ORTALAMA_CIKIS;
  const katkilar: [NedenTuru, number][] = [
    ["musait", ustaDurumu(u, b.simdi).tur === "musait" ? AGIRLIK.musait : 0],
    ["yakin", AGIRLIK.yakinlik * Math.max(0, 1 - km / 15)], // 0 km → 20, 15+ km → 0
    ["puan", AGIRLIK.puan * Math.max(0, (puanOrtalamasi - 4) / 1)], // 4,0 → 0, 5,0 → 20
    ["hizli", AGIRLIK.yanit * Math.max(0, 1 - u.yanitDk / 30)], // 0 dk → 10, 30+ dk → 0
    ["dil", b.dil !== "tr" && u.diller.includes(b.dil) ? AGIRLIK.dil : 0],
    ["fiyat", u.cikisUcreti < ortalama ? AGIRLIK.fiyat : 0],
  ];
  const puan = Math.round(katkilar.reduce((t, [, k]) => t + k, 0) * 10) / 10;
  // Yalnızca anlamlı katkılar "neden" olarak gösterilir
  const esik: Record<NedenTuru, number> = { musait: 1, yakin: 12, puan: 14, hizli: 5, dil: 1, fiyat: 1 };
  const nedenler = katkilar
    .filter(([tur, k]) => k >= esik[tur])
    .sort((a, b) => b[1] - a[1])
    .map(([tur]) => tur);
  return { puan, nedenler };
}
