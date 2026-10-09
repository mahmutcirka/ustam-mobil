// Kısa bildirim (toast)

/** Bildirim türü; renk ve ikon buna göre seçilir */
export const BILDIRIM_TURLERI = ["basari", "bilgi", "hata"] as const;
export type BildirimTuru = (typeof BILDIRIM_TURLERI)[number];

export interface Bildirim {
  /** Kuyruktaki benzersiz sıra numarası */
  id: number;
  /** Gösterilecek, çevrilmiş metin */
  metin: string;
  /** Bildirim türü */
  tur: BildirimTuru;
}
