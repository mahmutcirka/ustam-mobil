# Kurallar — Git Akışı ve Kod Yazımı

> Görev tanımı: [`docs/tasks/week-3/01-pr-merge.task.md`](tasks/week-3/01-pr-merge.task.md).
> Yapay zekâ ajanları için özet kurallar [`AGENTS.md`](../AGENTS.md) içindedir; bu belge ayrıntıyı tutar.

---

## 1. Git Akışı: Branch → PR → Merge

`master` dalına **doğrudan commit atılmaz**. Her görev veya düzeltme kendi dalında geliştirilir.

| Dal öneki | Ne zaman | Örnek |
|---|---|---|
| `feature/` | Yeni özellik, sayfa veya belge | `feature/branding`, `feature/bilgi-sayfalari` |
| `fix/` | Hata düzeltme | `fix/rtl-ok-yonu` |

Dal adlarında Türkçe karakter ve boşluk kullanılmaz.

```bash
git checkout master
git pull origin master
git checkout -b feature/<ozellik-adi>

# geliştir → doğrula
bun run build            # 0 hata olmalı
git add <dosyalar>
git commit -m "feat: <ne yapıldı>"

git push -u origin feature/<ozellik-adi>
# GitHub → Compare & pull request → Files changed incelenir → Merge pull request
git checkout master
git pull origin master
```

## 2. Commit Mesajları (Conventional Commits)

| Önek | Anlamı |
|---|---|
| `feat:` | Yeni özellik / ekran / sayfa |
| `fix:` | Hata düzeltme |
| `docs:` | Yalnızca belge değişikliği |
| `refactor:` | Davranışı değiştirmeyen kod düzenlemesi |
| `chore:` | Bağımlılık, yapılandırma, araç |

## 3. Pull Request Açıklaması

Her PR açıklamasında 2–3 cümleyle şunlar yazılır:

1. Ne yapıldı (hangi görev / ekran).
2. Yapay zekâ asistanına verilen görev (prompt özeti).
3. Nasıl doğrulandı (`bun run build` sonucu, ekran görüntüsü, `cargo test`).

Merge'den önce **Files changed** sekmesinde yalnızca istenen dosyaların değiştiği kontrol edilir.

## 4. Kod Yazım Kuralları

- **Svelte 5 Runes:** `$state`, `$derived`, `$props`, `$effect`; `export let` ve `$:` kullanılmaz.
- **İsimlendirme:** Değişken, fonksiyon ve dosya adları Türkçe ve ASCII (`isEmirleri`, `kodUret`, `UstaKart.svelte`).
- **Renkler:** Yalnızca [`docs/branding.md`](branding.md) token'ları (`var(--renk-ana)` vb.); bileşende hex renk yazılmaz.
- **Metinler:** Arayüz metinleri `src/lib/ceviriler.ts` içinde 4 dilde tutulur; bileşende sabit Türkçe metin yazılmaz.
- **RTL:** `left/right` yerine `inline-start/inline-end` mantıksal özellikleri kullanılır.
- **Tarayıcı API'leri:** `localStorage` erişimi `src/lib/depo.ts` (`oku`, `yaz`) üzerinden yapılır.
- **Rust:** Yeni komutlar `src-tauri/src/lib.rs` içinde `#[tauri::command]` ile tanımlanır, `generate_handler!` listesine
  eklenir ve birim testiyle (`cargo test`) doğrulanır.
- **Yeni sayfa:** Önce [`docs/mimari-agac.md`](mimari-agac.md) güncellenir, sonra `src/pages/` altına eklenir.

## 5. Testler

Her PR'dan önce yerelde, her push'ta CI'da ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)):

```bash
bun run build                                   # 0 hata
bun run test                                    # TS: ortak vektörler, çeviriler, veri, canlı takip
bunx svelte-check --tsconfig ./tsconfig.json    # tip kontrolü
cd src-tauri && cargo test                      # Rust kuralları
```

- **İş kuralı değişikliği:** Önce [`src-tauri/test-vektorleri.json`](../src-tauri/test-vektorleri.json)'a elle hesaplanmış
  örnek eklenir, sonra `lib.rs` ve `kurallar.ts` birlikte değiştirilir; iki test grubu da geçmeden PR açılmaz.
- **Yeni arayüz metni:** 4 dile eklenir; `tests/ceviriler.test.ts` eksik anahtarı, boş metni ve uyuşmayan `{yer tutucuyu}` yakalar.
- **Yeni usta veya sorun:** `tests/data.test.ts` fiyat bilgisi, çeviri ve güvenlik ipucu olmayan sorunu yakalar.
