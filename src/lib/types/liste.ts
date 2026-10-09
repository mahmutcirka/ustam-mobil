// Ustalar listesi: arama, süzgeç, sıralama ve "Önerilen" sıralamanın açıklaması
import type { Dil, Semt } from "./ortak";
import type { Anahtar } from "../ceviriler";
import type { Kategori, UstaDurumu } from "./usta";

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

/** Usta kartının ekran tarafındaki bağlamı — Usta'yı genel kart girdisine çevirirken (src/lib/ustaKarti.ts) */
export interface UstaKartBaglami {
  /** Kullanıcının semtinden mesafe, km */
  km: number;
  /** Ustanın anlık durumu (ustaDurumu) */
  durum: UstaDurumu;
  /** Bu cihazdaki yorumlarla birlikte puan özeti */
  puan: { deger: number; sayi: number };
  /** Arayüz dili */
  dil: Dil;
  /** Çevirmen (dil.t) */
  t: (anahtar: Anahtar, degerler?: Record<string, string | number>) => string;
  /** Dilin kendi dilindeki adı ("Türkçe", "العربية" …) */
  dilAdi: (d: Dil) => string;
  /** İsteğe bağlı: aranan sorun — detayda önceden seçili gelir */
  sorun?: string;
}

/** Bir liste ekranının gösterebileceği dört hal (Görev 13) */
export const LISTE_DURUMLARI = ["yukleniyor", "hata", "bos", "dolu"] as const;
export type ListeDurumu = (typeof LISTE_DURUMLARI)[number];

/** Ustalar listesinde kullanıcının seçtikleri — adreste (?q=…) tutulur, detaydan dönüşte geri yüklenir (Görev 14) */
export interface ListeSecimi {
  /** Arama kutusundaki metin */
  arama: string;
  /** Seçili kategori çipi */
  kategori: Kategori | "tumu";
  /** Arama önerisinden seçilen sorun (yoksa null) */
  sorun: SorunOnerisi | null;
  /** Sıralama */
  siralama: Siralama;
  /** Süzgeç */
  filtre: UstaFiltresi;
}
