# İstem günlüğü — lat.md bilgi grafiği (Hafta 05)

## Şartname
- **Amaç:** Projeyi yapay zekânın anlayacağı hale getirmek: `lat.md/` bilgi grafiği (ürün, mimari, iş kuralları, izinler, veri, test özellikleri, görev durumu), kaynak koda ve testlere bağlı.
- **Kapsam dışı:** Uygulama kodunda davranış değişikliği (yalnız testlere `@lat:` yorumları eklenir); yönetim paneli (görev dosyası gelince ayrı PR).
- **Kabul ölçütleri:** `lat check` temiz; içerik şablon projeyi (PassoKlon) değil Ustam'ı anlatır; AGENTS.md tek kural kaynağı, CLAUDE.md ve GEMINI.md yalnız ona yönlendirir; CJK karakter kuralı eklenir; PR ile merge.
- **Dokunulacak dosyalar:** `lat.md/*`, `.agents/skills/lat-md/SKILL.md`, `AGENTS.md`, `.gitignore`, test dosyalarında `@lat:` yorumları, bu kayıt.

## İstem
> `.agents/skills/lat-md/SKILL.md` skill'ini oku ve projemizi en profesyonel şekilde lat.md kullanarak doküman, görevler, durum ve tüm gereken parçaları oluştur.

## Plan ve uygulananlar
1. `npm install -g lat.md` (0.13.3) → `lat init`. Ajan seçimi gerçek terminal istediği için terminalsiz çalıştırmada seçim boş kaldı; aynı çıktılar lat'ın kendi şablonlarından üretildi: skill `templates/skill/SKILL.md` → `.agents/skills/lat-md/SKILL.md`, AGENTS bölümü `lat gen agents.md` → AGENTS.md sonuna `%% lat:begin %%` / `%% lat:end %%` işaretleriyle.
2. Skill kurallarına göre 7 dosya: `urun`, `mimari`, `is-kurallari`, `izinler`, `veri`, `testler` (`require-code-mention`), `gorevler`; dizin `lat.md/lat.md`. Her bölümün ilk paragrafı ≤ 250 karakter; davranış anlatılırken kaynak sembolüne bağlantı (`[[src/lib/native.ts#cagir]]`, `[[src-tauri/src/lib.rs#kod_olustur]]` …).
3. `testler.md`'deki 10 yaprak bölüm, ilgili Rust ve bun testlerine `// @lat: [[…]]` yorumuyla bağlandı.
4. AGENTS.md: belge dizinine `lat.md/`, komut tablosuna `lat check`, kırmızı çizgilere CJK karakter yasağı.

## Düzeltmeler
- İlk `lat check`: dizinde dosya satırları eksik, test bölümleri koda bağlı değil, bir bölüm bağlantısı kısa biçimde yazılmış (`testler#Platform…` → `testler#Testler#İzinler ve platform#Platform…`). Üçü düzeltildi.
- Şablon denetimi: `lat.md/` içinde PassoKlon/bilet/etkinlik geçmiyor; README ve `proje-fikri.md`'deki "PassoKlon → Ustam dönüşümü" tabloları bilinçli olarak kaldı.

## Doğrulama
- `lat check` → All checks passed
- CJK taraması (`.md .ts .rs .svelte .astro`) → 0 eşleşme
- `bun run test`, `cargo test` → yorum eklemeleri sonrası geçti (PR açıklamasında)
