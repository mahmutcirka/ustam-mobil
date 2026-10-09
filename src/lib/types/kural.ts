// İş kuralı tipleri — src-tauri/src/lib.rs içindeki Rust yapılarıyla aynı alanlar (serde camelCase)
import type { Aciliyet } from "./isEmri";

/** İş emri kodu doğrulama sonucu (Rust: KodDurumu) */
export const KOD_DURUMLARI = ["gecerli", "bicim-hatali", "kontrol-hatali"] as const;
export type KodDurumu = (typeof KOD_DURUMLARI)[number];

/** Fiyat hesaplama girdisi (Rust: FiyatGirdisi) */
export interface FiyatGirdisi {
  /** Ustanın çıkış ücreti, TL (≥ 0) */
  cikisUcreti: number;
  /** Aciliyet; "hemen" sabit acil ücreti ekler */
  aciliyet: Aciliyet;
  /** Ziyaret zamanı, yerel ISO "YYYY-MM-DDTHH:mm" */
  zaman: string;
  /** Tahmini işçiliğin alt sınırı, TL (≥ 0) */
  iscilikMin: number;
  /** Tahmini işçiliğin üst sınırı, TL (≥ iscilikMin) */
  iscilikMax: number;
}

/** Fiyat dökümü (Rust: FiyatDokumu) — bütün tutarlar TL, tam sayı */
export interface FiyatDokumu {
  /** Çıkış ücreti */
  cikis: number;
  /** Acil çağrı ücreti ("hemen" ise 150, değilse 0) */
  acil: number;
  /** Gece ek ücreti (22:00–07:59, çıkışın %25'i) */
  gece: number;
  /** Pazar ek ücreti (çıkışın %15'i) */
  pazar: number;
  /** İşçilik alt sınırı */
  iscilikMin: number;
  /** İşçilik üst sınırı */
  iscilikMax: number;
  /** Toplam alt sınır */
  toplamMin: number;
  /** Toplam üst sınır */
  toplamMax: number;
}
