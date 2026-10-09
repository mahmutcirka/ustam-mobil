// Ustalar listesi: arama, süzgeç, sıralama ve "Önerilen" sıralamanın açıklaması
import type { Dil, Semt } from "./ortak";
import type { Kategori } from "./usta";

/** Liste sıralama seçenekleri */
export const SIRALAMALAR = ["onerilen", "yakin", "puan", "fiyat"] as const;
export type Siralama = (typeof SIRALAMALAR)[number];

/** Liste ya da harita görünümü */
export const GORUNUMLER = ["liste", "harita"] as const;
export type Gorunum = (typeof GORUNUMLER)[number];

/** Ustalar süzgeci — 0 ya da boş değer "hepsi" demektir */
export interface UstaFiltresi {
  /** Yalnız şu an müsait olanlar */
  musait: boolean;
  /** Yalnız favoriler */
  favori: boolean;
  /** En fazla mesafe, km (0 = hepsi) */
  mesafe: number;
  /** En az puan (0 = hepsi) */
  puan: number;
  /** En fazla çıkış ücreti, TL (0 = hepsi) */
  fiyat: number;
  /** Konuştuğu dil ("" = hepsi) */
  dil: Dil | "";
}

/** Arama kutusundaki sorun önerisi */
export interface SorunOnerisi {
  /** Hizmet.sorun anahtarı */
  sorun: string;
  /** Sorunun kategorisi */
  kategori: Kategori;
}

/** "Neden önerildi?" etkenleri */
export const NEDEN_TURLERI = ["musait", "yakin", "puan", "hizli", "dil", "fiyat"] as const;
export type NedenTuru = (typeof NEDEN_TURLERI)[number];

/** Bir ustanın öneri puanı ve kullanıcıya gösterilen nedenleri */
export interface Oneri {
  /** 0–100; yüksek olan önce */
  puan: number;
  /** Olumlu etkenler, en güçlüden zayıfa */
  nedenler: NedenTuru[];
}

/** Öneri puanının hesaplandığı bağlam */
export interface OneriBaglami {
  /** Kullanıcının semti */
  semt: Semt;
  /** Arayüz dili */
  dil: Dil;
  /** Hesaplama anı */
  simdi: Date;
  /** İsteğe bağlı: karşılaştırma için ortalama çıkış ücreti, TL */
  ortalamaUcret?: number;
}
