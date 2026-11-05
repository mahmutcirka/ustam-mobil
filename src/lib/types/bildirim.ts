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

// Cihaz bildirimi (yerel; push sunucusu yok) — docs/izinler.md § Bildirim senaryoları

/** Kullanıcının açıp kapatabildiği bildirim kategorileri */
export const BILDIRIM_KATEGORILERI = ["is-durumu", "randevu"] as const;
export type BildirimKategorisi = (typeof BILDIRIM_KATEGORILERI)[number];

/** Kategori başına açık/kapalı tercihi */
export type BildirimTercihleri = Record<BildirimKategorisi, boolean>;

/** Ustanın tarafında olup kullanıcıya haber verilen iş olayları (kullanıcının kendi eylemleri bildirilmez) */
export const IS_OLAYLARI = ["onaylandi", "randevu-onaylandi", "randevu-yaklasiyor", "yolda", "kapida"] as const;
export type IsOlayi = (typeof IS_OLAYLARI)[number];

/** Gönderilmeyi bekleyen tek bir iş bildirimi */
export interface IsBildirimi {
  /** Tekrarı önleyen anahtar: "<kod>:<olay>" */
  anahtar: string;
  /** İş emri kodu */
  kod: string;
  /** Olay */
  olay: IsOlayi;
  /** Kategori (tercihten kapatılabilir) */
  kategori: BildirimKategorisi;
  /** Olayın gerçekleştiği zaman */
  zaman: Date;
}
