// İş emri — kullanıcının bir ustayı çağırmasıyla oluşan kayıt; kodu ve fiyat dökümü Rust'tan gelir
import type { FiyatDokumu } from "./kural";
import type { Kategori } from "./usta";

/** Ne zaman gelinsin: hemen (acil), bugün içinde, ileri bir tarihte */
export const ACILIYETLER = ["hemen", "bugun", "randevu"] as const;
export type Aciliyet = (typeof ACILIYETLER)[number];

/** Kalıcı durum; aktif işin anlık aşaması zamana göre hesaplanır (takip.ts) */
export const IS_DURUMLARI = ["aktif", "tamamlandi", "iptal"] as const;
export type IsDurumu = (typeof IS_DURUMLARI)[number];

/** Canlı takip aşamaları, sırayla */
export const IS_ASAMALARI = ["alindi", "onaylandi", "yolda", "kapida", "tamamlandi"] as const;
export type IsAsamasi = (typeof IS_ASAMALARI)[number];

/** Ödeme tercihi (ödeme uygulama içinde alınmaz, ustaya yapılır) */
export const ODEME_TERCIHLERI = ["nakit", "kart"] as const;
export type OdemeTercihi = (typeof ODEME_TERCIHLERI)[number];

/** İptal nedeni seçenekleri */
export const IPTAL_NEDENLERI = ["vazgectim", "gecikti", "baskasi", "cozuldu"] as const;
export type IptalNedeni = (typeof IPTAL_NEDENLERI)[number];

/** Detay ekranında seçilen, henüz onaylanmamış çağrı */
export interface CagriTaslagi {
  /** Çağrılan ustanın kimliği (Usta.id) */
  ustaId: number;
  /** Seçilen sorun (Hizmet.sorun) */
  sorun: string;
  /** Aciliyet */
  aciliyet: Aciliyet;
  /** Ziyaret zamanı, yerel ISO "2026-10-12T14:30" */
  zaman: string;
  /** Adres ve kapı notu (serbest metin) */
  adresNotu: string;
  /** İsteğe bağlı: arızanın küçültülmüş fotoğrafı (JPEG data URL) */
  foto?: string;
}

/** Onaylanmış çağrı — Rust'ın ürettiği kod ve fiyat dökümüyle saklanır */
export interface IsEmri extends CagriTaslagi {
  /** İş emri kodu, UST-KAT-GGAA-XXXC (ör. UST-ELK-1210-K7QZ) */
  kod: string;
  /** Usta adı (kayıt anındaki) */
  ustaAd: string;
  /** Usta kategorisi */
  kategori: Kategori;
  /** Rust fiyat_hesapla dökümü */
  fiyat: FiyatDokumu;
  /** Kalıcı durum */
  durum: IsDurumu;
  /** Oluşturma zamanı, yerel ISO */
  olusturma: string;
  /** Oluşturma anındaki tahmini yol süresi, dk */
  varisDk: number;
  /** Ödeme tercihi */
  odeme: OdemeTercihi;
  /** Ustanın arayacağı telefon */
  telefon: string;
  /** İsteğe bağlı: kapıdaki ustanın kodu doğrulandı */
  dogrulandi?: boolean;
  /** İsteğe bağlı: iptal edildiyse nedeni */
  iptalNedeni?: IptalNedeni;
  /** İsteğe bağlı: tamamlanma ya da iptal zamanı, yerel ISO */
  bitis?: string;
}

/** Önceki sürümlerde saklanmış kayıt (tek "tutar" alanı, eski durum adları) — okunurken IsEmri'ye çevrilir */
export type EskiIsEmriKaydi = Partial<IsEmri> &
  CagriTaslagi & {
    /** İş emri kodu */
    kod: string;
    /** İsteğe bağlı: eski sürümdeki tek tutar, TL */
    tutar?: number;
    /** İsteğe bağlı: eski durum adı ("bekliyor", "yolda" …) */
    durum?: string;
  };

/** Canlı takip ekranının anlık bilgisi (takip.ts) */
export interface TakipBilgisi {
  /** Şu anki aşama */
  asama: IsAsamasi;
  /** Varışa kalan dakika */
  kalanDk: number;
  /** Yola çıkıştan varışa ilerleme, 0–1 */
  ilerleme: number;
  /** Tahmini varış zamanı */
  varis: Date;
}
