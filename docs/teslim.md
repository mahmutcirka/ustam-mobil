# Teslim — Hafta 03 (Batch 01)

> **Son teslim: 09.10.2026 · 23:59** · Geç teslim kabul edilmez · Yalnızca `.zip` · 3 deneme hakkı

## 1. Teslim Adımları

1. **Formu doldurun:** "Hafta 03 - GitHub Hesabı ve Fork Repo Bilgileri" formu.
2. **Repoyu ZIP olarak indirin:** GitHub'da repo sayfası → **Code → Download ZIP**.
3. **ZIP'i Blackboard'daki ödeve yükleyin** (zorunlu, yalnızca `.zip`).

## 2. Form Alanları

| Alan | Format | Ustam için değer |
|---|---|---|
| GitHub kullanıcı adı | Yalnızca ad — `@` veya URL yok | `mahmutcirka` |
| Fork repo linki | Tam URL | `https://github.com/mahmutcirka/ustam-mobil` |
| Proje fikri | 1–2 cümle | Ustam, tesisat, elektrik, çilingir ve kombi gibi acil arızalarda yakındaki müsait ustayı bulup sorunu tarif ederek hızlıca çağırmayı sağlayan 4 dilli bir uygulamadır. Rust tarafı her çağrı için `UST-XXX-GGAA-XXXX` formatında bir iş emri kodu üretir. |
| Hedef platformlar | En az 1 | Android, iOS, Windows (macOS ve Linux da desteklenir) |
| Dosya | Yalnızca `.zip` | Reponun tamamı (Code → Download ZIP) |

## 3. Proje Kuralları

- **Davet (zorunlu):** Eğitmen `keyvanarasteh` repoya collaborator olarak davet edilir
  (Settings → Collaborators → Add people).
- **Git akışı:** Her görev için en az 1 PR (`feature/*` veya `fix/*`); `master`'a doğrudan commit yok
  ([`kurallar.md`](kurallar.md)).
- **Derleme kanıtı:** `bun run build` → 0 hata; `bun run tauri dev` ekran görüntüsü teslime eklenir.
- **Diller ve RTL:** TR · EN · AR · FA; AR ve FA için `dir="rtl"` ([`mimari-agac.md`](mimari-agac.md#3-dil-ve-yön-kapsamı)).

## 4. Görev → PR Eşlemesi

| Görev | Konu | Puan | Dal (PR) |
|---|---|---|---|
| 01 | Fork ve teslim | 10 | — (GitHub + Blackboard) |
| 01.2 | Branch, PR ve merge | 10 | tüm dallar |
| 02 | Proje fikri | 10 | `feature/proje-fikri` |
| — | Ustam ekranları + Rust kodu | — | `feature/ustam-uygulama` |
| 05 | Markalama, renk token ve platform ikonları | 15 | `feature/branding` |
| 06 | Bilgi sayfaları (4 dil, RTL) | 15 | `feature/bilgi-sayfalari` |
| 07 | Klasör yapısı, sayfa ağacı, responsive | 10 | `feature/mimari-responsive` |
| 03 | README | 10 | `feature/readme` |
| 04 | AGENTS.md / CLAUDE.md / GEMINI.md | 10 | `feature/agents` |
| 08 | İleri AGENTS.md ve doküman indeksi | 10 | `feature/agents-pro` |
| 09 | Batch 01 denetimi ve git tag | 10 | `feature/batch-01` + `v0.1.0-batch-01` |
| — | Tasarım sistemi (SVG ikonlar, bildirim, modal, 3'lü tema) | — | `feature/tasarim-sistemi` |
| — | Rust kural motoru (kontrol karakteri, fiyat, ortak vektörler) | — | `feature/rust-kurallar` |
| — | Ustalar v2 (harita, semt, yorumlar, favoriler, karşılama) | — | `feature/ustalar-v2` |
| — | Çağrı ve canlı takip (aşamalar, QR, değerlendirme, profil) | — | `feature/cagri-takip` |
| — | Testler, CI ve belgeler (v0.2.0) | — | `feature/test-ci-belgeler` |

Dallar sırayla birbirinin üzerine kurulmuştur; PR'lar yukarıdaki sırayla merge edilmelidir.

Batch 01 denetim tablosu: [`ilerleme-batch-01.md`](ilerleme-batch-01.md).

## 5. Hafta 04 (Batch 02 ön yayın) — Görev → PR Eşlemesi

> Görevler: [`docs/tasks/week-4/`](tasks/week-4/README.md). Puanlar taslaktır; son tarih ve Görev 16 denetimi derste duyurulacak.
> Her görevin istemi, planı, düzeltmeleri ve doğrulaması: [`docs/istemler/`](istemler/README.md).

| Görev | Konu | Taslak puan | Dal (PR) | Durum |
|---|---|---|---|---|
| 09.1 | Master koruması ve PR güvenliği | ön koşul | `feature/09-1-master-korumasi` (#25) | Belge tamam; **GitHub ayarları ve `docs/kanit/master-korumasi.png` öğrenci tarafından yapılacak** |
| 10 | Çalışma yöntemi: şartname, istem günlüğü | 10 | `feature/10-calisma-yontemi` (#28) | Tamam; yeni sohbette "kural testi" yanıtı öğrenci tarafından eklenecek |
| 11 | Veri sözleşmesi: tipler, örnek veri, `bun run check` | 15 | `feature/11-veri-sozlesmesi` (#29) | Tamam |
| 12 | Kart bileşeni (`ui/Kart.svelte`) | 15 | `feature/12-kart-bileseni` (#30) | Tamam |
| 13 | Liste ekranı ve üç durum | 20 | `feature/13-liste-ve-uc-durum` (#31) | Tamam |
| 14 | Detay ekranı ve gezinme | 10 | `feature/14-detay-ekrani` (#32) | Tamam |
| 15 | Rust komutu: tipli sonuç ve hata, platform kuralı | 20 | `feature/15-rust-komutu` (#33) | Tamam; `tauri dev` (Windows) ve Android'de elle deneme öğrenciye |
| — | Telefon önizleme aracı (`bun run telefon`) | — | `feature/telefon-onizleme` (#26) | Tamam |
| — | Android projesi ve APK belgesi | — | `feature/android-projesi` (#27) | Tamam |
| — | Profil yenileme (çağrıya hazırlık, Evim, Evimi tanıyorum) | — | `feature/profil-yenileme` (#34) | Tamam |
