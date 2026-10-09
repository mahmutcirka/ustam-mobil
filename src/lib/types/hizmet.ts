// Hizmet — bir kategorideki tek bir arıza türü (sorun) ve tahmini işçilik bilgisi
import type { Kategori } from "./usta";

export interface Hizmet {
  /** Sorun anahtarı; adı ceviriler.ts içinde "sorun.<anahtar>" olarak 4 dilde */
  sorun: string;
  /** Bağlı olduğu kategori */
  kategori: Kategori;
  /** Tahmini işçilik aralığı, TL: [en az, en çok] */
  iscilik: [min: number, max: number];
  /** Tahmini iş süresi, dk */
  sureDk: number;
  /** İsteğe bağlı: can ya da mal güvenliği riski — arayüzde güvenlik uyarısı vurgulanır */
  tehlikeli?: boolean;
}

/** Ana sayfadaki "Ne oldu?" kısayolu — sık görülen acil sorun */
export interface AcilKisayol {
  /** Hizmet.sorun anahtarı */
  sorun: string;
  /** Sorunun kategorisi */
  kategori: Kategori;
}
