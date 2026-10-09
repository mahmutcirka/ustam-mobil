# İstem Günlüğü

Bu klasör, uygulamanın yapay zekâ aracıyla nasıl geliştirildiğinin kaydıdır. **Her görev için bir dosya** açılır.

- **Dosya adı:** `NN-kisa-ad.md` — `NN` görev numarası, `kisa-ad` görevin dal adındaki kısmı.
  Örnek: `feature/12-kart-bileseni` dalı → `12-kart-bileseni.md`. Ara görevlerde nokta yerine tire: `09-1-master-korumasi.md`.
- **Ekran görüntüleri:** `docs/istemler/img/NN-kisa-ad-*.png`; kayıt içinde göreli bağlantıyla gösterilir.
- Kayıt, görevin PR'ı ile **aynı dalda** commit edilir; PR açıklaması bu kayda bağlantı verir.

## Her kayıtta bulunacak başlıklar

| Başlık | İçerik |
|---|---|
| **Şartname** | [`docs/gorev-sartnamesi.md`](../gorev-sartnamesi.md) şablonunun doldurulmuş hâli (Amaç, Kapsam dışı, Kabul ölçütleri, Dokunulacak dosyalar, Doğrulama adımları) |
| **Araç ve model** | Kullanılan araç (ör. Claude Code masaüstü) ve model adı (ör. Claude Opus 5.5) |
| **İstem** | Araca verilen istem, olduğu gibi |
| **Plan** | Aracın değişiklikten önce sunduğu plan |
| **Düzeltmeler** | Planda ya da çıkan değişiklikte öğrencinin düzelttiği / reddettiği yerler; aracın hata yapıp düzelttiği yerler |
| **Doğrulama** | Çalıştırılan komutlar ve çıktıları (`bun run build`, `bun run check`, `bun run test`, `cargo test`), elle denenenler, ekran görüntüleri |

## Kayıtlar

| No | Görev | Kayıt |
|---|---|---|
| 10 | Çalışma yöntemi | [10-calisma-yontemi.md](10-calisma-yontemi.md) |
