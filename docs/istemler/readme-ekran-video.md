# İstem günlüğü — README ekran görüntüleri ve kullanım videosu

## İstem
> Hoca README'ye Ustam Mobil'in fotoğraflarını ve kullanım videosunu istiyor; hepsini yap, detaylıca.

## Plan ve uygulananlar
- Görüntüler uygulamanın kendisinden alındı: gizli Chrome, DevTools protokolüyle telefon boyutunda (390 × 844, 2x) yönetildi; yeni paket kurulmadı (görüntü işleme projede zaten olan `sharp` ile).
- **12 ekran görüntüsü** (`docs/ekran-goruntuleri/`): karşılama, ustalar, harita, Ne oldu sihirbazı, usta detayı, çağrı özeti, canlı takip, profil, izinler, Arapça (RTL), gece teması, masaüstü.
- **Kullanım videosu** (~50 sn): karşılama → ustalar → harita → usta detayı → çağrı özeti (telefon, koşullar, onay) → canlı takip → profil → izinler → gece teması + Arapça. Çağrı gerçek akışla oluşturuldu; iş emri kodu ve fiyat kural motorundan geldi.
- Video GIF (README'de doğrudan oynar, 2,6 MB) ve animasyonlu WebP (daha net, 1 MB) olarak kaydedildi. GitHub, depodaki MP4 dosyalarını README içinde oynatmaz; README'de oynayan biçim GIF'tir.
- Yeniden üretilebilir: `araclar/ekran-cekimi.ts` (`bun run ekran`, `bun run dev` açıkken).
- Kişi bilgileri uydurmadır ("Ayşe Demir", 0555 000 00 00).

## Düzeltmeler
- Saat 21:50'de 1 numaralı usta kapalıydı, çağrı randevuya dönüyordu → gece de açık (7/24) usta seçildi.
- Takip ekranında iş bildirimi görüntünün üstüne biniyordu → çekimden önce bildirimler "gönderildi" işaretlendi.
- Videoda karşılamanın semt adımında arka plandaki ana sayfa düğmesine basılıyordu → dokunuş karşılama penceresiyle sınırlandı.
- `localhost` bazen yalnız IPv4'te dinliyor → araç iki adresi de dener (telefon önizleme aracındaki gibi).

## Doğrulama
- Her görüntü ve videodan eşit aralıklı kareler gözle kontrol edildi.
- `bun run build` → 39 sayfa · `bun run check` → 0 hata · `bun run test` → 152 · `lat check` → temiz
