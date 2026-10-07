// Ustam iş kuralları — src-tauri/src/lib.rs'teki Rust kurallarının birebir TypeScript karşılığı.
// Tauri içinde Rust kullanılır; tarayıcıda (bun run dev) bu dosya devreye girer.
// İki uygulama da src-tauri/test-vektorleri.json'daki ortak örneklerle test edilir.
import type { Aciliyet, Kategori } from "../types/ustam";

export const ALFABE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ACIL_UCRET = 150;
export const GECE_ORANI = 0.25; // 22:00–07:59
export const PAZAR_ORANI = 0.15;

export const KATEGORI_KODU: Record<Kategori, string> = {
  tesisat: "TES",
  elektrik: "ELK",
  cilingir: "CLN",
  kombi: "KMB",
  "beyaz-esya": "BYZ",
};

export type KodDurumu = "gecerli" | "bicim-hatali" | "kontrol-hatali";

export interface FiyatGirdisi {
  cikisUcreti: number;
  aciliyet: Aciliyet;
  zaman: string;
  iscilikMin: number;
  iscilikMax: number;
}

export interface FiyatDokumu {
  cikis: number;
  acil: number;
  gece: number;
  pazar: number;
  iscilikMin: number;
  iscilikMax: number;
  toplamMin: number;
  toplamMax: number;
}

const BICIM = /^UST-(TES|ELK|CLN|KMB|BYZ)-(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])-[A-HJ-NP-Z2-9]{4}$/;

// Rust'taki f64::round (sıfırdan uzağa yuvarlama) ile aynı sonucu verir
const yuvarla = (n: number) => Math.sign(n) * Math.round(Math.abs(n));

export function zamanCoz(zaman: string) {
  const yil = Number(zaman.slice(0, 4));
  const ay = Number(zaman.slice(5, 7));
  const gun = Number(zaman.slice(8, 10));
  const saat = zaman.length >= 13 ? Number(zaman.slice(11, 13)) : 12;
  const dakika = zaman.length >= 16 ? Number(zaman.slice(14, 16)) : 0;
  const gecerli =
    [yil, ay, gun, saat, dakika].every(Number.isInteger) && ay >= 1 && ay <= 12 && gun >= 1 && gun <= 31 && saat < 24 && dakika < 60;
  return gecerli ? { yil, ay, gun, saat, dakika } : null;
}

// Sakamoto algoritması — 0 = Pazar
export function haftaninGunu(yil: number, ay: number, gun: number): number {
  const T = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = ay < 3 ? yil - 1 : yil;
  const sonuc = y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + T[ay - 1] + gun;
  return ((sonuc % 7) + 7) % 7;
}

export function kontrolKarakteri(govde: string): string {
  let toplam = 0;
  [...govde].forEach((c, i) => {
    const deger = parseInt(c, 36);
    toplam += (i + 1) * (Number.isNaN(deger) ? 0 : deger);
  });
  return ALFABE[toplam % ALFABE.length];
}

export function kodUret(kategori: Kategori, zaman: string, rastgele = rastgeleEk(3)): string {
  const z = zamanCoz(zaman);
  if (!z) throw new Error(`geçersiz tarih: ${zaman}`);
  const kat = KATEGORI_KODU[kategori];
  const tarih = String(z.gun).padStart(2, "0") + String(z.ay).padStart(2, "0");
  return `UST-${kat}-${tarih}-${rastgele}${kontrolKarakteri(kat + tarih + rastgele)}`;
}

export function kodDurumu(ham: string): KodDurumu {
  const kod = ham.trim().toUpperCase();
  if (!BICIM.test(kod)) return "bicim-hatali";
  const [, kat, tarih, ek] = kod.split("-");
  return ek.endsWith(kontrolKarakteri(kat + tarih + ek.slice(0, 3))) ? "gecerli" : "kontrol-hatali";
}

export function fiyatHesapla(g: FiyatGirdisi): FiyatDokumu {
  const z = zamanCoz(g.zaman);
  if (!z) throw new Error(`geçersiz tarih: ${g.zaman}`);
  const oran = (o: number) => yuvarla(g.cikisUcreti * o);
  const acil = g.aciliyet === "hemen" ? ACIL_UCRET : 0;
  const gece = z.saat >= 22 || z.saat < 8 ? oran(GECE_ORANI) : 0;
  const pazar = haftaninGunu(z.yil, z.ay, z.gun) === 0 ? oran(PAZAR_ORANI) : 0;
  const sabit = g.cikisUcreti + acil + gece + pazar;
  return {
    cikis: g.cikisUcreti,
    acil,
    gece,
    pazar,
    iscilikMin: g.iscilikMin,
    iscilikMax: g.iscilikMax,
    toplamMin: sabit + g.iscilikMin,
    toplamMax: sabit + g.iscilikMax,
  };
}

function rastgeleEk(uzunluk: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(uzunluk)), (b) => ALFABE[b % ALFABE.length]).join("");
}
