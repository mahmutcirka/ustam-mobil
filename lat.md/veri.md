# Veri

Veri tipleri tek yerde tanımlıdır ve örnek veri tek dosyadadır; kullanıcının verileri yalnız bu cihazda saklanır ve KVKK gereği dışa aktarılıp silinebilir.

Alan tabloları [[docs/veri-modeli.md]] içindedir.

## Veri sözleşmesi

Bütün tipler [[src/lib/types]] altında, her ana tip ayrı dosyadadır; durum gibi alanlar serbest metin değil sabit seçenek dizisinden türetilir.

Ana tipler usta, hizmet, iş emri ve fiyat dökümüdür; iş emri [[src/lib/types/isEmri.ts#IsEmri]] Rust'ın ürettiği kod ve fiyatla oluşur. Bileşen ya da store içinde veri tipi tanımlanmaz, `any` yazılmaz. Örnek veri (17 usta, 15 hizmet, 12 semt) [[src/lib/data.ts]]; semt merkezleri hem stilize harita hem gerçek koordinat içerir ([[src/lib/data.ts#semtler]]).

## Yerel depolama

Profil, iş emirleri, favoriler, yorumlar ve tercihler tarayıcı depolamasında tutulur; erişim her zaman korumalı yardımcılarla yapılır.

Okuma ve yazma [[src/lib/depo.ts#oku]] ve [[src/lib/depo.ts#yaz]] üzerinden; depolama yoksa ya da bozuksa varsayılana dönülür. Önceki sürümlerin iş emri kayıtları okunurken yeni biçime çevrilir.

## Veri hakları

Kullanıcı bu cihazdaki kişisel verilerini dışa aktarabilir ve tamamını silebilir; dil ve tema tercihi kişisel veri sayılmaz.

Anahtar listesi ve dışa aktarma [[src/lib/veri.ts#kisiselVeriler]], silme [[src/lib/veri.ts#tumVerileriSil]]. Kaydetme yolu platforma göre değişir: tarayıcıda indirme, masaüstünde Rust ile İndirilenler klasörü, telefonda pano ([[src/lib/native.ts#verileriKaydet]]).
