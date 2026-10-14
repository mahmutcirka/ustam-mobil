//! Ustam iş işlevleri: iş emri kodu (kontrol karakterli), fiyat dökümü, iş emri yaşam döngüsü, yorum, panel özeti.
//! Kod ve fiyat formülleri `src-tauri/src/lib.rs` ve `src/lib/kurallar.ts` ile aynıdır; fark: fiyat sabitleri
//! (acil ücret, gece/pazar oranı) `fiyat_kurallari` tablosundan gelir, böylece yönetim panelinden değiştirilebilir.
use crate::backend::audit;
use crate::backend::crud;
use crate::backend::error::{AppError, AppResult, FieldError};
use crate::backend::policy::authorize;
use crate::backend::rbac::{self, ModelRef};
use crate::backend::schema;
use crate::backend::state::AppState;
use crate::backend::util::{now_iso, random_from, NOW_SQL};
use rusqlite::{params, Connection, OptionalExtension};
use serde_json::{json, Value};
use tauri::State;

pub const ALFABE: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
pub const KATEGORILER: [(&str, &str); 5] = [("tesisat", "TES"), ("elektrik", "ELK"), ("cilingir", "CLN"), ("kombi", "KMB"), ("beyaz-esya", "BYZ")];

/// Stilize İstanbul haritasında semt merkezleri (100×110 birim).
pub const SEMTLER: [(&str, f64, f64); 12] = [
    ("Sarıyer", 57.0, 14.0), ("Beşiktaş", 51.0, 50.0), ("Şişli", 42.0, 46.0), ("Beyoğlu", 44.0, 60.0), ("Fatih", 33.0, 70.0), ("Bakırköy", 14.0, 80.0),
    ("Beykoz", 78.0, 26.0), ("Üsküdar", 63.0, 60.0), ("Kadıköy", 60.0, 79.0), ("Ataşehir", 76.0, 70.0), ("Maltepe", 80.0, 88.0), ("Kartal", 92.0, 95.0),
];

#[derive(Debug, Clone)]
pub struct Kural {
    pub acil_ucret: f64,
    pub gece_orani: f64,
    pub pazar_orani: f64,
}

pub fn kategori_kodu(kategori: &str) -> Option<&'static str> {
    KATEGORILER.iter().find(|(k, _)| *k == kategori).map(|(_, c)| *c)
}

fn karakter_degeri(c: char) -> u32 {
    match ALFABE.iter().position(|a| *a as char == c) {
        Some(i) => i as u32,
        None => c.to_digit(36).unwrap_or(0),
    }
}

/// Tek sayı ağırlıklar (1, 3, 5, …) toplamının mod 32 değeri.
pub fn kontrol_karakteri(govde: &str) -> char {
    let toplam: u32 = govde.chars().enumerate().map(|(i, c)| (2 * i as u32 + 1) * karakter_degeri(c)).sum();
    ALFABE[(toplam % ALFABE.len() as u32) as usize] as char
}

/// `YYYY-MM-DDTHH:mm` → (yıl, ay, gün, saat, dakika)
pub fn zaman_coz(z: &str) -> Option<(i32, u32, u32, u32, u32)> {
    let yil = z.get(0..4)?.parse::<i32>().ok()?;
    let ay = z.get(5..7)?.parse::<u32>().ok()?;
    let gun = z.get(8..10)?.parse::<u32>().ok()?;
    let saat = z.get(11..13).and_then(|s| s.parse::<u32>().ok()).unwrap_or(12);
    let dk = z.get(14..16).and_then(|s| s.parse::<u32>().ok()).unwrap_or(0);
    if (1..=12).contains(&ay) && (1..=31).contains(&gun) && saat < 24 && dk < 60 { Some((yil, ay, gun, saat, dk)) } else { None }
}

/// Sakamoto algoritması; 0 = Pazar
pub fn haftanin_gunu(yil: i32, ay: u32, gun: u32) -> u32 {
    const T: [i32; 12] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let y = if ay < 3 { yil - 1 } else { yil };
    ((y + y / 4 - y / 100 + y / 400 + T[(ay - 1) as usize] + gun as i32).rem_euclid(7)) as u32
}

pub fn kod_uret(kategori: &str, zaman: &str) -> AppResult<String> {
    let kat = kategori_kodu(kategori).ok_or_else(|| AppError::validation("kategori", "Kategori tanınmıyor."))?;
    let (_, ay, gun, _, _) = zaman_coz(zaman).ok_or_else(|| AppError::validation("zaman", "Tarih YYYY-MM-DDTHH:mm biçiminde olmalı."))?;
    let tarih = format!("{gun:02}{ay:02}");
    let ek = random_from(ALFABE, 3);
    Ok(format!("UST-{kat}-{tarih}-{ek}{}", kontrol_karakteri(&format!("{kat}{tarih}{ek}"))))
}

/// `gecerli` / `bicim-hatali` / `kontrol-hatali`
pub fn kod_durumu(ham: &str) -> &'static str {
    let kod = ham.trim().to_uppercase();
    let p: Vec<&str> = kod.split('-').collect();
    let ok_bicim = p.len() == 4
        && p[0] == "UST"
        && ["TES", "ELK", "CLN", "KMB", "BYZ"].contains(&p[1])
        && p[2].len() == 4
        && p[2].chars().all(|c| c.is_ascii_digit())
        && matches!(p[2][0..2].parse::<u32>(), Ok(1..=31))
        && matches!(p[2][2..4].parse::<u32>(), Ok(1..=12))
        && p[3].len() == 4
        && p[3].bytes().all(|b| ALFABE.contains(&b));
    if !ok_bicim {
        return "bicim-hatali";
    }
    let ek = p[3];
    if ek.ends_with(kontrol_karakteri(&format!("{}{}{}", p[1], p[2], &ek[..3]))) { "gecerli" } else { "kontrol-hatali" }
}

/// Fiyat dökümü: toplam = çıkış + acil + gece + pazar + işçilik (min–max)
pub fn fiyat_hesapla(cikis: i64, aciliyet: &str, zaman: &str, isc_min: i64, isc_max: i64, k: &Kural) -> AppResult<Value> {
    let (yil, ay, gun, saat, _) = zaman_coz(zaman).ok_or_else(|| AppError::validation("zaman", "Tarih geçersiz."))?;
    if !["hemen", "bugun", "randevu"].contains(&aciliyet) {
        return Err(AppError::validation("aciliyet", "Aciliyet hemen / bugun / randevu olmalı."));
    }
    for (ad, v) in [("cikisUcreti", cikis), ("iscilikMin", isc_min), ("iscilikMax", isc_max)] {
        if !(0..=1_000_000).contains(&v) {
            return Err(AppError::validation(ad, "Tutar 0–1.000.000 arasında olmalı."));
        }
    }
    if isc_min > isc_max {
        return Err(AppError::validation("iscilikMin", "İşçilik alt sınırı üst sınırdan büyük olamaz."));
    }
    let oran = |o: f64| (cikis as f64 * o).round() as i64; // f64::round: sıfırdan uzağa yuvarlar
    let acil = if aciliyet == "hemen" { k.acil_ucret.round() as i64 } else { 0 };
    let gece = if saat >= 22 || saat < 8 { oran(k.gece_orani) } else { 0 };
    let pazar = if haftanin_gunu(yil, ay, gun) == 0 { oran(k.pazar_orani) } else { 0 };
    let sabit = cikis + acil + gece + pazar;
    Ok(json!({ "cikis": cikis, "acil": acil, "gece": gece, "pazar": pazar, "iscilikMin": isc_min, "iscilikMax": isc_max, "toplamMin": sabit + isc_min, "toplamMax": sabit + isc_max }))
}

/// Haritada usta ile semt merkezi arası km (1 birim ≈ 0,3 km; en az 0,3) ve İstanbul trafiğinde varış süresi (dk)
pub fn mesafe_km(usta: (f64, f64), semt: &str) -> f64 {
    let (sx, sy) = SEMTLER.iter().find(|s| s.0 == semt).map(|s| (s.1, s.2)).unwrap_or(usta);
    (((usta.0 - sx).hypot(usta.1 - sy) * 0.3 * 10.0).round() / 10.0).max(0.3)
}
pub fn varis_dk(km: f64) -> i64 {
    (8.0 + km * 2.2).round() as i64
}

fn kural_yukle(c: &Connection) -> AppResult<Kural> {
    c.query_row(
        "SELECT acilUcret, geceOrani, pazarOrani FROM fiyat_kurallari WHERE durum = 'yayinda' ORDER BY surum DESC LIMIT 1",
        [],
        |r| Ok(Kural { acil_ucret: r.get(0)?, gece_orani: r.get(1)?, pazar_orani: r.get(2)? }),
    )
    .optional()?
    .ok_or_else(|| AppError::NotFound("Yayınlanmış fiyat kuralı yok.".into()))
}

fn metin<'a>(v: &'a Value, alan: &str) -> AppResult<&'a str> {
    v.get(alan).and_then(Value::as_str).map(str::trim).filter(|s| !s.is_empty()).ok_or_else(|| AppError::validation(alan, "Zorunlu alan."))
}

fn musteri_kimligi(uid: i64) -> String {
    format!("u{uid}")
}

fn sahibi_mi(uid: i64, is_emri: &Value) -> bool {
    is_emri["musteriId"].as_str() == Some(musteri_kimligi(uid).as_str())
}

/// Oturumdaki kullanıcı işin sahibi değilse `ability` iznini arar.
fn sahip_ya_da_izin(c: &Connection, uid: i64, is_emri: &Value, ability: &str) -> AppResult<()> {
    if sahibi_mi(uid, is_emri) || rbac::can(c, ModelRef::user(uid), ability)? {
        Ok(())
    } else {
        Err(AppError::Forbidden("Bu iş emri size ait değil.".into()))
    }
}

/// Müşterinin çağrısı: usta + sorun + aciliyet + zaman + adres → fiyat dökümü ve iş emri kodu.
/// `girdi`: `{ ustaId, sorun, aciliyet, zaman, telefon, adresNotu?, foto?, odeme?, semt?, adres? }`
pub fn do_is_emri_olustur(app: &AppState, girdi: &Value) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    app.db.with(|c| {
        let usta_id = girdi.get("ustaId").and_then(Value::as_i64).ok_or_else(|| AppError::validation("ustaId", "Usta seçilmeli."))?;
        let usta = crud::find(c, &schema::USTA, &json!(usta_id))?;
        let sorun = metin(girdi, "sorun")?;
        let sablon = crud::find(c, &schema::SORUN_SABLONU, &json!(sorun)).map_err(|_| AppError::validation("sorun", "Sorun şablonu bulunamadı."))?;
        if sablon["aktif"] == json!(false) {
            return Err(AppError::validation("sorun", "Bu sorun şablonu kapalı."));
        }
        if sablon["kategori"] != usta["kategori"] {
            return Err(AppError::validation("sorun", "Seçilen usta bu kategoride hizmet vermiyor."));
        }
        let aciliyet = metin(girdi, "aciliyet")?;
        if aciliyet == "hemen" && usta["musait"] == json!(false) {
            return Err(AppError::Conflict("Usta şu an meşgul; acil çağrı için başka bir usta seç ya da randevu al.".into()));
        }
        let zaman = metin(girdi, "zaman")?;
        let telefon = metin(girdi, "telefon")?;
        let isc = sablon["iscilik"].as_array().cloned().unwrap_or_default();
        let (isc_min, isc_max) = (isc.first().and_then(Value::as_i64).unwrap_or(0), isc.get(1).and_then(Value::as_i64).unwrap_or(0));
        let kural = kural_yukle(c)?;
        let fiyat = fiyat_hesapla(usta["cikisUcreti"].as_i64().unwrap_or(0), aciliyet, zaman, isc_min, isc_max, &kural)?;
        let konum = (usta["konum"]["x"].as_f64().unwrap_or(0.0), usta["konum"]["y"].as_f64().unwrap_or(0.0));
        let semt = girdi.get("semt").and_then(Value::as_str).or_else(|| usta["semt"].as_str()).unwrap_or("Kadıköy").to_string();
        let odeme = girdi.get("odeme").and_then(Value::as_str).unwrap_or("nakit");
        // Müşteri kaydı (yoksa oluşturulur)
        let ad: String = c.query_row("SELECT name FROM users WHERE id = ?1", [uid], |r| r.get(0))?;
        c.execute(
            "INSERT OR IGNORE INTO musteriler (id, ad, telefon, semt, adres) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![musteri_kimligi(uid), ad, telefon, semt, girdi.get("adres").and_then(Value::as_str).unwrap_or("")],
        )?;
        let kategori = usta["kategori"].as_str().unwrap_or("tesisat").to_string();
        let simdi = now_iso(c)?;
        for _ in 0..8 {
            let kod = kod_uret(&kategori, zaman)?;
            let kayit = json!({
                "kod": kod, "musteriId": musteri_kimligi(uid), "ustaId": usta_id, "ustaAd": usta["ad"], "kategori": kategori, "sorun": sorun,
                "aciliyet": aciliyet, "zaman": zaman, "adresNotu": girdi.get("adresNotu").and_then(Value::as_str).unwrap_or(""),
                "foto": girdi.get("foto"), "fiyat": fiyat, "durum": "aktif", "olusturma": simdi,
                "varisDk": varis_dk(mesafe_km(konum, &semt)), "odeme": odeme, "telefon": telefon,
            });
            match crud::insert(c, &schema::IS_EMRI, &kayit) {
                Ok(v) => {
                    audit::record(c, Some(uid), "IsEmri.create", "IsEmri", &kod, None, None, Some(&v))?;
                    return Ok(v);
                }
                Err(AppError::Conflict(_)) => continue, // kod çakışması: yeniden dene
                Err(e) => return Err(e),
            }
        }
        Err(AppError::Conflict("Benzersiz iş emri kodu üretilemedi, tekrar dene.".into()))
    })
}

/// Aktif işi iptal eder. Sahibi ya da `Cancel:IsEmri` izni olan kişi yapabilir.
pub fn do_is_emri_iptal(app: &AppState, kod: &str, neden: &str, aciklama: Option<&str>) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    app.db.with(|c| {
        let is = crud::find(c, &schema::IS_EMRI, &json!(kod))?;
        sahip_ya_da_izin(c, uid, &is, "Cancel:IsEmri")?;
        if is["durum"] != json!("aktif") {
            return Err(AppError::Conflict("Yalnız aktif iş emri iptal edilebilir.".into()));
        }
        if !["vazgectim", "gecikti", "baskasi", "cozuldu"].contains(&neden) {
            return Err(AppError::validation("neden", "İptal nedeni geçersiz."));
        }
        let sonra = crud::update(c, &schema::IS_EMRI, &json!(kod), &json!({ "durum": "iptal", "iptalNedeni": neden, "bitis": now_iso(c)? }))?;
        audit::record(c, Some(uid), "IsEmri.cancel", "IsEmri", kod, aciklama, Some(&is), Some(&sonra))?;
        Ok(sonra)
    })
}

/// Kapıdaki ustanın söylediği kodu doğrular (yalnız işin sahibi).
pub fn do_is_emri_kod_dogrula(app: &AppState, kod: &str, girilen: &str) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    app.db.with(|c| {
        let is = crud::find(c, &schema::IS_EMRI, &json!(kod))?;
        if !sahibi_mi(uid, &is) {
            return Err(AppError::Forbidden("Bu iş emri size ait değil.".into()));
        }
        let durum = kod_durumu(girilen);
        let eslesti = durum == "gecerli" && girilen.trim().to_uppercase() == kod;
        if eslesti {
            crud::update(c, &schema::IS_EMRI, &json!(kod), &json!({ "dogrulandi": true }))?;
        }
        Ok(json!({ "kodDurumu": durum, "eslesti": eslesti }))
    })
}

/// İşi tamamlar: sahibi yalnız kod doğrulandıktan sonra; `Update:IsEmri` izni olan personel her zaman.
pub fn do_is_emri_tamamla(app: &AppState, kod: &str) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    app.db.with(|c| {
        let is = crud::find(c, &schema::IS_EMRI, &json!(kod))?;
        let personel = rbac::can(c, ModelRef::user(uid), "Update:IsEmri")?;
        if !personel {
            if !sahibi_mi(uid, &is) {
                return Err(AppError::Forbidden("Bu iş emri size ait değil.".into()));
            }
            if is["dogrulandi"] != json!(true) {
                return Err(AppError::Conflict("Önce kapıdaki ustanın kodunu doğrula.".into()));
            }
        }
        if is["durum"] != json!("aktif") {
            return Err(AppError::Conflict("Yalnız aktif iş emri tamamlanabilir.".into()));
        }
        let sonra = crud::update(c, &schema::IS_EMRI, &json!(kod), &json!({ "durum": "tamamlandi", "bitis": now_iso(c)? }))?;
        c.execute("UPDATE ustalar SET tamamlananIs = tamamlananIs + 1 WHERE id = ?1", [is["ustaId"].as_i64()])?;
        audit::record(c, Some(uid), "IsEmri.complete", "IsEmri", kod, None, Some(&is), Some(&sonra))?;
        Ok(sonra)
    })
}

/// Tamamlanan işe puan ve yorum (iş başına bir kez); ustanın ortalama puanı güncellenir.
pub fn do_yorum_ekle(app: &AppState, kod: &str, puan: i64, yorum: &str, dil: &str) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    app.db.with(|c| {
        let mut hatalar = Vec::new();
        if !(1..=5).contains(&puan) {
            hatalar.push(FieldError { field: "puan".into(), message: "Puan 1–5 olmalı.".into() });
        }
        if yorum.trim().is_empty() || yorum.chars().count() > 1000 {
            hatalar.push(FieldError { field: "metin".into(), message: "Yorum 1–1000 karakter olmalı.".into() });
        }
        if !["tr", "en", "ar", "fa"].contains(&dil) {
            hatalar.push(FieldError { field: "dil".into(), message: "Dil geçersiz.".into() });
        }
        if !hatalar.is_empty() {
            return Err(AppError::Validation(hatalar));
        }
        let is = crud::find(c, &schema::IS_EMRI, &json!(kod))?;
        if !sahibi_mi(uid, &is) {
            return Err(AppError::Forbidden("Bu iş emri size ait değil.".into()));
        }
        if is["durum"] != json!("tamamlandi") {
            return Err(AppError::Conflict("Yalnız tamamlanan işe yorum yapılabilir.".into()));
        }
        if !is["yorum"].is_null() {
            return Err(AppError::Conflict("Bu iş için zaten yorum yapılmış.".into()));
        }
        let usta = crud::find(c, &schema::USTA, &is["ustaId"])?;
        let sayi = usta["yorumSayisi"].as_i64().unwrap_or(0);
        let yeni_sayi = sayi + 1;
        let yeni_puan = (((usta["puan"].as_f64().unwrap_or(0.0) * sayi as f64 + puan as f64) / yeni_sayi as f64) * 10.0).round() / 10.0;
        let ad: String = c.query_row("SELECT name FROM users WHERE id = ?1", [uid], |r| r.get(0))?;
        let bugun = now_iso(c)?[..10].to_string();
        let mut yorumlar = usta["yorumlar"].as_array().cloned().unwrap_or_default();
        yorumlar.insert(0, json!({ "ad": ad, "puan": puan, "metin": yorum.trim(), "dil": dil, "tarih": bugun }));
        crud::update(c, &schema::USTA, &is["ustaId"], &json!({ "puan": yeni_puan, "yorumSayisi": yeni_sayi, "yorumlar": yorumlar }))?;
        c.execute("INSERT OR IGNORE INTO yorum_moderasyonu (isKodu, durum) VALUES (?1, 'yayinda')", [kod])?;
        let sonra = crud::update(c, &schema::IS_EMRI, &json!(kod), &json!({ "yorum": { "puan": puan, "metin": yorum.trim() } }))?;
        audit::record(c, Some(uid), "IsEmri.review", "IsEmri", kod, None, None, Some(&sonra["yorum"]))?;
        Ok(sonra)
    })
}

/// Fiyat simülatörü (yönetim paneli ve müşteri ekranı): geçerli kuralla döküm.
pub fn do_fiyat_simule(app: &AppState, cikis: i64, aciliyet: &str, zaman: &str, isc_min: i64, isc_max: i64) -> AppResult<Value> {
    app.db.with(|c| fiyat_hesapla(cikis, aciliyet, zaman, isc_min, isc_max, &kural_yukle(c)?))
}

/// Kuralı yayınlar (`Publish:FiyatKurali`): önceki yayınlanmış sürümler taslağa alınmaz, en yüksek sürüm geçerlidir.
pub fn do_fiyat_kurali_yayinla(app: &AppState, surum: i64) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Publish:FiyatKurali")?;
        let once = crud::find(c, &schema::FIYAT_KURALI, &json!(surum))?;
        c.execute(&format!("UPDATE fiyat_kurallari SET durum = 'yayinda', yururlukTarihi = {NOW_SQL} WHERE surum = ?1"), [surum])?;
        let sonra = crud::find(c, &schema::FIYAT_KURALI, &json!(surum))?;
        audit::record(c, Some(uid), "FiyatKurali.publish", "FiyatKurali", &surum.to_string(), None, Some(&once), Some(&sonra))?;
        Ok(sonra)
    })
}

/// Panel özeti: iş durumları, ortalama varış, ortalama puan, tamamlanan işlerin gelir aralığı, iptal nedenleri, kategori dağılımı.
pub fn do_ustam_dashboard(app: &AppState, from: Option<&str>, to: Option<&str>) -> AppResult<Value> {
    app.db.with(|c| {
        authorize(c, app.user(), "ViewAny:IsEmri")?;
        let (lo, hi) = (from.unwrap_or("0000"), to.unwrap_or("9999"));
        let gruplar = |sql: &str| -> AppResult<Vec<Value>> {
            let mut st = c.prepare(sql)?;
            let rows = st.query_map(params![lo, hi], |r| Ok(json!({ "value": r.get::<_, Option<String>>(0)?, "count": r.get::<_, i64>(1)? })))?;
            Ok(rows.collect::<Result<Vec<_>, _>>()?)
        };
        let durumlar = gruplar("SELECT durum, COUNT(*) FROM is_emirleri WHERE olusturma >= ?1 AND olusturma <= ?2 GROUP BY durum")?;
        let iptal = gruplar("SELECT iptalNedeni, COUNT(*) FROM is_emirleri WHERE durum = 'iptal' AND olusturma >= ?1 AND olusturma <= ?2 GROUP BY iptalNedeni")?;
        let kategoriler = gruplar("SELECT kategori, COUNT(*) FROM is_emirleri WHERE olusturma >= ?1 AND olusturma <= ?2 GROUP BY kategori ORDER BY 2 DESC")?;
        let (toplam, ort_varis): (i64, Option<f64>) =
            c.query_row("SELECT COUNT(*), AVG(varisDk) FROM is_emirleri WHERE olusturma >= ?1 AND olusturma <= ?2", params![lo, hi], |r| Ok((r.get(0)?, r.get(1)?)))?;
        let (gmin, gmax): (f64, f64) = c.query_row(
            "SELECT COALESCE(SUM(json_extract(fiyat, '$.toplamMin')), 0), COALESCE(SUM(json_extract(fiyat, '$.toplamMax')), 0)
             FROM is_emirleri WHERE durum = 'tamamlandi' AND olusturma >= ?1 AND olusturma <= ?2",
            params![lo, hi],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )?;
        let ort_puan: Option<f64> = c.query_row("SELECT AVG(puan) FROM ustalar WHERE yorumSayisi > 0", [], |r| r.get(0))?;
        Ok(json!({ "toplam": toplam, "durumlar": durumlar, "iptalNedenleri": iptal, "kategoriler": kategoriler,
                   "ortalamaVarisDk": ort_varis, "ortalamaPuan": ort_puan, "gelirAraligi": { "min": gmin, "max": gmax } }))
    })
}

// ───────────────────────── Tauri komutları ─────────────────────────

#[tauri::command]
pub fn is_emri_olustur(state: State<'_, AppState>, girdi: Value) -> AppResult<Value> {
    do_is_emri_olustur(&state, &girdi)
}
#[tauri::command]
pub fn is_emri_iptal(state: State<'_, AppState>, kod: String, neden: String, aciklama: Option<String>) -> AppResult<Value> {
    do_is_emri_iptal(&state, &kod, &neden, aciklama.as_deref())
}
#[tauri::command]
pub fn is_emri_kod_dogrula(state: State<'_, AppState>, kod: String, girilen: String) -> AppResult<Value> {
    do_is_emri_kod_dogrula(&state, &kod, &girilen)
}
#[tauri::command]
pub fn is_emri_tamamla(state: State<'_, AppState>, kod: String) -> AppResult<Value> {
    do_is_emri_tamamla(&state, &kod)
}
#[tauri::command]
pub fn yorum_ekle(state: State<'_, AppState>, kod: String, puan: i64, yorum: String, dil: String) -> AppResult<Value> {
    do_yorum_ekle(&state, &kod, puan, &yorum, &dil)
}
#[tauri::command]
pub fn fiyat_simule(state: State<'_, AppState>, cikis: i64, aciliyet: String, zaman: String, iscilik_min: i64, iscilik_max: i64) -> AppResult<Value> {
    do_fiyat_simule(&state, cikis, &aciliyet, &zaman, iscilik_min, iscilik_max)
}
#[tauri::command]
pub fn fiyat_kurali_yayinla(state: State<'_, AppState>, surum: i64) -> AppResult<Value> {
    do_fiyat_kurali_yayinla(&state, surum)
}
#[tauri::command]
pub fn ustam_dashboard(state: State<'_, AppState>, from: Option<String>, to: Option<String>) -> AppResult<Value> {
    do_ustam_dashboard(&state, from.as_deref(), to.as_deref())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::backend::controllers as c;
    use crate::backend::boot_memory;

    #[test]
    fn kod_biciminde_ve_kontrol_dogru() {
        for _ in 0..50 {
            let k = kod_uret("elektrik", "2026-10-12T14:30").unwrap();
            assert!(k.starts_with("UST-ELK-1210-"), "{k}");
            assert_eq!(kod_durumu(&k), "gecerli", "{k}");
            // son karakteri değiştirince kontrol hatası
            let mut bozuk: Vec<char> = k.chars().collect();
            let son = bozuk.len() - 1;
            bozuk[son] = if bozuk[son] == 'A' { 'B' } else { 'A' };
            assert_eq!(kod_durumu(&bozuk.into_iter().collect::<String>()), "kontrol-hatali");
        }
        assert_eq!(kod_durumu("UST-XXX-1210-K7QZ"), "bicim-hatali");
        assert!(kod_uret("bilinmeyen", "2026-10-12T14:30").is_err());
    }

    #[test]
    fn fiyat_vektorleri() {
        let k = Kural { acil_ucret: 150.0, gece_orani: 0.25, pazar_orani: 0.15 };
        // 2026-10-18 Pazar; 23:00 gece; 350*0,25 = 87,5 → 88; 350*0,15 = 52,5 → 53
        let f = fiyat_hesapla(350, "hemen", "2026-10-18T23:00", 250, 600, &k).unwrap();
        assert_eq!((f["acil"].as_i64(), f["gece"].as_i64(), f["pazar"].as_i64()), (Some(150), Some(88), Some(53)));
        assert_eq!((f["toplamMin"].as_i64(), f["toplamMax"].as_i64()), (Some(891), Some(1241)));
        // hafta içi öğleden sonra, acil değil: yalnız çıkış + işçilik
        let g = fiyat_hesapla(300, "randevu", "2026-10-14T14:00", 200, 450, &k).unwrap();
        assert_eq!((g["toplamMin"].as_i64(), g["toplamMax"].as_i64()), (Some(500), Some(750)));
        assert!(fiyat_hesapla(-1, "hemen", "2026-10-14T14:00", 0, 1, &k).is_err());
        assert!(fiyat_hesapla(100, "hemen", "2026-10-14T14:00", 5, 1, &k).is_err());
        assert_eq!(haftanin_gunu(2026, 10, 18), 0);
    }

    #[test]
    fn mesafe_ve_varis() {
        // usta Kadıköy merkezinde: en az 0,3 km → 8 + 0,66 = 9 dk
        assert_eq!(mesafe_km((60.0, 79.0), "Kadıköy"), 0.3);
        assert_eq!(varis_dk(0.3), 9);
    }

    #[test]
    fn is_emri_yasam_dongusu() {
        let app = boot_memory().unwrap();
        c::auth_register(&app, "Yönetici", "y@ornek.com", "gizli-parola-1").unwrap();
        let usta = c::crud_store(&app, "Usta", &json!({ "ad": "Örnek Usta", "kategori": "tesisat", "cikisUcreti": 350, "semt": "Kadıköy", "konum": { "x": 61, "y": 77 }, "calisma": "7-24", "sorunlar": ["su-sizintisi"] })).unwrap();
        c::auth_logout(&app);
        c::auth_register(&app, "Müşteri", "m@ornek.com", "gizli-parola-2").unwrap();
        let is = do_is_emri_olustur(&app, &json!({ "ustaId": usta["id"], "sorun": "su-sizintisi", "aciliyet": "hemen", "zaman": "2026-10-18T23:00", "telefon": "5000000000", "odeme": "kart" })).unwrap();
        let kod = is["kod"].as_str().unwrap().to_string();
        assert_eq!(kod_durumu(&kod), "gecerli");
        assert_eq!(is["fiyat"]["toplamMin"], json!(350 + 150 + 88 + 53 + 250));
        // yanlış kategori
        assert!(do_is_emri_olustur(&app, &json!({ "ustaId": usta["id"], "sorun": "sigorta-atiyor", "aciliyet": "bugun", "zaman": "2026-10-18T10:00", "telefon": "5000000000" })).is_err());
        // kapıda kod doğrulama → tamamlama → yorum
        assert_eq!(do_is_emri_tamamla(&app, &kod).unwrap_err().code(), "conflict");
        let d = do_is_emri_kod_dogrula(&app, &kod, &kod).unwrap();
        assert_eq!(d["eslesti"], json!(true));
        do_is_emri_tamamla(&app, &kod).unwrap();
        do_yorum_ekle(&app, &kod, 5, "Çok iyi", "tr").unwrap();
        assert_eq!(do_yorum_ekle(&app, &kod, 5, "tekrar", "tr").unwrap_err().code(), "conflict");
        // iptal yalnız aktif işte
        assert_eq!(do_is_emri_iptal(&app, &kod, "vazgectim", None).unwrap_err().code(), "conflict");
        // başkası dokunamaz
        c::auth_logout(&app);
        c::auth_register(&app, "Başka", "b@ornek.com", "gizli-parola-3").unwrap();
        assert_eq!(do_is_emri_kod_dogrula(&app, &kod, &kod).unwrap_err().code(), "forbidden");
    }
}
