// Profilin çağrıya hazırlığı — saf işlevler (testli). Eksik alanlar çağrı sırasında yine sorulur;
// burada doldurulanlar usta detayındaki adres notuna ve çağrı formundaki telefona hazır gelir.
import { PROFIL_ALANLARI, type ProfilAlani, type ProfilBilgileri } from "./types";

/** Türkiye cep / sabit hat: boşluk ve tireler atıldıktan sonra 10–13 rakam, başta isteğe bağlı + */
export function telefonGecerliMi(telefon: string): boolean {
  return /^\+?\d{10,13}$/.test(telefon.replace(/[^\d+]/g, ""));
}

function doluMu(p: ProfilBilgileri, alan: ProfilAlani): boolean {
  if (alan === "telefon") return telefonGecerliMi(p.telefon);
  return p[alan].trim() !== "";
}

/** Doldurulmamış (ya da telefon için geçersiz) alanlar, ölçerdeki sırayla */
export function profilEksikleri(p: ProfilBilgileri): ProfilAlani[] {
  return PROFIL_ALANLARI.filter((a) => !doluMu(p, a));
}

/** 0–100, dörder alan üzerinden */
export function hazirlikYuzdesi(p: ProfilBilgileri): number {
  return Math.round(((PROFIL_ALANLARI.length - profilEksikleri(p).length) / PROFIL_ALANLARI.length) * 100);
}

/** Çağrının adres notu için: "Moda Cad. 12 · 3. kat, zil 5" */
export function cagriAdresi(p: Pick<ProfilBilgileri, "adres" | "kapiNotu">): string {
  return [p.adres.trim(), p.kapiNotu.trim()].filter(Boolean).join(" · ");
}

/** Ekranda gösterim: "0555 123 45 67" (yalnız 0 ile başlayan 11 haneli numaralar biçimlenir) */
export function telefonYaz(telefon: string): string {
  const r = telefon.replace(/\D/g, "");
  return r.length === 11 && r.startsWith("0") ? `${r.slice(0, 4)} ${r.slice(4, 7)} ${r.slice(7, 9)} ${r.slice(9)}` : telefon.trim();
}
