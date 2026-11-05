# Ürün

Ustam, acil arızada (tesisat, elektrik, çilingir, kombi, beyaz eşya) yakındaki müsait ustayı bulup sorunu tarif ederek çağırmayı sağlayan 4 dilli bir Tauri v2 uygulamasıdır.

Fikrin tam metni [[docs/proje-fikri.md]], sayfa ağacı [[docs/mimari-agac.md]] içindedir. Bu bölüm yalnız kodu anlamak için gereken özeti tutar.

## Kullanıcı ve ana akış

Kullanıcı semtini seçer, ustayı listeden ya da haritadan bulur, sorunu ve aciliyeti seçip çağırır; Rust iş emri kodu ve fiyat dökümü üretir, iş canlı takip edilir.

Akış: Ustalar → Usta detayı → Çağrı özeti → İş Emirlerim. Kapıdaki ustayı kullanıcı iş emri koduyla doğrular ([[is-kurallari#İş emri kodu]]); iş tamamlanınca değerlendirme alınır. Hesap ve sunucu yoktur, veriler cihazdadır ([[veri#Yerel depolama]]).

## Diller ve yön

Arayüz Türkçe, İngilizce, Arapça ve Farsçadır; Arapça ve Farsça sağdan sola (RTL) gösterilir ve metinler tek sözlükten gelir.

Sözlük [[src/lib/ceviriler.ts]]; Türkçe kaynak kabul edilir, diğer diller aynı anahtarların tamamını içermek zorundadır (TypeScript eksik anahtarı derlemede yakalar). Seçili dil ve yön [[src/lib/i18n.svelte.ts#DilYonetici]] içindedir. Ustaya giden metin her zaman Türkçedir.

## Platformlar

Uygulama Android, iOS, macOS, Windows ve Linux'ta çalışır; tarayıcı önizlemesi de desteklenir. Bir platformda olmayan özellik arayüzde hiç gösterilmez.

Özellik × platform kararları [[mimari#Platform tablosu]] ile verilir; ayrıntılı gerekçeler [[docs/platform-destegi.md]] içindedir.
