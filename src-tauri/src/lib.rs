use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

// Karışan karakterler (0/O, 1/I) kullanılmaz — ön yüzdeki KOD_DESENI ile aynı alfabe
const ALFABE: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

// "2026-10-12T14:30" → "1210" (gün + ay)
fn gun_ay(zaman: &str) -> Option<String> {
    let ay: u32 = zaman.get(5..7)?.parse().ok()?;
    let gun: u32 = zaman.get(8..10)?.parse().ok()?;
    if !(1..=12).contains(&ay) || !(1..=31).contains(&gun) {
        return None;
    }
    Some(format!("{:02}{:02}", gun, ay))
}

// xorshift64* — harici crate gerektirmeyen basit sözde rastgele üreteç
fn rastgele_ek(tohum: u64) -> String {
    let mut x = tohum | 1;
    (0..4)
        .map(|_| {
            x ^= x >> 12;
            x ^= x << 25;
            x ^= x >> 27;
            let n = x.wrapping_mul(0x2545_F491_4F6C_DD1D);
            ALFABE[(n >> 59) as usize % ALFABE.len()] as char
        })
        .collect()
}

fn kod_olustur(kategori: &str, zaman: &str, tohum: u64) -> Result<String, String> {
    let kat = kategori_kodu(kategori).ok_or_else(|| format!("bilinmeyen kategori: {kategori}"))?;
    let tarih = gun_ay(zaman).ok_or_else(|| format!("geçersiz tarih: {zaman}"))?;
    Ok(format!("UST-{kat}-{tarih}-{}", rastgele_ek(tohum)))
}

fn bicim_gecerli(kod: &str) -> bool {
    let parcalar: Vec<&str> = kod.split('-').collect();
    // ASCII dışı karakter, aşağıdaki bayt dilimlemesinde panik yaratabilir
    if !kod.is_ascii() || parcalar.len() != 4 || parcalar[0] != "UST" {
        return false;
    }
    let kat_gecerli = ["TES", "ELK", "CLN", "KMB", "BYZ"].contains(&parcalar[1]);
    let tarih_gecerli = parcalar[2].len() == 4
        && gun_ay(&format!("2000-{}-{}", &parcalar[2][2..], &parcalar[2][..2])).is_some();
    let ek_gecerli = parcalar[3].len() == 4 && parcalar[3].bytes().all(|b| ALFABE.contains(&b));
    kat_gecerli && tarih_gecerli && ek_gecerli
}

// Ön yüz invoke("is_emri_uret", { kategori, zaman }) ile çağırır → "UST-ELK-1210-K7Q4"
#[tauri::command]
fn is_emri_uret(kategori: String, zaman: String) -> Result<String, String> {
    let nano = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos() as u64;
    let tohum = nano ^ SAYAC.fetch_add(1, Ordering::Relaxed).wrapping_mul(0x9E37_79B9_7F4A_7C15);
    kod_olustur(&kategori, &zaman, tohum)
}

// Kapıdaki ustanın söylediği kodun biçimini doğrular
#[tauri::command]
fn is_emri_dogrula(kod: String) -> bool {
    bicim_gecerli(kod.trim())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![is_emri_uret, is_emri_dogrula])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod testler {
    use super::*;

    #[test]
    fn kod_bicimi_dogru() {
        let kod = kod_olustur("elektrik", "2026-10-12T14:30", 42).unwrap();
        assert!(kod.starts_with("UST-ELK-1210-"), "{kod}");
        assert!(bicim_gecerli(&kod), "{kod}");
    }

    #[test]
    fn tum_kategoriler_gecerli_kod_uretir() {
        for k in ["tesisat", "elektrik", "cilingir", "kombi", "beyaz-esya"] {
            assert!(bicim_gecerli(&kod_olustur(k, "2026-01-05T09:00", 7).unwrap()));
        }
    }

    #[test]
    fn hatali_girdiler_reddedilir() {
        assert!(kod_olustur("boyaci", "2026-10-12T14:30", 1).is_err());
        assert!(kod_olustur("kombi", "2026-13-40T14:30", 1).is_err());
        assert!(!bicim_gecerli("PSK-001-ABCDEFG"));
        assert!(!bicim_gecerli("UST-ELK-1210-K0Q4")); // 0 alfabede yok
        assert!(!bicim_gecerli("UST-ELK-3213-K7Q4")); // 13. ay yok
    }

    #[test]
    fn farkli_tohumlar_farkli_kod() {
        let a = kod_olustur("tesisat", "2026-10-12T14:30", 1).unwrap();
        let b = kod_olustur("tesisat", "2026-10-12T14:30", 2).unwrap();
        assert_ne!(a, b);
    }
}
