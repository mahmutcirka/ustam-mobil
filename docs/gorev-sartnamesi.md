# Görev Şartnamesi Şablonu

> Her görevden önce bu şablon kopyalanır ve `docs/istemler/NN-kisa-ad.md` kaydının başına doldurulur.
> Çalışma döngüsü: **şartname → plan → değişiklik → doğrulama** ([`AGENTS.md` § Çalışma döngüsü](../AGENTS.md#6-çalışma-döngüsü)).
> Köşeli parantezli satırları silip kendi görevinize göre yazın; aşağıdaki örnekler Ustam'dan alınmıştır.

---

## Amaç

Bu görev bitince kullanıcı ya da geliştirici neyi yapabiliyor olacak? Bir–iki cümle.

- [Örnek] Kullanıcı ana ekranda hangi ustanın müsait olduğunu tek bakışta görür; usta kartları her listede aynı görünür.
- [Örnek] Kapıdaki ustanın söylediği iş emri kodu Rust tarafında doğrulanır; geçersiz kodda uygulama çökmez, hata ekranı çıkar.

## Kapsam dışı

Bu görevde **yapılmayacak** olanlar. Ajan bunlara dokunmaz.

- [Örnek] Gerçek sunucu / ödeme entegrasyonu yok; ustalar `src/lib/data.ts` örnek verisinden gelir.
- [Örnek] Renk paleti ve ikonlar değişmez (`docs/branding.md`).
- [Örnek] Bilgi sayfalarının (Hakkında, Gizlilik…) metinlerine dokunulmaz.

## Kabul ölçütleri

İşin bittiğini gösteren, evet/hayır ile denetlenebilen maddeler.

- [ ] [Örnek] Ana ekranda en az 6 usta kartı görünüyor; kart Tab ile odaklanıyor, Enter ile detay açılıyor.
- [ ] [Örnek] Dil Arapça / Farsça yapıldığında kart sağdan sola dönüyor, taşma yok.
- [ ] [Örnek] Yeni arayüz metinleri `src/lib/ceviriler.ts` içinde 4 dilde (TR · EN · AR · FA).
- [ ] `bun run build` → 0 hata; iş kuralı değiştiyse `bun run test` ve `cargo test` de geçiyor.

## Dokunulacak dosyalar

Değişmesi beklenen dosyalar. Liste dışında bir dosya değişirse PR'da nedeni yazılır.

| Dosya | Neden |
|---|---|
| [Örnek] `src/lib/components/ui/Kart.svelte` | Yeni genel kart bileşeni |
| [Örnek] `src/components/Ustalar.svelte` | Ana listeyi yeni kartla kurmak |
| [Örnek] `src/lib/ceviriler.ts` | Yeni metinler (4 dil) |

## Doğrulama adımları

Değişiklikten sonra **elle** yapılacak denemeler ve çalıştırılacak komutlar. Sonuçlar istem kaydına yazılır.

1. `bun run build` → 0 hata (çıktının son satırları kayda yapıştırılır).
2. [Örnek] `bun run dev` → `http://localhost:1420` → Ustalar ekranında kartları Tab ile gezin, Enter'a basın.
3. [Örnek] Üst menüden dili **AR** yapın; kartın görseli ve metni yer değiştirdi mi?
4. [Örnek] `bun run telefon` ile 390×844 telefon çerçevesinde açın; yatay taşma var mı?
5. Ekran görüntüleri `docs/istemler/img/` altına, adı `NN-kisa-ad-*.png` olacak biçimde eklenir.
