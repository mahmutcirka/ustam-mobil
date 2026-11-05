# İlerleme — Batch 02 Denetimi (Hafta 4)

> Görevler: [`docs/tasks/week-4/`](tasks/week-4/README.md) · Görev → PR eşlemesi: [`teslim.md`](teslim.md#5-hafta-04-batch-02-ön-yayın--görev--pr-eşlemesi)
> · İstem günlükleri: [`docs/istemler/`](istemler/README.md) · Önceki denetim: [`ilerleme-batch-01.md`](ilerleme-batch-01.md)

## 1. Kontrol Matrisi

| No | Görev | İstenen çıktı | Kanıt | Durum |
|:---:|---|---|---|:---:|
| 09.1 | Master koruması | `master` için kural seti: PR zorunlu, force push ve dal silme kapalı; ekran görüntüsü | GitHub → Settings → Rules; `docs/kanit/master-korumasi.png` | ☐ öğrenci |
| 09.1 | PR güvenliği belgesi | PR güvenlik kuralları, AGENTS git kuralı | [`kurallar.md` § 4](kurallar.md#4-pr-güvenliği), PR #25 | ☑ |
| 10 | Çalışma yöntemi | Şartname şablonu, istem günlüğü, AGENTS çalışma döngüsü | [`gorev-sartnamesi.md`](gorev-sartnamesi.md), [`istemler/`](istemler/README.md), PR #28 | ☑ |
| 10 | Kural testi | Yeni sohbette ajanın kuralları doğru söylemesi | [`istemler/10-calisma-yontemi.md`](istemler/10-calisma-yontemi.md) "Kural testi" | ☐ öğrenci |
| 11 | Veri sözleşmesi | `src/lib/types/`, örnek veri, `bun run check` | [`veri-modeli.md`](veri-modeli.md), PR #29 | ☑ |
| 12 | Kart bileşeni | Genel `ui/Kart.svelte`, liste ve favorilerde | `src/lib/components/ui/Kart.svelte`, PR #30 | ☑ |
| 13 | Liste ve üç durum | Yükleniyor, hata, boş, dolu; `?durum=` | [`gelistirme-notlari.md`](gelistirme-notlari.md), PR #31 | ☑ |
| 14 | Detay ekranı | Gezinme, seçim adreste, bulunamadı | `src/components/UstaDetay.svelte`, `src/pages/404.astro`, PR #32 | ☑ |
| 15 | Rust komutu ve platform | Tipli sonuç ve hata, platform tablosu | [`komutlar.md`](komutlar.md), [`platform-destegi.md`](platform-destegi.md), PR #33 | ☑ |
| 16 | Pencere boyutu | `tauri.conf.json` içinde `minWidth` / `minHeight` | `minWidth: 360`, `minHeight: 600` (aşağıda) | ☑ |
| 16 | Denetim belgesi | `docs/ilerleme-batch-02.md` | Bu belge | ☑ |
| 16 | Etiket | `v0.2.0-batch-02` | § 4 | ☐ 09.1 bitince |

Batch 02 dışında aynı dönemde eklenenler: telefon önizleme aracı (#26), Android projesi (#27), profil yenileme (#34),
SQLite yerel arka uç (#36, eğitmen), yetkiler / izinler (#37), lat.md bilgi grafiği (#38).

## 2. Pencere boyutu

Masaüstü penceresi telefon düzeninde (420×820) açılır; en küçük boyut **360×600**'dür
([`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json)). 360 px, desteklenen en dar telefon genişliğidir: bu
genişlikte Ustalar, Usta detayı, Çağrı, İş Emirlerim, Profil ve İzinler sayfalarında yatay taşma olmadığı tarayıcıda
denetlendi. Daha dar pencerede alt menü ve kartlar sıkışacağı için pencere bundan küçültülemez. Breakpoint'ler:
[`mimari-agac.md` § 4](mimari-agac.md#4-ekran-boyutları-responsive-breakpoints).

## 3. Derleme ve Test Kanıtı

```text
$ bun run build
[build] 39 page(s) built
[build] Complete!

$ bun run check            # astro check
- 0 errors
- 0 warnings

$ bunx svelte-check --tsconfig ./tsconfig.json
COMPLETED 0 ERRORS 0 WARNINGS

$ bun run test
 152 pass
 0 fail

$ cd src-tauri && cargo test
test result: ok. 24 passed; 0 failed

$ lat check
All checks passed
```

CI (GitHub Actions) her PR'da derleme, TS testleri, tip kontrolü (Linux) ve `cargo test` (Windows) çalıştırır.

## 4. Git Etiketi

Görev 09.1'in GitHub adımı (kural seti + ekran görüntüsü) bitip tablo tamamen işaretlenince:

```bash
git checkout master
git pull origin master
git tag -a v0.2.0-batch-02 -m "Hafta 4: Batch 02 - veri sözleşmesi, Kart, liste ve üç durum, detay, tipli Rust komutları"
git push origin v0.2.0-batch-02
```
