// İş emirleri — kod ve fiyat dökümü Rust'tan (motor.ts), liste localStorage'da saklanır
import type { CagriTaslagi, IptalNedeni, IsEmri, OdemeTercihi, Usta } from "../types/ustam";
import { mesafeKm, sorunBilgisi, tahminiFiyat, varisDk } from "./data";
import { oku, yaz } from "./depo";
import { fiyatHesapla, isEmriKoduUret } from "./motor";
import { profil } from "./profil.svelte";

const ANAHTAR = "is-emirleri";

// Önceki sürümlerdeki kayıtlar (tek "tutar" alanı, "bekliyor"/"yolda" durumları) okunurken yeni biçime çevrilir
type EskiKayit = Partial<IsEmri> & CagriTaslagi & { kod: string; tutar?: number; durum?: string };

function donustur(e: EskiKayit): IsEmri {
  const tutar = e.tutar ?? 0;
  return {
    ...e,
    ustaAd: e.ustaAd ?? "",
    kategori: e.kategori ?? "tesisat",
    fiyat: e.fiyat ?? { cikis: tutar, acil: 0, gece: 0, pazar: 0, iscilikMin: 0, iscilikMax: 0, toplamMin: tutar, toplamMax: tutar },
    durum: e.durum === "tamamlandi" || e.durum === "iptal" ? e.durum : "aktif",
    olusturma: e.olusturma ?? e.zaman,
    varisDk: e.varisDk ?? 20,
    odeme: e.odeme ?? "nakit",
    telefon: e.telefon ?? "",
  };
}

class IsEmirleri {
  liste = $state<IsEmri[]>(oku<EskiKayit[]>(ANAHTAR, []).map(donustur));

  aktifler = $derived(this.liste.filter((i) => i.durum === "aktif"));
  gecmis = $derived(this.liste.filter((i) => i.durum !== "aktif"));
  aktifSayisi = $derived(this.aktifler.length);

  async olustur(t: CagriTaslagi, usta: Usta, ek: { odeme: OdemeTercihi; telefon: string }): Promise<IsEmri> {
    const [iscilikMin, iscilikMax] = sorunBilgisi[t.sorun]?.iscilik ?? [0, 0];
    const [kod, fiyat] = await Promise.all([
      isEmriKoduUret(usta.kategori, t.zaman),
      fiyatHesapla({ cikisUcreti: usta.cikisUcreti, aciliyet: t.aciliyet, zaman: t.zaman, iscilikMin, iscilikMax }).catch(
        () => tahminiFiyat(usta, t.sorun, t.aciliyet, t.zaman),
      ),
    ]);
    const emir: IsEmri = {
      ...t,
      ...ek,
      kod,
      ustaAd: usta.ad,
      kategori: usta.kategori,
      fiyat,
      durum: "aktif",
      olusturma: new Date().toISOString(),
      varisDk: varisDk(mesafeKm(usta, profil.bilgi.semt)),
    };
    this.liste.unshift(emir);
    this.kaydet();
    return emir;
  }

  bul(kod: string): IsEmri | undefined {
    const aranan = kod.trim().toUpperCase();
    return this.liste.find((i) => i.kod === aranan);
  }

  dogrula(kod: string) {
    this.guncelle(kod, { dogrulandi: true });
  }

  tamamla(kod: string) {
    this.guncelle(kod, { durum: "tamamlandi", bitis: new Date().toISOString() });
  }

  iptal(kod: string, neden: IptalNedeni) {
    this.guncelle(kod, { durum: "iptal", iptalNedeni: neden, bitis: new Date().toISOString() });
  }

  hepsiniSil() {
    this.liste = [];
    this.kaydet();
  }

  private guncelle(kod: string, degisiklik: Partial<IsEmri>) {
    const i = this.liste.findIndex((e) => e.kod === kod);
    if (i === -1) return;
    this.liste[i] = { ...this.liste[i], ...degisiklik };
    this.kaydet();
  }

  private kaydet() {
    yaz(ANAHTAR, $state.snapshot(this.liste));
  }
}

export const isEmirleri = new IsEmirleri();
