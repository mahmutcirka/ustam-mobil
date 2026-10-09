# AGENTS.md — Ustam

Bu belge, bu depoda çalışan tüm yapay zekâ ajanları (Antigravity, Cursor, Claude Code, Gemini) için bağlayıcı
sistem talimatlarını içerir. [`CLAUDE.md`](CLAUDE.md) ve [`GEMINI.md`](GEMINI.md) yalnızca bu dosyaya yönlendirir.

**Ustam**, acil arızalarda yakındaki müsait ustayı 4 dilde (TR · EN · AR · FA) bulup çağıran ve her çağrı için
Rust ile `UST-ELK-1210-K7QZ` biçiminde iş emri kodu üreten bir Tauri v2 uygulamasıdır.

## 1. Temel Proje Haritası ve Tek Kaynak Kuralı (DRY Docs)

- **Dokümantasyon tekrar edilmez, link edilir:** Ajan hiçbir zaman dizin ağaçlarını, kuralları veya renk
  tablolarını kopyalayıp birden fazla dosyaya yapıştırmaz. Her zaman `docs/` altındaki tek kaynağa link verir.
- Bir kural değiştiğinde **yalnızca ilgili `docs/*.md`** güncellenir; bu dosya ve README yalnızca link tutar.

| Belge | Kapsam | Bağlayıcı kural |
|---|---|---|
| [`docs/proje-fikri.md`](docs/proje-fikri.md) | Proje konsepti, ekranlar, veri modeli, kod formatı | Veri modelleri, terimler (usta, çağrı, iş emri) ve sayfa içerikleri bu konsepte sadık kalır. |
| [`docs/branding.md`](docs/branding.md) | Marka, renk token'ları, kontrast, ikonlar | Ad-hoc renk yazılmaz. Yalnızca `src/styles/app.css` içindeki CSS değişkenleri kullanılır. |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa ağacı, platformlar, dil kapsamı, breakpoint'ler | Yeni rota veya sayfa eklerken önce bu ağaç güncellenir, sonra sayfa eklenir. |
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Dizin ve dosya mimarisi | Klasör yapısı yalnızca bu belgede tanımlanır; dizin ağacı başka dosyada tekrar yazılmaz. |
| [`docs/kurallar.md`](docs/kurallar.md) | Git akışı, commit, PR ve kod yazım kuralları | Branch/commit/PR biçimi buradaki tabloya uyar. |
| [`docs/kurulum.md`](docs/kurulum.md) | Ön gereksinimler ve çalıştırma | Komut değişirse önce burası güncellenir. |
| [`docs/kaynaklar.md`](docs/kaynaklar.md) | Tasarım ve teknik referanslar | Yeni dış kaynak kullanıldığında buraya eklenir. |
| [`docs/teslim.md`](docs/teslim.md) | Teslim adımları, görev → PR eşlemesi | Teslim biçimi bu belgeye göre hazırlanır. |
| [`docs/ilerleme-batch-01.md`](docs/ilerleme-batch-01.md) | Batch 01 kontrol matrisi ve derleme kanıtı | Yeni teslimden önce matris güncellenir. |
| [`docs/ajan-uyum-testi.md`](docs/ajan-uyum-testi.md) | Ajanın bu kurallara uyum testi | Kurallar değiştiğinde test yeniden çalıştırılır. |
| [`docs/gorev-sartnamesi.md`](docs/gorev-sartnamesi.md) | Her görevde doldurulan şartname şablonu | Değişiklikten önce Amaç, Kapsam dışı, Kabul ölçütleri, Dokunulacak dosyalar ve Doğrulama adımları yazılır. |
| [`docs/istemler/`](docs/istemler/README.md) | Görev başına istem günlüğü (`NN-kisa-ad.md`) | Her görevin istemi, planı, düzeltmeleri ve doğrulama sonucu aynı dalda kaydedilir. |
| [`docs/tasks/`](docs/tasks/) | Eğitmenin haftalık görev dokümanları | Salt okunur; ajan bu dosyaları değiştirmez. |

## 2. Teknoloji Yığını ve Komutlar

- **Platform:** Tauri v2 (Rust çekirdek + WebView) — komutlar `src-tauri/src/lib.rs`
- **Web çatısı:** Astro (statik derleme, `output: 'static'`, port `1420`)
- **Arayüz:** Svelte 5 (Runes: `$state`, `$derived`, `$props`), React bileşenleri, MDX
- **Paket yöneticisi:** Bun

### Komutlar

| Amaç | Komut |
|---|---|
| Web geliştirme | `bun run dev` |
| Tauri geliştirme | `bun run tauri dev` |
| Derleme ve doğrulama | `bun run build` → **0 hata** |
| Rust birim testleri | `cargo test` (`src-tauri/` içinde) |
| TypeScript kural testleri | `bun run test` |
| Tip kontrolü | `bunx svelte-check --tsconfig ./tsconfig.json` |
| Platform ikonları | `bun run tauri icon app-icon.svg` |

## 3. Geliştirme ve Git Kuralları

1. **Feature branch kuralı:** Asla doğrudan `master`/`main` dalında geliştirme yapma. Her yeni özellik için
   `feature/<ozellik>`, her düzeltme için `fix/<hata>` dalı açılır ve PR ile birleştirilir.
2. **Kapsam koruma (Scope Guard):** Görev tanımında istenmeyen dosyalara dokunulmaz; izinsiz refactoring yapılmaz.
3. **Derleme garantisi (Proof):** Her geliştirme bittiğinde `bun run build` çalıştırılır ve 0 hata doğrulanır;
   iş kuralları (`src/lib/kurallar.ts` veya `src-tauri/src/lib.rs`) değiştiyse `bun run test` ve `cargo test` de çalıştırılır.
4. **Kural eşliği:** Rust ve TypeScript kuralları birlikte değiştirilir; yeni bir kural için önce
   `src-tauri/test-vektorleri.json` dosyasına elle hesaplanmış örnek eklenir.
5. **Svelte 5 Runes:** Yeni Svelte bileşenlerinde yalnızca Runes kullanılır (`export let` ve `$:` yasak).
6. **Commit biçimi:** `feat:` / `fix:` / `docs:` / `refactor:` / `chore:` önekleri ([`docs/kurallar.md`](docs/kurallar.md)).
7. **PR güvenliği:** `master` kural setiyle korunur (PR zorunlu, force push ve dal silme kapalı); PR'ı yalnız
   collaborator'lar merge eder ve okunmayan PR merge edilmez — ayrıntı:
   [`docs/kurallar.md` § PR Güvenliği](docs/kurallar.md#4-pr-güvenliği).

## 4. Kırmızı Çizgiler

- Bileşenlere hex/rgb renk yazmak — yerine `var(--token)` ([`docs/branding.md`](docs/branding.md)).
- Arayüze sabit Türkçe metin yazmak — yerine `dil.t("anahtar")` ve 4 dilde sözlük girdisi.
- `left`/`right`/`margin-left` gibi fiziksel yön özellikleri — yerine `inline-start`/`inline-end` (RTL bozulur).
- `localStorage`'a korumasız erişim — yerine `src/lib/depo.ts` (`oku`, `yaz`).
- Dizin ağacını, renk tablosunu veya sayfa ağacını README / AGENTS.md içine kopyalamak.
- `docs/tasks/` altındaki eğitmen dosyalarını düzenlemek.
- Bileşen içinde genel `app.css` sınıflarıyla aynı adı kullanmak (`.sayfa`, `.kart`, `.btn`, `.bos`, `.izgara`, `.metin`, `.dar`)
  — Svelte kapsamlı stilleri genel sınıfı ezmez, ikisi birleşir ve beklenmedik boşluk/taşma oluşur.
- Bileşenlerde emoji ikon kullanmak — yerine `<Ikon ad="…" />` (`src/lib/ikonlar.ts`).
- Seçili durumları turuncuyla göstermek — turuncu (`--renk-ana`) yalnızca birincil aksiyonda; seçili için `--secili`.
- Mobilde çok seçenekli içerik için ortada modal açmak — yerine `<Pencere alt>` (alttan açılan panel).
- Yapay gecikme, sahte ağ isteği ya da "gerçek zamanlı bağlandı" gibi gerçek dışı iddialar — simülasyon kodda adıyla belirtilir (`takip.ts`).
- İş kuralını yalnızca bir tarafta değiştirmek — Rust (`lib.rs`) ve TS (`kurallar.ts`) birlikte, ortak vektörlerle.

## 5. Sık Görevler İçin Tarifler

| Görev | Adımlar |
|---|---|
| **Renk değiştirmek / eklemek** | 1) [`docs/branding.md`](docs/branding.md) tablosuna token'ı light + dark hex ve kontrast oranıyla ekle → 2) `src/styles/app.css` içinde `:root` ve `:root[data-tema="gece"]` altına aynı adla yaz → 3) bileşende `var(--token)` kullan. |
| **Yeni sayfa / rota** | 1) [`docs/mimari-agac.md`](docs/mimari-agac.md) ağacına ekle → 2) `src/pages/` altına `.astro` veya `.mdx` ekle, `Layout` kullan → 3) bilgi sayfasıysa `en/`, `ar/`, `fa/` sürümlerini de ekle (`dil` frontmatter'ı ile) → 4) gezinmeye bağla. |
| **Yeni arayüz metni** | `src/lib/ceviriler.ts` içinde `tr` nesnesine anahtarı ekle; `en`, `ar`, `fa` nesnelerine aynı anahtarı ekle (TypeScript eksik çeviriyi yakalar). |
| **Yeni Rust komutu** | `src-tauri/src/lib.rs` içinde `#[tauri::command]` fonksiyonu + `generate_handler!` listesi + test → aynı kuralın TS karşılığı `src/lib/kurallar.ts` → köprü fonksiyonu `src/lib/motor.ts` → ortak örnekler `src-tauri/test-vektorleri.json`. Bileşenler `invoke()`'u doğrudan değil `motor.ts` üzerinden çağırır. |

## 6. Çalışma Döngüsü

Her görev aynı sırayla yapılır: **şartname → plan → değişiklik → doğrulama.**

1. **Şartname:** Görev için [`docs/gorev-sartnamesi.md`](docs/gorev-sartnamesi.md) doldurulur ve
   `docs/istemler/NN-kisa-ad.md` kaydının başına yazılır ([`docs/istemler/README.md`](docs/istemler/README.md)).
2. **Önce plan:** Ajan hiçbir dosyayı değiştirmeden önce planını sunar (hangi dosya, neden, nasıl doğrulanacak) ve
   öğrencinin onayını bekler. Onay gelmeden değişiklik yapılmaz; plan istem kaydına yapıştırılır.
3. **Değişiklik:** Onaydan sonra yalnız planda yazan dosyalar değiştirilir. Her görev ayrı dalda
   (`feature/NN-kisa-ad`) yapılır ve PR ile `master`'a girer; `master`'a doğrudan commit yoktur.
4. **Doğrulama:** `bun run build` **0 hata** vermeden "bitti" denmez. Tipler değiştiyse `bun run check`, iş kuralı
   değiştiyse `bun run test` ve `cargo test` de çalıştırılır. Komut çıktıları ve elle yapılan denemeler kayda yazılır.
5. **Özet:** Bitince hangi dosyanın neden değiştiği madde madde yazılır ve öğrencinin elle denemesi gereken adımlar
   listelenir.
