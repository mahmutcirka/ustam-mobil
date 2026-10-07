// Canlı iş takibi — aktif bir iş emrinin anlık aşaması zamandan hesaplanır (sunucu yok, simülasyon).
// Alındı → (20 sn) Onaylandı → (yola çıkış) Yolda → (varış veya kod doğrulama) Kapıda → Tamamlandı
import type { IsAsamasi, IsEmri } from "../types/ustam";

export const ONAY_SN = 20; // ustanın çağrıyı onaylaması
export const YOLA_CIKIS_EN_ERKEN_SN = 45; // "hemen" çağrılarında yola çıkış

export const asamalar: IsAsamasi[] = ["alindi", "onaylandi", "yolda", "kapida", "tamamlandi"];

export interface TakipBilgisi {
  asama: IsAsamasi;
  kalanDk: number; // varışa kalan dakika
  ilerleme: number; // 0–1, yola çıkıştan varışa
  varis: Date;
}

export function takip(is: Pick<IsEmri, "durum" | "olusturma" | "zaman" | "varisDk" | "dogrulandi">, simdi: Date): TakipBilgisi {
  const olusma = new Date(is.olusturma).getTime();
  const varis = new Date(is.zaman).getTime();
  const yolaCikis = Math.max(varis - is.varisDk * 60_000, olusma + YOLA_CIKIS_EN_ERKEN_SN * 1000);
  const t = simdi.getTime();

  const kalanDk = Math.max(0, Math.ceil((varis - t) / 60_000));
  const ilerleme = varis > yolaCikis ? Math.min(1, Math.max(0, (t - yolaCikis) / (varis - yolaCikis))) : 1;

  let asama: IsAsamasi;
  if (is.durum === "tamamlandi") asama = "tamamlandi";
  else if (is.dogrulandi || t >= varis) asama = "kapida";
  else if (t >= yolaCikis) asama = "yolda";
  else if (t >= olusma + ONAY_SN * 1000) asama = "onaylandi";
  else asama = "alindi";

  return { asama, kalanDk, ilerleme, varis: new Date(varis) };
}
