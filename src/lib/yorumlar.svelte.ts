// Kullanıcının bu cihazda yazdığı yorumlar — usta detayında örnek yorumların üstünde gösterilir
import type { Usta, Yorum } from "../types/ustam";
import { oku, yaz } from "./depo";

const ANAHTAR = "yorumlarim";

type Kayit = Yorum & { ustaId: number; isKodu: string };

class Yorumlarim {
  liste = $state<Kayit[]>(oku<Kayit[]>(ANAHTAR, []));

  ekle(k: Kayit) {
    this.liste = [k, ...this.liste.filter((y) => y.isKodu !== k.isKodu)];
    yaz(ANAHTAR, this.liste);
  }

  isIcin(isKodu: string): Kayit | undefined {
    return this.liste.find((y) => y.isKodu === isKodu);
  }

  // Örnek yorumlar + kullanıcının yorumları; ortalama ve sayı birlikte güncellenir
  ustaIcin(u: Usta): { yorumlar: Yorum[]; puan: number; sayi: number } {
    const benim = this.liste.filter((y) => y.ustaId === u.id).map((y) => ({ ...y, benim: true }));
    const sayi = u.yorumSayisi + benim.length;
    const toplam = u.puan * u.yorumSayisi + benim.reduce((t, y) => t + y.puan, 0);
    return { yorumlar: [...benim, ...u.yorumlar], puan: Math.round((toplam / sayi) * 10) / 10, sayi };
  }
}

export const yorumlarim = new Yorumlarim();
