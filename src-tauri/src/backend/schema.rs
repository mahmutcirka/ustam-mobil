//! Bu uygulamanın tabloları ve kaynak tanımları.
//! Sütun adları `src/` altındaki TypeScript tipleriyle ve tasarım belgelerindeki alan adlarıyla birebir aynıdır.
use crate::backend::crud::{col, req, Entity, Kind};
use crate::backend::error::{AppError, AppResult};
pub use crate::backend::schema_common::*;

/// Kayıt olan (ilk kullanıcı dışındaki) herkese verilen rol; `None` ise rolsüz kalır.
pub const DEFAULT_ROLE: Option<&str> = Some("customer");

pub static USTA: Entity = Entity {
    resource: "Usta",
    table: "ustalar",
    pk: "id",
    pk_kind: Kind::Int,
    cols: &[
        req("ad", Kind::Text),
        req("kategori", Kind::Text),
        col("puan", Kind::Real),
        col("yorumSayisi", Kind::Int),
        col("musait", Kind::Bool),
        col("musaitOlacakDk", Kind::Int),
        req("cikisUcreti", Kind::Int),
        col("deneyimYil", Kind::Int),
        col("tamamlananIs", Kind::Int),
        req("semt", Kind::Text),
        req("konum", Kind::Json),
        col("diller", Kind::Json),
        col("rozetler", Kind::Json),
        col("yanitDk", Kind::Int),
        req("calisma", Kind::Json),
        col("sorunlar", Kind::Json),
        col("yorumlar", Kind::Json),
    ],
    search: &["ad"],
    filters: &["kategori", "semt", "musait", "puan"],
    order_by: "\"puan\" DESC",
    readonly: false,
};

pub static SORUN_SABLONU: Entity = Entity {
    resource: "SorunSablonu",
    table: "sorun_sablonlari",
    pk: "anahtar",
    pk_kind: Kind::Text,
    cols: &[
        req("kategori", Kind::Text),
        req("ad", Kind::Json),
        req("iscilik", Kind::Json),
        req("sureDk", Kind::Int),
        col("tehlikeli", Kind::Bool),
        col("aktif", Kind::Bool),
    ],
    search: &["anahtar"],
    filters: &["kategori", "tehlikeli", "aktif"],
    order_by: "\"kategori\" ASC, \"anahtar\" ASC",
    readonly: false,
};

pub static MUSTERI: Entity = Entity {
    resource: "Musteri",
    table: "musteriler",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("telefon", Kind::Text),
        req("semt", Kind::Text),
        col("adres", Kind::Text),
        col("kayitTarihi", Kind::Date),
        col("durum", Kind::Text),
    ],
    search: &["ad"],
    filters: &["semt", "durum"],
    order_by: "\"kayitTarihi\" DESC",
    readonly: false,
};

pub static IS_EMRI: Entity = Entity {
    resource: "IsEmri",
    table: "is_emirleri",
    pk: "kod",
    pk_kind: Kind::Text,
    cols: &[
        col("musteriId", Kind::Text),
        req("ustaId", Kind::Int),
        req("ustaAd", Kind::Text),
        req("kategori", Kind::Text),
        req("sorun", Kind::Text),
        req("aciliyet", Kind::Text),
        req("zaman", Kind::Text),
        col("adresNotu", Kind::Text),
        col("foto", Kind::Text),
        req("fiyat", Kind::Json),
        col("durum", Kind::Text),
        col("olusturma", Kind::Date),
        col("varisDk", Kind::Int),
        col("odeme", Kind::Text),
        req("telefon", Kind::Text),
        col("dogrulandi", Kind::Bool),
        col("iptalNedeni", Kind::Text),
        col("bitis", Kind::Date),
        col("yorum", Kind::Json),
    ],
    search: &["kod", "ustaAd", "sorun"],
    filters: &["kategori", "aciliyet", "durum", "odeme", "ustaId", "musteriId", "olusturma"],
    order_by: "\"olusturma\" DESC",
    readonly: false,
};

pub static USTA_BASVURU: Entity = Entity {
    resource: "UstaBasvuru",
    table: "usta_basvurulari",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("kategori", Kind::Text),
        req("semt", Kind::Text),
        col("belgeler", Kind::Json),
        col("durum", Kind::Text),
        col("not", Kind::Text),
        col("tarih", Kind::Date),
    ],
    search: &["ad"],
    filters: &["kategori", "durum"],
    order_by: "\"tarih\" DESC",
    readonly: false,
};

pub static SIKAYET: Entity = Entity {
    resource: "Sikayet",
    table: "sikayetler",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("isKodu", Kind::Text),
        req("acan", Kind::Text),
        req("neden", Kind::Text),
        col("durum", Kind::Text),
        col("karar", Kind::Text),
        col("tarih", Kind::Date),
    ],
    search: &["isKodu", "neden"],
    filters: &["durum", "acan", "karar"],
    order_by: "\"tarih\" DESC",
    readonly: false,
};

pub static YORUM_MODERASYON: Entity = Entity {
    resource: "YorumModerasyon",
    table: "yorum_moderasyonu",
    pk: "isKodu",
    pk_kind: Kind::Text,
    cols: &[
        col("durum", Kind::Text),
        col("neden", Kind::Text),
    ],
    search: &[],
    filters: &["durum"],
    order_by: "\"isKodu\" ASC",
    readonly: false,
};

pub static ODEME: Entity = Entity {
    resource: "Odeme",
    table: "odemeler",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ustaId", Kind::Int),
        req("donem", Kind::Text),
        req("brut", Kind::Real),
        req("komisyon", Kind::Real),
        req("net", Kind::Real),
        col("durum", Kind::Text),
    ],
    search: &[],
    filters: &["ustaId", "donem", "durum"],
    order_by: "\"donem\" DESC",
    readonly: false,
};

pub static FIYAT_KURALI: Entity = Entity {
    resource: "FiyatKurali",
    table: "fiyat_kurallari",
    pk: "surum",
    pk_kind: Kind::Int,
    cols: &[
        col("durum", Kind::Text),
        req("acilUcret", Kind::Real),
        req("geceOrani", Kind::Real),
        req("pazarOrani", Kind::Real),
        col("geceBaslangic", Kind::Text),
        col("geceBitis", Kind::Text),
        col("yururlukTarihi", Kind::Date),
    ],
    search: &[],
    filters: &["durum"],
    order_by: "\"surum\" DESC",
    readonly: false,
};

pub static ESLESTIRME_AGIRLIKLARI: Entity = Entity {
    resource: "EslestirmeAgirliklari",
    table: "eslestirme_agirliklari",
    pk: "surum",
    pk_kind: Kind::Int,
    cols: &[
        col("durum", Kind::Text),
        req("musait", Kind::Real),
        req("yakinlik", Kind::Real),
        req("puan", Kind::Real),
        req("yanit", Kind::Real),
        req("dil", Kind::Real),
        req("fiyat", Kind::Real),
    ],
    search: &[],
    filters: &["durum"],
    order_by: "\"surum\" DESC",
    readonly: false,
};

pub static PROJECT: &[&Entity] = &[&USTA, &SORUN_SABLONU, &MUSTERI, &IS_EMRI, &USTA_BASVURU, &SIKAYET, &YORUM_MODERASYON, &ODEME, &FIYAT_KURALI, &ESLESTIRME_AGIRLIKLARI];

/// Bütün kaynaklar: ortak + bu uygulamanınkiler.
pub fn all() -> Vec<&'static Entity> {
    let mut v: Vec<&'static Entity> = vec![&CONTACT_MESSAGE, &CONTENT_PAGE, &AUDIT_LOG];
    v.extend(PROJECT.iter().copied());
    v
}

pub fn entity(resource: &str) -> AppResult<&'static Entity> {
    all().into_iter().find(|e| e.resource == resource)
        .ok_or_else(|| AppError::NotFound(format!("`{resource}` adında bir kaynak yok.")))
}
