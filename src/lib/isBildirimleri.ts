// İş emri olaylarından cihaz bildirimi seçimi (saf işlev; zamanlayıcı ve gönderim: bildirimIzleyici.svelte.ts).
// Yalnız ustanın tarafındaki olaylar bildirilir (onay, yola çıkış, kapıya varış, randevu hatırlatması); kullanıcının kendi
// eylemleri (çağrı oluşturma, iptal, tamamlama) ekranda zaten onaylandığı için bildirilmez. Senaryolar: docs/izinler.md
import { asamaZamanlari } from "./takip";
import type { BildirimTercihleri, IsBildirimi, IsEmri, IsOlayi, BildirimKategorisi } from "./types";

/** Bundan eski olaylar bildirilmez (uygulama uzun süre kapalı kaldıysa eski aşamalar art arda düşmesin) */
export const TAZELIK_DK = 15;
/** Randevudan bu kadar önce hatırlatılır */
export const RANDEVU_HATIRLATMA_DK = 60;

export const bildirimAnahtari = (kod: string, olay: IsOlayi) => `${kod}:${olay}`;

/** Bir iş emrinin bildirilebilir olayları, zaman sırasıyla */
export function isOlaylari(is: IsEmri): IsBildirimi[] {
  const { onay, yolaCikis, varis } = asamaZamanlari(is);
  const randevu = is.aciliyet === "randevu";
  const olay = (o: IsOlayi, zaman: number, kategori: BildirimKategorisi): IsBildirimi => ({
    anahtar: bildirimAnahtari(is.kod, o),
    kod: is.kod,
    olay: o,
    kategori,
    zaman: new Date(zaman),
  });
  const liste = [randevu ? olay("randevu-onaylandi", onay, "randevu") : olay("onaylandi", onay, "is-durumu")];
  const hatirlatma = varis - RANDEVU_HATIRLATMA_DK * 60_000;
  if (randevu && hatirlatma > onay && hatirlatma < yolaCikis) liste.push(olay("randevu-yaklasiyor", hatirlatma, "randevu"));
  liste.push(olay("yolda", yolaCikis, "is-durumu"), olay("kapida", varis, "is-durumu"));
  return liste.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
}

/**
 * Şu an gönderilecek bildirimler ve "görüldü" sayılacak anahtarlar.
 * Her aktif iş için yalnız gerçekleşmiş en son olay bildirilir; daha eskiler sessizce görüldü sayılır (art arda bildirim yok).
 * Daha önce gönderilen, bayat, kategorisi kapalı ya da kullanıcının zaten bildiği (kapıda kodu doğruladı) olay bildirilmez.
 */
export function bekleyenBildirimler(
  liste: readonly IsEmri[],
  simdi: Date,
  gonderilenler: ReadonlySet<string>,
  tercihler: BildirimTercihleri,
): { gonderilecek: IsBildirimi[]; gorulen: string[] } {
  const t = simdi.getTime();
  const gonderilecek: IsBildirimi[] = [];
  const gorulen: string[] = [];
  for (const is of liste) {
    if (is.durum !== "aktif") continue;
    const olmus = isOlaylari(is).filter((o) => o.zaman.getTime() <= t);
    const son = olmus.at(-1);
    if (!son) continue;
    for (const o of olmus) if (!gonderilenler.has(o.anahtar)) gorulen.push(o.anahtar);
    const taze = t - son.zaman.getTime() <= TAZELIK_DK * 60_000;
    const biliyor = son.olay === "kapida" && is.dogrulandi === true;
    if (!gonderilenler.has(son.anahtar) && taze && !biliyor && tercihler[son.kategori]) gonderilecek.push(son);
  }
  return { gonderilecek, gorulen };
}
