# Mimari

Astro statik sayfaları, Svelte 5 adaları ve Rust çekirdeği (Tauri v2) üç katmandır; arayüz Rust'a ve işletim sistemine yalnız tek bir modül üzerinden gider.

Klasör sorumlulukları [[docs/klasor-mimarisi.md]], komut listesi [[docs/komutlar.md]] içindedir.

## Tek native kapısı

Bileşenler `invoke()`, Tauri eklentileri ya da platform adı kullanmaz; her native iş [[src/lib/native.ts]] içindeki işlevlerden geçer.

Ortak çağrı [[src/lib/native.ts#cagir]] Tauri içinde Rust komutunu, tarayıcıda aynı işin TypeScript ya da tarayıcı API'si karşılığını çalıştırır; her iki yolda hata [[src/lib/native.ts#NativeHata]] olarak aynı biçimde döner ve [[src/lib/native.ts#hataAnahtari]] ile 4 dilde metne çevrilir.

## Tipli komut hatası

Rust komutları düz metin hata döndürmez ve geçersiz girdide panik yapmaz; hata türü ve isteğe bağlı ayrıntı içeren tek bir enum kullanılır.

Rust tarafı [[src-tauri/src/lib.rs#KomutHatasi]] (`tur` / `ayrinti` olarak serileşir), TypeScript karşılığı [[src/lib/types/native.ts#KomutHatasi]]. Yeni hata türü iki tarafa birlikte ve sözlüğe 4 dilde eklenir.

## Platform tablosu

Platforma göre değişebilen her özellik için altı ortamda (beş platform + web) destek durumu tek bir tabloda tutulur: destekleniyor, farklı yolla ya da yok.

Tablo [[src/lib/native.ts#DESTEK]]; bileşen yalnız [[src/lib/native.ts#destekleniyorMu]] diye sorar ve "yok" ise özelliği hiç göstermez. Platform [[src/lib/native.ts#platform]] ile WebView kimliğinden bulunur. Belgedeki tablo ile koddaki tablo bir testle eşit tutulur ([[testler#Testler#İzinler ve platform#Platform tablosu belgeyle aynı]]).

## Durum ve sayfalar

Paylaşılan durum `src/lib/*.svelte.ts` store'larındadır (Svelte 5 runes); sayfalar Astro, etkileşimli parçalar `client:only` Svelte adalarıdır.

İş emirleri [[src/lib/isEmirleri.svelte.ts#IsEmirleri]], profil, favoriler, tema ve dil ayrı store'lardır. Ortak iskelet [[src/layouts/Layout.astro]]: üst bar, alt menü, kısa bildirimler ve iş bildirimi izleyicisi ([[izinler#Bildirim]]) burada bir kez bulunur.

## Yerel arka uç

SQLite tabanlı geçici arka uç Rust içinde çalışır: migration, rol ve izin denetimi (RBAC), kaynak denetleyicileri; henüz ekranlara bağlı değildir.

Kod [[src-tauri/src/backend]], ayrıntı [[docs/backend.md]]. Sorgularda tablo ve sütun adları sabit listeden gelir, değerler parametreyle gider; parolalar Argon2id ile saklanır.
