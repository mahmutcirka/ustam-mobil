// Detay ekranında hazırlanan, henüz onaylanmamış çağrı (PassoKlon'daki sepetin karşılığı)
import type { CagriTaslagi } from "../types/ustam";
import { ustaBul, tutarHesapla } from "./data";
import { oku, yaz } from "./depo";

const ANAHTAR = "cagri-taslagi";

class Cagri {
  taslak = $state<CagriTaslagi | null>(oku<CagriTaslagi | null>(ANAHTAR, null));

  usta = $derived(this.taslak ? ustaBul(this.taslak.ustaId) : undefined);
  tutar = $derived(this.taslak && this.usta ? tutarHesapla(this.usta, this.taslak.aciliyet) : 0);

  hazirla(t: CagriTaslagi) {
    this.taslak = t;
    yaz(ANAHTAR, t);
  }

  temizle() {
    this.taslak = null;
    yaz(ANAHTAR, null);
  }
}

export const cagri = new Cagri();
