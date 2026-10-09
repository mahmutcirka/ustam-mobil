use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

// Ustam iş kuralları — iş emri kodu, kod doğrulama ve fiyat hesabı.
// Aynı kurallar tarayıcı için src/lib/kurallar.ts içinde de vardır; ikisi
// test-vektorleri.json'daki ortak örneklerle test edilir (cargo test / bun test).

// Karışan karakterler (0/O, 1/I) kullanılmaz
const ALFABE: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const ACIL_UCRET: u32 = 150;
const GECE_ORANI: f64 = 0.25; // 22:00–07:59 arası çıkış ücretine eklenir
const PAZAR_ORANI: f64 = 0.15; // Pazar günü çıkış ücretine eklenir

// Aynı nanosaniyede gelen iki çağrının aynı kodu almaması için sayaç
static SAYAC: AtomicU64 = AtomicU64::new(0);

fn kategori_kodu(kategori: &str) -> Option<&'static str> {
    match kategori {
        "tesisat" => Some("TES"),
        "elektrik" => Some("ELK"),
        "cilingir" => Some("CLN"),
        "kombi" => Some("KMB"),
        "beyaz-esya" => Some("BYZ"),
        _ => None,
    }
}

// "2026-10-12T14:30" → (2026, 10, 12, 14, 30)
fn zaman_coz(zaman: &str) -> Option<(i32, u32, u32, u32, u32)> {
    let yil: i32 = zaman.get(0..4)?.parse().ok()?;
    let ay: u32 = zaman.get(5..7)?.parse().ok()?;
    let gun: u32 = zaman.get(8..10)?.parse().ok()?;
    let saat: u32 = zaman.get(11..13).and_then(|s| s.parse().ok()).unwrap_or(12);
    let dakika: u32 = zaman.get(14..16).and_then(|s| s.parse().ok()).unwrap_or(0);
    let gecerli = (1..=12).contains(&ay) && (1..=31).contains(&gun) && saat < 24 && dakika < 60;
    gecerli.then_some((yil, ay, gun, saat, dakika))
}

// Sakamoto algoritması — 0 = Pazar, 6 = Cumartesi
fn haftanin_gunu(yil: i32, ay: u32, gun: u32) -> u32 {
    const T: [i32; 12] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let y = if ay < 3 { yil - 1 } else { yil };
    ((y + y / 4 - y / 100 + y / 400 + T[(ay - 1) as usize] + gun as i32).rem_euclid(7)) as u32
}

// Karakter değeri: 32'lik alfabedeki sırası; alfabede olmayan (tarihteki 0/1) için base-36 değeri
fn karakter_degeri(c: char) -> u32 {
    ALFABE
        .iter()
        .position(|&b| b as char == c)
        .map(|i| i as u32)
        .unwrap_or_else(|| c.to_digit(36).unwrap_or(0))
}

// Ağırlıklı toplam (tek sayı ağırlıklar 1, 3, 5, … × değer) mod 32 → tek karakter.
// Tek ağırlıklar 32 ile aralarında asal olduğundan alfabe içindeki her tek karakter hatası kesin yakalanır;
// yan yana yer değiştirmelerin de çoğu yakalanır.
fn kontrol_karakteri(govde: &str) -> char {
    let toplam: u32 = govde
        .chars()
        .enumerate()
        .map(|(i, c)| (2 * i as u32 + 1) * karakter_degeri(c))
        .sum();
    ALFABE[(toplam % ALFABE.len() as u32) as usize] as char
}

// xorshift64* — harici crate gerektirmeyen basit sözde rastgele üreteç
fn rastgele_ek(tohum: u64, uzunluk: usize) -> String {
    let mut x = tohum | 1;
    (0..uzunluk)
        .map(|_| {
            x ^= x >> 12;
            x ^= x << 25;
            x ^= x >> 27;
            let n = x.wrapping_mul(0x2545_F491_4F6C_DD1D);
            ALFABE[(n >> 59) as usize % ALFABE.len()] as char
        })
        .collect()
}

// Komutların tipli hatası — ön yüze { "tur": "gecersiz-tutar", "ayrinti": "cikisUcreti" } biçiminde gider.
// TypeScript karşılığı: src/lib/types/native.ts (KomutHatasi). Düz metin hata döndürülmez; geçersiz girdide panik yok.
#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "tur", content = "ayrinti", rename_all = "kebab-case")]
enum KomutHatasi {
    /// Kategori tanınmıyor (ayrıntı: gelen değer)
    BilinmeyenKategori(String),
    /// Tarih "YYYY-MM-DDTHH:mm" biçiminde değil ya da geçersiz (ayrıntı: gelen değer)
    GecersizTarih(String),
    /// Aciliyet hemen / bugun / randevu değil (ayrıntı: gelen değer)
    BilinmeyenAciliyet(String),
    /// Tutar eksi ya da üst sınırın üstünde (ayrıntı: alan adı)
    GecersizTutar(String),
    /// İşçilik alt sınırı üst sınırdan büyük
    AralikTers,
    /// İçerik boş ya da çok büyük
    GecersizIcerik,
    /// Dosya yazılamadı (ayrıntı: işletim sisteminin mesajı)
    DosyaYazilamadi(String),
    /// Bu komut bu platformda yok (ör. mobilde dosyaya kaydetme)
    PlatformDesteklemiyor,
}

// Tutarlar için makul üst sınır (TL); taşmayı ve yazım hatalarını engeller
const UST_TUTAR: i64 = 1_000_000;

/// is_emri_uret sonucu
#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct UretilenKod {
    /// UST-ELK-1210-K7QZ
    kod: String,
    /// 3 harfli kategori kodu (ELK)
    kategori_kodu: String,
    /// Ziyaret günü ve ayı, GGAA (1210)
    tarih: String,
}

// UST-ELK-1210-K7Q + kontrol karakteri → UST-ELK-1210-K7QZ
fn kod_olustur(kategori: &str, zaman: &str, tohum: u64) -> Result<UretilenKod, KomutHatasi> {
    let kat = kategori_kodu(kategori).ok_or_else(|| KomutHatasi::BilinmeyenKategori(kategori.to_string()))?;
    let (_, ay, gun, _, _) = zaman_coz(zaman).ok_or_else(|| KomutHatasi::GecersizTarih(zaman.to_string()))?;
    let tarih = format!("{gun:02}{ay:02}");
    let ek = rastgele_ek(tohum, 3);
    let kontrol = kontrol_karakteri(&format!("{kat}{tarih}{ek}"));
    Ok(UretilenKod { kod: format!("UST-{kat}-{tarih}-{ek}{kontrol}"), kategori_kodu: kat.to_string(), tarih })
}

#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
enum KodDurumu {
    Gecerli,
    BicimHatali,
    KontrolHatali,
}

fn kod_durumu(kod: &str) -> KodDurumu {
    let kod = kod.trim().to_uppercase();
    let kod = kod.as_str();
    let p: Vec<&str> = kod.split('-').collect();
    // ASCII dışı karakter, aşağıdaki bayt dilimlemesinde panik yaratabilir
    if !kod.is_ascii() || p.len() != 4 || p[0] != "UST" {
        return KodDurumu::BicimHatali;
    }
    let kat_gecerli = ["TES", "ELK", "CLN", "KMB", "BYZ"].contains(&p[1]);
    let tarih_gecerli =
        p[2].len() == 4 && zaman_coz(&format!("2000-{}-{}", &p[2][2..], &p[2][..2])).is_some();
    let ek_gecerli = p[3].len() == 4 && p[3].bytes().all(|b| ALFABE.contains(&b));
    if !(kat_gecerli && tarih_gecerli && ek_gecerli) {
        return KodDurumu::BicimHatali;
    }
    let beklenen = kontrol_karakteri(&format!("{}{}{}", p[1], p[2], &p[3][..3]));
    if p[3].ends_with(beklenen) {
        KodDurumu::Gecerli
    } else {
        KodDurumu::KontrolHatali
    }
}

// Tutarlar i64: eksi sayı da gelebilsin ve tipli hatayla reddedilsin (u32 olsaydı serde düz metin hata verirdi)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FiyatGirdisi {
    cikis_ucreti: i64,
    aciliyet: String,
    zaman: String,
    iscilik_min: i64,
    iscilik_max: i64,
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FiyatDokumu {
    cikis: u32,
    acil: u32,
    gece: u32,
    pazar: u32,
    iscilik_min: u32,
    iscilik_max: u32,
    toplam_min: u32,
    toplam_max: u32,
}

fn tutar(ad: &str, deger: i64) -> Result<u32, KomutHatasi> {
    if (0..=UST_TUTAR).contains(&deger) {
        Ok(deger as u32)
    } else {
        Err(KomutHatasi::GecersizTutar(ad.to_string()))
    }
}

// Denetim sırası TS ile aynıdır (kurallar.ts fiyatGirdisiDenetle): tarih → aciliyet → tutarlar → aralık
fn fiyat_dokumu(g: &FiyatGirdisi) -> Result<FiyatDokumu, KomutHatasi> {
    let (yil, ay, gun, saat, _) = zaman_coz(&g.zaman).ok_or_else(|| KomutHatasi::GecersizTarih(g.zaman.clone()))?;
    let acil = match g.aciliyet.as_str() {
        "hemen" => ACIL_UCRET,
        "bugun" | "randevu" => 0,
        diger => return Err(KomutHatasi::BilinmeyenAciliyet(diger.to_string())),
    };
    let cikis = tutar("cikisUcreti", g.cikis_ucreti)?;
    let iscilik_min = tutar("iscilikMin", g.iscilik_min)?;
    let iscilik_max = tutar("iscilikMax", g.iscilik_max)?;
    if iscilik_min > iscilik_max {
        return Err(KomutHatasi::AralikTers);
    }
    let oran = |o: f64| (cikis as f64 * o).round() as u32;
    let gece = if saat >= 22 || saat < 8 { oran(GECE_ORANI) } else { 0 };
    let pazar = if haftanin_gunu(yil, ay, gun) == 0 { oran(PAZAR_ORANI) } else { 0 };
    let sabit = cikis + acil + gece + pazar;
    Ok(FiyatDokumu {
        cikis,
        acil,
        gece,
        pazar,
        iscilik_min,
        iscilik_max,
        toplam_min: sabit + iscilik_min,
        toplam_max: sabit + iscilik_max,
    })
}

/// veri_dosyasi_kaydet sonucu
#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct KaydedilenDosya {
    /// Dosyanın tam yolu (ör. C:\Users\…\Downloads\ustam-verilerim.json)
    yol: String,
}

const EN_BUYUK_ICERIK: usize = 5 * 1024 * 1024; // 5 MB

// Klasörde olmayan ilk ad: ustam-verilerim.json, ustam-verilerim-2.json, …
#[cfg_attr(mobile, allow(dead_code))]
fn bos_dosya_yolu(klasor: &std::path::Path, ad: &str, uzanti: &str) -> std::path::PathBuf {
    let ilk = klasor.join(format!("{ad}.{uzanti}"));
    if !ilk.exists() {
        return ilk;
    }
    (2..)
        .map(|n| klasor.join(format!("{ad}-{n}.{uzanti}")))
        .find(|yol| !yol.exists())
        .expect("sınırsız aralıkta boş ad bulunur")
}

fn icerik_denetle(icerik: &str) -> Result<(), KomutHatasi> {
    if icerik.trim().is_empty() || icerik.len() > EN_BUYUK_ICERIK {
        Err(KomutHatasi::GecersizIcerik)
    } else {
        Ok(())
    }
}

// Ön yüz invoke("is_emri_uret", { kategori, zaman }) ile çağırır → { kod, kategoriKodu, tarih }
#[tauri::command]
fn is_emri_uret(kategori: String, zaman: String) -> Result<UretilenKod, KomutHatasi> {
    // Sistem saati 1970 öncesini gösterirse tohum 0 olur; sayaç yine farklı kod üretir (panik yok)
    let nano = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos() as u64).unwrap_or(0);
    let tohum = nano ^ SAYAC.fetch_add(1, Ordering::Relaxed).wrapping_mul(0x9E37_79B9_7F4A_7C15);
    kod_olustur(&kategori, &zaman, tohum)
}

// Kapıdaki ustanın söylediği kod: "gecerli" | "bicim-hatali" | "kontrol-hatali" (her girdide sonuç döner)
#[tauri::command]
fn is_emri_dogrula(kod: String) -> KodDurumu {
    kod_durumu(&kod)
}

// invoke("fiyat_hesapla", { girdi: { cikisUcreti, aciliyet, zaman, iscilikMin, iscilikMax } })
#[tauri::command]
fn fiyat_hesapla(girdi: FiyatGirdisi) -> Result<FiyatDokumu, KomutHatasi> {
    fiyat_dokumu(&girdi)
}

// KVKK veri dışa aktarma — platforma göre farklı yol (docs/platform-destegi.md):
// masaüstünde (Windows, macOS, Linux) kullanıcının İndirilenler klasörüne JSON yazar;
// mobilde (Android, iOS) uygulama ortak klasörlere yazamadığı için PlatformDesteklemiyor döner ve
// ön yüz aynı içeriği panoya kopyalar (src/lib/native.ts → verileriKaydet).
#[tauri::command]
fn veri_dosyasi_kaydet(app: tauri::AppHandle, icerik: String) -> Result<KaydedilenDosya, KomutHatasi> {
    icerik_denetle(&icerik)?;
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let klasor = app.path().download_dir().map_err(|e| KomutHatasi::DosyaYazilamadi(e.to_string()))?;
        let yol = bos_dosya_yolu(&klasor, "ustam-verilerim", "json");
        std::fs::write(&yol, icerik).map_err(|e| KomutHatasi::DosyaYazilamadi(e.to_string()))?;
        Ok(KaydedilenDosya { yol: yol.display().to_string() })
    }
    #[cfg(mobile)]
    {
        let _ = app;
        Err(KomutHatasi::PlatformDesteklemiyor)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![is_emri_uret, is_emri_dogrula, fiyat_hesapla, veri_dosyasi_kaydet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod testler {
    use super::*;
    use serde_json::{json, Value};

    // Rust ve TypeScript'in birlikte doğrulandığı ortak örnekler
    const VEKTORLER: &str = include_str!("../test-vektorleri.json");

    fn vektorler() -> Value {
        serde_json::from_str(VEKTORLER).expect("test-vektorleri.json okunamadı")
    }

    #[test]
    fn ortak_kontrol_karakterleri() {
        for v in vektorler()["kontrolKarakteri"].as_array().unwrap() {
            let govde = v["govde"].as_str().unwrap();
            assert_eq!(kontrol_karakteri(govde).to_string(), v["beklenen"].as_str().unwrap(), "{govde}");
        }
    }

    #[test]
    fn ortak_kod_durumlari() {
        for v in vektorler()["kodDurumu"].as_array().unwrap() {
            let kod = v["kod"].as_str().unwrap();
            let durum = serde_json::to_value(kod_durumu(kod)).unwrap();
            assert_eq!(durum, v["durum"], "{kod}");
        }
    }

    #[test]
    fn ortak_haftanin_gunleri() {
        for v in vektorler()["haftaninGunu"].as_array().unwrap() {
            let tarih = v["tarih"].as_str().unwrap();
            let (y, a, g, _, _) = zaman_coz(tarih).unwrap();
            assert_eq!(haftanin_gunu(y, a, g), v["gun"].as_u64().unwrap() as u32, "{tarih}");
        }
    }

    #[test]
    fn ortak_fiyat_dokumleri() {
        for v in vektorler()["fiyat"].as_array().unwrap() {
            let girdi: FiyatGirdisi = serde_json::from_value(v["girdi"].clone()).unwrap();
            let beklenen: FiyatDokumu = serde_json::from_value(v["beklenen"].clone()).unwrap();
            assert_eq!(fiyat_dokumu(&girdi).unwrap(), beklenen, "{}", v["aciklama"]);
        }
    }

    // Hatalı girdide panik yok; ön yüze giden JSON ({ tur, ayrinti }) ortak örneklerle aynı
    #[test]
    fn ortak_fiyat_hatalari_tipli_doner() {
        for v in vektorler()["fiyatHatalari"].as_array().unwrap() {
            let girdi: FiyatGirdisi = serde_json::from_value(v["girdi"].clone()).unwrap();
            let hata = fiyat_dokumu(&girdi).expect_err(v["aciklama"].as_str().unwrap());
            assert_eq!(serde_json::to_value(hata).unwrap(), v["hata"], "{}", v["aciklama"]);
        }
    }

    #[test]
    fn ortak_kod_uretim_hatalari_tipli_doner() {
        for v in vektorler()["kodHatalari"].as_array().unwrap() {
            let hata = kod_olustur(v["kategori"].as_str().unwrap(), v["zaman"].as_str().unwrap(), 1).unwrap_err();
            assert_eq!(serde_json::to_value(hata).unwrap(), v["hata"]);
        }
    }

    #[test]
    fn uretilen_kod_alanlari_tutarli() {
        let k = kod_olustur("elektrik", "2026-10-12T14:30", 7).unwrap();
        assert_eq!(k.kategori_kodu, "ELK");
        assert_eq!(k.tarih, "1210");
        assert!(k.kod.starts_with("UST-ELK-1210-"));
        let json = serde_json::to_value(&k).unwrap();
        assert_eq!(json["kategoriKodu"], "ELK");
        assert_eq!(json["kod"], k.kod.as_str());
    }

    #[test]
    fn uretilen_kodlar_kendi_dogrulamasindan_gecer() {
        for k in ["tesisat", "elektrik", "cilingir", "kombi", "beyaz-esya"] {
            for tohum in 1..50 {
                let kod = kod_olustur(k, "2026-01-05T09:00", tohum).unwrap().kod;
                assert_eq!(kod_durumu(&kod), KodDurumu::Gecerli, "{kod}");
            }
        }
    }

    #[test]
    fn rastgele_kisimdaki_her_tek_karakter_hatasi_yakalanir() {
        for tohum in 1..40 {
            let kod = kod_olustur("kombi", "2026-10-12T14:30", tohum).unwrap().kod;
            for konum in kod.len() - 4..kod.len() {
                for &yeni in ALFABE {
                    if kod.as_bytes()[konum] == yeni {
                        continue;
                    }
                    let mut bayt = kod.clone().into_bytes();
                    bayt[konum] = yeni;
                    let bozuk = String::from_utf8(bayt).unwrap();
                    assert_ne!(kod_durumu(&bozuk), KodDurumu::Gecerli, "{kod} → {bozuk}");
                }
            }
        }
    }

    #[test]
    fn tek_karakter_hatasi_yakalanir() {
        let kod = kod_olustur("elektrik", "2026-10-12T14:30", 42).unwrap().kod;
        let mut bayt = kod.into_bytes();
        let son = bayt.len() - 2; // rastgele kısmın bir karakterini değiştir
        bayt[son] = if bayt[son] == b'A' { b'B' } else { b'A' };
        assert_ne!(kod_durumu(std::str::from_utf8(&bayt).unwrap()), KodDurumu::Gecerli);
    }

    #[test]
    fn hatali_girdiler_reddedilir() {
        assert_eq!(kod_olustur("boyaci", "2026-10-12T14:30", 1), Err(KomutHatasi::BilinmeyenKategori("boyaci".into())));
        assert!(matches!(kod_olustur("kombi", "2026-13-40T14:30", 1), Err(KomutHatasi::GecersizTarih(_))));
        assert_eq!(kod_durumu("UST-ELK-1210-ÜÜ"), KodDurumu::BicimHatali);
        assert_eq!(kod_durumu(""), KodDurumu::BicimHatali);
    }

    #[test]
    fn hata_json_bicimi() {
        assert_eq!(serde_json::to_value(KomutHatasi::AralikTers).unwrap(), json!({ "tur": "aralik-ters" }));
        assert_eq!(serde_json::to_value(KomutHatasi::PlatformDesteklemiyor).unwrap(), json!({ "tur": "platform-desteklemiyor" }));
        assert_eq!(
            serde_json::to_value(KomutHatasi::GecersizTutar("cikisUcreti".into())).unwrap(),
            json!({ "tur": "gecersiz-tutar", "ayrinti": "cikisUcreti" })
        );
    }

    #[test]
    fn veri_icerigi_ve_dosya_adi() {
        assert_eq!(icerik_denetle("   "), Err(KomutHatasi::GecersizIcerik));
        assert_eq!(icerik_denetle(&"x".repeat(EN_BUYUK_ICERIK + 1)), Err(KomutHatasi::GecersizIcerik));
        assert_eq!(icerik_denetle("{\"uygulama\":\"Ustam\"}"), Ok(()));

        let klasor = std::env::temp_dir().join(format!("ustam-test-{}", std::process::id()));
        std::fs::create_dir_all(&klasor).unwrap();
        let ilk = bos_dosya_yolu(&klasor, "ustam-verilerim", "json");
        assert!(ilk.ends_with("ustam-verilerim.json"));
        std::fs::write(&ilk, "{}").unwrap();
        let ikinci = bos_dosya_yolu(&klasor, "ustam-verilerim", "json");
        assert!(ikinci.ends_with("ustam-verilerim-2.json"), "üzerine yazılmaz: {}", ikinci.display());
        std::fs::remove_dir_all(&klasor).unwrap();
    }
}
