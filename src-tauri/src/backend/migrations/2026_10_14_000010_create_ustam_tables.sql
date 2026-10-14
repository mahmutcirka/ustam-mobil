-- ustam tabloları. Sütun adları ön yüz tipleriyle birebir (camelCase); tablo adları snake_case.

CREATE TABLE "ustalar" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('tesisat', 'elektrik', 'cilingir', 'kombi', 'beyaz-esya')),
    "puan" REAL NOT NULL DEFAULT 0.0,
    "yorumSayisi" INTEGER NOT NULL DEFAULT 0,
    "musait" INTEGER NOT NULL DEFAULT 1 CHECK ("musait" IN (0, 1)),
    "musaitOlacakDk" INTEGER,
    "cikisUcreti" INTEGER NOT NULL,
    "deneyimYil" INTEGER NOT NULL DEFAULT 0,
    "tamamlananIs" INTEGER NOT NULL DEFAULT 0,
    "semt" TEXT NOT NULL CHECK ("semt" IN ('Sarıyer', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Bakırköy', 'Beykoz', 'Üsküdar', 'Kadıköy', 'Ataşehir', 'Maltepe', 'Kartal')),
    "konum" TEXT NOT NULL,
    "diller" TEXT NOT NULL DEFAULT '["tr"]',
    "rozetler" TEXT NOT NULL DEFAULT '[]',
    "yanitDk" INTEGER NOT NULL DEFAULT 15,
    "calisma" TEXT NOT NULL,
    "sorunlar" TEXT NOT NULL DEFAULT '[]',
    "yorumlar" TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX ustalar_kategori_index ON "ustalar" ("kategori");
CREATE INDEX ustalar_semt_index ON "ustalar" ("semt");

CREATE TABLE "sorun_sablonlari" (
    "anahtar" TEXT PRIMARY KEY,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('tesisat', 'elektrik', 'cilingir', 'kombi', 'beyaz-esya')),
    "ad" TEXT NOT NULL,
    "iscilik" TEXT NOT NULL,
    "sureDk" INTEGER NOT NULL,
    "tehlikeli" INTEGER NOT NULL DEFAULT 0 CHECK ("tehlikeli" IN (0, 1)),
    "aktif" INTEGER NOT NULL DEFAULT 1 CHECK ("aktif" IN (0, 1))
);

CREATE TABLE "musteriler" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "semt" TEXT NOT NULL CHECK ("semt" IN ('Sarıyer', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Bakırköy', 'Beykoz', 'Üsküdar', 'Kadıköy', 'Ataşehir', 'Maltepe', 'Kartal')),
    "adres" TEXT NOT NULL DEFAULT '',
    "kayitTarihi" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    "durum" TEXT NOT NULL DEFAULT 'aktif' CHECK ("durum" IN ('aktif', 'engelli'))
);

CREATE TABLE "is_emirleri" (
    "kod" TEXT PRIMARY KEY,
    "musteriId" TEXT REFERENCES "musteriler" ("id") ON DELETE SET NULL,
    "ustaId" INTEGER NOT NULL REFERENCES "ustalar" ("id") ON DELETE RESTRICT,
    "ustaAd" TEXT NOT NULL,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('tesisat', 'elektrik', 'cilingir', 'kombi', 'beyaz-esya')),
    "sorun" TEXT NOT NULL,
    "aciliyet" TEXT NOT NULL CHECK ("aciliyet" IN ('hemen', 'bugun', 'randevu')),
    "zaman" TEXT NOT NULL,
    "adresNotu" TEXT NOT NULL DEFAULT '',
    "foto" TEXT,
    "fiyat" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'aktif' CHECK ("durum" IN ('aktif', 'tamamlandi', 'iptal')),
    "olusturma" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    "varisDk" INTEGER NOT NULL DEFAULT 0,
    "odeme" TEXT NOT NULL DEFAULT 'nakit' CHECK ("odeme" IN ('nakit', 'kart')),
    "telefon" TEXT NOT NULL,
    "dogrulandi" INTEGER NOT NULL DEFAULT 0 CHECK ("dogrulandi" IN (0, 1)),
    "iptalNedeni" TEXT CHECK ("iptalNedeni" IS NULL OR "iptalNedeni" IN ('vazgectim', 'gecikti', 'baskasi', 'cozuldu')),
    "bitis" TEXT,
    "yorum" TEXT
);
CREATE INDEX is_emirleri_durum_index ON "is_emirleri" ("durum");
CREATE INDEX is_emirleri_ustaId_index ON "is_emirleri" ("ustaId");
CREATE INDEX is_emirleri_olusturma_index ON "is_emirleri" ("olusturma");

CREATE TABLE "usta_basvurulari" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('tesisat', 'elektrik', 'cilingir', 'kombi', 'beyaz-esya')),
    "semt" TEXT NOT NULL CHECK ("semt" IN ('Sarıyer', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Bakırköy', 'Beykoz', 'Üsküdar', 'Kadıköy', 'Ataşehir', 'Maltepe', 'Kartal')),
    "belgeler" TEXT NOT NULL DEFAULT '[]',
    "durum" TEXT NOT NULL DEFAULT 'beklemede' CHECK ("durum" IN ('beklemede', 'onayli', 'red')),
    "not" TEXT,
    "tarih" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE "sikayetler" (
    "id" TEXT PRIMARY KEY,
    "isKodu" TEXT NOT NULL REFERENCES "is_emirleri" ("kod") ON DELETE CASCADE,
    "acan" TEXT NOT NULL CHECK ("acan" IN ('musteri', 'usta')),
    "neden" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'acik' CHECK ("durum" IN ('acik', 'inceleniyor', 'karar')),
    "karar" TEXT CHECK ("karar" IS NULL OR "karar" IN ('iade', 'uyari', 'red')),
    "tarih" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE "yorum_moderasyonu" (
    "isKodu" TEXT PRIMARY KEY,
    "durum" TEXT NOT NULL DEFAULT 'yayinda' CHECK ("durum" IN ('yayinda', 'gizli', 'silindi')),
    "neden" TEXT
);

CREATE TABLE "odemeler" (
    "id" TEXT PRIMARY KEY,
    "ustaId" INTEGER NOT NULL REFERENCES "ustalar" ("id") ON DELETE RESTRICT,
    "donem" TEXT NOT NULL,
    "brut" REAL NOT NULL,
    "komisyon" REAL NOT NULL,
    "net" REAL NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor' CHECK ("durum" IN ('bekliyor', 'odendi'))
);

CREATE TABLE "fiyat_kurallari" (
    "surum" INTEGER PRIMARY KEY AUTOINCREMENT,
    "durum" TEXT NOT NULL DEFAULT 'taslak' CHECK ("durum" IN ('taslak', 'yayinda')),
    "acilUcret" REAL NOT NULL,
    "geceOrani" REAL NOT NULL,
    "pazarOrani" REAL NOT NULL,
    "geceBaslangic" TEXT NOT NULL DEFAULT '22:00',
    "geceBitis" TEXT NOT NULL DEFAULT '08:00',
    "yururlukTarihi" TEXT
);

CREATE TABLE "eslestirme_agirliklari" (
    "surum" INTEGER PRIMARY KEY AUTOINCREMENT,
    "durum" TEXT NOT NULL DEFAULT 'taslak' CHECK ("durum" IN ('taslak', 'yayinda')),
    "musait" REAL NOT NULL,
    "yakinlik" REAL NOT NULL,
    "puan" REAL NOT NULL,
    "yanit" REAL NOT NULL,
    "dil" REAL NOT NULL,
    "fiyat" REAL NOT NULL
);
