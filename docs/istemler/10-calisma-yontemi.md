# 10 — Çalışma Yöntemi: Şartname, İstem Günlüğü, Doğrulama

Görev: [`docs/tasks/week-4/10-calisma-yontemi.task.md`](../tasks/week-4/10-calisma-yontemi.task.md) · Dal: `feature/10-calisma-yontemi`

## Şartname

**Amaç:** Bundan sonraki her görev aynı döngüyle yapılsın: şartname → plan → değişiklik → doğrulama; her görevin istemi ve sonucu repoda kayıtlı olsun.

**Kapsam dışı:** Uygulama kodu, arayüz ve iş kuralları değişmez. `docs/tasks/` altındaki eğitmen dosyalarına dokunulmaz.

**Kabul ölçütleri:**
- [x] `docs/gorev-sartnamesi.md` beş başlıkla (Amaç, Kapsam dışı, Kabul ölçütleri, Dokunulacak dosyalar, Doğrulama adımları) ve Ustam'a özgü örnek satırlarla var.
- [x] `docs/istemler/README.md` dosya adı kuralını (`NN-kisa-ad.md`) ve her kayıttaki başlıkları anlatıyor.
- [x] `AGENTS.md` içinde "Çalışma döngüsü" bölümü: plan-önce, onay, görev başına dal + PR, `bun run build` 0 hata şartı.
- [x] İki yeni belge `AGENTS.md` doküman indeksinde.
- [x] `bun run build` → 0 hata.

**Dokunulacak dosyalar:** `docs/gorev-sartnamesi.md` (yeni), `docs/istemler/README.md` (yeni), `docs/istemler/10-calisma-yontemi.md` (yeni), `AGENTS.md`.

**Doğrulama adımları:** `bun run build`; yeni bir sohbette araca döngüyü sormak (aşağıda).

## Araç ve model

Claude Code (Claude masaüstü uygulaması, Code sekmesi) · model **Claude Opus 5.5** (`claude-opus-5-5`).

## İstem

Öğrencinin bu oturumdaki isteği:

> hocanın son attığı commitleri incele hepsini detaylıca analiz et yapılması gereken her şeyi yap sakın duraklama her şeyi commit at kalan extra bi sorun olursa en son beni uyar.

Görev dosyasındaki istem, Ustam'a uyarlanmış hâliyle:

```text
Bu repoda bundan sonra her görevi şu döngüyle yapacağız: şartname, plan, değişiklik, doğrulama.
1. `docs/gorev-sartnamesi.md` adında, benim her görevde dolduracağım kısa bir şablon oluştur. Başlıklar: Amaç, Kapsam dışı, Kabul ölçütleri, Dokunulacak dosyalar, Doğrulama adımları.
2. `docs/istemler/README.md` oluştur: her görev için `NN-kisa-ad.md` dosyası açılır; içinde araç ve model, istem, plan, düzeltmeler ve doğrulama sonucu yazar.
3. `AGENTS.md` dosyasına "Çalışma döngüsü" bölümü ekle: önce plan sun ve onayımı bekle; onaydan sonra değiştir; her görev ayrı dalda ve PR ile; `bun run build` 0 hata vermeden bitti deme.
4. Yeni belgeleri `AGENTS.md` doküman indeksine ekle.
Önce planını göster, ben onaylayınca uygula.
Son olarak: `bun run build` 0 hata vermeli. Bitince hangi dosyaları neden değiştirdiğini madde madde özetle ve benim elle denemem gereken adımları yaz.
```

## Plan

Aracın sunduğu plan:

1. `docs/gorev-sartnamesi.md` — beş başlıklı şablon; her başlığın altında ne yazılacağı tek cümle, Ustam'dan `[Örnek]` satırları (usta kartı, iş emri kodu doğrulaması, 4 dil, RTL), doğrulamada `bun run telefon` ile telefon çerçevesi.
2. `docs/istemler/README.md` — dosya adı kuralı (`NN-kisa-ad.md`, ara görevde `09-1-…`), ekran görüntüleri için `docs/istemler/img/`, kayıttaki altı başlığın tablosu, kayıt listesi.
3. `AGENTS.md` — indekse iki satır; yeni bölüm "6. Çalışma Döngüsü": şartname → plan (onay bekle) → değişiklik (ayrı dal, PR) → doğrulama (`bun run build` 0 hata; tip değişince `bun run check`, kural değişince `bun run test` + `cargo test`) → özet.
4. `docs/istemler/10-calisma-yontemi.md` — bu kayıt.
5. `bun run build`, ardından dal `feature/10-calisma-yontemi` → PR → merge.

## Düzeltmeler

- **Onay adımı:** Görev döngüsü "plan sun, onay bekle" der. Öğrenci bu oturumda açıkça *"sakın duraklama"* dediği için plan bu kayda yazıldı ve ayrıca onay beklenmeden uygulandı; sonraki görevlerde de (11–15) plan aynı biçimde kayda yazıldı. Kural `AGENTS.md`'de onay beklemeyi şart koşacak biçimde bırakıldı.
- **Bağlantı:** Şablondaki `AGENTS.md` bağlantısı bölüm başlığına (`#6-çalışma-döngüsü`) verildi; tüm dosya yerine doğrudan kurala gidilsin diye.
- **Kanıt klasörü:** Ekran görüntüleri için ayrı `docs/istemler/img/` klasörü belirlendi; `docs/kanit/` yalnız Görev 09.1 gibi GitHub ayarı kanıtları için kullanılacak.

## Doğrulama

```text
$ bun run build
[build] 37 page(s) built
[build] Complete!
```

- `docs/gorev-sartnamesi.md` açıldı: beş başlık var, örnekler Ustam'a özgü.
- `AGENTS.md` içindeki yeni bağlantılar (`docs/gorev-sartnamesi.md`, `docs/istemler/README.md`, `docs/kurallar.md#4-pr-güvenliği`) dosyalara gidiyor.

### Kural testi (yeni sohbet) — öğrenci tarafından yapılacak

Yeni bir sohbet açıp araca şu soru sorulur ve yanıt buraya yapıştırılır:

```text
Bu repoda bir görevi hangi sırayla yaparsın?
```

Beklenen: yanıtın `AGENTS.md` § 6'daki döngüyü (şartname → plan ve onay → ayrı dalda değişiklik + PR → `bun run build` 0 hata) anlatması.

> Yanıt: _(buraya yapıştırın)_
