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
| **GitHub** | [`@KULLANICI-ADIN`](https://github.com/KULLANICI-ADIN) |
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

- 🔧 **Ustalar:** Canlı arama, 5 kategori çipi (Tesisat, Elektrik, Çilingir, Kombi, Beyaz Eşya) ve "sadece müsait olanlar" filtresi.
- 📋 **Usta detayı:** Sorun tipi, aciliyet (Hemen / Bugün / Randevu), ziyaret saati ve adres notu seçimi; tahmini tutar.
- 🦀 **Rust iş emri kodu:** `is_emri_uret` ve `is_emri_dogrula` Tauri komutları, birim testleriyle.
- 🛡️ **Kapıda doğrulama:** Ustanın söylediği kod iş emirlerinizde yoksa "Kapıyı açmayın!" uyarısı.
- 🌍 **4 dil + RTL:** Türkçe, İngilizce, Arapça, Farsça; AR ve FA'da `dir="rtl"`. Yabancı kullanıcının seçtiği sorun ustaya Türkçe iletilir.
- 🌗 **Gece / gündüz modu:** WCAG AA kontrastlı marka renkleri ([`docs/branding.md`](docs/branding.md)).
- 📱 **Responsive:** Telefon, tablet, masaüstü ve büyük ekran için 1–4 sütunlu ızgara; masaüstünde yan menü.
- 📖 **Bilgi sayfaları:** Hakkında, İletişim (reaktif form), Kullanım Koşulları ve Gizlilik (KVKK) — 4 dilde.

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
| Paket yöneticisi | [Bun](https://bun.sh/) | Bağımlılık kurulumu ve script çalıştırma |

---

## 📦 Kurulum ve Çalıştırma

Ön gereksinimler: [Bun](https://bun.sh/), [Rust](https://rustup.rs/) ve işletim sisteminize göre
[Tauri önkoşulları](https://v2.tauri.app/start/prerequisites/). Ayrıntılar: [`docs/kurulum.md`](docs/kurulum.md).

```bash
# 1. Depoyu klonlayın
git clone https://github.com/KULLANICI-ADIN/hello-mobil.git
cd hello-mobil

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
| [`docs/teslim.md`](docs/teslim.md) | Teslim adımları |
| [`docs/tasks/week-3/`](docs/tasks/week-3/) | Hafta 3 görev tanımları |
| [`AGENTS.md`](AGENTS.md) | Yapay zekâ ajanları için bağlayıcı kurallar |

---

## 📄 Lisans

Bu proje [Apache License 2.0](LICENSE) ile lisanslanmıştır.
