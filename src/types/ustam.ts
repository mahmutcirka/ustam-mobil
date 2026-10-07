// Ustam veri modeli — tüm ekranların paylaştığı tipler
import type { FiyatDokumu } from "../lib/kurallar";

export type Dil = "tr" | "en" | "ar" | "fa";

export type Kategori = "tesisat" | "elektrik" | "cilingir" | "kombi" | "beyaz-esya";

export type Aciliyet = "hemen" | "bugun" | "randevu";

export type IsDurumu = "bekliyor" | "yolda" | "tamamlandi" | "iptal";

export interface Usta {
  id: number;
  ad: string;
  kategori: Kategori;
  puan: number; // 0–5
  yorumSayisi: number;
  mesafeKm: number;
  musait: boolean;
  cikisUcreti: number; // TL
  deneyimYil: number;
  tamamlananIs: number;
  bolge: string;
  sorunlar: string[]; // ceviriler.ts içindeki "sorun.*" anahtarları
}

// Detay ekranında seçilen, henüz onaylanmamış çağrı
export interface CagriTaslagi {
  ustaId: number;
  sorun: string;
  aciliyet: Aciliyet;
  zaman: string; // yerel ISO: "2026-10-12T14:30"
  adresNotu: string;
}

// Rust kodu üretildikten sonra kaydedilen iş emri
export interface IsEmri extends CagriTaslagi {
  kod: string; // UST-ELK-1210-K7QM
  ustaAd: string;
  kategori: Kategori;
  fiyat: FiyatDokumu; // Rust fiyat_hesapla dökümü
  durum: IsDurumu;
  olusturma: string;
}
