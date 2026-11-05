# İş kuralları

İş emri kodu, kod doğrulama ve fiyat hesabı Rust'ta yazılıdır; aynı kuralların TypeScript karşılığı tarayıcı için vardır ve ikisi ortak örneklerle test edilir.

Rust [[src-tauri/src/lib.rs]], TypeScript [[src/lib/kurallar.ts]], ortak örnekler [[src-tauri/test-vektorleri.json]]. Bir kural yalnız bir tarafta değiştirilmez.

## İş emri kodu

Her çağrı `UST-KAT-GGAA-XXXC` biçiminde kod alır: 3 harfli kategori, ziyaret günü ve ayı, 3 rastgele karakter ve bir kontrol karakteri.

Üretim [[src-tauri/src/lib.rs#kod_olustur]] (TS: [[src/lib/kurallar.ts#kodUret]]). Alfabe karışan karakterleri (0/O, 1/I) içermez ([[src-tauri/src/lib.rs#ALFABE]]). Kontrol karakteri [[src-tauri/src/lib.rs#kontrol_karakteri]] gövdedeki tek karakter hatasını yakalar; kullanıcı kapıdaki ustanın söylediği kodu [[src-tauri/src/lib.rs#kod_durumu]] ile doğrular (geçerli, biçim hatalı, kontrol hatalı).

## Fiyat dökümü

Fiyat çıkış ücreti, acil ek ücreti, gece ve Pazar oranı ile işçilik aralığından oluşur; tutarlar tam sayı TL'dir.

Hesap [[src-tauri/src/lib.rs#fiyat_dokumu]] (TS: [[src/lib/kurallar.ts#fiyatHesapla]]). Acil ücret [[src-tauri/src/lib.rs#ACIL_UCRET]], gece oranı [[src-tauri/src/lib.rs#GECE_ORANI]] (22:00–07:59), Pazar oranı [[src-tauri/src/lib.rs#PAZAR_ORANI]]. Denetim sırası iki tarafta aynıdır: tarih, aciliyet, tutarlar, aralık; eksi ya da [[src-tauri/src/lib.rs#UST_TUTAR]] üstü tutar tipli hata verir.

## Canlı takip

Sunucu olmadığı için aktif işin aşaması zamandan hesaplanan bir simülasyondur: alındı, onaylandı, yolda, kapıda, tamamlandı.

Geçiş anları [[src/lib/takip.ts#asamaZamanlari]], anlık durum [[src/lib/takip.ts#takip]]. Onay oluşturmadan 20 sn sonra, yola çıkış varıştan yol süresi kadar önce (en erken 45 sn); kod doğrulanınca varış beklenmeden "kapıda" sayılır. Simülasyon kodda adıyla belirtilir, gerçek zamanlı bağlantı iddia edilmez.

## Önerilen sıralama

"Önerilen" sıralama yapay zekâ değildir: müsaitlik, yakınlık, puan, yanıt süresi, dil ve fiyat sabit ağırlıklarla puanlanır ve kullanıcıya nedenleri gösterilir.

Puan [[src/lib/eslestirme.ts#oneriPuani]]. Yakınlık kullanıcının semtinden ustaya mesafeyle ([[src/lib/data.ts#mesafeKm]]) hesaplanır; varış süresi [[src/lib/data.ts#varisDk]].
