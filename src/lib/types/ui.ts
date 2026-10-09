// Genel arayüz bileşenlerinin girdileri — uygulamanın veri tiplerini (Usta, IsEmri …) tanımaz.
// Ekran kendi verisini bu girdilere dönüştürür (ör. src/lib/ustaKarti.ts).
import type { IkonAdi } from "../ikonlar";

/** Kart etiketinin türü; renk app.css değişkenlerinden seçilir */
export const ETIKET_TURLERI = ["bilgi", "basari", "uyari", "hata"] as const;
export type EtiketTuru = (typeof ETIKET_TURLERI)[number];

/** Kartın solundaki (RTL'de sağındaki) görsel */
export interface KartGorseli {
  /** Alternatif metin — ekran okuyucu bunu okur (zorunlu) */
  alt: string;
  /** İsteğe bağlı: resim adresi; yoksa harfler gösterilir */
  src?: string;
  /** İsteğe bağlı: resim yokken gösterilecek 1–2 harf (ör. "HY") */
  harfler?: string;
  /** İsteğe bağlı: görselin köşesindeki küçük ikon */
  ikon?: IkonAdi;
}

/** Kartın alt satırındaki küçük bilgi (mesafe, dil, rozet …) */
export interface KartBilgisi {
  /** Gösterilen kısa metin */
  metin: string;
  /** İsteğe bağlı: metnin önündeki ikon */
  ikon?: IkonAdi;
  /** İsteğe bağlı: üzerine gelince / ekran okuyucuda açıklama (ör. "TR" → "Türkçe") */
  ipucu?: string;
  /** İsteğe bağlı: çerçeveli küçük kutu olarak göster */
  kutulu?: boolean;
  /** İsteğe bağlı: başarı rengiyle vurgula */
  vurgulu?: boolean;
}

/** Kartın puan satırı */
export interface KartPuani {
  /** 0–5 arası değer (yıldızlar) */
  deger: number;
  /** Yanında gösterilecek, biçimlenmiş metin (ör. "4,8 (129)") */
  metin: string;
}

/** Kart.svelte girdileri */
export interface KartGirdisi {
  /** Başlık — uzunsa iki satırda kırpılır */
  baslik: string;
  /** İsteğe bağlı: başlığın altındaki kısa açıklama */
  altMetin?: string;
  /** İsteğe bağlı: görsel */
  gorsel?: KartGorseli;
  /** İsteğe bağlı: kartın en belirgin durum satırı (ör. "Şimdi gelebilir · ~23 dk") */
  etiket?: string;
  /** İsteğe bağlı: etiketin türü; varsayılan "bilgi" */
  etiketTuru?: EtiketTuru;
  /** İsteğe bağlı: kart bir sayfaya gidiyorsa adres; yoksa tıklama olayı kullanılır */
  href?: string;
  /** İsteğe bağlı: puan satırı */
  puan?: KartPuani;
  /** İsteğe bağlı: alt satırdaki bilgiler */
  bilgiler?: KartBilgisi[];
  /** İsteğe bağlı: alt satırın sonunda vurgulu değer (ör. fiyat) */
  deger?: string;
  /** İsteğe bağlı: görseli soluk göster (ör. şu an müsait değil) */
  soluk?: boolean;
}
