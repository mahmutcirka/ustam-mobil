// Kullanıcı profili ve görünüm tercihleri — yalnız bu cihazda saklanır
import type { Semt } from "./ortak";

export interface ProfilBilgileri {
  /** Ad soyad (boş bırakılabilir) */
  ad: string;
  /** Ustanın arayacağı telefon */
  telefon: string;
  /** Yakındaki ustaları sıralamak için kullanıcının semti */
  semt: Semt;
  /** Açık adres (çağrıda varsayılan adres notu) */
  adres: string;
}

/** Tema tercihi: sistemi izle, gündüz ya da gece */
export const TEMA_TERCIHLERI = ["sistem", "gunduz", "gece"] as const;
export type TemaTercihi = (typeof TEMA_TERCIHLERI)[number];

/** Uygulanan tema */
export type Tema = Exclude<TemaTercihi, "sistem">;
