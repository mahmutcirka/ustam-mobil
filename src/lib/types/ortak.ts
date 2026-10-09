// Ortak tipler — dil, semt ve harita konumu. Sabit seçenekler dizi olarak tutulur; tip diziden türetilir.

/** Arayüz ve içerik dilleri: Türkçe, İngilizce, Arapça (RTL), Farsça (RTL) */
export const DILLER = ["tr", "en", "ar", "fa"] as const;
export type Dil = (typeof DILLER)[number];

/** Uygulamanın hizmet verdiği İstanbul semtleri (örnek veri kapsamı) */
export const SEMTLER = [
  "Sarıyer",
  "Beşiktaş",
  "Şişli",
  "Beyoğlu",
  "Fatih",
  "Bakırköy",
  "Beykoz",
  "Üsküdar",
  "Kadıköy",
  "Ataşehir",
  "Maltepe",
  "Kartal",
] as const;
export type Semt = (typeof SEMTLER)[number];

/** İstanbul'un iki yakası — harita ve semt seçicide gruplama için */
export const YAKALAR = ["avrupa", "asya"] as const;
export type Yaka = (typeof YAKALAR)[number];

/** Stilize İstanbul haritasında konum — 100×110 birimlik koordinat sistemi */
export interface Konum {
  /** Yatay konum, 0 (batı) – 100 (doğu) */
  x: number;
  /** Dikey konum, 0 (kuzey) – 110 (güney) */
  y: number;
}
