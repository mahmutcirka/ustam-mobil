// Favori ustalar — usta id'leri localStorage'da
import { oku, yaz } from "./depo";

const ANAHTAR = "favoriler";

class Favoriler {
  idler = $state<number[]>(oku<number[]>(ANAHTAR, []));

  var(id: number): boolean {
    return this.idler.includes(id);
  }

  // Eklendiyse true, çıkarıldıysa false döner
  degistir(id: number): boolean {
    const eklendi = !this.var(id);
    this.idler = eklendi ? [...this.idler, id] : this.idler.filter((i) => i !== id);
    yaz(ANAHTAR, this.idler);
    return eklendi;
  }
}

export const favoriler = new Favoriler();
