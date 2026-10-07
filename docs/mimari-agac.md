# Ustam — Mimari Ağaç, Sayfa Haritası ve Platform Kapsamı

> Görev tanımı: [`docs/tasks/week-3/07-hedefler-agac-yapisi.task.md`](tasks/week-3/07-hedefler-agac-yapisi.task.md)
>
> Bu belge sayfa ve rota yapısının **tek doğru kaynağıdır**. Klasör yapısı için
> [`docs/klasor-mimarisi.md`](klasor-mimarisi.md), renkler için [`docs/branding.md`](branding.md) geçerlidir.

---

## 1. Sayfa ve Özellik Ağacı (Site & Feature Map)

Her satır bir rotadır; `src/pages/` altındaki dosya adı URL'yi belirler.

```
Ustam
├── (ilk açılış) Karşılama penceresi                 src/components/Karsilama.svelte
│   ├── 1. adım: dil seçimi (TR / EN / AR / FA) ve uygulamanın 3 özelliği
│   └── 2. adım: semt seçimi → mesafe ve varış süreleri bu semtten hesaplanır
│
├── / (Ustalar — ana sayfa)                          src/pages/index.astro
│   ├── Semt düğmesi (alt panel) · profil kısayolu · selamlama
│   ├── "Ne oldu?": 4 acil kısayol — en yakın müsait usta adı + varış süresi → /usta/[id]?sorun=…&aciliyet=hemen
│   ├── "Arızayı adım adım tarif et" → Ne oldu sihirbazı (alt panel): alan → sorun → aciliyet → en iyi 3 usta
│   ├── Aktif iş bandı: "{usta} yolda · ~9 dk" → /is-emirlerim
│   ├── Akıllı arama (arama.ts): usta adı, semt, kategori ve 4 dildeki sorun adları; sorun önerileri
│   ├── Kategori çipleri · Filtrele (alt panel: durum, mesafe, puan, ücret, dil, favori) · Sırala (alt panel)
│   ├── "Önerilen" sıralama (eslestirme.ts) ve ilk kartta "Neden önerildi?" açıklaması
│   └── Görünüm: Liste (usta kartları) ⇄ Harita (pinler, varış etiketi, alttaki usta kartı, "Listeye dön")
│
├── /usta/[id] (Usta detayı ve çağrı hazırlama)       src/pages/usta/[id].astro
│   ├── Kapak: ad, doğrulama rozeti, puan, anlık durum (müsait / meşgul / kapalı), favori
│   ├── Rozetler · istatistikler (deneyim, tamamlanan iş, yanıt süresi, uzaklık) · saatler · diller
│   ├── Sorun seçimi: işçilik aralığı + süre; "ustaya Türkçe iletilecek" önizlemesi; güvenlik ipucu
│   ├── Aciliyet: Hemen (+acil ücret) / Bugün (çalışma saatleri içinde) / Randevu (7 günlük gün çipleri + saat)
│   ├── Tehlikeli sorunlarda 112 bağlantısı
│   ├── Fotoğraf (yalnızca görsel, ≤15 MB, cihazda küçültülür) · adres notu (profilden ya da "Tekrar çağır"dan dolar)
│   ├── Yorumlar: puan dağılımı, 4 dilden yorumlar, kullanıcının kendi yorumu
│   └── Sabit çağrı çubuğu: tahmini toplam + "Ustayı çağır"
│
├── /cagri (Çağrı özeti ve onay)                      src/pages/cagri.astro
│   ├── Adımlar: Usta · Sorun · Zaman (+ Değiştir) → Adres (düzenlenebilir) → İletişim → Ödeme
│   ├── Fiyat dökümü → Rust: invoke("fiyat_hesapla", { girdi })  (acil · gece · Pazar · işçilik) + "Nasıl hesaplandı?"
│   ├── Koşulların onayı · sabit onay çubuğu (tahmini toplam + "Çağrıyı onayla") · hata → "Tekrar dene"
│   └── Onay → Rust: invoke("is_emri_uret", { kategori, zaman }) → /is-emirlerim
│
├── /is-emirlerim (İş emirleri)                       src/pages/is-emirlerim.astro
│   ├── Aktif sekmesi — canlı iş kartı (src/components/IsKarti.svelte)
│   │   ├── Dikey çizelge (saatleriyle): Talep alındı → Usta onayladı → Yolda (geri sayım) → Kapıda → Tamamlandı
│   │   ├── Güvenlik kodu alanı: UST-ELK-1210-K7QZ · kopyala · QR kod
│   │   ├── Kapıdaki ustayı doğrula (giriş kodGirdisi.ts ile düzenlenir) → Rust: invoke("is_emri_dogrula", { kod })
│   │   └── İptal (neden penceresi) · İş tamamlandı (doğrulamadan sonra) → değerlendirme penceresi
│   └── Geçmiş sekmesi — tamamlanan / iptal edilen işler, puanım, "Tekrar çağır"
│
├── /profil (Kullanıcı, ayarlar, veri hakları)        src/pages/profil.astro
│   ├── İstatistikler: toplam iş, tamamlanan, harcama, yorumlar
│   ├── Ad, telefon, adres · semt · favori ustalar
│   ├── Dil (4) · tema (Sistem / Gündüz / Gece)
│   ├── KVKK: verilerimi dışa aktar (JSON) · tüm verilerimi sil
│   └── Bilgi sayfalarına bağlantılar (seçili dilde)
│
└── Bilgi ve yasal sayfalar — her biri 4 dilde (AR ve FA: dir="rtl")
    ├── /hakkinda   · /en/hakkinda   · /ar/hakkinda   · /fa/hakkinda    (MDX + React CanliRozet)
    ├── /iletisim   · /en/iletisim   · /ar/iletisim   · /fa/iletisim    (Astro + Svelte formu)
    ├── /kosullar   · /en/kosullar   · /ar/kosullar   · /fa/kosullar    (MDX)
    └── /gizlilik   · /en/gizlilik   · /ar/gizlilik   · /fa/gizlilik    (MDX + KVKK)
```

### Ekranlar arası akış

```
Karşılama ─► Ustalar ─► Usta detayı ─► Çağrı özeti ─[Rust: fiyat_hesapla, is_emri_uret]─► İş Emirlerim
                ▲  │                                                                         │
                │  └─ Acil kısayol (sorun + "hemen" önceden seçili) ─────► Usta detayı         │
                └──────── alt menü / yan şerit (Ustalar · Çağrı · İş Emirlerim · Profil) ◄─────┘
```

### Paylaşılan durum (store'lar — `src/lib/`)

| Store / modül | İçerik | Kalıcılık |
|---|---|---|
| `profil.svelte.ts` | Ad, telefon, **semt**, adres; karşılama tamamlandı mı | `localStorage["profil"]`, `["karsilama-tamam"]` |
| `cagri.svelte.ts` | Onaylanmamış çağrı taslağı (foto dahil) ve anlık fiyat tahmini | `localStorage["cagri-taslagi"]` |
| `isEmirleri.svelte.ts` | İş emirleri; doğrulama, tamamlama, iptal | `localStorage["is-emirleri"]` |
| `favoriler.svelte.ts` | Favori usta kimlikleri | `localStorage["favoriler"]` |
| `yorumlar.svelte.ts` | Kullanıcının yorumları; usta puanına eklenir | `localStorage["yorumlarim"]` |
| `i18n.svelte.ts` | Seçili dil, `t()` çevirisi, RTL yönü | `localStorage["dil"]` |
| `tema.svelte.ts` | Sistem / Gündüz / Gece tercihi | `localStorage["tema"]` |
| `bildirim.svelte.ts` | Kısa bildirimler; sayfa geçişi için kuyruk | `sessionStorage["bildirim-kuyrugu"]` |
| `saat.svelte.ts` | 15 sn'de bir güncellenen saat (müsaitlik, geri sayım) | — |
| `motor.ts` → `kurallar.ts` / Rust | Kod üretimi, kod doğrulama, fiyat (Tauri'de Rust, tarayıcıda TS) | — |
| `takip.ts` | İşin anlık aşaması, kalan süre, ilerleme (**simülasyon**: sunucu yok, zamana göre hesaplanır) | — |
| `arama.ts` | Normalleştirilmiş, 4 dilli arama ve sorun önerileri | — |
| `eslestirme.ts` | "Önerilen" sıralamanın sabit ağırlıklı kuralı ve nedenleri | — |
| `kodGirdisi.ts` | Kapıdaki kodun yazımını düzenler (doğrulama Rust/kurallar.ts'te) | — |
| "Tekrar çağır" taslağı | Önceki işin adres notu, detay sayfası bir kez okur | `localStorage["tekrar-taslagi"]` |

---

## 2. Hedef Platform Matrisi

Tauri v2 sayesinde tek kod tabanından aşağıdaki platformlar hedeflenir. İkon setleri
[`docs/branding.md`](branding.md#platform-ikon-ve-launcher-tablosu) tablosundaki gibi üretilmiştir.

| Platform | İşletim sistemleri | Hedef çıktı | Komut |
|---|---|---|---|
| Masaüstü | macOS (Apple Silicon / Intel) | `.dmg`, `.app` | `bun run tauri build` (macOS üzerinde) |
| Masaüstü | Windows (10 / 11 x64) | `.msi`, `.exe` | `bun run tauri build` |
| Masaüstü | Linux (Ubuntu / Debian) | `.deb`, `.AppImage` | `bun run tauri build` (Linux üzerinde) |
| Mobil | iOS (iPhone & iPad) | `.ipa` (Xcode) | `bun run tauri ios build` (macOS + Xcode) |
| Mobil | Android (telefon & tablet) | `.apk`, `.aab` | `bun run tauri android build` (Android SDK + NDK) |

---

## 3. Dil ve Yön Kapsamı

| Dil | Kod | Yön | Uygulama ekranları | Bilgi sayfaları |
|---|---|---|---|---|
| Türkçe | `tr` | `ltr` | ✓ (varsayılan) | `/hakkinda` … |
| English | `en` | `ltr` | ✓ | `/en/…` |
| العربية | `ar` | `rtl` | ✓ | `/ar/…` |
| فارسی | `fa` | `rtl` | ✓ | `/fa/…` |

- Uygulama ekranlarının metinleri `src/lib/ceviriler.ts` sözlüklerinden gelir; dil seçimi `<html lang dir>`'i günceller.
- Bilgi sayfalarında dil URL'den gelir (`data-sabit-dil`); üst bardaki dil seçici aynı sayfanın diğer dildeki karşılığına geçer.
- Stiller fiziksel yön yerine mantıksal özellikler kullanır (`inset-inline-start`, `border-inline-start`, `padding-inline-start`), böylece RTL'de otomatik aynalanır.

---

## 4. Ekran Boyutları (Responsive Breakpoints)

Breakpoint'ler [`src/styles/app.css`](../src/styles/app.css) (ızgara, `max-width`),
[`src/components/AppNav.svelte`](../src/components/AppNav.svelte) (gezinme) ve
[`src/layouts/Layout.astro`](../src/layouts/Layout.astro) (ana alan boşlukları) içinde tanımlıdır.

| Sınıf | Genişlik | Izgara (`.izgara`) | İçerik `max-width` (`.sayfa`) | Gezinme davranışı |
|---|---|---|---|---|
| Telefon | `< 768px` (375–430 hedef) | 1 sütun | %100, 16px kenar boşluğu | Altta sabit menü (4 sekme), güvenli alan (`safe-area-inset`) desteği |
| Tablet | `768–1199px` | 2 sütun | `960px`, ortalanmış, 24px boşluk | Alt menü korunur; sekmeler 140px genişlikte ortalanır |
| Masaüstü | `1200–1599px` | 3 sütun | `1200px`, ortalanmış | Menü başlığın altında **96px dikey yan şeride** geçer (RTL'de sağ kenar) |
| Büyük ekran | `≥ 1600px` | 4 sütun | `1440px`, ortalanmış | Yan şerit |

- Form ve özet ekranları (`/usta/[id]`, `/cagri`, `/profil`, bilgi sayfaları) her boyutta `.sayfa.dar` ile
  **560px** okunabilir genişlikte kalır.
- Tauri masaüstü penceresi varsayılan olarak 420×820 açılır (telefon düzeni); pencere büyütüldüğünde aynı
  breakpoint'ler devreye girer.
