# AGENTS.md — Ustam

Bu belge, bu depoda çalışan tüm yapay zekâ ajanları (Antigravity, Claude, Cursor, Gemini) için bağlayıcı
geliştirme kurallarını içerir. `CLAUDE.md` ve `GEMINI.md` yalnızca bu dosyaya yönlendirir.

## 1. Dokümantasyon ve Tek Kaynak Kuralı (DRY Docs)

- **Dokümanlar tekrarlanmaz, link edilir:** Ajan dizin ağaçlarını, kuralları veya renk tablolarını dosyalar
  arasında kopyalamaz; ilgili konuda daima `docs/` altındaki tek doğru kaynağa link verir.
- Aşağıdaki belgeler bağlayıcı standartlardır:

| Doküman | Kapsam | Bağlayıcı kural |
|---|---|---|
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Dizin ve dosya yapısı | Klasör mimarisi yalnızca bu belgede tanımlanır. Yeni dosya eklerken bu hiyerarşiye uy. |
| [`docs/branding.md`](docs/branding.md) | Marka kimliği ve renkler | Ad-hoc renk uydurma; `branding.md`'deki CSS değişkenlerini kullan. |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa ve özellik haritası | Yeni sayfa veya rota eklerken mimari ağaca sadık kal. |
| [`docs/proje-fikri.md`](docs/proje-fikri.md) | Proje konsepti | İş mantığı ve veri modelleri Ustam konseptine uygun olmalı. |
| [`docs/kurallar.md`](docs/kurallar.md) | Git akışı ve kod yazımı | Branch, commit ve PR kuralları burada ayrıntılıdır. |

## 2. Teknoloji Yığını ve Çalıştırma

- **Çekirdek:** Tauri v2 (Rust) + Astro (statik)
- **Arayüz:** Svelte 5 (Runes: `$state`, `$derived`, `$props`), React bileşenleri, MDX
- **Paket yöneticisi:** Bun
- **Geliştirme sunucusu:** `bun run dev` (127.0.0.1:1420)
- **Tauri uygulaması:** `bun run tauri dev`
- **Derleme / doğrulama:** `bun run build`
- **Rust testleri:** `cargo test` (`src-tauri/` içinde)

## 3. Git ve Geliştirme Disiplini (Zorunlu)

1. **Doğrudan `master`/`main`'e commit atılmaz!**
   - Her yeni özellik veya düzeltme için `feature/<ozellik-adi>` veya `fix/<hata-adi>` dalı açılır.
   - Değişiklikler test edildikten sonra Pull Request (PR) ile incelenip ana dala birleştirilir.
2. **Kanıtsız teslim yapılmaz:**
   - Her değişiklikten sonra `bun run build` çalıştırılır ve derlemenin 0 hata ile tamamlandığı doğrulanır.
3. **Kapsam koruma (Scope Guard):**
   - Yalnızca görevin gerektirdiği dosyalar düzenlenir. İstenmeyen dosyalarda "temizlik" veya izinsiz büyük
     refactoring yapılmaz.

## 4. Kod Yazım Kuralları

- Svelte kodlarında Svelte 5 Runes (`$state`, `$derived`, `$props`) kullanılır. Eski Svelte 4 sözdizimi
  (`export let`, `$:`) kullanılmaz.
- SSR güvenliği: `window`, `document` veya `localStorage` erişimleri yalnızca client ortamında ya da korumalı
  (`typeof window !== 'undefined'`, `try/catch`) yapılır. Kalıcı veri için `src/lib/depo.ts` yardımcılarını kullan.
- Arayüz metinleri koda gömülmez; `src/lib/ceviriler.ts` sözlüğüne **4 dilde (TR, EN, AR, FA)** eklenir ve
  `dil.t("anahtar")` ile okunur.
- RTL uyumu için fiziksel yön yerine mantıksal CSS özellikleri kullanılır (`margin-inline-start`,
  `border-inline-start`, `inset-inline-start`).
