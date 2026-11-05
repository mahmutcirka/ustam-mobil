# İstem günlüğü — Yetkiler / İzinler (Görev 31-36)

## İstem
qLar izin desenini örnek alarak izin altyapısı ekle: permissions_status (asla diyalog açmaz) ve
permission_request; gerçek izin bildirim ("Usta yolda / iş emri durumu bildirimi"). /izinler ekranı; Rust yalnız native.ts üzerinden.

## Uygulandı
permissions.rs, lib.rs (tauri-plugin-notification + komut kaydı), Cargo.toml, capabilities/default.json
(notification:default), native.ts, types/izin.ts, /izinler sayfası + Izinler.svelte, docs/izinler.md.

## Doğrulama
bun run build ve cargo check sonucu PR'da belirtildi. Canlı bildirim masaüstü/cihaz derlemesinde görünür.

## Not
Öğretim görevlisi tarafından başlangıç (scaffold) olarak gönderildi; öğrenci inceleyip merge eder.

---

## Öğrenci adımı — iskeletin tamamlanması (aynı PR, #37)

### Şartname
- **Amaç:** İskeleti gerçek bir izin merkezine dönüştürmek: canlı konum (en yakın semt), iş akışına bağlı yerel bildirimler, reddedilen izinde sistem ayarlarına yönlendirme.
- **Kapsam dışı:** Push bildirim (sunucu yok), arka planda konum, zamanlanmış bildirim, randevu değiştirme akışı (uygulamada yok).
- **Kabul ölçütleri:** Durumlar işletim sisteminden okunur (sabit değer yok); diyalog yalnız kullanıcı eylemiyle; konum saklanmaz/loglanmaz; hata türleri `KomutHatasi`; 4 dil; masaüstünde desteklenmeyen konum düğmesi görünmez; `bun run build`, `bun run check`, `bun run test`, `cargo test` temiz.
- **Dokunulacak dosyalar:** `permissions.rs`, `lib.rs`, `Cargo.toml`, Android manifest + Kotlin eklentisi, `Info.ios.plist`, `native.ts`, `types/`, `konum.ts`, `isBildirimleri.ts`, `bildirimIzleyici.svelte.ts`, `Izinler.svelte`, `KonumdanSemt.svelte`, `SemtSecici.svelte`, `Profil.svelte`, `Layout.astro`, `ceviriler.ts`, `data.ts`, `takip.ts`, `veri.ts`, testler, belgeler.

### İskelette bulunan sorunlar
1. Konum durumu sabitti (`prompt` / `unsupported`) — işletim sisteminden okunmuyordu; konum eklentisi yoktu.
2. Hatalar düz metindi (`Result<_, String>`), `KomutHatasi` biçimine uymuyordu; bileşen `String(e)` gösteriyordu.
3. Arayüz metinleri sabit Türkçeydi (4 dil kuralı); bileşende ad-hoc renk yedekleri (`#666`, `#fff`) ve olmayan token adları vardı.
4. `native.ts` Tauri kontrolünü üç kez tekrarlıyor, `invoke`'u dinamik içe aktarıyordu; tarayıcı yedeği yoktu.
5. `capabilities/default.json` web görünümüne `notification:default` veriyordu — bildirim Rust'tan gönderildiği için gereksiz yetki.
6. `AndroidManifest.xml` satır sonları CRLF → LF çevrilmişti (tüm dosya değişmiş görünüyordu); hassas konum da isteniyordu.
7. `Info.plist` macOS'a da ekleniyordu; iOS için `Info.ios.plist` gerekir.
8. Komutlar senkrondu: mobil eklenti yanıtını beklerken ana iş parçacığı bloke olabilirdi.
9. "Test bildirimi" dışında bildirim hiçbir iş akışına bağlı değildi.

### Plan ve uygulananlar
- **Rust:** tipli `IzinKimligi` / `IzinDegeri` / `IzinDurumu` / `KonumOkumasi`; `KomutHatasi`'na 6 tür; `konum_oku` ve `sistem_ayarlarini_ac` komutları; tüm komutlar `async`; konum eklentisi yalnız mobilde; Android için uygulamanın kendi Kotlin eklentisi; 5 yeni test.
- **Android/iOS:** yalnız yaklaşık konum; FINE, BOOT, WAKE_LOCK `tools:node="remove"`; CRLF korundu; `Info.ios.plist`.
- **Ön yüz:** `native.ts`'e tipli işlevler + tarayıcı API'leriyle gerçek yedek yol; `DESTEK` tablosuna `bildirim`, `konum`, `sistem-ayarlari`; /izinler yeniden tasarım; semt seçicide "Konumumdan bul"; iş aşamalarından bildirim (tekrar ve bayat olay önleme, kategoriler); Profil → İzinler bağlantısı.
- **Belgeler:** `izinler.md` (senaryolar, açık/kapalı, push farkı), `komutlar.md`, `platform-destegi.md`, `veri-modeli.md`, `mimari-agac.md`, `klasor-mimarisi.md`, AGENTS dizini (`izinler.md`, `backend.md`), `teslim.md`.

### Doğrulama
Komut çıktıları PR açıklamasında. Cihaz (telefon) bağlı değildi: Android APK derlendi ama cihazda denenmedi; iOS bu bilgisayarda derlenemez.
