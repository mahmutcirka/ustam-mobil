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
├── / (Ustalar — ana liste)                          src/pages/index.astro
│   ├── Canlı arama (ad, uzmanlık, semt — seçili dilde ve Türkçe)
│   ├── Kategori çipleri: Tesisat · Elektrik · Çilingir · Kombi · Beyaz Eşya
│   ├── "Sadece müsait olanlar" anahtarı
│   └── Usta kartları (müsait olanlar önce, mesafeye göre sıralı)
│
├── /usta/[id] (Usta detayı ve seçim)                 src/pages/usta/[id].astro
│   ├── Profil: deneyim, tamamlanan iş, bölge, puan
│   ├── Sorun tipi seçimi (+ "ustaya Türkçe iletilecek" önizlemesi)
│   ├── Aciliyet: Hemen (+acil ücret) / Bugün (saat dilimi) / Randevu (tarih + saat)
│   └── Adres notu → "Ustayı çağır"
│
├── /cagri (Çağrı özeti ve onay)                      src/pages/cagri.astro
│   └── Tahmini tutar → Rust: invoke("is_emri_uret", { kategori, zaman })
│
├── /is-emirlerim (İş emirleri ve kodlar)             src/pages/is-emirlerim.astro
│   ├── Rust'ın ürettiği kod: UST-ELK-1210-K7Q4, durum (Bekliyor / Yolda / Tamamlandı / İptal)
│   └── Kapıdaki ustayı doğrula → Rust: invoke("is_emri_dogrula", { kod })
│
├── /profil (Kullanıcı ve ayarlar)                    src/pages/profil.astro
│   ├── Ad, telefon, adres (localStorage)
│   ├── Uygulama dili (TR / EN / AR / FA) ve gece / gündüz modu
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
Ustalar ──► Usta detayı ──► Çağrı özeti ──[Rust: is_emri_uret]──► İş Emirlerim
   ▲                                                                   │
   └──────────────── alt menü / yan şerit (Ustalar · Çağrı · İş Emirlerim · Profil) ◄┘
```

### Paylaşılan durum (store'lar — `src/lib/`)

| Store | İçerik | Kalıcılık |
|---|---|---|
| `cagri.svelte.ts` | Onaylanmamış çağrı taslağı | `localStorage["cagri-taslagi"]` |
| `isEmirleri.svelte.ts` | İş emirleri listesi, Rust çağrıları | `localStorage["is-emirleri"]` |
| `i18n.svelte.ts` | Seçili dil, `t()` çevirisi, RTL yönü | `localStorage["dil"]` |
| `tema.svelte.ts` | Gece / gündüz modu | `localStorage["tema"]` |

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
