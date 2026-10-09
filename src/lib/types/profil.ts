// Kullanıcı profili, ev hazırlığı ve görünüm tercihleri — yalnız bu cihazda saklanır
import type { Semt } from "./ortak";

export interface ProfilBilgileri {
  /** Ad soyad (boş bırakılabilir) */
  ad: string;
  /** Ustanın arayacağı telefon */
  telefon: string;
  /** Yakındaki ustaları sıralamak için kullanıcının semti */
  semt: Semt;
  /** Açık adres (çağrıda adres notuna hazır gelir) */
  adres: string;
  /** Kapı / kat notu: kat, daire, zil, site kapı kodu … (çağrıda adresin sonuna eklenir; boş bırakılabilir) */
  kapiNotu: string;
}

/** "Çağrıya hazırlık" ölçerinde sayılan profil alanları */
export const PROFIL_ALANLARI = ["ad", "telefon", "adres", "kapiNotu"] as const;
export type ProfilAlani = (typeof PROFIL_ALANLARI)[number];

/** "Evimi tanıyorum" listesi — acil arızada ilk dakikada bulunması gerekenler */
export const HAZIRLIK_MADDELERI = ["su-vanasi", "sigorta-kutusu", "dogalgaz-vanasi"] as const;
export type HazirlikMaddesi = (typeof HAZIRLIK_MADDELERI)[number];

/** Her madde için: kullanıcı yerini biliyor mu */
export type EvHazirligi = Record<HazirlikMaddesi, boolean>;

/** Tema tercihi: sistemi izle, gündüz ya da gece */
export const TEMA_TERCIHLERI = ["sistem", "gunduz", "gece"] as const;
export type TemaTercihi = (typeof TEMA_TERCIHLERI)[number];

/** Uygulanan tema */
export type Tema = Exclude<TemaTercihi, "sistem">;
