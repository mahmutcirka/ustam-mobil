// Kullanıcının bu cihazda yazdığı yorumlar — usta detayında örnek yorumların üstünde gösterilir
import type { Usta, Yorum, YorumKaydi } from "./types";
import { oku, yaz } from "./depo";

const ANAHTAR = "yorumlarim";

class Yorumlarim {
  liste = $state<YorumKaydi[]>(oku<YorumKaydi[]>(ANAHTAR, []));

  ekle(k: YorumKaydi) {
    this.liste = [k, ...this.liste.filter((y) => y.isKodu !== k.isKodu)];
    yaz(ANAHTAR, this.liste);
  }

  isIcin(isKodu: string): YorumKaydi | undefined {
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
