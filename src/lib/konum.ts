// Cihaz konumunu en yakın semte eşler — "Konumumdan bul" (SemtSecici). Koordinat yalnız bu hesapta kullanılır;
// saklanmaz, loglanmaz, hiçbir yere gönderilmez. Sonuç olarak yalnız semt adı profile yazılır (docs/izinler.md).
import { semtler, semtListesi } from "./data";
import type { CografiKonum, Semt } from "./types";

/** En yakın semt merkezi bundan uzaksa konum hizmet bölgesinin dışında sayılır */
export const HIZMET_YARICAPI_KM = 15;

const DUNYA_YARICAPI_KM = 6371;
const radyan = (derece: number) => (derece * Math.PI) / 180;

/** İki nokta arası kuş uçuşu mesafe, km (haversine) */
export function kusUcusuKm(a: CografiKonum, b: CografiKonum): number {
  const dEnlem = radyan(b.enlem - a.enlem);
  const dBoylam = radyan(b.boylam - a.boylam);
  const h = Math.sin(dEnlem / 2) ** 2 + Math.cos(radyan(a.enlem)) * Math.cos(radyan(b.enlem)) * Math.sin(dBoylam / 2) ** 2;
  return 2 * DUNYA_YARICAPI_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Konuma en yakın semt; hizmet bölgesinin dışındaysa ya da koordinat geçersizse null */
export function enYakinSemt(konum: CografiKonum): { semt: Semt; km: number } | null {
  const { enlem, boylam } = konum;
  if (!Number.isFinite(enlem) || !Number.isFinite(boylam) || Math.abs(enlem) > 90 || Math.abs(boylam) > 180) return null;
  let enIyi: { semt: Semt; km: number } | null = null;
  for (const semt of semtListesi) {
    const km = kusUcusuKm(konum, semtler[semt]);
    if (!enIyi || km < enIyi.km) enIyi = { semt, km };
  }
  return enIyi && enIyi.km <= HIZMET_YARICAPI_KM ? { semt: enIyi.semt, km: Math.round(enIyi.km * 10) / 10 } : null;
}
