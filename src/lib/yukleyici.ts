// Liste verisinin tek giriş noktası (Görev 13). Ekranlar veriyi doğrudan değil bu işlevlerle alır ve sonuca göre
// dört halden birini gösterir: yükleniyor, hata, boş, dolu. Veri şimdilik cihazdaki örnek veridir (data.ts) —
// ağ isteği ya da yapay gecikme yoktur.
//
// Geliştirme sırasında dört hali elle denemek için adres çubuğuna ?durum=yukleniyor | hata | bos yazılır
// (yalnız `bun run dev`; derlenmiş uygulamada etkisizdir). Ayrıntı: docs/gelistirme-notlari.md
import { ustalar } from "./data";
import { LISTE_DURUMLARI, type ListeDurumu, type Usta } from "./types";

/** Adresteki ?durum= değerini okur; geliştirme dışında ya da geçersiz değerde null */
export function zorlananDurum(arama: string, gelistirme: boolean): ListeDurumu | null {
  if (!gelistirme) return null;
  const d = new URLSearchParams(arama).get("durum");
  return d && (LISTE_DURUMLARI as readonly string[]).includes(d) && d !== "dolu" ? (d as ListeDurumu) : null;
}

function gelistirmeDurumu(): ListeDurumu | null {
  if (typeof window === "undefined") return null;
  // Vite: DEV boolean; Bun testlerinde ortam değişkeni (metin) — ikisi de "true" olduğunda geliştirme sayılır
  const d = zorlananDurum(window.location.search, String(import.meta.env?.DEV) === "true");
  // Hata geçici bir arıza gibi davranır: bir kez gösterilir, "Tekrar dene" listeyi getirir
  if (d === "hata") {
    const adres = new URL(window.location.href);
    adres.searchParams.delete("durum");
    history.replaceState(history.state, "", adres);
  }
  return d;
}

/** Bir kaynağı yükler; geliştirme sırasında ?durum= ile hali zorlamaya izin verir */
export async function listeYukle<T>(kaynak: () => T[] | Promise<T[]>, zorla = gelistirmeDurumu()): Promise<T[]> {
  if (zorla === "yukleniyor") return new Promise<T[]>(() => {}); // hiç bitmeyen yükleme: iskelet ekranda kalır
  if (zorla === "hata") throw new Error("gelistirme: ?durum=hata");
  if (zorla === "bos") return [];
  return await kaynak();
}

/** Ana ekrandaki usta listesi */
export const ustalariYukle = (): Promise<Usta[]> => listeYukle(() => ustalar);

/** Yükleme sonucunu ekranın göstereceği hale çevirir */
export const listeDurumu = (liste: readonly unknown[]): ListeDurumu => (liste.length ? "dolu" : "bos");
