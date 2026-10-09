# Platform Desteği

> Görev tanımı: [`docs/tasks/week-4/15-rust-komutu.task.md`](tasks/week-4/15-rust-komutu.task.md).
> **Kural:** Uygulama beş platformun hepsinde çalışır (Android, iOS, macOS, Windows, Linux). Bir özellik bir platformda
> farklı yolla destekleniyorsa o yolla yapılır; hiç desteklenmiyorsa o platformda arayüzde **hiç görünmez** (devre dışı
> düğme ya da hata mesajı bırakılmaz). **Yeni özellik eklenirken bu tablo ve `src/lib/native.ts` içindeki `DESTEK`
> tablosu birlikte güncellenir** — `tests/native.test.ts` ikisinin aynı olduğunu denetler.

Bileşenler platform adını kendileri sorgulamaz; `native.ts` → `destekleniyorMu("özellik")` ve platforma göre doğru yolu
seçen işlevleri (`telefonAc`, `panoyaKopyala`, `verileriKaydet`) kullanır. Platform, Tauri içinde WebView'ın kimliğinden
(`navigator.userAgent`, iPadOS için dokunmatik ekran denetimi) bulunur; Tauri dışında `web`'dir.

## Özellik × platform

✅ destekleniyor · 🔁 farklı yolla · — yok (arayüzde görünmez)

| Özellik | Android | iOS | macOS | Windows | Linux | Web (tarayıcı) |
|---|---|---|---|---|---|---|
| `kural-motoru` | ✅ | ✅ | ✅ | ✅ | ✅ | 🔁 |
| `acil-arama` | 🔁 | 🔁 | — | — | — | ✅ |
| `foto-ekleme` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `panoya-kopyalama` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `veri-disa-aktarma` | 🔁 | 🔁 | 🔁 | 🔁 | 🔁 | ✅ |

## Özellikler ve "farklı yolla" / "yok" satırları

### `kural-motoru` — iş emri kodu, kod doğrulama, fiyat

- **Beş platform:** Rust komutları `is_emri_uret`, `is_emri_dogrula`, `fiyat_hesapla` ([`docs/komutlar.md`](komutlar.md)).
- **Web 🔁:** Rust yokken `native.ts` aynı kuralların TypeScript karşılığını (`src/lib/kurallar.ts`) çalıştırır; ekran
  çökmez, hatalar aynı tipli biçimdedir. İki taraf [`src-tauri/test-vektorleri.json`](../src-tauri/test-vektorleri.json)
  ile birlikte test edilir.

### `acil-arama` — tehlikeli arızada "112'yi ara" düğmesi (usta detayı)

- **Android / iOS 🔁:** Tauri WebView'ı `tel:` bağlantısını kendisi açmaz; `telefonAc("112")` opener eklentisiyle
  (`openUrl("tel:112")`) sistemin çeviricisini açar. İzin: `src-tauri/capabilities/default.json` → `opener:default`
  (`tel:*` dahil).
- **macOS / Windows / Linux —:** Bilgisayarda arama yapacak bir hat yoktur; `tel:` ya hiçbir şey yapmaz ya da ilgisiz bir
  uygulama açar. Düğme **gösterilmez** (`{#if destekleniyorMu("acil-arama")}` — `src/components/UstaDetay.svelte`);
  güvenlik uyarısı metni yerinde kalır.
- **Web ✅:** Telefon tarayıcısı `tel:` ile çeviriciyi açar.

### `foto-ekleme` — arıza fotoğrafı (usta detayı)

- Tüm platformlarda aynı `<input type="file" accept="image/*" capture="environment">`: telefonda kamera/galeri,
  masaüstünde dosya seçici açılır. Fotoğraf cihazda küçültülür, 15 MB üstü reddedilir.

### `panoya-kopyalama` — güvenlik kodunu kopyalama (iş kartı)

- `panoyaKopyala()` önce Clipboard API'yi dener; izin vermeyen ya da eski WebView'da (ör. Linux WebKitGTK eski
  sürümleri) gizli metin alanı + kopyalama komutu yedeğine geçer.

### `veri-disa-aktarma` — KVKK "Verilerimi dışa aktar" (profil)

- **Web ✅:** JSON dosyası tarayıcıdan indirilir.
- **macOS / Windows / Linux 🔁:** WebView'ların indirme davranışı platforma göre değiştiği için Rust komutu
  `veri_dosyasi_kaydet` dosyayı kullanıcının **İndirilenler** klasörüne yazar (`#[cfg(desktop)]`); var olan dosyanın
  üzerine yazmaz (`ustam-verilerim-2.json`). Bildirimde dosyanın tam yolu gösterilir.
- **Android / iOS 🔁:** Uygulama ortak klasörlere yazamaz; aynı Rust komutu `#[cfg(mobile)]` dalında
  `platform-desteklemiyor` döner ve `native.ts` içeriği **panoya kopyalar**. Düğmenin adı bu platformlarda
  "Verilerimi kopyala (JSON)" olur.

## Elle deneme

| Cihaz | Ne denenir |
|---|---|
| Tarayıcı (`bun run dev`) | Usta detayı → tehlikeli bir sorun (Su sızıntısı) → "112'yi ara" görünür; Profil → dışa aktar → dosya iner |
| Windows (`bun run tauri dev`) | Aynı ekranda "112'yi ara" **görünmez**; Profil → dışa aktar → bildirimde İndirilenler yolu |
| Android (APK, [`docs/kurulum.md`](kurulum.md)) | "112'yi ara" çeviriciyi açar; Profil → "Verilerimi kopyala" → panoya kopyalandı bildirimi |
| iOS / macOS / Linux | Bu bilgisayarda derlenemedi (iOS ve macOS için Mac gerekir); tablo kodla aynıdır, cihazda denenmedi |
