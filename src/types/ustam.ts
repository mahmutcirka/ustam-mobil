// Ustam veri modeli — tüm ekranların paylaştığı tipler
import type { FiyatDokumu } from "../lib/kurallar";

export type Dil = "tr" | "en" | "ar" | "fa";

export type Kategori = "tesisat" | "elektrik" | "cilingir" | "kombi" | "beyaz-esya";

export type Aciliyet = "hemen" | "bugun" | "randevu";

// Kalıcı durum; aktif işin anlık aşaması (onaylandı, yolda, kapıda) zamana göre hesaplanır (takip.ts)
export type IsDurumu = "aktif" | "tamamlandi" | "iptal";

export type IsAsamasi = "alindi" | "onaylandi" | "yolda" | "kapida" | "tamamlandi";

export type OdemeTercihi = "nakit" | "kart";

export type IptalNedeni = "vazgectim" | "gecikti" | "baskasi" | "cozuldu";

export type Semt =
  | "Sarıyer"
  | "Beşiktaş"
  | "Şişli"
  | "Beyoğlu"
  | "Fatih"
  | "Bakırköy"
  | "Beykoz"
  | "Üsküdar"
  | "Kadıköy"
  | "Ataşehir"
  | "Maltepe"
  | "Kartal";

export type Rozet = "dogrulanmis" | "sigortali" | "7-24" | "hizli-yanit";

// Haritadaki konum — stilize İstanbul haritasının 100×110 birimlik koordinat sistemi
export interface Konum {
  x: number;
  y: number;
}

export interface Yorum {
  ad: string;
  puan: number; // 1–5
  metin: string;
  dil: Dil; // yorumun yazıldığı dil (çevrilmez, kullanıcı içeriğidir)
  tarih: string; // YYYY-MM-DD
  benim?: boolean; // bu cihazda kullanıcının yazdığı yorum
}

export interface Usta {
  id: number;
  ad: string;
  kategori: Kategori;
  puan: number; // 0–5, örnek verideki ortalama
  yorumSayisi: number;
  musait: boolean; // false → şu an başka bir işte
  musaitOlacakDk?: number; // meşgulse, elindeki işin tahmini bitişine kalan süre (örnek veri)
  cikisUcreti: number; // TL
  deneyimYil: number;
  tamamlananIs: number;
  semt: Semt;
  konum: Konum;
  diller: Dil[]; // ustanın konuştuğu diller
  rozetler: Rozet[];
  yanitDk: number; // ortalama ilk yanıt süresi
  calisma: "7-24" | [string, string]; // "08:00"–"22:00"
  sorunlar: string[]; // ceviriler.ts içindeki "sorun.*" anahtarları
  yorumlar: Yorum[];
}

// Ustanın şu anki hâli: çalışma saatleri ve meşguliyet birlikte değerlendirilir
export type UstaDurumu = { tur: "musait" } | { tur: "mesgul"; dk?: number } | { tur: "kapali"; acilis: string };

// Detay ekranında seçilen, henüz onaylanmamış çağrı
export interface CagriTaslagi {
  ustaId: number;
  sorun: string;
  aciliyet: Aciliyet;
  zaman: string; // yerel ISO: "2026-10-12T14:30"
  adresNotu: string;
  foto?: string; // küçültülmüş JPEG data URL (isteğe bağlı)
}

// Rust kodu üretildikten sonra kaydedilen iş emri
export interface IsEmri extends CagriTaslagi {
  kod: string; // UST-ELK-1210-K7QZ
  ustaAd: string;
  kategori: Kategori;
  fiyat: FiyatDokumu; // Rust fiyat_hesapla dökümü
  durum: IsDurumu;
  olusturma: string; // yerel ISO
  varisDk: number; // oluşturma anındaki tahmini yol süresi
  odeme: OdemeTercihi;
  telefon: string;
  dogrulandi?: boolean; // kapıdaki ustanın kodu doğrulandı
  iptalNedeni?: IptalNedeni;
  bitis?: string; // tamamlanma veya iptal zamanı
}
