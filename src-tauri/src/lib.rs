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

// UST-ELK-1210-K7Q + kontrol karakteri → UST-ELK-1210-K7QX
fn kod_olustur(kategori: &str, zaman: &str, tohum: u64) -> Result<String, String> {
    let kat = kategori_kodu(kategori).ok_or_else(|| format!("bilinmeyen kategori: {kategori}"))?;
    let (_, ay, gun, _, _) = zaman_coz(zaman).ok_or_else(|| format!("geçersiz tarih: {zaman}"))?;
    let tarih = format!("{gun:02}{ay:02}");
    let ek = rastgele_ek(tohum, 3);
    let kontrol = kontrol_karakteri(&format!("{kat}{tarih}{ek}"));
    Ok(format!("UST-{kat}-{tarih}-{ek}{kontrol}"))
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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FiyatGirdisi {
    cikis_ucreti: u32,
    aciliyet: String,
    zaman: String,
    iscilik_min: u32,
    iscilik_max: u32,
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

fn fiyat_dokumu(g: &FiyatGirdisi) -> Result<FiyatDokumu, String> {
    let (yil, ay, gun, saat, _) = zaman_coz(&g.zaman).ok_or_else(|| format!("geçersiz tarih: {}", g.zaman))?;
    let oran = |o: f64| (g.cikis_ucreti as f64 * o).round() as u32;
    let acil = if g.aciliyet == "hemen" { ACIL_UCRET } else { 0 };
    let gece = if saat >= 22 || saat < 8 { oran(GECE_ORANI) } else { 0 };
    let pazar = if haftanin_gunu(yil, ay, gun) == 0 { oran(PAZAR_ORANI) } else { 0 };
    let sabit = g.cikis_ucreti + acil + gece + pazar;
    Ok(FiyatDokumu {
        cikis: g.cikis_ucreti,
        acil,
        gece,
        pazar,
        iscilik_min: g.iscilik_min,
        iscilik_max: g.iscilik_max,
        toplam_min: sabit + g.iscilik_min,
        toplam_max: sabit + g.iscilik_max,
    })
}

// Ön yüz invoke("is_emri_uret", { kategori, zaman }) ile çağırır → "UST-ELK-1210-K7QX"
#[tauri::command]
fn is_emri_uret(kategori: String, zaman: String) -> Result<String, String> {
    let nano = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos() as u64;
    let tohum = nano ^ SAYAC.fetch_add(1, Ordering::Relaxed).wrapping_mul(0x9E37_79B9_7F4A_7C15);
    kod_olustur(&kategori, &zaman, tohum)
}

// Kapıdaki ustanın söylediği kod: "gecerli" | "bicim-hatali" | "kontrol-hatali"
#[tauri::command]
fn is_emri_dogrula(kod: String) -> KodDurumu {
    kod_durumu(&kod)
}

// invoke("fiyat_hesapla", { girdi: { cikisUcreti, aciliyet, zaman, iscilikMin, iscilikMax } })
#[tauri::command]
fn fiyat_hesapla(girdi: FiyatGirdisi) -> Result<FiyatDokumu, String> {
    fiyat_dokumu(&girdi)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![is_emri_uret, is_emri_dogrula, fiyat_hesapla])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod testler {
    use super::*;
    use serde_json::Value;

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

    #[test]
    fn uretilen_kodlar_kendi_dogrulamasindan_gecer() {
        for k in ["tesisat", "elektrik", "cilingir", "kombi", "beyaz-esya"] {
            for tohum in 1..50 {
                let kod = kod_olustur(k, "2026-01-05T09:00", tohum).unwrap();
                assert_eq!(kod_durumu(&kod), KodDurumu::Gecerli, "{kod}");
            }
        }
    }

    #[test]
    fn rastgele_kisimdaki_her_tek_karakter_hatasi_yakalanir() {
        for tohum in 1..40 {
            let kod = kod_olustur("kombi", "2026-10-12T14:30", tohum).unwrap();
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
        let kod = kod_olustur("elektrik", "2026-10-12T14:30", 42).unwrap();
        let mut bayt = kod.into_bytes();
        let son = bayt.len() - 2; // rastgele kısmın bir karakterini değiştir
        bayt[son] = if bayt[son] == b'A' { b'B' } else { b'A' };
        assert_ne!(kod_durumu(std::str::from_utf8(&bayt).unwrap()), KodDurumu::Gecerli);
    }

    #[test]
    fn hatali_girdiler_reddedilir() {
        assert!(kod_olustur("boyaci", "2026-10-12T14:30", 1).is_err());
        assert!(kod_olustur("kombi", "2026-13-40T14:30", 1).is_err());
        assert_eq!(kod_durumu("UST-ELK-1210-ÜÜ"), KodDurumu::BicimHatali);
    }
}
