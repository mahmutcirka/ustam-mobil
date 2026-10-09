# Veri Modeli

> Görev tanımı: [`docs/tasks/week-4/11-veri-sozlesmesi.task.md`](tasks/week-4/11-veri-sozlesmesi.task.md).
> **Tek kaynak:** [`src/lib/types/`](../src/lib/types/index.ts) — bu belge tiplerin okunur özetidir. Bir alan değişirse
> önce tip dosyası, sonra bu tablo güncellenir. Örnek veri tek dosyadadır: [`src/lib/data.ts`](../src/lib/data.ts).

## Ana tipler ve ilişkiler

```text
            ┌──────────────┐ 1      N ┌──────────┐
            │    Usta      │──────────│  Yorum   │
            └──────┬───────┘          └──────────┘
          kategori │ N                       
                   │            ┌──────────────┐
                   └────────────│   Hizmet     │  (kategori başına 3 sorun)
                        N       └──────┬───────┘
                                       │ 1
   ┌──────────────┐  onay + Rust  ┌────┴─────────┐  1      1 ┌──────────────┐
   │ CagriTaslagi │──────────────▶│   IsEmri     │───────────│ FiyatDokumu  │
   └──────────────┘               └──────────────┘           └──────────────┘
          ustaId → Usta.id · sorun → Hizmet.sorun · kod: Rust is_emri_uret · fiyat: Rust fiyat_hesapla
```

- **Usta 1–N Yorum:** yorumlar ustanın içinde tutulur; kullanıcının bu cihazda yazdıkları `YorumKaydi` olarak ayrıca saklanır.
- **Usta N–N Hizmet:** usta kendi kategorisindeki bütün hizmetleri (sorunları) çözer; `Usta.sorunlar` bu listeden türetilir.
- **CagriTaslagi → IsEmri:** onaylanan taslak, Rust'ın ürettiği kod ve fiyat dökümüyle iş emrine dönüşür.
- **IsEmri N–1 Usta / N–1 Hizmet:** `ustaId` ve `sorun` alanlarıyla bağlanır.
- İşin anlık aşaması (`IsAsamasi`) saklanmaz; [`src/lib/takip.ts`](../src/lib/takip.ts) zamandan hesaplar (`TakipBilgisi`).

Örnek veri sayıları: **17 usta**, **15 hizmet**, **6 örnek iş emri**, **35 yorum**, **12 semt** ([`tests/data.test.ts`](../tests/data.test.ts) en az 6 kaydı ve tutarlılığı denetler).

## Usta — `src/lib/types/usta.ts`

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | `number` | ✔ | Benzersiz kimlik; detay adresi `/usta/<id>` |
| `ad` | `string` | ✔ | Ad soyad |
| `kategori` | `Kategori` | ✔ | `tesisat` · `elektrik` · `cilingir` · `kombi` · `beyaz-esya` |
| `puan` | `number` | ✔ | Ortalama puan, 0–5 |
| `yorumSayisi` | `number` | ✔ | Toplam yorum sayısı |
| `musait` | `boolean` | ✔ | Şu an yeni iş alabilir mi |
| `musaitOlacakDk` | `number` | — | Meşgulse elindeki işin bitmesine kalan dk |
| `cikisUcreti` | `number` | ✔ | Çıkış ücreti, TL |
| `deneyimYil` | `number` | ✔ | Deneyim, yıl |
| `tamamlananIs` | `number` | ✔ | Tamamlanan iş sayısı |
| `semt` | `Semt` | ✔ | 12 semtten biri |
| `konum` | `Konum` | ✔ | Stilize haritada `{ x, y }` |
| `diller` | `Dil[]` | ✔ | Konuştuğu diller: `tr` · `en` · `ar` · `fa` |
| `rozetler` | `Rozet[]` | ✔ | `dogrulanmis` · `sigortali` · `7-24` · `hizli-yanit` |
| `yanitDk` | `number` | ✔ | Ortalama ilk yanıt süresi, dk |
| `calisma` | `CalismaSaatleri` | ✔ | `"7-24"` ya da `["08:00", "22:00"]` |
| `sorunlar` | `string[]` | ✔ | Çözdüğü `Hizmet.sorun` anahtarları |
| `yorumlar` | `Yorum[]` | ✔ | Örnek müşteri yorumları |

**Yorum:** `ad` ✔, `puan` ✔ (1–5), `metin` ✔ (çevrilmez), `dil` ✔, `tarih` ✔ (YYYY-MM-DD), `benim` — (bu cihazda yazıldı).
**UstaDurumu** (hesaplanır): `{ tur: "musait" }` · `{ tur: "mesgul", dk? }` · `{ tur: "kapali", acilis }`.

## Hizmet — `src/lib/types/hizmet.ts`

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `sorun` | `string` | ✔ | Sorun anahtarı; adı `ceviriler.ts` içinde `sorun.<anahtar>` (4 dil) |
| `kategori` | `Kategori` | ✔ | Bağlı olduğu kategori |
| `iscilik` | `[min, max]` | ✔ | Tahmini işçilik aralığı, TL |
| `sureDk` | `number` | ✔ | Tahmini iş süresi, dk |
| `tehlikeli` | `boolean` | — | Güvenlik riski; arayüzde uyarı vurgulanır |

**AcilKisayol:** ana sayfadaki "Ne oldu?" kutuları — `sorun` ✔, `kategori` ✔.

## İş emri — `src/lib/types/isEmri.ts`

**CagriTaslagi** (onaydan önce):

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `ustaId` | `number` | ✔ | `Usta.id` |
| `sorun` | `string` | ✔ | `Hizmet.sorun` |
| `aciliyet` | `Aciliyet` | ✔ | `hemen` · `bugun` · `randevu` |
| `zaman` | `string` | ✔ | Ziyaret zamanı, yerel ISO `2026-10-12T14:30` |
| `adresNotu` | `string` | ✔ | Adres ve kapı notu |
| `foto` | `string` | — | Küçültülmüş JPEG data URL |

**IsEmri** = `CagriTaslagi` + aşağıdakiler:

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `kod` | `string` | ✔ | `UST-KAT-GGAA-XXXC` (Rust `is_emri_uret`) |
| `ustaAd` | `string` | ✔ | Kayıt anındaki usta adı |
| `kategori` | `Kategori` | ✔ | Usta kategorisi |
| `fiyat` | `FiyatDokumu` | ✔ | Rust `fiyat_hesapla` dökümü |
| `durum` | `IsDurumu` | ✔ | `aktif` · `tamamlandi` · `iptal` |
| `olusturma` | `string` | ✔ | Oluşturma zamanı, yerel ISO |
| `varisDk` | `number` | ✔ | Oluşturma anındaki tahmini yol süresi |
| `odeme` | `OdemeTercihi` | ✔ | `nakit` · `kart` |
| `telefon` | `string` | ✔ | Ustanın arayacağı telefon |
| `dogrulandi` | `boolean` | — | Kapıdaki ustanın kodu doğrulandı |
| `iptalNedeni` | `IptalNedeni` | — | `vazgectim` · `gecikti` · `baskasi` · `cozuldu` |
| `bitis` | `string` | — | Tamamlanma ya da iptal zamanı |

**IsAsamasi** (hesaplanır, saklanmaz): `alindi` → `onaylandi` → `yolda` → `kapida` → `tamamlandi`.

## Kural tipleri — `src/lib/types/kural.ts`

Rust yapılarıyla ([`src-tauri/src/lib.rs`](../src-tauri/src/lib.rs), serde `camelCase`) aynı alanlar.

| Tip | Alanlar |
|---|---|
| `FiyatGirdisi` | `cikisUcreti`, `aciliyet`, `zaman`, `iscilikMin`, `iscilikMax` |
| `FiyatDokumu` | `cikis`, `acil`, `gece`, `pazar`, `iscilikMin`, `iscilikMax`, `toplamMin`, `toplamMax` (TL, tam sayı) |
| `KodDurumu` | `gecerli` · `bicim-hatali` · `kontrol-hatali` |

## Diğer tipler

| Dosya | Tipler |
|---|---|
| `ortak.ts` | `Dil` (`DILLER`), `Semt` (`SEMTLER`), `Yaka`, `Konum` |
| `profil.ts` | `ProfilBilgileri` (`ad`, `telefon`, `semt`, `adres`), `TemaTercihi` (`sistem` · `gunduz` · `gece`), `Tema` |
| `liste.ts` | `Siralama`, `Gorunum`, `UstaFiltresi`, `SorunOnerisi`, `NedenTuru`, `Oneri`, `OneriBaglami` |
| `bildirim.ts` | `Bildirim`, `BildirimTuru` (`basari` · `bilgi` · `hata`) |

## Kurallar

- **Yeni veri alanı önce `src/lib/types/` içinde tanımlanır**; bileşen ya da store içinde tip tanımlanmaz (bileşenin kendi `Props` arayüzü hariç).
- Durum gibi alanlar serbest metin değildir: `as const` dizi (`IS_DURUMLARI`) ve ondan türetilen tip (`IsDurumu`).
- Projede `any` kullanılmaz; `bun run check` (`astro check`) ve `bunx svelte-check` 0 hata vermelidir.
