// İş emirleri — kod ve fiyat dökümü Rust'tan (motor.ts), liste localStorage'da saklanır
import type { CagriTaslagi, IsDurumu, IsEmri, Usta } from "../types/ustam";
import { sorunBilgisi, tahminiFiyat, yerelIso } from "./data";
import { oku, yaz } from "./depo";
import { fiyatHesapla, isEmriKoduUret } from "./motor";

const ANAHTAR = "is-emirleri";

// İlk sürümde fiyat yerine tek "tutar" alanı vardı; eski kayıtlar okunurken dökümüne çevrilir
type EskiIsEmri = Omit<IsEmri, "fiyat"> & { fiyat?: IsEmri["fiyat"]; tutar?: number };

function yukle(): IsEmri[] {
  return oku<EskiIsEmri[]>(ANAHTAR, []).map(({ tutar, ...e }) => ({
    ...e,
    fiyat: e.fiyat ?? {
      cikis: tutar ?? 0,
      acil: 0,
      gece: 0,
      pazar: 0,
      iscilikMin: 0,
      iscilikMax: 0,
      toplamMin: tutar ?? 0,
      toplamMax: tutar ?? 0,
    },
  }));
}

class IsEmirleri {
  liste = $state<IsEmri[]>(yukle());

  aktifSayisi = $derived(this.liste.filter((i) => i.durum === "bekliyor" || i.durum === "yolda").length);

  async olustur(t: CagriTaslagi, usta: Usta): Promise<IsEmri> {
    const [iscilikMin, iscilikMax] = sorunBilgisi[t.sorun]?.iscilik ?? [0, 0];
    const [kod, fiyat] = await Promise.all([
      isEmriKoduUret(usta.kategori, t.zaman),
      fiyatHesapla({ cikisUcreti: usta.cikisUcreti, aciliyet: t.aciliyet, zaman: t.zaman, iscilikMin, iscilikMax }).catch(
        () => tahminiFiyat(usta, t.sorun, t.aciliyet, t.zaman),
      ),
    ]);
    const emir: IsEmri = {
      ...t,
      kod,
      ustaAd: usta.ad,
      kategori: usta.kategori,
      fiyat,
      durum: t.aciliyet === "hemen" ? "yolda" : "bekliyor",
      olusturma: yerelIso(new Date()),
    };
    this.liste.unshift(emir);
    this.kaydet();
    return emir;
  }

  durumDegistir(kod: string, durum: IsDurumu) {
    const emir = this.liste.find((i) => i.kod === kod);
    if (!emir) return;
    emir.durum = durum;
    this.kaydet();
  }

  bul(kod: string): IsEmri | undefined {
    const aranan = kod.trim().toUpperCase();
    return this.liste.find((i) => i.kod === aranan);
  }

  private kaydet() {
    yaz(ANAHTAR, $state.snapshot(this.liste));
  }
}

export const isEmirleri = new IsEmirleri();
