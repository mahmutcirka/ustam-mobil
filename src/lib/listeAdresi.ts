// Ustalar listesinin arama, kategori, sorun, sıralama ve süzgeç seçimi adreste tutulur (Görev 14):
// "/?q=kombi&kat=kombi&musait=1&sirala=yakin". Böylece detaydan geri dönünce, tarayıcının geri tuşunda ve
// kopyalanan bağlantıda liste aynı seçimle açılır. Saf işlevler; adresi okuyup yazmayı ekran yapar.
import { sorunBilgisi } from "./data";
import { DILLER, KATEGORILER, SIRALAMALAR, type Dil, type Kategori, type ListeSecimi, type Siralama, type UstaFiltresi } from "./types";

export const BOS_FILTRE: UstaFiltresi = { musait: false, favori: false, mesafe: 0, puan: 0, fiyat: 0, dil: "" };

export const VARSAYILAN_SECIM: ListeSecimi = { arama: "", kategori: "tumu", sorun: null, siralama: "onerilen", filtre: BOS_FILTRE };

// Bu modülün yönettiği adres anahtarları; diğerleri (ör. geliştirmedeki ?durum=) olduğu gibi bırakılır
const ANAHTARLAR = ["q", "kat", "sorun", "sirala", "musait", "favori", "mesafe", "puan", "fiyat", "dil"];

const sayi = (deger: string | null) => {
  const n = Number(deger);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Adres sorgusundan seçimi okur; tanınmayan değerler varsayılana düşer */
export function secimOku(arama: string): ListeSecimi {
  const p = new URLSearchParams(arama);
  const kat = p.get("kat");
  const sorunAnahtari = p.get("sorun");
  const hizmet = sorunAnahtari ? sorunBilgisi[sorunAnahtari] : undefined;
  const sirala = p.get("sirala");
  const dil = p.get("dil");
  return {
    arama: p.get("q") ?? "",
    kategori: hizmet ? hizmet.kategori : (KATEGORILER as readonly string[]).includes(kat ?? "") ? (kat as Kategori) : "tumu",
    sorun: hizmet ? { sorun: hizmet.sorun, kategori: hizmet.kategori } : null,
    siralama: (SIRALAMALAR as readonly string[]).includes(sirala ?? "") ? (sirala as Siralama) : "onerilen",
    filtre: {
      musait: p.get("musait") === "1",
      favori: p.get("favori") === "1",
      mesafe: sayi(p.get("mesafe")),
      puan: sayi(p.get("puan")),
      fiyat: sayi(p.get("fiyat")),
      dil: (DILLER as readonly string[]).includes(dil ?? "") ? (dil as Dil) : "",
    },
  };
}

/** Seçimi adres sorgusuna yazar ("" ya da "?…"); varsayılan değerler adrese yazılmaz */
export function secimYaz(s: ListeSecimi, mevcut = ""): string {
  const p = new URLSearchParams(mevcut);
  for (const a of ANAHTARLAR) p.delete(a);
  if (s.arama.trim()) p.set("q", s.arama.trim());
  if (s.sorun) p.set("sorun", s.sorun.sorun);
  else if (s.kategori !== "tumu") p.set("kat", s.kategori);
  if (s.siralama !== "onerilen") p.set("sirala", s.siralama);
  if (s.filtre.musait) p.set("musait", "1");
  if (s.filtre.favori) p.set("favori", "1");
  if (s.filtre.mesafe) p.set("mesafe", String(s.filtre.mesafe));
  if (s.filtre.puan) p.set("puan", String(s.filtre.puan));
  if (s.filtre.fiyat) p.set("fiyat", String(s.filtre.fiyat));
  if (s.filtre.dil) p.set("dil", s.filtre.dil);
  const metin = p.toString();
  return metin ? `?${metin}` : "";
}

// Detay ekranındaki "geri" düğmesi listeyi son seçimle açsın diye son liste adresi oturum boyunca saklanır
const OTURUM_ANAHTARI = "liste-adresi";

export function sonListeAdresiniKaydet(adres: string) {
  try {
    sessionStorage.setItem(OTURUM_ANAHTARI, adres);
  } catch {
    // oturum deposu kapalıysa geri düğmesi ana sayfaya döner
  }
}

export function sonListeAdresi(): string {
  try {
    const adres = sessionStorage.getItem(OTURUM_ANAHTARI);
    // Yalnız bu uygulamanın kendi yolları ("/…"); "//başka-site" gibi adresler kabul edilmez
    return adres && adres.startsWith("/") && !adres.startsWith("//") ? adres : "/";
  } catch {
    return "/";
  }
}
