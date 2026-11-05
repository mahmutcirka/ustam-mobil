# İzinler

Uygulama yalnız gerçekten kullandığı iki izni ister: bildirim ve yaklaşık konum. Durum okumak asla diyalog açmaz; diyalog yalnız kullanıcı düğmeye bastığında açılır.

Rust [[src-tauri/src/permissions.rs]], ekran [[src/components/Izinler.svelte]], gerekçe ve senaryo tablosu [[docs/izinler.md]].

## İzin durumu

Her iznin durumu işletim sisteminden okunur ve tahmin edilmez: verildi, reddedildi, sorulmadı, servis kapalı, gerekmiyor, desteklenmiyor ya da okunamadı.

Değerler [[src-tauri/src/permissions.rs#IzinDegeri]]; işletim sistemi durumundan eşleme [[src-tauri/src/permissions.rs#izin_degeri]]. Android'de bir kez reddedilen izin "reddedildi" ama yeniden sorulabilir döner; kalıcı reddedilende kullanıcı sistem ayarlarına yönlendirilir ([[src-tauri/src/permissions.rs#sistem_ayarlarini_ac]]). Masaüstünde bildirim için çalışma zamanı izni yoktur ("gerekmiyor").

## Konum

Konum yalnız "Konumumdan bul" dokunuşuyla, yaklaşık doğrulukta ve bir kez okunur; koordinat en yakın semti bulmakta kullanılıp atılır, profile yalnız semt adı yazılır.

Okuma [[src-tauri/src/permissions.rs#konum_oku]] (yalnız telefonda; masaüstü eklentisi gerçek konum vermediği için düğme masaüstünde gösterilmez). Eşleme [[src/lib/konum.ts#enYakinSemt]] semt merkezlerine haversine mesafesiyle yapılır; [[src/lib/konum.ts#HIZMET_YARICAPI_KM]] dışı konum "hizmet bölgesi dışında" sayılır. Android'de hassas konum izni manifestten çıkarılmıştır.

## Bildirim

Bildirimler yereldir (push sunucusu yok) ve iş akışına bağlıdır: usta onayladı, yola çıktı, kapıda; randevu onayı ve randevudan bir saat önce hatırlatma.

Olay seçimi saf işlevdir: [[src/lib/isBildirimleri.ts#bekleyenBildirimler]]. Her iş için yalnız gerçekleşmiş en son olay bildirilir, [[src/lib/isBildirimleri.ts#TAZELIK_DK]] dakikadan eski olay bildirilmez, gönderilen olay `kod:olay` anahtarıyla kaydedilip tekrar edilmez. Kullanıcının kendi eylemleri (çağrı, iptal, tamamlama) bildirilmez. Gönderim [[src/lib/bildirimIzleyici.svelte.ts#denetle]]: uygulama öndeyse ekran içi, arkadaysa sistem bildirimi; hiç ulaştırılamayan olay geri alınır.
