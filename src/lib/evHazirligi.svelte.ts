// "Evimi tanıyorum" listesi — ana su vanası, sigorta kutusu, doğalgaz vanası. Yalnız bu cihazda saklanır.
import { oku, yaz } from "./depo";
import { HAZIRLIK_MADDELERI, type EvHazirligi, type HazirlikMaddesi } from "./types";

const ANAHTAR = "ev-hazirligi";
const BOS: EvHazirligi = { "su-vanasi": false, "sigorta-kutusu": false, "dogalgaz-vanasi": false };

class EvHazirligiDeposu {
  durum = $state<EvHazirligi>({ ...BOS, ...oku<Partial<EvHazirligi>>(ANAHTAR, {}) });

  tamamSayisi = $derived(HAZIRLIK_MADDELERI.filter((m) => this.durum[m]).length);

  degistir(m: HazirlikMaddesi) {
    this.durum = { ...this.durum, [m]: !this.durum[m] };
    yaz(ANAHTAR, this.durum);
  }
}

export const evHazirligi = new EvHazirligiDeposu();
