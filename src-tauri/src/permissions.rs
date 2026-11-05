//! İzin (yetki) yüzeyi — qLar deseninden damıtıldı. Ayrıntı ve izin tablosu: docs/izinler.md
//!
//! `permissions_status`: izinlerin işletim sisteminden okunan anlık durumunu döner ve ASLA sistem diyaloğu açmaz
//! ("snapshot never prompts"). `permission_request`: yalnız kullanıcı düğmeye bastığında OS diyaloğunu açar.
//! Konum yalnız kullanıcı "Konumumdan bul" dediğinde, izin verilmişse ve tek sefer okunur; saklanmaz, loglanmaz.
//!
//! Tüm komutlar `async`: mobil eklentiler (Kotlin/Swift) yanıt verene kadar ana iş parçacığını bekletmesin diye.

use crate::KomutHatasi;
use serde::{Deserialize, Serialize};
use tauri::plugin::PermissionState;
use tauri::{AppHandle, Runtime};
use tauri_plugin_notification::NotificationExt;

/// Uygulamanın istediği izinler — yalnız gerçekten kullanılanlar (docs/izinler.md)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IzinKimligi {
    /// İş emri aşamaları (usta onayladı, yolda, kapıda) ve randevu hatırlatması
    Bildirim,
    /// Bulunduğun semti seçip en yakın ustayı göstermek (yaklaşık konum, tek sefer)
    Konum,
}

/// İznin işletim sistemindeki anlık durumu; tahmin edilmez, okunamazsa `Okunamadi`
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum IzinDegeri {
    Verildi,
    Reddedildi,
    /// Henüz sorulmadı (ya da Android'de bir kez reddedildi, yeniden sorulabilir — `istenebilir` ayırır)
    Sorulmadi,
    /// İzin olsa da cihazın konum servisi kapalı (yalnız telefonda)
    #[cfg_attr(desktop, allow(dead_code))]
    ServisKapali,
    /// Bu platformda çalışma zamanı izni yok (masaüstü bildirimleri); sistem ayarlarından kapatılabilir
    Gerekmiyor,
    /// Bu platformda bu özellik yok
    Desteklenmiyor,
    /// İşletim sistemi durumu bildirmedi
    Okunamadi,
}

/// Tek bir iznin durumu (TS: src/lib/types/izin.ts → IzinDurumu)
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IzinDurumu {
    pub id: IzinKimligi,
    pub durum: IzinDegeri,
    /// Uygulama içinden OS diyaloğu açılabilir mi? false ve Reddedildi ise yalnız sistem ayarlarından açılır
    pub istenebilir: bool,
}

/// konum_oku sonucu — yalnız semt eşlemesi için ön yüze gider, hiçbir yerde saklanmaz
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KonumOkumasi {
    pub enlem: f64,
    pub boylam: f64,
    /// Yaklaşık doğruluk, metre
    pub dogruluk_m: f64,
}

/// Mobil eklentinin bildirdiği durum → uygulamanın değeri. Android'de bir kez reddedilen izin
/// "prompt-with-rationale" döner: reddedildi ama uygulama içinden yeniden sorulabilir.
fn izin_degeri(durum: PermissionState) -> (IzinDegeri, bool) {
    match durum {
        PermissionState::Granted => (IzinDegeri::Verildi, false),
        PermissionState::Denied => (IzinDegeri::Reddedildi, false),
        PermissionState::PromptWithRationale => (IzinDegeri::Reddedildi, true),
        PermissionState::Prompt => (IzinDegeri::Sorulmadi, true),
    }
}

/// Konum eklentisinin düz metin hatası → tipli hata. Android: "Location services are disabled." /
/// "Location disabled.", iOS: "Location services are not enabled."
#[cfg_attr(desktop, allow(dead_code))]
fn konum_hatasi(mesaj: &str) -> KomutHatasi {
    let kucuk = mesaj.to_lowercase();
    if kucuk.contains("disabled") || kucuk.contains("not enabled") {
        KomutHatasi::KonumServisiKapali
    } else {
        KomutHatasi::KonumOkunamadi(mesaj.to_string())
    }
}

fn bildirim_durumu<R: Runtime>(app: &AppHandle<R>) -> IzinDurumu {
    let (durum, istenebilir) = if cfg!(desktop) {
        // Masaüstü eklentisi her zaman "granted" döner: Windows/macOS/Linux'ta çalışma zamanı izni yoktur
        let _ = app;
        (IzinDegeri::Gerekmiyor, false)
    } else {
        match app.notification().permission_state() {
            Ok(d) => izin_degeri(d),
            Err(_) => (IzinDegeri::Okunamadi, false),
        }
    };
    IzinDurumu { id: IzinKimligi::Bildirim, durum, istenebilir }
}

#[cfg(mobile)]
fn konum_durumu<R: Runtime>(app: &AppHandle<R>) -> IzinDurumu {
    use tauri_plugin_geolocation::GeolocationExt;
    // Yaklaşık konum (coarseLocation) yeterli; Android'de hassas konum izni manifestten çıkarıldı
    let (durum, istenebilir) = match app.geolocation().check_permissions() {
        Ok(d) => izin_degeri(d.coarse_location),
        Err(e) => match konum_hatasi(&e.to_string()) {
            KomutHatasi::KonumServisiKapali => (IzinDegeri::ServisKapali, false),
            _ => (IzinDegeri::Okunamadi, false),
        },
    };
    IzinDurumu { id: IzinKimligi::Konum, durum, istenebilir }
}

#[cfg(desktop)]
fn konum_durumu<R: Runtime>(_app: &AppHandle<R>) -> IzinDurumu {
    // Masaüstü konum eklentisi gerçek konum okumaz (sıfır döner); bu yüzden hiç kullanılmaz
    IzinDurumu { id: IzinKimligi::Konum, durum: IzinDegeri::Desteklenmiyor, istenebilir: false }
}

fn anlik_durum<R: Runtime>(app: &AppHandle<R>) -> Vec<IzinDurumu> {
    vec![bildirim_durumu(app), konum_durumu(app)]
}

fn bildirim_verildi_mi<R: Runtime>(app: &AppHandle<R>) -> bool {
    matches!(bildirim_durumu(app).durum, IzinDegeri::Verildi | IzinDegeri::Gerekmiyor)
}

/// Durumu döner; asla diyalog açmaz.
#[tauri::command]
pub async fn permissions_status<R: Runtime>(app: AppHandle<R>) -> Vec<IzinDurumu> {
    anlik_durum(&app)
}

/// İlgili izin için OS diyaloğunu açar, sonra güncel durumların tamamını döner.
#[tauri::command]
pub async fn permission_request<R: Runtime>(app: AppHandle<R>, id: IzinKimligi) -> Result<Vec<IzinDurumu>, KomutHatasi> {
    match id {
        IzinKimligi::Bildirim => {
            if cfg!(mobile) {
                app.notification()
                    .request_permission()
                    .map_err(|e| KomutHatasi::IzinIstenemedi(e.to_string()))?;
            }
        }
        IzinKimligi::Konum => {
            #[cfg(mobile)]
            {
                use tauri_plugin_geolocation::{GeolocationExt, PermissionType};
                app.geolocation()
                    .request_permissions(Some(vec![PermissionType::CoarseLocation]))
                    .map_err(|e| match konum_hatasi(&e.to_string()) {
                        KomutHatasi::KonumServisiKapali => KomutHatasi::KonumServisiKapali,
                        _ => KomutHatasi::IzinIstenemedi(e.to_string()),
                    })?;
            }
            #[cfg(desktop)]
            return Err(KomutHatasi::PlatformDesteklemiyor);
        }
    }
    Ok(anlik_durum(&app))
}

const EN_UZUN_BASLIK: usize = 80;
const EN_UZUN_GOVDE: usize = 240;

fn bildirim_metni_denetle(baslik: &str, govde: &str) -> Result<(), KomutHatasi> {
    let uzun = |m: &str, sinir: usize| m.chars().count() > sinir;
    if baslik.trim().is_empty() || govde.trim().is_empty() || uzun(baslik, EN_UZUN_BASLIK) || uzun(govde, EN_UZUN_GOVDE) {
        Err(KomutHatasi::GecersizIcerik)
    } else {
        Ok(())
    }
}

/// Yerel bildirim gösterir (push değildir; sunucu yok). İzin yoksa diyalog açmaz, `IzinYok` döner.
#[tauri::command]
pub async fn bildirim_gonder<R: Runtime>(app: AppHandle<R>, baslik: String, govde: String) -> Result<(), KomutHatasi> {
    bildirim_metni_denetle(&baslik, &govde)?;
    if !bildirim_verildi_mi(&app) {
        return Err(KomutHatasi::IzinYok);
    }
    app.notification()
        .builder()
        .title(baslik)
        .body(govde)
        .show()
        .map_err(|e| KomutHatasi::BildirimGosterilemedi(e.to_string()))
}

/// Cihazın konumunu bir kez okur (yaklaşık doğruluk). İzin verilmemişse diyalog açmaz, `IzinYok` döner.
#[tauri::command]
pub async fn konum_oku<R: Runtime>(app: AppHandle<R>) -> Result<KonumOkumasi, KomutHatasi> {
    #[cfg(mobile)]
    {
        use tauri_plugin_geolocation::{GeolocationExt, PositionOptions};
        match konum_durumu(&app).durum {
            IzinDegeri::Verildi => {}
            IzinDegeri::ServisKapali => return Err(KomutHatasi::KonumServisiKapali),
            _ => return Err(KomutHatasi::IzinYok),
        }
        // Yüksek doğruluk (GPS) istenmez; 2 dakikaya kadar eski bir okuma yeterli, 10 sn'de yanıt yoksa hata
        let secenekler = PositionOptions { enable_high_accuracy: false, timeout: 10_000, maximum_age: 120_000 };
        let konum = app
            .geolocation()
            .get_current_position(Some(secenekler))
            .map_err(|e| konum_hatasi(&e.to_string()))?;
        Ok(KonumOkumasi { enlem: konum.coords.latitude, boylam: konum.coords.longitude, dogruluk_m: konum.coords.accuracy })
    }
    #[cfg(desktop)]
    {
        let _ = app;
        Err(KomutHatasi::PlatformDesteklemiyor)
    }
}

// ---------------------------------------------------------------- sistem ayarları

/// Android: uygulamanın kendi Kotlin eklentisi (gen/android/.../AyarlarEklentisi.kt) uygulama ayrıntıları ekranını açar
#[cfg(target_os = "android")]
struct AndroidAyarlar<R: Runtime>(tauri::plugin::PluginHandle<R>);

/// Yalnız Android'de Kotlin sınıfını kaydeden küçük eklenti; diğer platformlarda boş
pub fn ayarlar_eklentisi<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("ustam-ayarlar")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                let tutamac = _api.register_android_plugin("edu.istinye.ustam", "AyarlarEklentisi")?;
                _app.manage(AndroidAyarlar(tutamac));
            }
            Ok(())
        })
        .build()
}

/// Kullanıcının izni sistemden açabilmesi için ayarlar ekranını açar: telefonda uygulamanın ayar sayfası,
/// Windows/macOS'ta bildirim ayarları. Linux'ta ortak bir ayar adresi yok → PlatformDesteklemiyor.
#[tauri::command]
pub async fn sistem_ayarlarini_ac<R: Runtime>(app: AppHandle<R>) -> Result<(), KomutHatasi> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        let ayarlar = app.state::<AndroidAyarlar<R>>();
        ayarlar
            .0
            .run_mobile_plugin::<serde_json::Value>("uygulamaAyarlariniAc", ())
            .map(|_| ())
            .map_err(|e| KomutHatasi::AyarlarAcilamadi(e.to_string()))
    }
    #[cfg(not(target_os = "android"))]
    {
        let adres = if cfg!(target_os = "ios") {
            "app-settings:"
        } else if cfg!(target_os = "windows") {
            "ms-settings:notifications"
        } else if cfg!(target_os = "macos") {
            "x-apple.systempreferences:com.apple.preference.notifications"
        } else {
            return Err(KomutHatasi::PlatformDesteklemiyor);
        };
        use tauri_plugin_opener::OpenerExt;
        app.opener().open_url(adres, None::<&str>).map_err(|e| KomutHatasi::AyarlarAcilamadi(e.to_string()))
    }
}

#[cfg(test)]
mod testler {
    use super::*;
    use serde_json::json;

    // @lat: [[testler#Testler#İzinler ve platform#İzin durumu işletim sisteminden eşlenir]]
    #[test]
    fn izin_durumu_isletim_sisteminden_eslenir() {
        assert_eq!(izin_degeri(PermissionState::Granted), (IzinDegeri::Verildi, false));
        assert_eq!(izin_degeri(PermissionState::Denied), (IzinDegeri::Reddedildi, false));
        assert_eq!(izin_degeri(PermissionState::PromptWithRationale), (IzinDegeri::Reddedildi, true));
        assert_eq!(izin_degeri(PermissionState::Prompt), (IzinDegeri::Sorulmadi, true));
    }

    #[test]
    fn konum_hatasi_servis_kapaliyi_ayirir() {
        assert_eq!(konum_hatasi("Location services are disabled."), KomutHatasi::KonumServisiKapali);
        assert_eq!(konum_hatasi("Location disabled."), KomutHatasi::KonumServisiKapali);
        assert_eq!(konum_hatasi("Location services are not enabled."), KomutHatasi::KonumServisiKapali);
        assert_eq!(konum_hatasi("Timeout expired."), KomutHatasi::KonumOkunamadi("Timeout expired.".into()));
    }

    #[test]
    fn bildirim_metni_bos_ya_da_uzun_olamaz() {
        assert!(bildirim_metni_denetle("Ustam", "Usta yola çıktı").is_ok());
        assert_eq!(bildirim_metni_denetle(" ", "x"), Err(KomutHatasi::GecersizIcerik));
        assert_eq!(bildirim_metni_denetle("x", ""), Err(KomutHatasi::GecersizIcerik));
        // Sınır karakter sayısıdır, bayt değil (Arapça/Farsça metinler)
        assert!(bildirim_metni_denetle(&"ş".repeat(EN_UZUN_BASLIK), "x").is_ok());
        assert_eq!(bildirim_metni_denetle(&"ş".repeat(EN_UZUN_BASLIK + 1), "x"), Err(KomutHatasi::GecersizIcerik));
        assert_eq!(bildirim_metni_denetle("x", &"a".repeat(EN_UZUN_GOVDE + 1)), Err(KomutHatasi::GecersizIcerik));
    }

    #[test]
    fn izin_durumu_ts_tipiyle_ayni_bicimde_gider() {
        let d = IzinDurumu { id: IzinKimligi::Konum, durum: IzinDegeri::ServisKapali, istenebilir: false };
        assert_eq!(serde_json::to_value(d).unwrap(), json!({ "id": "konum", "durum": "servis-kapali", "istenebilir": false }));
        let k = KonumOkumasi { enlem: 41.0, boylam: 29.0, dogruluk_m: 500.0 };
        assert_eq!(serde_json::to_value(k).unwrap(), json!({ "enlem": 41.0, "boylam": 29.0, "dogrulukM": 500.0 }));
        assert_eq!(serde_json::from_value::<IzinKimligi>(json!("bildirim")).unwrap(), IzinKimligi::Bildirim);
        assert!(serde_json::from_value::<IzinKimligi>(json!("kamera")).is_err());
    }

    #[test]
    fn yeni_hata_turleri_tipli_gider() {
        assert_eq!(serde_json::to_value(KomutHatasi::IzinYok).unwrap(), json!({ "tur": "izin-yok" }));
        assert_eq!(serde_json::to_value(KomutHatasi::KonumServisiKapali).unwrap(), json!({ "tur": "konum-servisi-kapali" }));
        assert_eq!(
            serde_json::to_value(KomutHatasi::KonumOkunamadi("Timeout expired.".into())).unwrap(),
            json!({ "tur": "konum-okunamadi", "ayrinti": "Timeout expired." })
        );
    }
}
