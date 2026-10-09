// Usta → genel kart girdisi (Görev 12). Kart bileşeni (ui/Kart.svelte) Usta tipini tanımaz;
// dönüşümü kartı kullanan ekran bu saf işlevle yapar. Metinler çevirmen işleviyle (dil.t) gelir.
import type { Anahtar } from "./ceviriler";
import { basHarfler, kategoriIkon, paraYaz, sayiYaz, varisDk } from "./data";
import type { EtiketTuru, KartBilgisi, KartGirdisi, Usta, UstaDurumu, UstaKartBaglami } from "./types";

const etiketTuru: Record<UstaDurumu["tur"], EtiketTuru> = { musait: "basari", mesgul: "uyari", kapali: "bilgi" };

function durumMetni(d: UstaDurumu, km: number, b: UstaKartBaglami): string {
  if (d.tur === "musait") return b.t("kart.simdiGelebilir", { dk: sayiYaz(varisDk(km), b.dil) });
  if (d.tur === "mesgul") return d.dk ? b.t("kart.mesgulSonra", { dk: sayiYaz(d.dk, b.dil) }) : b.t("kart.mesgul");
  return b.t("kart.kapali", { saat: d.acilis });
}

export function ustaKartGirdisi(u: Usta, b: UstaKartBaglami): KartGirdisi {
  const bilgiler: KartBilgisi[] = [
    { ikon: "konum", metin: b.t("kart.km", { n: sayiYaz(b.km, b.dil) }) },
    ...u.diller.map((d) => ({ metin: d.toUpperCase(), ipucu: b.dilAdi(d), kutulu: true, vurgulu: d === b.dil && d !== "tr" })),
    ...u.rozetler
      .filter((r) => r === "sigortali" || r === "7-24")
      .map((r) => ({ metin: b.t(`rozet.${r}` as Anahtar) })),
  ];
  return {
    baslik: u.ad,
    altMetin: `${b.t(`kategori.${u.kategori}` as Anahtar)} · ${u.semt}`,
    gorsel: { harfler: basHarfler(u.ad), alt: u.ad, ikon: kategoriIkon[u.kategori] },
    etiket: durumMetni(b.durum, b.km, b),
    etiketTuru: etiketTuru[b.durum.tur],
    href: b.sorun ? `/usta/${u.id}?sorun=${b.sorun}` : `/usta/${u.id}`,
    puan: { deger: b.puan.deger, metin: `${sayiYaz(b.puan.deger, b.dil)} (${sayiYaz(b.puan.sayi, b.dil)})` },
    bilgiler,
    deger: b.t("kart.cikisDan", { tutar: paraYaz(u.cikisUcreti, b.dil) }),
    soluk: b.durum.tur !== "musait",
  };
}
