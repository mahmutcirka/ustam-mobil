# Rust Komutları

> Görev tanımı: [`docs/tasks/week-4/15-rust-komutu.task.md`](tasks/week-4/15-rust-komutu.task.md).
> Kod: [`src-tauri/src/lib.rs`](../src-tauri/src/lib.rs) · Arayüz tarafındaki **tek** giriş noktası: [`src/lib/native.ts`](../src/lib/native.ts)
> · Tipler: [`src/lib/types/native.ts`](../src/lib/types/native.ts) ve [`src/lib/types/kural.ts`](../src/lib/types/kural.ts).

Komutlar başarıda alanları belli bir yapı, başarısızlıkta türü belli bir hata (`KomutHatasi`) döndürür; düz metin
döndürmez ve geçersiz girdide panik yapmaz. Tarayıcıda (Rust yokken) `native.ts` aynı kuralların TypeScript karşılığını
çalıştırır; hata biçimi aynıdır. Rust ve TS aynı örneklerle test edilir:
[`src-tauri/test-vektorleri.json`](../src-tauri/test-vektorleri.json) (`cargo test` · `bun run test`).

## Komutlar

| Komut (`invoke`) | `native.ts` işlevi | Girdi | Başarıda | Hata türleri |
|---|---|---|---|---|
| `is_emri_uret` | `isEmriKoduUret(kategori, zaman)` | `kategori`: `tesisat` · `elektrik` · `cilingir` · `kombi` · `beyaz-esya`; `zaman`: `"2026-10-12T14:30"` | `UretilenKod { kod, kategoriKodu, tarih }` — ör. `{ kod: "UST-ELK-1210-K7QZ", kategoriKodu: "ELK", tarih: "1210" }` | `bilinmeyen-kategori`, `gecersiz-tarih` |
| `is_emri_dogrula` | `isEmriKoduDogrula(kod)` | `kod`: kapıdaki ustanın söylediği metin (boşluk/küçük harf olabilir) | `KodDurumu`: `gecerli` · `bicim-hatali` · `kontrol-hatali` | — (her girdide bir durum döner) |
| `fiyat_hesapla` | `fiyatHesapla(girdi)` | `FiyatGirdisi { cikisUcreti, aciliyet, zaman, iscilikMin, iscilikMax }` | `FiyatDokumu { cikis, acil, gece, pazar, iscilikMin, iscilikMax, toplamMin, toplamMax }` (TL, tam sayı) | `gecersiz-tarih`, `bilinmeyen-aciliyet`, `gecersiz-tutar`, `aralik-ters` |
| `veri_dosyasi_kaydet` | `verileriKaydet(icerik, dosyaAdi)` | `icerik`: dışa aktarılacak JSON metni | `KaydedilenDosya { yol }` — masaüstünde İndirilenler'deki tam yol | `gecersiz-icerik`, `dosya-yazilamadi`, `platform-desteklemiyor` (mobil) |

Kod biçimi ve fiyat kuralları (acil ücret, gece %25, Pazar %15): [`docs/proje-fikri.md`](proje-fikri.md) § 4.

## Hata biçimi — `KomutHatasi`

Rust'ta `#[serde(tag = "tur", content = "ayrinti", rename_all = "kebab-case")]`; ön yüze şöyle gelir:

```json
{ "tur": "gecersiz-tutar", "ayrinti": "cikisUcreti" }
{ "tur": "aralik-ters" }
```

| `tur` | `ayrinti` | Ne zaman | Arayüzde |
|---|---|---|---|
| `bilinmeyen-kategori` | gelen değer | Kategori 5 hizmetten biri değil | `hata.bilinmeyenKategori` |
| `gecersiz-tarih` | gelen değer | `YYYY-MM-DDTHH:mm` değil ya da ay/gün/saat geçersiz | `hata.gecersizTarih` |
| `bilinmeyen-aciliyet` | gelen değer | `hemen` · `bugun` · `randevu` değil | `hata.bilinmeyenAciliyet` |
| `gecersiz-tutar` | alan adı | Tutar eksi ya da 1.000.000 TL'den büyük | `hata.gecersizTutar` |
| `aralik-ters` | — | `iscilikMin > iscilikMax` | `hata.aralikTers` |
| `gecersiz-icerik` | — | Dışa aktarılacak içerik boş ya da 5 MB'tan büyük | `hata.gecersizIcerik` |
| `dosya-yazilamadi` | işletim sistemi mesajı | İndirilenler klasörü bulunamadı ya da yazılamadı | `hata.dosyaYazilamadi` |
| `platform-desteklemiyor` | — | Komut bu platformda yok (mobilde dosyaya kaydetme) | `native.ts` panoya kopyalamaya geçer |
| `ic-hata` *(yalnız TS)* | ham mesaj | Rust komutu çalışmadan Tauri katmanında oluşan beklenmeyen hata | `hata.icHata` |

`fiyat_hesapla` denetim sırası iki tarafta da aynıdır: **tarih → aciliyet → tutarlar (çıkış, işçilik alt, üst) → aralık**.
Tutarlar Rust'ta `i64` alınır; böylece eksi sayı serde'nin düz metin hatasına değil `gecersiz-tutar`'a düşer.

Hatalar arayüzde [`ui/HataDurumu.svelte`](../src/lib/components/ui/HataDurumu.svelte) ile gösterilir (çağrı onayı,
`src/components/Cagri.svelte`): başlık, türün çevrilmiş açıklaması, `ayrinti` ve "Tekrar dene".

## Platform

`veri_dosyasi_kaydet` platforma göre farklı derlenir: `#[cfg(desktop)]` dosya yazar, `#[cfg(mobile)]`
`platform-desteklemiyor` döner. Özellik × platform tablosu: [`docs/platform-destegi.md`](platform-destegi.md).

## Yeni komut eklerken

1. `lib.rs`: `#[tauri::command]` + `generate_handler!` listesi; sonuç `struct`, hata `KomutHatasi` (yeni tür gerekirse enum'a eklenir).
2. En az 2 test (başarılı + hatalı girdi); ortak kural ise `test-vektorleri.json`'a örnek.
3. `src/lib/types/native.ts`'e aynı alanlarla tip; `src/lib/native.ts`'e işlev ve tarayıcı yedeği.
4. Bu tabloya satır; platforma göre değişiyorsa `docs/platform-destegi.md` ve `DESTEK` tablosu.
