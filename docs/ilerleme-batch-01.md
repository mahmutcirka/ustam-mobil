# İlerleme — Batch 01 Denetimi (Hafta 3)

> Görev tanımı: [`docs/tasks/week-3/09-progress-batch-01.task.md`](tasks/week-3/09-progress-batch-01.task.md) ·
> Son teslim: **09.10.2026 23:59** · Teslim adımları: [`teslim.md`](teslim.md)

## 1. Kontrol Matrisi

| No | Alan | İstenen çıktı | Kanıt | Durum |
|:---:|---|---|---|:---:|
| 1 | Fork ve işbirliği | Kendi hesapta fork + `keyvanarasteh` collaborator daveti | GitHub → Settings → Collaborators | ☐ öğrenci |
| 2 | Blackboard teslimi | GitHub kullanıcı adı ve fork linki forma yazıldı | "Hafta 03" formu | ☐ öğrenci |
| 3 | Proje fikri | `docs/proje-fikri.md`, 3 ekran ve kod formatı | [`proje-fikri.md`](proje-fikri.md) | ☑ |
| 4 | Kurumsal README | Logo, rozetler, öğrenci bilgisi, kurulum | [`README.md`](../README.md) | ☑ |
| 5 | Ajan kural dosyaları | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | [`AGENTS.md`](../AGENTS.md) | ☑ |
| 6 | Markalama | `branding.md` token'ları = `app.css`; 5 platform ikonu | [`branding.md`](branding.md) | ☑ |
| 7 | Bilgi sayfaları | Hakkında, İletişim, Koşullar, Gizlilik × 4 dil, AR/FA RTL | `src/pages/`, `src/pages/{en,ar,fa}/` | ☑ |
| 8 | Mimari ağaç | Sayfa ağacı, platform matrisi, breakpoint'ler | [`mimari-agac.md`](mimari-agac.md) | ☑ |
| 9 | Derleme doğrulaması | `bun run build` 0 hata | Aşağıdaki çıktı | ☑ |

## 2. Derleme Kanıtı

```text
$ bun run build
 generating static routes
  ├─ /ar/gizlilik/index.html · /ar/hakkinda/index.html · /ar/iletisim/index.html · /ar/kosullar/index.html
  ├─ /en/gizlilik/index.html · /en/hakkinda/index.html · /en/iletisim/index.html · /en/kosullar/index.html
  ├─ /fa/gizlilik/index.html · /fa/hakkinda/index.html · /fa/iletisim/index.html · /fa/kosullar/index.html
  ├─ /gizlilik · /hakkinda · /iletisim · /kosullar
  ├─ /cagri · /is-emirlerim · /profil · /index.html
  └─ /usta/1 … /usta/8
[build] 28 page(s) built
[build] Complete!

$ cd src-tauri && cargo test
test result: ok. 4 passed; 0 failed
```

Ekran görüntüleri (`bun run build` ve `bun run tauri dev`) teslim ZIP'ine eklenir.

## 3. Git Etiketi

Tüm PR'lar `master`'a merge edildikten sonra:

```bash
git checkout master
git pull origin master
git tag -a v0.1.0-batch-01 -m "Hafta 3: Batch 01 - Proje altyapısı, markalama ve sayfalar tamamlandı"
git push origin v0.1.0-batch-01
```
