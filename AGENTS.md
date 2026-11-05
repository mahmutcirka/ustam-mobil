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
| [`docs/veri-modeli.md`](docs/veri-modeli.md) | Veri sözleşmesi: tipler, alan tabloları, ilişkiler | **Yeni veri alanı önce `src/lib/types/` içinde tanımlanır**, sonra bu tablo güncellenir; bileşen/store içinde tip tanımlanmaz, `any` yazılmaz. |
| [`docs/branding.md`](docs/branding.md) | Marka, renk token'ları, kontrast, ikonlar | Ad-hoc renk yazılmaz. Yalnızca `src/styles/app.css` içindeki CSS değişkenleri kullanılır. |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa ağacı, platformlar, dil kapsamı, breakpoint'ler | Yeni rota veya sayfa eklerken önce bu ağaç güncellenir, sonra sayfa eklenir. |
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Dizin ve dosya mimarisi | Klasör yapısı yalnızca bu belgede tanımlanır; dizin ağacı başka dosyada tekrar yazılmaz. |
| [`docs/kurallar.md`](docs/kurallar.md) | Git akışı, commit, PR ve kod yazım kuralları | Branch/commit/PR biçimi buradaki tabloya uyar. |
| [`docs/kurulum.md`](docs/kurulum.md) | Ön gereksinimler ve çalıştırma | Komut değişirse önce burası güncellenir. |
| [`docs/kaynaklar.md`](docs/kaynaklar.md) | Tasarım ve teknik referanslar | Yeni dış kaynak kullanıldığında buraya eklenir. |
| [`docs/teslim.md`](docs/teslim.md) | Teslim adımları, görev → PR eşlemesi | Teslim biçimi bu belgeye göre hazırlanır. |
| [`docs/ilerleme-batch-01.md`](docs/ilerleme-batch-01.md) | Batch 01 kontrol matrisi ve derleme kanıtı | Yeni teslimden önce matris güncellenir. |
| [`docs/ilerleme-batch-02.md`](docs/ilerleme-batch-02.md) | Batch 02 kontrol matrisi (Görev 09.1–16), en küçük pencere, derleme kanıtı | Etiket (`v0.2.0-batch-02`) yalnız matris tamamen işaretlenince atılır. |
| [`docs/ajan-uyum-testi.md`](docs/ajan-uyum-testi.md) | Ajanın bu kurallara uyum testi | Kurallar değiştiğinde test yeniden çalıştırılır. |
| [`docs/komutlar.md`](docs/komutlar.md) | Rust komutları: girdi, tipli sonuç, hata türleri | Rust'a yalnız `src/lib/native.ts` üzerinden gidilir; komut düz metin döndürmez, geçersiz girdide panik yapmaz. |
| [`docs/platform-destegi.md`](docs/platform-destegi.md) | Özellik × platform tablosu (Android, iOS, macOS, Windows, Linux, web) | **Yeni özellik eklenirken bu tablo güncellenir**; desteklenmeyen özellik o platformda arayüzde görünmez. |
| [`lat.md/`](lat.md/lat.md) | Bilgi grafiği: ürün, mimari, iş kuralları, izinler, veri, test özellikleri, görev durumu | İşe başlamadan `lat search` / `lat locate` ile ilgili bölüm okunur; anlamlı davranış değişince `lat.md/` güncellenir ve `lat check` temiz olmadan iş bitmiş sayılmaz (ayrıntı: bu dosyanın sonundaki lat bölümü). |
| [`docs/izinler.md`](docs/izinler.md) | İzinler: hangi izin, ne için, veri nereye gider; bildirim senaryoları | **Açıklanamayan izin istenmez**; durum okumak diyalog açmaz, diyalog yalnız kullanıcı eylemiyle; konum saklanmaz ve loglanmaz. |
| [`docs/backend.md`](docs/backend.md) | SQLite tabanlı geçici yerel arka uç: tablolar, roller/izinler, komutlar | Sorgularda tablo/sütun adı yalnız beyaz listeden, değerler parametreyle; her denetleyici yetki denetler. |
| [`docs/gelistirme-notlari.md`](docs/gelistirme-notlari.md) | Elle deneme kısa yolları (`?durum=` ile dört liste hali) | Liste ekranları veriyi tek yükleme işlevinden alır ve yükleniyor / hata / boş / dolu hallerini `ui/` bileşenleriyle gösterir. |
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
| Tip kontrolü | `bun run check` (`astro check`) ve `bunx svelte-check --tsconfig ./tsconfig.json` → **0 hata** |
| Platform ikonları | `bun run tauri icon app-icon.svg` |
| Bilgi grafiği denetimi | `lat check` → **0 hata** (`npm install -g lat.md`) |

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

- Çince, Japonca ya da Korece (CJK) karakter yazmak — kod, yorum, belge, commit ve yanıtların hiçbirinde. Yalnız Türkçe ve
  İngilizce yazılır; arayüzdeki Arapça ve Farsça metinler yalnız `src/lib/ceviriler.ts` ile `en/`, `ar/`, `fa/` sayfalarında bulunur.
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
- Bileşen ya da store içinde veri tipi tanımlamak ya da `any` yazmak — yerine `src/lib/types/` ([`docs/veri-modeli.md`](docs/veri-modeli.md)).
- Bileşende `invoke()`, `@tauri-apps/*` ya da `navigator.userAgent` ile platform sorgusu — yerine `src/lib/native.ts` (`destekleniyorMu`, `platform`).
- Bir platformda çalışmayan özelliği devre dışı düğme ya da hata mesajıyla bırakmak — o platformda hiç gösterilmez ([`docs/platform-destegi.md`](docs/platform-destegi.md)).

## 5. Sık Görevler İçin Tarifler

| Görev | Adımlar |
|---|---|
| **Renk değiştirmek / eklemek** | 1) [`docs/branding.md`](docs/branding.md) tablosuna token'ı light + dark hex ve kontrast oranıyla ekle → 2) `src/styles/app.css` içinde `:root` ve `:root[data-tema="gece"]` altına aynı adla yaz → 3) bileşende `var(--token)` kullan. |
| **Yeni sayfa / rota** | 1) [`docs/mimari-agac.md`](docs/mimari-agac.md) ağacına ekle → 2) `src/pages/` altına `.astro` veya `.mdx` ekle, `Layout` kullan → 3) bilgi sayfasıysa `en/`, `ar/`, `fa/` sürümlerini de ekle (`dil` frontmatter'ı ile) → 4) gezinmeye bağla. |
| **Yeni arayüz metni** | `src/lib/ceviriler.ts` içinde `tr` nesnesine anahtarı ekle; `en`, `ar`, `fa` nesnelerine aynı anahtarı ekle (TypeScript eksik çeviriyi yakalar). |
| **Yeni Rust komutu** | `src-tauri/src/lib.rs` içinde `#[tauri::command]` fonksiyonu (sonuç `struct`, hata `KomutHatasi`) + `generate_handler!` listesi + en az 2 test → aynı kuralın TS karşılığı `src/lib/kurallar.ts` → tip `src/lib/types/native.ts` → işlev `src/lib/native.ts` (tarayıcı yedeğiyle) → ortak örnekler `src-tauri/test-vektorleri.json` → [`docs/komutlar.md`](docs/komutlar.md). Bileşenler `invoke()`'u ya da Tauri eklentilerini doğrudan değil yalnız `native.ts` üzerinden çağırır. |
| **Yeni özellik (platforma bağlı olabilecek)** | Beş platform için değerlendir (destekleniyor / farklı yolla / yok) → [`docs/platform-destegi.md`](docs/platform-destegi.md) tablosu ve `native.ts` `DESTEK` tablosu birlikte güncellenir → bileşen `destekleniyorMu("…")` ile sorar; "yok" ise arayüzde hiç gösterilmez. |

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

%% lat:begin %%
# Before starting work

Use Lat's knowledge graph to ground each task before changing code.

- Run `lat search` to find sections relevant to your task. Read them to understand the design intent before writing code.

# Post-task checklist (REQUIRED — do not skip)

After EVERY task, before responding to the user:

- [ ] Update `lat.md/` if you added or changed meaningful implemented functionality, architecture, tests, or behavior. Keep it a focused snapshot of the current implemented state, not a journal/changelog. Plans may be drafted in `lat.md/` alongside implementation, with the intent that by commit time they describe what was implemented. Otherwise, keep proposals, hypothetical designs, and future work outside `lat.md/` unless the user explicitly requests them there.
- [ ] Run `lat check` — all validations must pass
- [ ] Do not skip these steps. Do not consider your task done until both are complete.

---

# What is lat.md?

Lat.md is the project's structured knowledge graph for architecture, design decisions, behavior, and tests.

The graph lives in `lat.md/` as cross-linked Markdown describing **what** the project does and **why**. Use it to ground work in actual architecture, and keep it a focused snapshot of the current implemented state rather than a journal or changelog.

Project-specific lat documentation belongs in `lat.md/`. Do not modify this generated instruction file or a generated `lat-md` `SKILL.md` to record project guidance: both are owned by lat tooling and may be replaced by a later `lat init`.

# Commands

Use these commands to navigate and validate the project knowledge graph.

```bash
lat locate "Section Name"      # find a section by name (exact, fuzzy)
lat refs "file#Section"        # find what references a section
lat search "natural language"  # semantic search across all sections
lat external show <handle>      # inspect a pinned external source before cloning it
lat check                      # run full graph and documentation validation
```

Run `lat --help` when in doubt about available commands or options.

If `lat search` fails because no API key is configured, explain to the user that semantic search requires a key provided via `LAT_LLM_KEY` (direct value), `LAT_LLM_KEY_FILE` (path to key file), or `LAT_LLM_KEY_HELPER` (command that prints the key). Supported key prefixes: `sk-...` (OpenAI) or `vck_...` (Vercel). If the user doesn't want to set it up, use `lat locate` for direct lookups instead.

# Syntax primer

Lat uses stable section ids, wiki links, source links, and code references to connect documentation with implementation.

- **Section ids**: `lat.md/path/to/file#Heading#SubHeading` — full form uses project-root-relative path (e.g. `lat.md/tests/search#RAG Replay Tests`). Short form uses bare file name when unique (e.g. `search#RAG Replay Tests`, `cli#search#Indexing`).
- **Wiki links**: `[[target]]` or `[[target|alias]]` — cross-references between sections. Can also reference repository paths or source code: `[[schema.sql]]`, `[[src/components]]`, `[[src/foo.ts#myFunction]]`.
- **Link specificity**: When documenting implemented behavior, prefer the narrowest relevant source-symbol link over a whole-file link. Use whole-file or directory links when discussing the module or resource as a whole, or when no supported symbol represents the target. If prose names a symbol, link that symbol directly.
- **Repository path links**: Wiki links without a `#` fragment may target any existing file or directory inside the project. Unsupported formats validate but cannot be opened by Lat; fragments require a `lat.md/` section or supported source file.
- **Source code links**: Wiki links in `lat.md/` files can reference functions, classes, constants, and methods in supported source files. Use the full path: `[[src/config.ts#getConfigDir]]`, `[[src/server.ts#App#listen]]` (class method), `[[lib/utils.py#parse_args]]`, `[[src/lib.rs#Greeter#greet]]` (Rust impl method), `[[src/app.go#Greeter#Greet]]` (Go method), `[[src/app.h#Greeter]]` (C struct). When prose names an implementation symbol or a behavior governed by one, link the symbol instead of using a bare code span or copying its literal value. Prefer `[[src/config.ts#DEFAULT_TIMEOUT]]` (or an aliased form) over a bare identifier or copied value. `lat check` validates these exist.
- **Code refs**: `// @lat: [[section-id]]` (JS/TS/Rust/Go/C/PHP) or `# @lat: [[section-id]]` (Python/PHP) — ties source code to concepts

# Diagrams

Default to prose. Reserve Mermaid diagrams for concepts involving more than seven interacting subjects (such as components, states, or stages) with complex sequencing, branching, or dependencies that prose alone makes hard to follow.

The subject count alone does not justify a diagram; omit diagrams for simple sequences or relationships that a short paragraph or list explains clearly. A diagram should give users and later agents an overview of the interactions.

Keep each diagram focused on one process, use readable labels, and explain the important decisions in surrounding prose with precise source-symbol links. Prefer a small overview or several focused diagrams over one dense diagram. Use fenced `mermaid` blocks and run `lat check` to validate syntax and readability.

# Test specs

Key tests can be described as sections in `lat.md/` files (e.g. `tests.md`). Add frontmatter to require that every leaf section is referenced by a `// @lat:` or `# @lat:` comment in test code:

```markdown
---
lat:
  require-code-mention: true
---
# Tests

Authentication and authorization test specifications.

## User login

Verify credential validation and error handling for the login endpoint.

### Rejects expired tokens
Tokens past their expiry timestamp are rejected with 401, even if otherwise valid.

### Handles missing password
Login request without a password field returns 400 with a descriptive error.
```

Every section MUST have a description — at least one sentence explaining what the test verifies and why. Empty sections with just a heading are not acceptable. (This is a specific case of the general leading paragraph rule below.)

Each test in code should reference its spec with exactly one comment placed next to the relevant test — not at the top of the file:

```python
# @lat: [[tests#User login#Rejects expired tokens]]
def test_rejects_expired_tokens():
    ...

# @lat: [[tests#User login#Handles missing password]]
def test_handles_missing_password():
    ...
```

Do not duplicate refs. One `@lat:` comment per spec section, placed at the test that covers it. `lat check` will flag any spec section not covered by a code reference, and any code reference pointing to a nonexistent section.

# Section structure

Concise opening paragraphs give every section a stable overview for validation and discovery.

Every section in `lat.md/` **must** have a leading paragraph — at least one sentence immediately after the heading, before any child headings or other block content. The first paragraph must be ≤250 characters (excluding `[[wiki link]]` content). This paragraph serves as the section's overview and is used in search results, command output, and RAG context — keeping it concise guarantees the section's essence is always captured.

```markdown
# Good Section

Brief overview of what this section documents and why it matters.

More detail can go in subsequent paragraphs, code blocks, or lists.

## Child heading

Details about this child topic.
```

```markdown
# Bad Section

## Child heading

Details about this child topic.
```

The second example is invalid because `Bad Section` has no leading paragraph. `lat check` validates this rule and reports errors for missing or overly long leading paragraphs.
%% lat:end %%
