// Usta — çağrılabilen hizmet veren kişi; yorumları ve anlık durumu
import type { Dil, Konum, Semt } from "./ortak";

/** Hizmet kategorileri; iş emri kodundaki 3 harfli karşılıkları kurallar.ts / lib.rs içinde */
export const KATEGORILER = ["tesisat", "elektrik", "cilingir", "kombi", "beyaz-esya"] as const;
export type Kategori = (typeof KATEGORILER)[number];

/** Usta profilinde gösterilen güven rozetleri */
export const ROZETLER = ["dogrulanmis", "sigortali", "7-24", "hizli-yanit"] as const;
export type Rozet = (typeof ROZETLER)[number];

/** Çalışma saatleri: kesintisiz ya da aynı gün içinde açılış–kapanış (["08:00", "22:00"]) */
export type CalismaSaatleri = "7-24" | [acilis: string, kapanis: string];

/** Müşteri yorumu — metin kullanıcı içeriğidir, çevrilmez */
export interface Yorum {
  /** Yorumu yazanın görünen adı (ör. "Zeynep K.") */
  ad: string;
  /** Verilen puan, 1–5 */
  puan: number;
  /** Yorum metni, yazıldığı dilde */
  metin: string;
  /** Yorumun yazıldığı dil */
  dil: Dil;
  /** Yorum tarihi, YYYY-MM-DD */
  tarih: string;
  /** İsteğe bağlı: bu cihazda kullanıcının kendi yazdığı yorum */
  benim?: boolean;
}

export interface Usta {
  /** Benzersiz kimlik; detay adresinde kullanılır (/usta/3) */
  id: number;
  /** Ad soyad */
  ad: string;
  /** Uzmanlık kategorisi */
  kategori: Kategori;
  /** Ortalama puan, 0–5 */
  puan: number;
  /** Toplam yorum sayısı (örnek verideki) */
  yorumSayisi: number;
  /** Şu an yeni iş alabilir mi; false → başka bir işte */
  musait: boolean;
  /** İsteğe bağlı: meşgulse elindeki işin bitmesine kalan tahmini dakika */
  musaitOlacakDk?: number;
  /** Çıkış (gelme) ücreti, TL */
  cikisUcreti: number;
  /** Meslekteki deneyim, yıl */
  deneyimYil: number;
  /** Tamamladığı iş sayısı */
  tamamlananIs: number;
  /** Bulunduğu semt */
  semt: Semt;
  /** Haritadaki konumu */
  konum: Konum;
  /** Konuşabildiği diller */
  diller: Dil[];
  /** Güven rozetleri */
  rozetler: Rozet[];
  /** Ortalama ilk yanıt süresi, dk */
  yanitDk: number;
  /** Çalışma saatleri */
  calisma: CalismaSaatleri;
  /** Çözdüğü sorunların anahtarları (Hizmet.sorun) */
  sorunlar: string[];
  /** Örnek müşteri yorumları */
  yorumlar: Yorum[];
}

/** Ustanın anlık durum türleri */
export const USTA_DURUM_TURLERI = ["musait", "mesgul", "kapali"] as const;
export type UstaDurumTuru = (typeof USTA_DURUM_TURLERI)[number];

/** Ustanın şu anki hâli: çalışma saatleri ve meşguliyet birlikte değerlendirilir */
export type UstaDurumu =
  | { tur: "musait" }
  /** dk: isteğe bağlı, müsait olmasına kalan dakika */
  | { tur: "mesgul"; dk?: number }
  /** acilis: bir sonraki açılış saati, "09:00" */
  | { tur: "kapali"; acilis: string };

/** Kullanıcının bu cihazda yazdığı yorum — hangi ustaya ve hangi işe ait olduğuyla */
export interface YorumKaydi extends Yorum {
  /** Yorumlanan ustanın kimliği (Usta.id) */
  ustaId: number;
  /** Yorumun bağlı olduğu iş emri kodu (IsEmri.kod) */
  isKodu: string;
}
