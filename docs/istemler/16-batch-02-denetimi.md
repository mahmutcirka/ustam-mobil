# İstem günlüğü — Görev 16: Batch 02 denetimi

## Şartname
- **Amaç:** Hafta 05 raporundaki Görev 16 eksiklerini kapatmak: `tauri.conf.json` içinde `minWidth` / `minHeight`, `docs/ilerleme-batch-02.md`, `v0.2.0-batch-02` etiketi.
- **Kapsam dışı:** Görev 09.1'in GitHub ayarı ve ekran görüntüsü (öğrenci yapar); etiket o adımdan sonra atılır.
- **Kabul ölçütleri:** En küçük pencere boyutu tanımlı ve bu boyutta yatay taşma yok; denetim belgesi her görevi kanıtıyla listeler; derleme ve testler temiz.
- **Dokunulacak dosyalar:** `src-tauri/tauri.conf.json`, `docs/ilerleme-batch-02.md`, `docs/mimari-agac.md`, `docs/teslim.md`, `docs/istemler/README.md`, bu kayıt.

## İstem
> Hocanın Hafta 05 raporundaki Görev 16 eksiklerini tamamla; etiketi 09.1 bitince at.

## Plan ve uygulananlar
1. `minWidth: 360`, `minHeight: 600` — 360 px desteklenen en dar telefon genişliği. Önce 360×600 görünümde 6 sayfa (/, /usta/1, /cagri, /is-emirlerim, /profil, /izinler) yatay taşma için denetlendi: hepsi temiz.
2. `docs/ilerleme-batch-02.md`: Batch 01 belgesinin biçiminde kontrol matrisi (09.1–16), pencere boyutu gerekçesi, derleme/test kanıtı, etiket komutu.
3. `mimari-agac.md` § 4'e en küçük pencere boyutu; `teslim.md` eşlemesine Görev 16 ve lat.md satırları.

## Doğrulama
- `cargo check` (yapılandırma geçerli) · `bun run build` → 39 sayfa, 0 hata · `bun run check` ve `svelte-check` → 0 hata · `bun run test` → 152 · `cargo test` → 24 · `lat check` → temiz
- Etiket atılmadı: 09.1 kural seti henüz GitHub'da yok (API: kural seti listesi boş).
