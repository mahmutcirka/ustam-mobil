---
lat:
  require-code-mention: true
---
# Testler

Önemli kuralların neyle ve neden test edildiği. Rust testleri `cargo test`, TypeScript testleri `bun run test` ile çalışır; her yaprak bölüm bir testte `@lat:` yorumuyla anılır.

## Kural motoru

İş emri kodu ve fiyat kuralları Rust ve TypeScript'te aynı sonucu vermelidir; ikisi aynı örnek dosyasını okur.

### Kontrol karakteri tek hatayı yakalar

Rastgele kısımdaki her konumda her tek karakter değişikliği kod doğrulamasında "kontrol hatalı" çıkmalıdır; kapıda yanlış söylenen kod böyle yakalanır.

### Fiyat dökümü ortak örneklerle aynı

Elle hesaplanmış fiyat örnekleri (acil, gece, Pazar, işçilik) Rust hesabında birebir aynı dökümü vermelidir.

### Tipli hata biçimi

Rust hatası ön yüze `tur` ve isteğe bağlı `ayrinti` alanlarıyla gitmelidir; TypeScript tipi bu biçime göre yazılıdır.

### TypeScript kuralları ortak örneklerle aynı

Tarayıcıdaki TypeScript kuralları, Rust'ın okuduğu ortak örnek dosyasındaki kontrol karakteri, kod durumu, gün ve fiyat örneklerini aynı sonuçla geçmelidir.

## Akışlar

Zamandan hesaplanan takip ve iş bildirimleri, sunucu olmadan doğru ve tekrarsız çalışmalıdır.

### Takip aşamaları sırayla ilerler

Aktif iş zamana göre alındı, onaylandı, yolda ve kapıda aşamalarından sırayla geçmelidir; tamamlanan iş her zaman tamamlandı görünür.

### İş bildirimi tekrar etmez

Her iş için yalnız en son olay bir kez bildirilmeli; bayat olay, kapalı kategori ve kapıda kodu doğrulanmış iş bildirim üretmemelidir.

## İzinler ve platform

İzin durumu tahmin edilmemeli, konum doğru semte eşlenmeli ve platform tablosu belgeyle aynı kalmalıdır.

### İzin durumu işletim sisteminden eşlenir

İşletim sisteminin dört izin durumu (verildi, reddedildi, yeniden sorulabilir, sorulmadı) uygulamanın değerlerine birebir eşlenmelidir.

### Konum en yakın semte eşlenir

Gerçek koordinatlar doğru semte eşlenmeli; hizmet bölgesi dışı ve geçersiz koordinat semt seçmemelidir.

### Platform tablosu belgeyle aynı

Koddaki özellik × platform tablosu, platform desteği belgesindeki tabloyla hücre hücre aynı olmalıdır.

### Çeviri anahtarları dört dilde aynı

Dört dilin sözlüğü Türkçe ile aynı anahtar kümesine sahip olmalıdır; eksik çeviri arayüzde anahtar adı olarak görünmesin.
