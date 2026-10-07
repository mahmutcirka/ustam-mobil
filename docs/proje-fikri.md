# Proje Fikri: Ustam

> Görev tanımı: [`docs/tasks/week-3/02-proje-fikriniz.task.md`](tasks/week-3/02-proje-fikriniz.task.md)

---

## 1. Proje Künyesi

- **Proje Adı:** Ustam
- **Slogan / Tek Cümlelik Tanım:** Arıza senden, usta bizden — acil arızalarda yakındaki müsait ustayı tek dokunuşla çağır.
- **Öğrenci Adı Soyadı:** Mahmut Çirka
- **Öğrenci Numarası:** 2520191026
- **İlham Alınan Konsept / Platform:** Kendi fikrim (Armut / Uber mantığıyla acil usta çağırma)

---

## 2. Proje Özeti ve Çözülen Problem

Evde ani bir arıza olduğunda (musluk patlaması, sigorta atması, kapıda kalma, kombi arızası) insanlar
güvenilir ve **şu an müsait** bir ustaya hızlıca ulaşamaz. Ustam, yakındaki ustaları puanı, mesafesi
ve müsaitlik durumuyla listeler; kullanıcı sorununu hazır şablonlarla **kendi dilinde (TR/EN/AR/FA)**
tarif eder ve ustayı çağırır. Her çağrı için Rust tarafında üretilen **iş emri kodu**, usta ile müşteri
arasındaki kaydı netleştirir: usta kapıya geldiğinde kod doğrulanır.

### PassoKlon → Ustam dönüşümü

| PassoKlon | Ustam |
|---|---|
| Etkinlik kartları | Usta kartları |
| Bilet kategorisi + adet seçimi | Sorun tipi + aciliyet + ziyaret saati seçimi |
| Sepet | Çağrı özeti (`/cagri`) |
| Bilet kodu `PSK-XXX-XXXXXXX` (Rust) | İş emri kodu `UST-ELK-1210-K7QM` (Rust) |
| Biletlerim | İş Emirlerim |

---

## 3. Temel Ekranlar ve İşlevler

Ayrıntılı rota ağacı: [`docs/mimari-agac.md`](mimari-agac.md).

1. **Ana Liste Ekranı (Ustalar — `/`):**
   - Usta kartları: ad, doğrulama rozeti, uzmanlık, puan, **kullanıcının semtine göre mesafe ve varış süresi**,
     konuştuğu diller, anlık durum (müsait / meşgul / kapalı), çıkış ücreti, favori.
   - "Acil mi?" kısayolları: en sık 4 acil sorun için en yakın müsait usta.
   - Canlı arama, kategori filtresi, "şu an müsait", favoriler, **"dilimi konuşan usta"**; 4 sıralama seçeneği.
   - **Liste ⇄ Harita:** stilize İstanbul haritasında usta pinleri.
2. **Detay ve Seçim Ekranı (`/usta/[id]`):**
   - Usta profili: rozetler, deneyim, tamamlanan iş, yanıt süresi, çalışma saatleri, konuştuğu diller, yorumlar ve puan dağılımı.
   - Sorun tipi seçimi (işçilik aralığı ve süresiyle) ve **"usta gelene kadar" güvenlik ipucu**; aciliyet: **Hemen / Bugün / Randevu**.
   - Arızanın fotoğrafı, adres notu; ekranın altında sabit **"Ustayı çağır"** çubuğu.
3. **Kayıt / Kod Üretme Ekranı (`/cagri` → `/is-emirlerim`):**
   - Çağrı özeti: Rust `fiyat_hesapla` dökümü, iletişim telefonu, ödeme tercihi, koşulların onayı.
   - Onayda Rust `is_emri_uret` kontrol karakterli kodu üretir.
   - **İş Emirlerim:** canlı aşamalar (Talep alındı → Onaylandı → Yolda → Kapıda → Tamamlandı), varış geri sayımı,
     QR kod, kapıdaki ustanın kodunu doğrulama, iptal nedeni, iş sonu puan ve yorum.
4. **Profil ve Ayarlar (`/profil`):**
   - İstatistikler, ad / telefon / semt / adres, favori ustalar; dil (TR / EN / AR / FA, AR ve FA sağdan sola) ve tema.
   - KVKK: verileri dışa aktarma ve cihazdan tamamen silme; bilgi sayfalarına bağlantılar.

---

## 4. Veri Modeli ve Kod Üretimi

Tiplerin tek doğru kaynağı [`src/types/ustam.ts`](../src/types/ustam.ts) dosyasıdır; burada yalnızca özetlenir.

| Tip | Önemli alanlar |
|---|---|
| `Usta` | kategori, puan ve yorum sayısı, `musait`, çıkış ücreti, **semt + harita konumu**, **konuştuğu diller**, rozetler, yanıt süresi, çalışma saatleri (`"7-24"` ya da `["08:00","22:00"]`), örnek yorumlar |
| `Yorum` | ad, 1–5 puan, metin, **yazıldığı dil** (çevrilmez), tarih |
| `CagriTaslagi` | usta, sorun, aciliyet, ziyaret zamanı, adres notu, isteğe bağlı fotoğraf |
| `IsEmri` | taslak + Rust kodu, **Rust fiyat dökümü**, durum (`aktif` / `tamamlandi` / `iptal`), varış süresi, ödeme tercihi, telefon, doğrulandı mı, iptal nedeni |

İşin anlık aşaması saklanmaz; oluşturma zamanı, ziyaret zamanı ve doğrulama bilgisinden
[`src/lib/takip.ts`](../src/lib/takip.ts) ile hesaplanır.

### Rust iş emri kodu formatı

```
UST-ELK-1210-K7QM
│   │   │    │  └─ kontrol karakteri: ağırlıklı toplam (konum × base-36 değer) mod 32
│   │   │    └──── 3 karakter rastgele (0/O ve 1/I hariç 32 karakterlik alfabe)
│   │   └───────── gün + ay (12 Ekim → 1210)
│   └───────────── kategori kodu: TES tesisat · ELK elektrik · CLN çilingir · KMB kombi · BYZ beyaz eşya
└───────────────── sabit önek
```

- **Üretim:** `invoke("is_emri_uret", { kategori, zaman })` → Rust kategori ve tarihi doğrular, kodu üretir.
- **Doğrulama:** `invoke("is_emri_dogrula", { kod })` → `gecerli` · `bicim-hatali` · `kontrol-hatali`.
  Kontrol karakteri sayesinde kapıdaki ustanın kodundaki tek karakterlik yazım hataları ve yan yana yer
  değiştirmelerin çoğu, iş emirleri listesine bakılmadan yakalanır.

### Rust fiyat motoru (`fiyat_hesapla`)

| Kalem | Kural |
|---|---|
| Çıkış ücreti | Ustanın sabit ücreti |
| Acil servis | Aciliyet "Hemen" ise +₺150 |
| Gece ek ücreti | Ziyaret 22:00–07:59 arasındaysa çıkış ücretinin %25'i |
| Pazar ek ücreti | Ziyaret Pazar günüyse çıkış ücretinin %15'i (gün, Sakamoto algoritmasıyla hesaplanır) |
| İşçilik | Sorun tipine göre tahmini aralık (ör. su sızıntısı ₺250–₺600) |
| Toplam | Sabit kalemler + işçilik aralığı → "₺650 – ₺950" |

Aynı kurallar tarayıcı için `src/lib/kurallar.ts` içinde de vardır. İki uygulama
[`src-tauri/test-vektorleri.json`](../src-tauri/test-vektorleri.json) dosyasındaki elle hesaplanmış ortak
örneklerle test edilir (`cargo test` ve `bun run test`).

---

## 5. Hedef Kitle

- **Kiracılar, aileler ve yalnız yaşayan öğrenciler:** Ani arızada "Güvenilir bir ustayı nereden bulacağım?" diyenler.
- **Türkiye'de yaşayan yabancılar (Arapça, Farsça, İngilizce konuşanlar):** Sorununu Türkçe anlatmakta
  zorlananlar; sorunu kendi dilinde seçer, usta aynı talebi Türkçe görür.
- **Bağımsız ustalar:** Müşteri bulmak ve işlerini kayıt altına almak isteyen esnaf.
