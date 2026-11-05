// İzinler (yetkiler) — Rust: src-tauri/src/permissions.rs ile aynı alanlar. Gerekçeler ve tablo: docs/izinler.md

/** Uygulamanın istediği izinler; yalnız gerçekten kullanılanlar */
export const IZINLER = ["bildirim", "konum"] as const;
export type IzinKimligi = (typeof IZINLER)[number];

/** İznin işletim sisteminden okunan anlık durumu (tahmin edilmez; okunamazsa "okunamadi") */
export const IZIN_DEGERLERI = [
  "verildi",
  "reddedildi",
  "sorulmadi",
  "servis-kapali",
  "gerekmiyor",
  "desteklenmiyor",
  "okunamadi",
] as const;
export type IzinDegeri = (typeof IZIN_DEGERLERI)[number];

/** Tek bir iznin anlık durumu (Rust: IzinDurumu) */
export interface IzinDurumu {
  /** Hangi izin */
  id: IzinKimligi;
  /** İşletim sistemindeki durumu */
  durum: IzinDegeri;
  /** Uygulama içinden sistem diyaloğu açılabilir mi; reddedilmiş ve false ise yalnız sistem ayarlarından açılır */
  istenebilir: boolean;
}

/** konum_oku sonucu (Rust: KonumOkumasi) — yalnız en yakın semti bulmak için kullanılır, saklanmaz */
export interface KonumOkumasi {
  /** Enlem, ondalık derece */
  enlem: number;
  /** Boylam, ondalık derece */
  boylam: number;
  /** Yaklaşık doğruluk, metre */
  dogrulukM: number;
}
