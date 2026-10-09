// Rust komutlarının sonuç ve hata tipleri (src-tauri/src/lib.rs ile aynı alanlar) ve platform desteği (Görev 15).
// Rust'a yalnız src/lib/native.ts üzerinden gidilir; komutların listesi: docs/komutlar.md

/** is_emri_uret sonucu (Rust: UretilenKod) */
export interface UretilenKod {
  /** İş emri kodu, UST-ELK-1210-K7QZ */
  kod: string;
  /** 3 harfli kategori kodu (ELK) */
  kategoriKodu: string;
  /** Ziyaret günü ve ayı, GGAA (1210) */
  tarih: string;
}

/** veri_dosyasi_kaydet sonucu (Rust: KaydedilenDosya) */
export interface KaydedilenDosya {
  /** Dosyanın tam yolu */
  yol: string;
}

/** Komutların tipli hatası (Rust: KomutHatasi — serde tag "tur", content "ayrinti") */
export type KomutHatasi =
  /** Kategori tanınmıyor; ayrinti: gelen değer */
  | { tur: "bilinmeyen-kategori"; ayrinti: string }
  /** Tarih geçersiz; ayrinti: gelen değer */
  | { tur: "gecersiz-tarih"; ayrinti: string }
  /** Aciliyet hemen / bugun / randevu değil; ayrinti: gelen değer */
  | { tur: "bilinmeyen-aciliyet"; ayrinti: string }
  /** Tutar eksi ya da üst sınırın üstünde; ayrinti: alan adı */
  | { tur: "gecersiz-tutar"; ayrinti: string }
  /** İşçilik alt sınırı üst sınırdan büyük */
  | { tur: "aralik-ters" }
  /** İçerik boş ya da çok büyük */
  | { tur: "gecersiz-icerik" }
  /** Dosya yazılamadı; ayrinti: işletim sisteminin mesajı */
  | { tur: "dosya-yazilamadi"; ayrinti: string }
  /** Komut bu platformda yok */
  | { tur: "platform-desteklemiyor" }
  /** Yalnız TS: Rust komutu çalışmadan Tauri katmanında oluşan beklenmeyen hata; ayrinti: ham mesaj */
  | { tur: "ic-hata"; ayrinti: string };

export type KomutHatasiTuru = KomutHatasi["tur"];

/** Uygulamanın çalıştığı yer: beş Tauri platformu ya da tarayıcı (bun run dev / web) */
export const PLATFORMLAR = ["android", "ios", "macos", "windows", "linux", "web"] as const;
export type Platform = (typeof PLATFORMLAR)[number];

/** Platforma göre değişebilen özellikler (docs/platform-destegi.md) */
export const OZELLIKLER = ["kural-motoru", "acil-arama", "foto-ekleme", "panoya-kopyalama", "veri-disa-aktarma"] as const;
export type Ozellik = (typeof OZELLIKLER)[number];

/** Bir özelliğin bir platformdaki durumu: doğrudan / farklı yolla / yok (arayüzde hiç görünmez) */
export const DESTEK_TURLERI = ["destekleniyor", "farkli-yolla", "yok"] as const;
export type DestekTuru = (typeof DESTEK_TURLERI)[number];

/** verileriKaydet sonucu: indirildi (tarayıcı), dosyaya yazıldı (masaüstü), panoya kopyalandı (mobil) */
export type VeriKaydi = { yol: "indirme" } | { yol: "dosya"; dosya: string } | { yol: "pano" };
