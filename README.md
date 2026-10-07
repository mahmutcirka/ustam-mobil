<div align="center">

<a href="https://www.istinye.edu.tr" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/isu-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/isu-logo.svg">
    <img alt="İstinye Üniversitesi" src="public/isu-logo.svg" width="280" />
  </picture>
</a>

<br><br>

<img src="src-tauri/icons/128x128.png" alt="Ustam logosu" width="96" />

# Ustam — Acil Usta Çağırma

**Evdeki ani arızalarda yakındaki müsait ustayı 4 dilde bulup çağıran, her çağrı için Rust ile iş emri kodu üreten Tauri v2 uygulaması.**

<sub>İstinye Üniversitesi · Meslek Yüksekokulu · MYO063 Mobil Programlama</sub>

<p>
  <a href="https://www.istinye.edu.tr"><img alt="İSTİNYE ÜNİVERSİTESİ İSTANBUL" src="https://img.shields.io/badge/%C4%B0ST%C4%B0NYE%20%C3%9CN%C4%B0VERS%C4%B0TES%C4%B0-%C4%B0STANBUL-002855?style=for-the-badge"></a>
  <a href="https://github.com/keyvanarasteh/hello-mobil"><img alt="MYO063 MOBİL PROGRAMLAMA" src="https://img.shields.io/badge/MYO063-MOB%C4%B0L%20PROGRAMLAMA-c2410c?style=for-the-badge"></a>
  <a href="#-akademik-bilgiler"><img alt="DÖNEM 2026-2027 GÜZ" src="https://img.shields.io/badge/D%C3%96NEM-2026--2027%20G%C3%9CZ-2563eb?style=for-the-badge"></a>
</p>
<p>
  <a href="https://v2.tauri.app/"><img alt="Tauri v2" src="https://img.shields.io/badge/Tauri-v2-FFC131?style=for-the-badge&logo=tauri&logoColor=white"></a>
  <a href="https://www.rust-lang.org/"><img alt="Rust" src="https://img.shields.io/badge/Rust-stable-000000?style=for-the-badge&logo=rust&logoColor=white"></a>
  <a href="https://astro.build/"><img alt="Astro v7" src="https://img.shields.io/badge/Astro-v7-BC52EE?style=for-the-badge&logo=astro&logoColor=white"></a>
  <a href="https://svelte.dev/"><img alt="Svelte 5" src="https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white"></a>
  <a href="https://react.dev/"><img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"></a>
  <a href="https://bun.sh/"><img alt="Bun" src="https://img.shields.io/badge/Bun-1.x-000000?style=for-the-badge&logo=bun&logoColor=white"></a>
  <a href="https://github.com/mahmutcirka/ustam-mobil/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/mahmutcirka/ustam-mobil/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License Apache-2.0" src="https://img.shields.io/badge/License-Apache--2.0-blue?style=for-the-badge"></a>
</p>
<p>
  <img alt="Diller" src="https://img.shields.io/badge/Diller-TR%20%C2%B7%20EN%20%C2%B7%20AR%20%C2%B7%20FA-15803d?style=flat-square">
  <img alt="RTL" src="https://img.shields.io/badge/RTL-AR%20%C2%B7%20FA-15803d?style=flat-square">
  <img alt="Platformlar" src="https://img.shields.io/badge/Platform-Android%20%C2%B7%20iOS%20%C2%B7%20Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-475569?style=flat-square">
</p>

</div>

---

## 📋 İçindekiler

- [Akademik Bilgiler](#-akademik-bilgiler)
- [Proje Hakkında](#-proje-hakkında)
- [Temel Özellikler](#-temel-özellikler)
- [Mimari](#-mimari)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Dokümantasyon](#-dokümantasyon)
- [Lisans](#-lisans)

---

## 🎓 Akademik Bilgiler

| Bilgi | Detay |
|:---|:---|
| **Kurum** | [İstinye Üniversitesi](https://www.istinye.edu.tr) — Meslek Yüksekokulu |
| **Program** | Bilişim Güvenliği Teknolojisi |
| **Ders** | `MYO063` — Mobil Programlama *(App Development)* · 2026–2027 Güz |
| **Öğretim Görevlisi** | Öğr. Gör. Keyvan Arasteh Abbasabad — [qrofessor.com](https://qrofessor.com) · [GitHub](https://github.com/keyvanarasteh) · [LinkedIn](https://www.linkedin.com/in/keyvanarasteh/) |
| **Kaynak Depo** | [`keyvanarasteh/hello-mobil`](https://github.com/keyvanarasteh/hello-mobil) |
| **Öğrenci** | **Mahmut Çirka** — `2520191026` — Şube 1 |
| **GitHub** | [`@mahmutcirka`](https://github.com/mahmutcirka) |
| **Proje Fikri** | [`docs/proje-fikri.md`](docs/proje-fikri.md) |

---

## 🚀 Proje Hakkında

Musluk patladığında, sigorta attığında ya da kapıda kaldığınızda güvenilir ve **şu an müsait** bir ustaya
ulaşmak zordur. **Ustam**, yakındaki ustaları puan, mesafe ve müsaitlik durumuyla listeler; sorunu hazır
şablonlarla **kendi dilinizde** seçip ustayı hemen, bugün veya randevuyla çağırmanızı sağlar.

Her çağrı onaylandığında uygulamanın **Rust çekirdeği** `UST-ELK-1210-K7Q4` biçiminde bir **iş emri kodu**
üretir. Usta kapıya geldiğinde bu kodu söyler; uygulama kodu doğrulayarak kapıdaki kişinin sizin
çağırdığınız usta olduğunu gösterir.

Proje, [`keyvanarasteh/hello-mobil`](https://github.com/keyvanarasteh/hello-mobil) şablonundaki PassoKlon
uygulamasının dönüştürülmesiyle geliştirilmiştir (etkinlik → usta, sepet → çağrı, bilet kodu → iş emri kodu).

---

## ✨ Temel Özellikler

**Ustaları bulma**
- 🗺️ **Liste ve harita:** 17 usta; stilize İstanbul haritasında (Boğaz, iki yaka, Adalar) pinler ve seçilen ustanın kartı.
- 📍 **Semte göre mesafe ve varış süresi:** İlk açılışta seçilen semtten her ustaya km ve trafikli tahmini varış süresi hesaplanır.
- 🚨 **"Acil mi?" kısayolları:** Su sızıntısı, elektrik kesintisi, kapıda kalma ve sıcak su için en yakın müsait usta tek dokunuşta açılır.
- 🔎 **Filtre ve sıralama:** Canlı arama, kategori çipleri, şu an müsait, favoriler, **"dilimi konuşan usta"** filtresi; önerilen / en yakın / en yüksek puan / en uygun fiyat sıralaması.
- 🕘 **Canlı müsaitlik:** Çalışma saatleri ve meşguliyete göre "Şu an müsait", "Meşgul" ya da "Kapalı · 09:00 açılır".

**Usta detayı ve çağrı**
- ⭐ Rozetler (kimliği doğrulandı, sigortalı, 7/24, hızlı yanıt), deneyim, yanıt süresi, konuştuğu diller.
- 💬 Dört dilden gelebilen yorumlar, 5→1 yıldız puan dağılımı, kullanıcının kendi yorumları.
- 🧰 Sorun başına tahmini işçilik aralığı ve süresi; 15 sorunun her biri için **"usta gelene kadar"** güvenlik ipucu.
- 📷 Arızanın fotoğrafı (cihazda küçültülür, hiçbir yere gönderilmez), adres notu, Hemen / Bugün / Randevu.

**Rust çekirdeği**
- 🦀 **Kontrol karakterli iş emri kodu** `UST-ELK-1210-K7QM` — yanlış yazılmış kod iş listesine bakılmadan yakalanır.
- 🧮 **Fiyat motoru** `fiyat_hesapla` — acil servis, gece (%25), Pazar (%15) ek ücretleri ve işçilik aralığı.
- 🔁 Aynı kurallar tarayıcı için TypeScript'te; ikisi **ortak test vektörleriyle** doğrulanır.

**Canlı takip ve güvenlik**
- 🛵 Talep alındı → Usta onayladı → Yolda (geri sayım ve ilerleme çubuğu) → Kapıda → Tamamlandı.
- 🛡️ Kapıdaki ustanın kodu kart içinde doğrulanır; kod listede yoksa **"Kapıyı açmayın!"** uyarısı. QR kod ve kopyalama.
- ✅ İş bitince 1–5 yıldız ve yorum; iptalde neden sorulur; geçmişten "Tekrar çağır".

**Dil, erişilebilirlik ve gizlilik**
- 🌍 **TR · EN · AR · FA** (259 anahtar × 4 dil), AR/FA'da `dir="rtl"` ve mantıksal CSS; yabancı kullanıcının seçtiği sorun ustaya **Türkçe** iletilir.
- 🎨 SVG ikon seti, Sistem / Gündüz / Gece teması, WCAG AA kontrast, klavye odağı ve `prefers-reduced-motion` desteği.
- 🔐 Tüm veriler cihazda (localStorage); profilde KVKK için **dışa aktarma** ve **tümünü silme**.
- 📱 Telefon / tablet / masaüstü / büyük ekran için 1–4 sütun; masaüstünde yan menü.
- 📖 Hakkında, İletişim, Kullanım Koşulları ve Gizlilik sayfaları — 4 dilde.

---


## 🧩 Mimari

- **Rust çekirdeği (Tauri v2):** Yerel pencere, IPC ile JS'ten çağrılan `is_emri_uret` / `is_emri_dogrula` komutları.
- **Astro (`output: 'static'`):** Dosya tabanlı rotalar, `<ClientRouter />` ile yumuşak sayfa geçişleri.
- **Svelte 5 Runes:** Ekranlar ve `$state` store'ları (çağrı taslağı, iş emirleri, dil, tema).
- **React + MDX:** Bilgi sayfalarına gömülü etkileşimli `CanliRozet` bileşeni.

Klasör yapısı [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md), sayfa ağacı ve platform matrisi
[`docs/mimari-agac.md`](docs/mimari-agac.md) belgelerindedir.

---

## 🧰 Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| Çekirdek platform | [Tauri v2](https://v2.tauri.app/) + [Rust](https://www.rust-lang.org/) | Yerel runtime, iş emri kodu üretimi |
| Web çatısı | [Astro](https://astro.build/) | Statik derleme ve çoklu çatı orkestrasyonu |
| Arayüz | [Svelte 5](https://svelte.dev/) | Runes ile reaktif ekranlar |
| Bileşen entegrasyonu | [React 19](https://react.dev/) | MDX içindeki etkileşimli bileşenler |
| İçerik | [MDX](https://mdxjs.com/) | Bilgi ve yasal sayfalar |
| QR kod | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | İş emri kodunun QR karşılığı (MIT) |
| Testler | [Bun test](https://bun.sh/docs/cli/test) + `cargo test` | Ortak test vektörleriyle TS ve Rust kuralları |
| Paket yöneticisi | [Bun](https://bun.sh/) | Bağımlılık kurulumu ve script çalıştırma |

---

## 📦 Kurulum ve Çalıştırma

Ön gereksinimler: [Bun](https://bun.sh/), [Rust](https://rustup.rs/) ve işletim sisteminize göre
[Tauri önkoşulları](https://v2.tauri.app/start/prerequisites/). Ayrıntılar: [`docs/kurulum.md`](docs/kurulum.md).

```bash
# 1. Depoyu klonlayın
git clone https://github.com/mahmutcirka/ustam-mobil.git
cd ustam-mobil

# 2. Bağımlılıkları yükleyin
bun install

# 3. Web geliştirme sunucusu → http://127.0.0.1:1420
bun run dev

# 4. Tauri masaüstü penceresinde çalıştırın
bun run tauri dev

# 5. Üretim derlemesi (dist/) — 0 hata beklenir
bun run build

# Rust birim testleri
cd src-tauri && cargo test
```

---

## 🧪 Testler ve CI

| Katman | Komut | Kapsam |
|---|---|---|
| Rust kuralları | `cd src-tauri && cargo test` | Kod üretimi ve kontrol karakteri, kod doğrulama, haftanın günü, fiyat dökümü (7 test) |
| TypeScript | `bun run test` | Ortak test vektörleri, 4 dilli sözlük tutarlılığı, örnek veri bütünlüğü, canlı takip aşamaları (70 test) |
| Tip kontrolü | `bunx svelte-check --tsconfig ./tsconfig.json` | Tüm Svelte bileşenleri ve TS modülleri |

Rust ve TypeScript aynı iş kurallarını uygular; [`src-tauri/test-vektorleri.json`](src-tauri/test-vektorleri.json) dosyasındaki
elle hesaplanmış örnekler iki tarafta da çalıştırılır. [`.github/workflows/ci.yml`](.github/workflows/ci.yml) her push ve
PR'da derlemeyi, TS testlerini ve tip kontrolünü (Linux), Rust testlerini (Windows) çalıştırır.

---

## 📚 Dokümantasyon

| Belge | İçerik |
|---|---|
| [`docs/proje-fikri.md`](docs/proje-fikri.md) | Konsept, 3 ekran, veri modeli ve kod formatı |
| [`docs/branding.md`](docs/branding.md) | Renk token'ları, kontrast oranları, logo ve platform ikonları |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa ağacı, platform matrisi, dil kapsamı, breakpoint'ler |
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Klasör yapısı ve sorumlulukları |
| [`docs/kurulum.md`](docs/kurulum.md) | Kurulum ve çalıştırma |
| [`docs/kurallar.md`](docs/kurallar.md) | Git akışı ve kod yazım kuralları |
| [`docs/kaynaklar.md`](docs/kaynaklar.md) | Tasarım ve teknik kaynaklar |
| [`docs/teslim.md`](docs/teslim.md) | Teslim adımları ve görev → PR eşlemesi |
| [`docs/ilerleme-batch-01.md`](docs/ilerleme-batch-01.md) | Batch 01 kontrol matrisi ve derleme kanıtı |
| [`docs/ajan-uyum-testi.md`](docs/ajan-uyum-testi.md) | Ajan uyum testi protokolü |
| [`docs/tasks/week-3/`](docs/tasks/week-3/) | Hafta 3 görev tanımları |
| [`AGENTS.md`](AGENTS.md) | Yapay zekâ ajanları için bağlayıcı kurallar |

---

## 📄 Lisans

Bu proje [Apache License 2.0](LICENSE) ile lisanslanmıştır.
