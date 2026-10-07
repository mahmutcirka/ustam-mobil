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

1. **Ana Liste Ekranı (Ustalar — `/`):**
   - Usta kartları: ad, uzmanlık, puan, mesafe, "Şu an müsait" rozeti, çıkış ücreti.
   - Canlı arama (usta adı / uzmanlık) ve kategori filtresi: Tesisat · Elektrik · Çilingir · Kombi · Beyaz Eşya.
   - "Sadece müsait olanlar" anahtarı.
2. **Detay ve Seçim Ekranı (`/usta/[id]`):**
   - Usta profili: deneyim yılı, tamamlanan iş sayısı, hizmet bölgesi, yorumlar, fiyat aralığı.
   - Sorun tipi seçimi (ör. "Su sızıntısı", "Priz yanık kokuyor"); aciliyet: **Hemen / Bugün / Randevu**.
   - Ziyaret saati ve adres notu; **"Ustayı Çağır"** butonu.
3. **Kayıt / Kod Üretme Ekranı (`/cagri` → `/is-emirlerim`):**
   - Çağrı özeti ve tahmini ücret; onaylanınca Rust komutu `is_emri_uret` çağrılır.
   - Üretilen kod "İş Emirlerim" sayfasında usta, sorun, saat ve durum (Bekliyor / Yolda / Tamamlandı) ile listelenir.
4. **Profil ve Ayarlar (`/profil`):**
   - Ad, telefon, adres; uygulama dili (TR / EN / AR / FA, AR ve FA sağdan sola); gece / gündüz modu.
   - Bilgi sayfalarına bağlantılar (Hakkında, İletişim, Koşullar, Gizlilik).

---

## 4. Veri Modeli ve Kod Üretimi

```ts
type Kategori = "tesisat" | "elektrik" | "cilingir" | "kombi" | "beyaz-esya";

interface Usta {
  id: number;
  ad: string;
  kategori: Kategori;
  puan: number;          // 0–5
  yorumSayisi: number;
  mesafeKm: number;
  musait: boolean;
  cikisUcreti: number;   // TL
  deneyimYil: number;
  bolge: string;
  sorunlar: SorunTipi[]; // ustanın çözdüğü sorun şablonları
}

interface IsEmri {
  kod: string;           // Rust tarafından üretilir
  ustaId: number;
  sorun: string;
  aciliyet: "hemen" | "bugun" | "randevu";
  zaman: string;         // ISO tarih-saat
  durum: "bekliyor" | "yolda" | "tamamlandi";
}
```

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
