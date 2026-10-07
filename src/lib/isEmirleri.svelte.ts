// İş emirleri — kodu Rust üretir (is_emri_uret), liste localStorage'da saklanır
import { invoke, isTauri } from "@tauri-apps/api/core";
import type { CagriTaslagi, IsDurumu, IsEmri, Kategori, Usta } from "../types/ustam";
import { tutarHesapla, yerelIso } from "./data";
import { oku, yaz } from "./depo";

const ANAHTAR = "is-emirleri";

const KATEGORI_KODU: Record<Kategori, string> = {
  tesisat: "TES",
  elektrik: "ELK",
  cilingir: "CLN",
  kombi: "KMB",
  "beyaz-esya": "BYZ",
};

// Karışan karakterler (0/O, 1/I) kullanılmaz — Rust tarafıyla aynı alfabe
const ALFABE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const KOD_DESENI = /^UST-(TES|ELK|CLN|KMB|BYZ)-(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])-[A-HJ-NP-Z2-9]{4}$/;

const tauriIcinde = () => typeof window !== "undefined" && isTauri();

// Tarayıcıda (bun run dev) Rust yoktur; aynı formatı JS ile üret
function webKodu(kategori: Kategori, zaman: string): string {
  const gunAy = zaman.slice(8, 10) + zaman.slice(5, 7);
  const rastgele = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => ALFABE[b % ALFABE.length]).join("");
  return `UST-${KATEGORI_KODU[kategori]}-${gunAy}-${rastgele}`;
}

async function kodUret(kategori: Kategori, zaman: string): Promise<string> {
  if (tauriIcinde()) return invoke<string>("is_emri_uret", { kategori, zaman });
  return webKodu(kategori, zaman);
}

export async function kodBicimiGecerli(kod: string): Promise<boolean> {
  if (tauriIcinde()) return invoke<boolean>("is_emri_dogrula", { kod });
  return KOD_DESENI.test(kod);
}

class IsEmirleri {
  liste = $state<IsEmri[]>(oku<IsEmri[]>(ANAHTAR, []));

  aktifSayisi = $derived(this.liste.filter((i) => i.durum === "bekliyor" || i.durum === "yolda").length);

  async olustur(t: CagriTaslagi, usta: Usta): Promise<IsEmri> {
    const kod = await kodUret(usta.kategori, t.zaman);
    const emir: IsEmri = {
      ...t,
      kod,
      ustaAd: usta.ad,
      kategori: usta.kategori,
      tutar: tutarHesapla(usta, t.aciliyet),
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
    return this.liste.find((i) => i.kod === kod);
  }

  private kaydet() {
    yaz(ANAHTAR, $state.snapshot(this.liste));
  }
}

export const isEmirleri = new IsEmirleri();
