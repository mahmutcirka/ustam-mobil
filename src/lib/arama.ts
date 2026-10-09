// Akıllı arama — usta adı, semt, kategori ve sorun adlarında (4 dilin hepsinde) arar.
// "musluk" → Tesisat / Musluk arızası, "sicak su" → Kombi / Sıcak su yok, "Kadikoy" → Kadıköy'deki ustalar.
import type { Kategori, SorunOnerisi, Usta } from "./types";
import { kategoriSorunlari } from "./data";
import { sozlukler } from "./ceviriler";

// Büyük/küçük harf, Türkçe karakter ve Arapça/Farsça hareke farklarını yok sayar
export function normalle(metin: string): string {
  return metin
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // birleşik işaretler: Latin aksanları ve Arapça harekeler
    .replace(/ı/g, "i")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

const sozluk = (anahtar: string) =>
  Object.values(sozlukler)
    .map((s) => (s as Record<string, string>)[anahtar] ?? "")
    .join(" ");

// Her sorun için 4 dildeki adı ve kategorisi — aranabilir tek metin
const sorunDizini = Object.entries(kategoriSorunlari).flatMap(([kategori, sorunlar]) =>
  sorunlar.map((sorun) => ({
    sorun,
    kategori: kategori as Kategori,
    metin: normalle(`${sozluk(`sorun.${sorun}`)} ${sozluk(`kategori.${kategori}`)}`),
  })),
);

export function sorunAra(sorgu: string, sinir = 4): SorunOnerisi[] {
  const q = normalle(sorgu);
  if (q.length < 2) return [];
  return sorunDizini.filter((s) => s.metin.includes(q)).slice(0, sinir).map(({ sorun, kategori }) => ({ sorun, kategori }));
}

// Usta; adı, semti, kategorisi ya da çözdüğü sorunlardan biri sorguyla eşleşirse bulunur
export function ustaEslesir(u: Usta, sorgu: string): boolean {
  const q = normalle(sorgu);
  if (!q) return true;
  const metin = normalle(`${u.ad} ${u.semt} ${sozluk(`kategori.${u.kategori}`)} ${u.sorunlar.map((s) => sozluk(`sorun.${s}`)).join(" ")}`);
  return q.split(" ").every((parca) => metin.includes(parca));
}
