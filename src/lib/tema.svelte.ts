// Tema: Sistem / Gündüz / Gece — tercih localStorage'da, uygulanan tema <html data-tema>'da
import { yaz } from "./depo";

export type TemaTercihi = "sistem" | "gunduz" | "gece";
export type Tema = "gunduz" | "gece";

const ANAHTAR = "tema";
const SIRA: TemaTercihi[] = ["sistem", "gunduz", "gece"];

const sistemKaranlik = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;

// Eski sürüm tercihi düz metin ("gece") olarak yazıyordu; JSON değilse de okunabilsin
function tercihOku(): TemaTercihi {
  try {
    const ham = typeof localStorage !== "undefined" ? localStorage.getItem(ANAHTAR) : null;
    const t = ham?.replaceAll('"', "");
    return SIRA.includes(t as TemaTercihi) ? (t as TemaTercihi) : "sistem";
  } catch {
    return "sistem";
  }
}

class TemaYonetici {
  tercih = $state<TemaTercihi>(tercihOku());
  private sistem = $state(sistemKaranlik());

  mod = $derived<Tema>(this.tercih === "sistem" ? (this.sistem ? "gece" : "gunduz") : this.tercih);

  constructor() {
    if (typeof matchMedia !== "undefined") {
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        this.sistem = e.matches;
        this.uygula();
      });
    }
  }

  sec(t: TemaTercihi) {
    this.tercih = t;
    yaz(ANAHTAR, t);
    this.uygula();
  }

  // Üst bardaki düğme: Sistem → Gündüz → Gece → Sistem
  siradaki() {
    this.sec(SIRA[(SIRA.indexOf(this.tercih) + 1) % SIRA.length]);
  }

  private uygula() {
    if (typeof document !== "undefined") document.documentElement.dataset.tema = this.mod;
  }
}

export const tema = new TemaYonetici();
