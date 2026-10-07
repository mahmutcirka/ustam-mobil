// Detay ekranında hazırlanan, henüz onaylanmamış çağrı taslağı
import type { CagriTaslagi } from "../types/ustam";
import { tahminiFiyat, ustaBul } from "./data";
import { oku, yaz } from "./depo";

const ANAHTAR = "cagri-taslagi";

class Cagri {
  taslak = $state<CagriTaslagi | null>(oku<CagriTaslagi | null>(ANAHTAR, null));

  usta = $derived(this.taslak ? ustaBul(this.taslak.ustaId) : undefined);

  // Anlık tahmin; kesin döküm onayda Rust'tan alınır
  fiyat = $derived(
    this.taslak && this.usta
      ? tahminiFiyat(this.usta, this.taslak.sorun, this.taslak.aciliyet, this.taslak.zaman)
      : null,
  );

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
