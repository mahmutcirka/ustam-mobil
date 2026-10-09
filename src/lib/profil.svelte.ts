// Kullanıcı profili — ad, telefon, semt ve adres yalnızca bu cihazda (localStorage) tutulur
import type { ProfilBilgileri } from "./types";
import { semtler } from "./data";
import { oku, yaz } from "./depo";

const ANAHTAR = "profil";
const KARSILAMA = "karsilama-tamam";
const VARSAYILAN: ProfilBilgileri = { ad: "", telefon: "", semt: "Kadıköy", adres: "" };

function yukle(): ProfilBilgileri {
  const kayit = { ...VARSAYILAN, ...oku<Partial<ProfilBilgileri>>(ANAHTAR, {}) };
  if (!(kayit.semt in semtler)) kayit.semt = VARSAYILAN.semt;
  return kayit;
}

class Profil {
  bilgi = $state<ProfilBilgileri>(yukle());
  karsilamaTamam = $state(oku<boolean>(KARSILAMA, false));

  guncelle(degisiklik: Partial<ProfilBilgileri>) {
    this.bilgi = { ...this.bilgi, ...degisiklik };
    yaz(ANAHTAR, this.bilgi);
  }

  karsilamayiBitir() {
    this.karsilamaTamam = true;
    yaz(KARSILAMA, true);
  }
}

export const profil = new Profil();
