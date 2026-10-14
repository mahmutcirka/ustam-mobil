-- Başlangıç (referans) verisi. Yinelenebilir: INSERT OR IGNORE.

-- sorun_sablonlari
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('su-sizintisi', 'tesisat', '{"tr":"Su sızıntısı","en":"Water leak"}', '[250,600]', 60, 1, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('tikali-gider', 'tesisat', '{"tr":"Tıkalı gider","en":"Blocked drain"}', '[200,450]', 45, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('musluk-ariza', 'tesisat', '{"tr":"Musluk arızası","en":"Faulty tap"}', '[150,350]', 30, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('sigorta-atiyor', 'elektrik', '{"tr":"Sigorta atıyor","en":"Tripping fuse"}', '[200,500]', 45, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('priz-yanik', 'elektrik', '{"tr":"Yanık priz","en":"Burnt socket"}', '[150,400]', 40, 1, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('elektrik-yok', 'elektrik', '{"tr":"Elektrik yok","en":"No power"}', '[250,700]', 60, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('kapida-kaldim', 'cilingir', '{"tr":"Kapıda kaldım","en":"Locked out"}', '[300,600]', 20, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('kilit-degisimi', 'cilingir', '{"tr":"Kilit değişimi","en":"Lock replacement"}', '[400,900]', 40, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('anahtar-kirildi', 'cilingir', '{"tr":"Anahtar kırıldı","en":"Broken key"}', '[250,500]', 30, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('sicak-su-yok', 'kombi', '{"tr":"Sıcak su yok","en":"No hot water"}', '[300,800]', 60, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('basinc-dusuk', 'kombi', '{"tr":"Basınç düşük","en":"Low pressure"}', '[150,350]', 30, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('petek-isinmiyor', 'kombi', '{"tr":"Petek ısınmıyor","en":"Radiator not heating"}', '[250,600]', 60, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('camasir-makinesi', 'beyaz-esya', '{"tr":"Çamaşır makinesi","en":"Washing machine"}', '[300,700]', 60, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('buzdolabi', 'beyaz-esya', '{"tr":"Buzdolabı","en":"Refrigerator"}', '[400,1200]', 75, 0, 1);
INSERT OR IGNORE INTO "sorun_sablonlari" ("anahtar", "kategori", "ad", "iscilik", "sureDk", "tehlikeli", "aktif") VALUES ('bulasik-makinesi', 'beyaz-esya', '{"tr":"Bulaşık makinesi","en":"Dishwasher"}', '[300,800]', 60, 0, 1);

-- fiyat_kurallari
INSERT OR IGNORE INTO "fiyat_kurallari" ("surum", "durum", "acilUcret", "geceOrani", "pazarOrani", "geceBaslangic", "geceBitis") VALUES (1, 'yayinda', 150, 0.25, 0.15, '22:00', '08:00');

-- eslestirme_agirliklari
INSERT OR IGNORE INTO "eslestirme_agirliklari" ("surum", "durum", "musait", "yakinlik", "puan", "yanit", "dil", "fiyat") VALUES (1, 'yayinda', 40, 20, 20, 10, 6, 4);

