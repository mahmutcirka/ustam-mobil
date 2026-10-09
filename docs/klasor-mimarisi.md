# Klasör Mimarisi ve Dizin Rehberi

Bu belge, projenin temel dizin yapısını, önemli klasörlerin sorumluluklarını ve bunların ne zaman / nasıl kullanılacağını açıklar.

> 📌 **Dokümantasyon Kuralı:**
> Dizin yapısı yalnızca bu belgede tutulur; `README.md` veya `AGENTS.md` içine kopyalanmaz, buraya link verilir.
> Proje geliştikçe her münferit dosyayı buraya eklemeyin; ana klasörleri ve sorumluluk sınırlarını koruyun.

---

## 📂 Temel Dizin Mimarisi

```
ustam/
├── package.json             # Bağımlılıklar, scriptler ve motor tanımları
├── astro.config.mjs         # Astro entegrasyonları (Svelte, React, MDX) ve Vite port ayarları
├── tsconfig.json            # TypeScript yapılandırması ve $lib alias'ı
├── .gitignore               # Versiyon kontrol dışı bırakılan dosyalar
├── app-icon.svg             # Tüm platform ikonlarının tek kaynağı (bun run tauri icon app-icon.svg)
│
├── public/                  # Statik varlıklar (Derlenmeyen logolar, favicon, görseller)
├── src-tauri/               # Rust Tauri çekirdeği (Pencere, yetkiler, native komutlar)
│   ├── tauri.conf.json      # Masaüstü/mobil pencere ayarları ve frontendDist hedefi
│   ├── Cargo.toml           # Rust kütüphaneleri ve bağımlılıkları
│   ├── icons/               # tauri icon ile üretilen macOS / Windows / Linux / iOS / Android ikonları
│   ├── gen/android/         # tauri android init ile üretilen Gradle projesi (APK/AAB); build/ ve .so repoya girmez
│   ├── test-vektorleri.json # Rust ve TS kurallarının ortak, elle hesaplanmış test örnekleri
│   └── src/lib.rs           # Rust komutları (kod üretimi/doğrulama, fiyat), testleri ve giriş noktası
│
├── src/                     # Ön yüz kaynak kodları (Frontend)
│   ├── layouts/             # Sayfa iskeleti: Layout.astro (header, alt menü, bildirimler, karşılama, tema + dil/RTL)
│   ├── pages/               # Dosya tabanlı rotalar (.astro, .mdx); en/ ar/ fa/ alt klasörleri bilgi sayfalarının diğer dilleri
│   ├── components/          # Sayfa düzeyindeki bileşenler (.svelte, .tsx, .astro)
│   ├── lib/                 # İş kuralları, örnek veri, çeviriler, ikonlar, Svelte 5 store'ları
│   │   ├── types/           # Veri sözleşmesi: her ana tip ayrı dosyada, index.ts hepsini dışa aktarır
│   │   └── components/      # Küçük UI parçaları; ui/ altında veri tipini tanımayan genel bileşenler
│   └── styles/              # Global tema değişkenleri ve CSS stilleri (app.css)
│
├── araclar/                 # Geliştirme araçları: telefon.ts + telefon.html (bun run telefon — telefon çerçeveli önizleme)
├── tests/                   # bun test: ortak vektörler, çeviri tutarlılığı, veri bütünlüğü, canlı takip
├── .github/workflows/       # CI: derleme + TS testleri + tip kontrolü (Linux), cargo test (Windows)
└── docs/                    # Proje dokümantasyonu, görevler ve mimari rehberler
```

---

## 🛠️ Klasörlerin Kullanımı ve Sorumlulukları

### 1. `package.json` & `astro.config.mjs` (Kök Konfigürasyon)
- **`package.json`:** Projenin bağımlılıklarını (`dependencies`) ve `bun run dev`, `bun run build` gibi komutlarını barındırır.
- **`astro.config.mjs`:** Svelte, React, MDX gibi entegrasyonların ve Vite ayarlarının (Tauri portu `1420`, `$lib` aliası) yapıldığı merkezdir.

### 2. `public/` (Statik Varlıklar)
- **Ne konur?** Doğrudan derleme sürecine girmeden tarayıcıya sunulacak dosyalar (logolar, `favicon.png`, `robots.txt`, resimler).
- **Nasıl kullanılır?** Kod içinde `/logo.svg` veya `/favicon.png` şeklinde kök dizinden çağrılır.

### 3. `src-tauri/` (Native Çekirdek)
- **Ne konur?** Rust backend kodları (`src/lib.rs`), Cargo paketleri (`Cargo.toml`) ve uygulama pencere/izin ayarları (`tauri.conf.json`).
- **Ne zaman kullanılır?** İşletim sistemiyle konuşacak native kodlar (iş emri kodu üretme ve doğrulama, dosya sistemi, bildirimler) yazılırken.

### 4. `src/layouts/` (Sayfa İskeletleri)
- **Ne konur?** Sayfaların ortak şablonları (`Layout.astro`).
- **Ne zaman kullanılır?** Üst bar, alt gezinme menüsü, tema kontrolü (`document.documentElement.dataset.tema`) ve yumuşak sayfa geçişleri (`<ClientRouter />`) burada tanımlanır. Sayfalar bu layout'u sarmalar.

### 5. `src/pages/` (Dosya Tabanlı Rotalar)
- **Ne konur?** Kullanıcının tarayıcıda veya mobil ekranda gezeceği sayfalar (`index.astro`, `is-emirlerim.astro`, `usta/[id].astro`, `hakkinda.mdx`, `en/hakkinda.mdx`).
- **Kural:** Dosya adı doğrudan URL yolu olur. İçerik ağırlıklı sayfalar için `.mdx`, dinamik veya bileşen içeren sayfalar için `.astro` kullanılır.

### 6. `src/components/` (Yeniden Kullanılabilir UI Bileşenleri)
- **Ne konur?** Butonlar, kartlar, formlar, üst/alt barlar (`.svelte` veya `.tsx`).
- **Kural:** Birden fazla sayfada tekrar eden veya bağımsız bir işlevi olan görsel parçalar burada toplanır. Svelte veya React ile yazılabilir.

### 7. `src/lib/` (Durum ve İş Mantığı)
- **Ne konur?** Svelte 5 `$state` store'ları (çağrı taslağı, iş emirleri, dil, tema), mock veriler (`data.ts`), çeviri sözlükleri (`ceviriler.ts`) ve Rust invoke çağrıları.
- **Nasıl import edilir?** `$lib/data` veya `$lib/cagri.svelte` şeklinde doğrudan alias ile çağrılır.

### 8. `src/lib/types/` (Veri Sözleşmesi)
- **Ne konur?** Uygulamanın bütün veri tipleri: `ortak.ts` (dil, semt, konum), `usta.ts`, `hizmet.ts`, `isEmri.ts`, `kural.ts` (Rust yapılarının karşılığı), `profil.ts`, `liste.ts`, `bildirim.ts`; `index.ts` hepsini dışa aktarır.
- **Kural:** Yeni veri alanı önce burada tanımlanır; durum gibi alanlar serbest metin değil sabit seçenek listesidir (`as const` dizi + türetilmiş tip). Alan tabloları: [`docs/veri-modeli.md`](veri-modeli.md).

### 9. `src/styles/` (Tasarım ve Stiller)
- **Ne konur?** `app.css` ve tema tanımları.
- **Kural:** Renkler CSS değişkeni (`--renk-ana`, `--zemin`, `--kart`) olarak burada tanımlanır; ad-hoc renk yazılmaz.

### 10. `docs/` (Dokümantasyon)
- **Ne konur?** Mimari kararlar, marka renkleri, görev kılavuzları ve proje planları.

### 11. `tests/` (TypeScript Testleri)
- **Ne konur?** `bun test` ile çalışan `*.test.ts` dosyaları; yalnızca saf modülleri (`kurallar.ts`, `data.ts`, `takip.ts`, `ceviriler.ts`) test eder.
- **Kural:** Yeni bir iş kuralı eklenince önce `src-tauri/test-vektorleri.json`'a örnek eklenir; Rust (`cargo test`) ve TS (`bun run test`) aynı örnekleri çalıştırır. Testlerin kendi `tsconfig.json`'u `bun` tiplerini içerir.

### 12. `.github/workflows/` (Sürekli Entegrasyon)
- **Ne konur?** `ci.yml` — her push ve PR'da derleme, testler ve tip kontrolü.
