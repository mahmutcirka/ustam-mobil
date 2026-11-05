# İzinler (yetkiler)

Bu uygulama yalnız gerçekten kullandığı izni ister. İlke: **açıklayamadığımız izni istemeyiz.**

İzin yüzeyi qLar deseninden damıtıldı: `permissions_status` (durumu döner, asla diyalog açmaz) ve `permission_request` (OS diyaloğunu açar). Arayüz bunları yalnız `src/lib/native.ts` üzerinden çağırır. Ekran: `/izinler` (Profil → Gizlilik → İzinler).

Kod: [`src-tauri/src/permissions.rs`](../src-tauri/src/permissions.rs) · tipler: [`src/lib/types/izin.ts`](../src/lib/types/izin.ts) · komut tablosu: [`docs/komutlar.md`](komutlar.md) · platform tablosu: [`docs/platform-destegi.md`](platform-destegi.md).

## İstenen izinler

| İzin | Ne için | Hangi ekran | Veri nereye gider |
|---|---|---|---|
| Bildirim (notification) | Usta onayladı / yola çıktı / kapıda; randevu onayı ve 1 saat önce hatırlatma | /izinler + uygulama akışı (iş emirleri) | Hiçbir yere; bildirim yalnız cihazda oluşturulur |
| Konum (location) — **yalnız yaklaşık** | "Konumumdan bul": bulunduğun semti seçip en yakın ustaları göstermek | Semt seçici (Ustalar, Profil → Evim), /izinler | Cihazda kalır; koordinat saklanmaz, loglanmaz, gönderilmez — profile yalnız **semt adı** yazılır |

### İstenmeyen izinler (bilerek)

| İzin | Neden istenmiyor |
|---|---|
| Hassas konum (`ACCESS_FINE_LOCATION`) | Semt eşlemesi için yaklaşık konum yeter; konum eklentisinin eklediği izin manifestte `tools:node="remove"` ile çıkarılır |
| Arka planda konum | Konum yalnız düğmeye basınca bir kez okunur; izleme (`watchPosition`) kullanılmaz |
| Kamera / galeri | Arıza fotoğrafı sistemin kendi seçicisiyle (`<input type="file">`) alınır; uygulama yalnız seçilen dosyayı görür |
| Telefon araması | "112'yi ara" telefon uygulamasını numara yazılı açar (`tel:`); aramayı kullanıcı başlatır |
| Mikrofon, rehber | Kullanan bir özellik yok |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Bildirim eklentisi zamanlanmış bildirim için ekler; zamanlama kullanılmadığından manifestten çıkarılır |

Webview'a eklentilerin JS izinleri (`notification:default`, `geolocation:*`) **verilmez**: bildirim ve konum yalnız uygulamanın kendi Rust komutlarıyla, denetimli girdiyle yapılır (`src-tauri/capabilities/default.json`).

## Durum değerleri

`IzinDegeri` — işletim sisteminden okunur, **tahmin edilmez**:

| Değer | Anlamı | Ekranda |
|---|---|---|
| `verildi` | İzin var | Yeşil rozet; bildirimde kategori anahtarları ve deneme düğmesi |
| `reddedildi` | Reddedildi. `istenebilir: true` ise (Android "bir kez reddedildi") yeniden sorulabilir; `false` ise yalnız sistem ayarlarından açılır | Kırmızı rozet; "İzin ver" ya da "Ayarları aç" + yönerge |
| `sorulmadi` | Henüz sorulmadı | Sarı rozet; "İzin ver" |
| `servis-kapali` | İzin olsa da cihazın konum servisi kapalı | Kırmızı rozet; "Konum servisini açın" yönergesi |
| `gerekmiyor` | Platformda çalışma zamanı izni yok (masaüstü bildirimleri) | Yeşil rozet; "Ayarları aç" bildirim ayarlarına götürür |
| `desteklenmiyor` | Bu platformda yok (masaüstünde konum) | Gri rozet; semti listeden seçme yönergesi |
| `okunamadi` | İşletim sistemi durumu bildirmedi | Sarı rozet; "Durumu yenile" |

qLar karşılıkları: `granted` → `verildi`, `denied` → `reddedildi`, `prompt` → `sorulmadi`, `unsupported` → `desteklenmiyor`, `unknown` → `okunamadi`.

## Akışlar

- **Durum okuma:** /izinler açılınca, "Durumu yenile"ye basınca ve uygulama yeniden öne gelince (ayarlardan dönüş) `permissions_status`. Diyalog açılmaz.
- **İzin isteme:** yalnız "İzin ver" düğmesi (ya da "Konumumdan bul" dokunuşu) `permission_request`'i çağırır; düğme o sırada "İzin isteniyor…" gösterir, sonuç kısa bildirimle söylenir. Reddetmek hiçbir özelliği kilitlemez; tekrar tekrar sorulmaz.
- **Konumumdan bul:** durum okunur → sorulabiliyorsa bir kez sorulur → izin varsa `konum_oku` (yüksek doğruluk yok, 10 sn zaman aşımı, 2 dk'ya kadar eski okuma kabul) → [`src/lib/konum.ts`](../src/lib/konum.ts) en yakın semt merkezini bulur (haversine, 15 km hizmet yarıçapı) → semt seçilir, koordinat atılır.
- **Sistem ayarları:** reddedilmiş ve artık sorulamayan izinde "Ayarları aç": Android'de uygulamanın Kotlin eklentisi ([`AyarlarEklentisi.kt`](../src-tauri/gen/android/app/src/main/java/edu/istinye/ustam/AyarlarEklentisi.kt)) uygulama ayrıntıları ekranını, iOS'ta `app-settings:`, Windows/macOS'ta bildirim ayarlarını açar. Linux ve tarayıcıda düğme yoktur, yönerge vardır.

## Bildirim senaryoları

Bildirimler **yereldir** (cihazda oluşturulur). Sunucu olmadığı için **push bildirimi yoktur**; push varmış gibi davranılmaz.

| Senaryo | Durum | Nasıl |
|---|---|---|
| Usta iş emrini kabul etti | ✅ `onaylandi` | Takip simülasyonunun onay anı ([`takip.ts`](../src/lib/takip.ts) → `asamaZamanlari`) |
| Usta yola çıktı | ✅ `yolda` | Yola çıkış anı |
| Usta iş yerine ulaştı | ✅ `kapida` | Varış anı; kullanıcı kodu kapıda zaten doğruladıysa bildirilmez |
| Randevu oluşturuldu → onaylandı | ✅ `randevu-onaylandi` | "Randevu" aciliyetli işte onay anı (kategori: randevu) |
| Randevu yaklaşıyor | ✅ `randevu-yaklasiyor` | Randevudan 60 dk önce (usta o sırada henüz yola çıkmadıysa) |
| Yeni iş emri oluşturuldu | — bildirilmez | Kullanıcının kendi eylemi; ekranda zaten onaylanır |
| İş emri tamamlandı / iptal edildi | — bildirilmez | Kullanıcının kendi eylemi (uygulamada işi kullanıcı tamamlar ya da iptal eder) |
| Randevu güncellendi / usta randevuyu iptal etti | ✗ yok | Uygulamada randevu değiştirme ya da usta tarafı yok; sunucu gelince eklenir. Varmış gibi gösterilmez |

Seçim saf işlevdedir ([`src/lib/isBildirimleri.ts`](../src/lib/isBildirimleri.ts), testler: `tests/izinler.test.ts`):

- **Tekrar yok:** her olayın anahtarı `kod:olay`; gönderilenler `localStorage["gonderilen-bildirimler"]`'a **gönderimden önce** yazılır (sayfa geçişinde ya da iki pencerede tekrar etmez); hiçbir yolla ulaştırılamayan bildirim kayıttan geri alınır. Silinen işlerin anahtarları temizlenir, en çok 200 kayıt tutulur.
- **Birikme yok:** bir iş için birden çok aşama birikmişse yalnız en sonuncusu bildirilir; 15 dakikadan eski olay bildirilmez (uygulama uzun süre kapalı kaldıysa art arda bildirim düşmez).
- **Kategoriler:** "İş durumu" ve "Randevular" /izinler ekranından ayrı ayrı kapatılabilir (`localStorage["bildirim-tercihleri"]`).
- **Doğru kullanıcı:** veriler yalnız bu cihazdadır, hesap yoktur; bildirim yalnız bu cihazda oluşturulan iş emirleri için çıkar.
- **Metinler:** seçili dilde (TR · EN · AR · FA), `ceviriler.ts` → `cihazBildirimi.*`.

### Uygulama açık / kapalı

| Durum | Davranış |
|---|---|
| Uygulama önde (görünür ve odakta) | İşletim sistemi bildirimi yerine ekranda kısa bildirim (toast) — kullanıcı zaten ekranda |
| Masaüstünde pencere arkada / simge durumunda | İşletim sistemi bildirimi (izin gerekmez) |
| Telefonda uygulama arka planda | WebView kısa süre içinde durdurulur; denetim uygulama yeniden açılınca yapılır, o an olan en son olay bildirilir (15 dk'dan eski değilse) |
| Uygulama tamamen kapalı | Bildirim gelmez. Bunun için push (sunucu + FCM/APNs) gerekir; Ustam'da yoktur |
| İzin verilmemiş | Diyalog açılmaz, kullanıcı zorlanmaz. Ekran görünürse kısa bildirim gösterilir; değilse olay "gönderilmedi" sayılır ve uygulama öne gelince (taze ise) ekranda gösterilir |

## Platform

| | Android | iOS | macOS / Windows / Linux | Tarayıcı |
|---|---|---|---|---|
| Bildirim | `POST_NOTIFICATIONS` (13+ çalışma zamanı izni) | Sistem izni | İzin yok (`gerekmiyor`) | `Notification` API |
| Konum | `ACCESS_COARSE_LOCATION` | `NSLocationWhenInUseUsageDescription` ([`Info.ios.plist`](../src-tauri/Info.ios.plist)) | Yok — düğme gösterilmez | Geolocation API |
| Ayarları aç | Kotlin eklentisi | `app-settings:` | Windows / macOS bildirim ayarları; Linux yok | Yok (yönerge) |

Konum eklentisi (`tauri-plugin-geolocation`) yalnız mobil derlemeye eklenir: masaüstü sürümü gerçek konum okumadan sıfır döndürdüğü için kullanılmaz.

## Elle deneme

| Cihaz | Ne denenir |
|---|---|
| Tarayıcı (`bun run dev`) | /izinler: iki kart ve gerçek tarayıcı durumu → "İzin ver" → tarayıcı sorar → rozet değişir; Ustalar → semt düğmesi → "Konumumdan bul" |
| Windows (`bun run tauri dev`) | /izinler: Bildirim "İzin gerekmiyor", Konum "Bu cihazda yok"; "Deneme bildirimi" Windows bildirimi gösterir; "Ayarları aç" bildirim ayarlarını açar; semt seçicide konum düğmesi yok |
| Android (APK) | İlk açılışta hiçbir izin sorulmaz; /izinler → "İzin ver" (bildirim, konum: yalnız "Yaklaşık"); reddet → "Ayarları aç" uygulama ayarlarını açar, dönünce durum yenilenir; konum servisini kapat → "Konum servisi kapalı"; bir çağrı oluştur, uygulamayı arka plana al ve geri dön → "Usta yola çıktı" |
| iOS | Bu bilgisayarda (Windows) derlenemez; yapılandırma kodla hazırdır, cihazda denenmedi |
