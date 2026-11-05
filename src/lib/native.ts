// Rust çekirdeğine ve işletim sistemine giden TEK kapı (Görev 15). Bileşenler `invoke()`'u, Tauri eklentilerini ya da
// platform adını doğrudan kullanmaz; buradaki işlevleri ve destekleniyorMu(...) sorusunu kullanır.
//
// - Tauri içinde Rust komutları çağrılır (src-tauri/src/lib.rs); tarayıcıda (bun run dev) aynı kuralların TypeScript
//   karşılığı (kurallar.ts) yedek olarak çalışır — ekran çökmez.
// - Hatalar her iki yolda da aynı tipli biçimdedir: NativeHata.hata = { tur, ayrinti? } (types/native.ts).
// - Platforma göre değişen özellikler ve nasıl yapıldıkları: docs/platform-destegi.md
import { invoke, isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { Anahtar } from "./ceviriler";
import * as kurallar from "./kurallar";
import type {
  DestekTuru,
  FiyatDokumu,
  FiyatGirdisi,
  IzinDurumu,
  IzinKimligi,
  KaydedilenDosya,
  Kategori,
  KodDurumu,
  KomutHatasi,
  KonumOkumasi,
  Ozellik,
  Platform,
  UretilenKod,
  VeriKaydi,
} from "./types";

/** Rust ya da kural katmanından gelen tipli hata */
export class NativeHata extends Error {
  constructor(readonly hata: KomutHatasi) {
    super(hata.tur);
  }
}

export const rustIcinde = () => typeof window !== "undefined" && isTauri();

// ---------------------------------------------------------------- platform

/** Çalışılan platform. Tauri dışında "web"; Tauri içinde WebView'ın kimliğinden (her platformun kendi motoru) */
export function platform(kimlik = typeof navigator === "undefined" ? "" : navigator.userAgent, tauri = rustIcinde()): Platform {
  if (!tauri) return "web";
  if (/Android/i.test(kimlik)) return "android";
  // iPadOS 13+ masaüstü kimliği gönderir ("Macintosh"); dokunmatik ekranla ayrılır
  const dokunmatik = typeof navigator !== "undefined" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(kimlik) || (/Macintosh/.test(kimlik) && dokunmatik)) return "ios";
  if (/Macintosh|Mac OS X/.test(kimlik)) return "macos";
  if (/Windows/.test(kimlik)) return "windows";
  return "linux";
}

/** Özellik × platform tablosu — docs/platform-destegi.md ile birebir aynı tutulur (tests/native.test.ts denetler) */
export const DESTEK: Record<Ozellik, Record<Platform, DestekTuru>> = {
  // Kod üretimi / doğrulama ve fiyat: beş platformda Rust; tarayıcıda TS karşılığı
  "kural-motoru": { android: "destekleniyor", ios: "destekleniyor", macos: "destekleniyor", windows: "destekleniyor", linux: "destekleniyor", web: "farkli-yolla" },
  // 112'yi arama: telefonda eklentiyle sistem çeviricisi; masaüstünde arayacak bir hat yok → düğme gösterilmez
  "acil-arama": { android: "farkli-yolla", ios: "farkli-yolla", macos: "yok", windows: "yok", linux: "yok", web: "destekleniyor" },
  // Arıza fotoğrafı: telefonda kamera/galeri, masaüstünde dosya seçici (aynı <input type="file">)
  "foto-ekleme": { android: "destekleniyor", ios: "destekleniyor", macos: "destekleniyor", windows: "destekleniyor", linux: "destekleniyor", web: "destekleniyor" },
  // Güvenlik kodunu kopyalama: Clipboard API; desteklemeyen eski WebView'da execCommand yedeği
  "panoya-kopyalama": { android: "destekleniyor", ios: "destekleniyor", macos: "destekleniyor", windows: "destekleniyor", linux: "destekleniyor", web: "destekleniyor" },
  // KVKK verilerimi dışa aktar: tarayıcıda indirme, masaüstünde Rust ile İndirilenler'e dosya, telefonda panoya kopyalama
  "veri-disa-aktarma": { android: "farkli-yolla", ios: "farkli-yolla", macos: "farkli-yolla", windows: "farkli-yolla", linux: "farkli-yolla", web: "destekleniyor" },
  // Yerel bildirim: Tauri bildirim eklentisi (Rust); tarayıcıda Notification API
  "bildirim": { android: "destekleniyor", ios: "destekleniyor", macos: "destekleniyor", windows: "destekleniyor", linux: "destekleniyor", web: "farkli-yolla" },
  // Tek seferlik yaklaşık konum: telefonda konum eklentisi (Rust); tarayıcıda Geolocation API; masaüstünde yok
  "konum": { android: "destekleniyor", ios: "destekleniyor", macos: "yok", windows: "yok", linux: "yok", web: "farkli-yolla" },
  // Reddedilen izni açmak için sistem ayarları: Android Kotlin eklentisi, iOS/Windows/macOS ayar adresi; Linux ve tarayıcıda yok
  "sistem-ayarlari": { android: "destekleniyor", ios: "destekleniyor", macos: "destekleniyor", windows: "destekleniyor", linux: "yok", web: "yok" },
};

/** Platformun özel adı; tarayıcı için null (ekran "Tarayıcı" metnini çeviriden alır) */
export function platformAdi(p: Platform = platform()): string | null {
  const adlar: Record<Platform, string | null> = { android: "Android", ios: "iOS", macos: "macOS", windows: "Windows", linux: "Linux", web: null };
  return adlar[p];
}

export const destekYolu = (o: Ozellik, p: Platform = platform()): DestekTuru => DESTEK[o][p];

/** Özellik bu platformda (doğrudan ya da farklı yolla) var mı? "yok" ise arayüzde hiç gösterilmez */
export const destekleniyorMu = (o: Ozellik, p: Platform = platform()): boolean => DESTEK[o][p] !== "yok";

// ---------------------------------------------------------------- komutlar

function hataya(e: unknown): NativeHata {
  if (e instanceof NativeHata) return e;
  if (e instanceof kurallar.KuralHatasi) return new NativeHata(e.hata);
  if (e && typeof e === "object" && "tur" in e) return new NativeHata(e as KomutHatasi); // Rust'tan gelen { tur, ayrinti }
  return new NativeHata({ tur: "ic-hata", ayrinti: String(e) });
}

async function cagir<T>(komut: string, argumanlar: Record<string, unknown>, yedek: () => T | Promise<T>): Promise<T> {
  try {
    return rustIcinde() ? await invoke<T>(komut, argumanlar) : await yedek();
  } catch (e) {
    throw hataya(e);
  }
}

/** Rust: is_emri_uret → UretilenKod; hatalı kategori/tarihte NativeHata */
export const isEmriKoduUret = (kategori: Kategori, zaman: string) =>
  cagir<UretilenKod>("is_emri_uret", { kategori, zaman }, () => {
    const kod = kurallar.kodUret(kategori, zaman);
    return { kod, kategoriKodu: kod.slice(4, 7), tarih: kod.slice(8, 12) };
  });

/** Rust: is_emri_dogrula → her girdide bir durum döner (hata vermez) */
export const isEmriKoduDogrula = (kod: string) =>
  cagir<KodDurumu>("is_emri_dogrula", { kod }, () => kurallar.kodDurumu(kod));

/** Rust: fiyat_hesapla → FiyatDokumu; eksi tutar, ters aralık, geçersiz tarih/aciliyette NativeHata */
export const fiyatHesapla = (girdi: FiyatGirdisi) =>
  cagir<FiyatDokumu>("fiyat_hesapla", { girdi }, () => kurallar.fiyatHesapla(girdi));

// ---------------------------------------------------------------- platforma göre değişen işler

/** Metni panoya kopyalar; başarılıysa true */
export async function panoyaKopyala(metin: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(metin);
    return true;
  } catch {
    // Clipboard API olmayan ya da izin vermeyen WebView: gizli metin alanı + copy komutu
    try {
      const alan = Object.assign(document.createElement("textarea"), { value: metin });
      alan.setAttribute("readonly", "");
      alan.style.position = "fixed";
      alan.style.opacity = "0";
      document.body.append(alan);
      alan.select();
      const tamam = document.execCommand("copy");
      alan.remove();
      return tamam;
    } catch {
      return false;
    }
  }
}

/** Telefon numarasını arar. Yalnız destekleniyorMu("acil-arama") iken çağrılır */
export async function telefonAc(numara: string): Promise<void> {
  const temiz = numara.replace(/[^\d+]/g, "");
  if (!temiz) throw new NativeHata({ tur: "ic-hata", ayrinti: "numara" });
  if (rustIcinde()) {
    // Android / iOS: opener eklentisi sistem çeviricisini açar (izin: capabilities/default.json → opener:default, tel:*)
    await openUrl(`tel:${temiz}`);
  } else {
    window.location.href = `tel:${temiz}`;
  }
}

/** Bu platformda veri dışa aktarmanın yolu — düğme metnini seçmek için (bileşen platform adını sorgulamaz) */
export function veriKayitYolu(p: Platform = platform()): VeriKaydi["yol"] {
  if (p === "web") return "indirme";
  return p === "android" || p === "ios" ? "pano" : "dosya";
}

/** KVKK verilerini dışa aktarır — tarayıcıda indirme, masaüstünde Rust ile dosya, telefonda pano */
export async function verileriKaydet(icerik: string, dosyaAdi: string): Promise<VeriKaydi> {
  if (!rustIcinde()) {
    const adres = URL.createObjectURL(new Blob([icerik], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: adres, download: dosyaAdi }).click();
    setTimeout(() => URL.revokeObjectURL(adres), 1000);
    return { yol: "indirme" };
  }
  try {
    const kayit = await cagir<KaydedilenDosya>("veri_dosyasi_kaydet", { icerik }, () => {
      throw new NativeHata({ tur: "platform-desteklemiyor" });
    });
    return { yol: "dosya", dosya: kayit.yol };
  } catch (e) {
    const h = hataya(e);
    // Android / iOS: Rust komutu bilerek desteklemiyor (cfg(mobile)); aynı içerik panoya kopyalanır
    if (h.hata.tur !== "platform-desteklemiyor") throw h;
    if (!(await panoyaKopyala(icerik))) throw new NativeHata({ tur: "ic-hata", ayrinti: "pano" });
    return { yol: "pano" };
  }
}

/** Hata türünün kullanıcıya gösterilecek metninin anahtarı (ceviriler.ts → hata.*) */
export function hataAnahtari(h: KomutHatasi): Anahtar {
  const anahtarlar: Record<KomutHatasi["tur"], Anahtar> = {
    "bilinmeyen-kategori": "hata.bilinmeyenKategori",
    "gecersiz-tarih": "hata.gecersizTarih",
    "bilinmeyen-aciliyet": "hata.bilinmeyenAciliyet",
    "gecersiz-tutar": "hata.gecersizTutar",
    "aralik-ters": "hata.aralikTers",
    "gecersiz-icerik": "hata.gecersizIcerik",
    "dosya-yazilamadi": "hata.dosyaYazilamadi",
    "platform-desteklemiyor": "hata.platformDesteklemiyor",
    "izin-yok": "hata.izinYok",
    "izin-istenemedi": "hata.izinIstenemedi",
    "konum-servisi-kapali": "hata.konumServisiKapali",
    "konum-okunamadi": "hata.konumOkunamadi",
    "bildirim-gosterilemedi": "hata.bildirimGosterilemedi",
    "ayarlar-acilamadi": "hata.ayarlarAcilamadi",
    "ic-hata": "hata.icHata",
  };
  return anahtarlar[h.tur];
}

// ---------------------------------------------------------------- izinler (docs/izinler.md)
// Tauri içinde Rust komutları (permissions.rs); tarayıcıda aynı durumlar tarayıcının kendi API'lerinden okunur.
// Hiçbir işlev kendiliğinden izin diyaloğu açmaz: diyalog yalnız izinIste() ile, kullanıcı düğmeye bastığında açılır.

const KONUM_SECENEKLERI: PositionOptions = { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 };

async function webBildirimDurumu(): Promise<IzinDurumu> {
  if (typeof Notification === "undefined") return { id: "bildirim", durum: "desteklenmiyor", istenebilir: false };
  const durumlar = { granted: "verildi", denied: "reddedildi", default: "sorulmadi" } as const;
  const p = Notification.permission;
  return { id: "bildirim", durum: durumlar[p] ?? "okunamadi", istenebilir: p === "default" };
}

async function webKonumDurumu(): Promise<IzinDurumu> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return { id: "konum", durum: "desteklenmiyor", istenebilir: false };
  try {
    const { state } = await navigator.permissions.query({ name: "geolocation" });
    const durumlar = { granted: "verildi", denied: "reddedildi", prompt: "sorulmadi" } as const;
    return { id: "konum", durum: durumlar[state] ?? "okunamadi", istenebilir: state === "prompt" };
  } catch {
    // Permissions API'si olmayan tarayıcı: durum bilinmez, ama konum isteğiyle sorulabilir
    return { id: "konum", durum: "okunamadi", istenebilir: true };
  }
}

function webKonumHatasi(e: GeolocationPositionError): NativeHata {
  if (e.code === e.PERMISSION_DENIED) return new NativeHata({ tur: "izin-yok" });
  return new NativeHata({ tur: "konum-okunamadi", ayrinti: e.message });
}

function webKonumOku(): Promise<KonumOkumasi> {
  return new Promise((coz, reddet) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => coz({ enlem: coords.latitude, boylam: coords.longitude, dogrulukM: coords.accuracy }),
      (e) => reddet(webKonumHatasi(e)),
      KONUM_SECENEKLERI,
    ),
  );
}

const webIzinleri = () => Promise.all([webBildirimDurumu(), webKonumDurumu()]);

/** Rust: permissions_status → izinlerin anlık durumu; asla diyalog açmaz */
export const izinDurumu = () => cagir<IzinDurumu[]>("permissions_status", {}, webIzinleri);

/** Rust: permission_request → izin için sistem diyaloğunu açar, güncel durumları döner. Yalnız kullanıcı eylemiyle çağrılır */
export const izinIste = (id: IzinKimligi) =>
  cagir<IzinDurumu[]>("permission_request", { id }, async () => {
    if (id === "bildirim") {
      if (typeof Notification === "undefined") throw new NativeHata({ tur: "platform-desteklemiyor" });
      await Notification.requestPermission();
    } else {
      // Tarayıcıda konum izni ayrı sorulamaz; sorulması için bir okuma başlatılır, sonuç kullanılmadan atılır
      await webKonumOku().catch(() => undefined); // izin sonucu aşağıda durumdan okunur
    }
    return webIzinleri();
  });

/** Rust: bildirim_gonder → yerel bildirim (push değil). İzin yoksa diyalog açmaz, "izin-yok" hatası verir */
export const bildirimGoster = (baslik: string, govde: string) =>
  cagir<void>("bildirim_gonder", { baslik, govde }, () => {
    if (typeof Notification === "undefined") throw new NativeHata({ tur: "platform-desteklemiyor" });
    if (Notification.permission !== "granted") throw new NativeHata({ tur: "izin-yok" });
    try {
      new Notification(baslik, { body: govde, icon: "/favicon.png" });
    } catch (e) {
      // Android Chrome sayfadan doğrudan bildirimi yasaklar (service worker ister)
      throw new NativeHata({ tur: "bildirim-gosterilemedi", ayrinti: String(e) });
    }
  });

/** Rust: konum_oku → yaklaşık konum, bir kez. İzin yoksa "izin-yok"; konum servisi kapalıysa "konum-servisi-kapali" */
export const konumOku = () => cagir<KonumOkumasi>("konum_oku", {}, webKonumOku);

/** Rust: sistem_ayarlarini_ac → uygulamanın ayar sayfası (telefon) ya da bildirim ayarları (Windows/macOS).
 *  Yalnız destekleniyorMu("sistem-ayarlari") iken çağrılır */
export const sistemAyarlariniAc = () =>
  cagir<void>("sistem_ayarlarini_ac", {}, () => {
    throw new NativeHata({ tur: "platform-desteklemiyor" });
  });
