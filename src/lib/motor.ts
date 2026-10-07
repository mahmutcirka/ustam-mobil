// Kural motoru köprüsü — Tauri içinde Rust komutlarını, tarayıcıda (bun run dev) aynı kuralların
// TypeScript karşılığını (kurallar.ts) çağırır. Bileşenler Rust'a doğrudan değil, buraya bağlanır.
import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Kategori } from "../types/ustam";
import * as kurallar from "./kurallar";
import type { FiyatDokumu, FiyatGirdisi, KodDurumu } from "./kurallar";

export const rustIcinde = () => typeof window !== "undefined" && isTauri();

export async function isEmriKoduUret(kategori: Kategori, zaman: string): Promise<string> {
  return rustIcinde() ? invoke<string>("is_emri_uret", { kategori, zaman }) : kurallar.kodUret(kategori, zaman);
}

export async function isEmriKoduDogrula(kod: string): Promise<KodDurumu> {
  return rustIcinde() ? invoke<KodDurumu>("is_emri_dogrula", { kod }) : kurallar.kodDurumu(kod);
}

export async function fiyatHesapla(girdi: FiyatGirdisi): Promise<FiyatDokumu> {
  return rustIcinde() ? invoke<FiyatDokumu>("fiyat_hesapla", { girdi }) : kurallar.fiyatHesapla(girdi);
}
