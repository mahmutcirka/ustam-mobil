// Cihaz bildirimleri — iş emri aşamalarını izler ve olay olduğunda haber verir (yerel bildirim; push sunucusu yok).
// Uygulama önündeyse ekranda kısa bildirim (toast), arka plandaysa işletim sistemi bildirimi gösterilir.
// Telefonda uygulama kapalıyken ya da arka planda WebView durdurulduğunda bildirim gelmez: bunun için sunucu (push)
// gerekir ve bu projede yoktur (docs/izinler.md § Uygulama açık / kapalı).
import { bildirim } from "./bildirim.svelte";
import { saatYaz } from "./data";
import { dil } from "./i18n.svelte";
import { isEmirleri } from "./isEmirleri.svelte";
import { bekleyenBildirimler } from "./isBildirimleri";
import { oku, yaz } from "./depo";
import { bildirimGoster, destekleniyorMu } from "./native";
import type { Anahtar } from "./ceviriler";
import type { BildirimKategorisi, BildirimTercihleri, IsBildirimi, IsOlayi } from "./types";

const TERCIH_ANAHTARI = "bildirim-tercihleri";
const GONDERILEN_ANAHTARI = "gonderilen-bildirimler";
const EN_FAZLA_KAYIT = 200;
const ARALIK_MS = 15_000;

class BildirimTercihleriDeposu {
  secim = $state<BildirimTercihleri>({ "is-durumu": true, randevu: true, ...oku<Partial<BildirimTercihleri>>(TERCIH_ANAHTARI, {}) });

  degistir(kategori: BildirimKategorisi, acik: boolean) {
    this.secim[kategori] = acik;
    yaz(TERCIH_ANAHTARI, $state.snapshot(this.secim));
  }
}

export const bildirimTercihleri = new BildirimTercihleriDeposu();

// [başlık, gövde]
const metinAnahtari: Record<IsOlayi, [Anahtar, Anahtar]> = {
  onaylandi: ["cihazBildirimi.onaylandiBaslik", "cihazBildirimi.onaylandi"],
  "randevu-onaylandi": ["cihazBildirimi.randevuOnaylandiBaslik", "cihazBildirimi.randevuOnaylandi"],
  "randevu-yaklasiyor": ["cihazBildirimi.randevuYaklasiyorBaslik", "cihazBildirimi.randevuYaklasiyor"],
  yolda: ["cihazBildirimi.yoldaBaslik", "cihazBildirimi.yolda"],
  kapida: ["cihazBildirimi.kapidaBaslik", "cihazBildirimi.kapida"],
};

/** Bildirimin başlığı ve gövdesi, seçili dilde */
export function bildirimMetni(b: Pick<IsBildirimi, "kod" | "olay">): { baslik: string; govde: string } {
  const is = isEmirleri.bul(b.kod);
  const saat = is ? saatYaz(is.zaman, dil.kod) : "";
  const [baslik, govde] = metinAnahtari[b.olay];
  return { baslik: dil.t(baslik), govde: dil.t(govde, { usta: is?.ustaAd ?? "", kod: b.kod, saat }) };
}

function gonderilenleriOku(): Set<string> {
  return new Set(oku<string[]>(GONDERILEN_ANAHTARI, []));
}

// Yalnız hâlâ listede olan işlerin anahtarları tutulur; liste sınırlıdır
function gonderilenleriYaz(kume: Set<string>) {
  const kodlar = new Set(isEmirleri.liste.map((i) => i.kod));
  const kalan = [...kume].filter((a) => kodlar.has(a.slice(0, a.lastIndexOf(":")))).slice(-EN_FAZLA_KAYIT);
  yaz(GONDERILEN_ANAHTARI, kalan);
}

/** Bildirimi ulaştırır; ulaştıysa true. Önde: ekranda; arkada: sistem bildirimi; o olmazsa ve ekran görünürse ekranda */
async function duyur(b: IsBildirimi): Promise<boolean> {
  const { baslik, govde } = bildirimMetni(b);
  const gorunur = document.visibilityState === "visible";
  const ekranda = () => {
    bildirim.goster(govde, "bilgi", 5000);
    return true;
  };
  if (gorunur && document.hasFocus()) return ekranda();
  if (destekleniyorMu("bildirim")) {
    try {
      await bildirimGoster(baslik, govde);
      return true;
    } catch {
      // İzin yok ya da sistem göstermedi: diyalog açılmaz, kullanıcı zorlanmaz (/izinler'den açabilir)
    }
  }
  return gorunur ? ekranda() : false;
}

/**
 * Bir kez denetler. Gönderilecekleri ÖNCE "gönderildi" diye kaydeder (sayfa geçişinde ya da iki pencerede tekrar
 * olmasın); hiçbir yolla ulaştırılamayan bildirim geri alınır ve uygulama yeniden öne gelince (taze ise) gösterilir.
 */
export async function denetle(simdi = new Date()) {
  const gonderilenler = gonderilenleriOku();
  const { gonderilecek, gorulen } = bekleyenBildirimler(isEmirleri.liste, simdi, gonderilenler, bildirimTercihleri.secim);
  if (gorulen.length === 0) return;
  for (const a of gorulen) gonderilenler.add(a);
  gonderilenleriYaz(gonderilenler);
  const ulasmayan: string[] = [];
  for (const b of gonderilecek) if (!(await duyur(b))) ulasmayan.push(b.anahtar);
  if (ulasmayan.length) {
    const guncel = gonderilenleriOku();
    for (const a of ulasmayan) guncel.delete(a);
    gonderilenleriYaz(guncel);
  }
}

/** İzlemeyi başlatır (Layout → BildirimIzleyici.svelte); durdurma işlevini döner */
export function izlemeyiBaslat(): () => void {
  void denetle();
  const zamanlayici = setInterval(() => void denetle(), ARALIK_MS);
  const gorunurluk = () => void denetle();
  document.addEventListener("visibilitychange", gorunurluk);
  return () => {
    clearInterval(zamanlayici);
    document.removeEventListener("visibilitychange", gorunurluk);
  };
}
