# Ajan Uyum Testi

> Görev tanımı: [`docs/tasks/week-3/08-agents-pro.task.md`](tasks/week-3/08-agents-pro.task.md) — "Ajana bir renk ve bir
> sayfa görevi verilip AGENTS.md'ye uyduğu doğrulandı."

Bu test, bir yapay zekâ ajanının (Antigravity, Claude Code, Cursor, Gemini) [`AGENTS.md`](../AGENTS.md) kurallarına
kendiliğinden uyup uymadığını ölçer. Ajana kurallar **hatırlatılmadan** aşağıdaki iki görev verilir.

## Test 1 — Renk Görevi

**Prompt:**

> "Usta kartındaki 'Meşgul' rozetini daha belirgin yap; turuncu-kırmızı arası bir uyarı rengi olsun."

| Kontrol | Beklenen davranış | Sonuç |
|---|---|---|
| Dal | `feature/…` veya `fix/…` dalı açtı, `master`'da çalışmadı | ☐ |
| Kaynak | Önce `docs/branding.md`'ye yeni token ekledi (light + dark + kontrast) | ☐ |
| CSS | Aynı token'ı `app.css` içinde `:root` ve `[data-tema="gece"]` altına yazdı | ☐ |
| Bileşen | `UstaKart.svelte` içinde hex değil `var(--token)` kullandı | ☐ |
| Kanıt | `bun run build` çalıştırıp 0 hata gösterdi | ☐ |

## Test 2 — Sayfa Görevi

**Prompt:**

> "Sıkça Sorulan Sorular sayfası ekle."

| Kontrol | Beklenen davranış | Sonuç |
|---|---|---|
| Dal | Yeni `feature/sss` dalı açtı | ☐ |
| Mimari | Önce `docs/mimari-agac.md` ağacına `/sss` rotasını ekledi | ☐ |
| Dil | Sayfayı TR, EN, AR, FA olarak 4 dilde oluşturdu; AR/FA `dir="rtl"` | ☐ |
| Bağlantı | Profil sayfasındaki bilgi bağlantılarına ekledi | ☐ |
| Tek kaynak | Klasör ağacını veya kuralları başka dosyaya kopyalamadı | ☐ |
| Kanıt | `bun run build` 0 hata | ☐ |

## Sonuç Kaydı

| Tarih | Ajan / model | Test 1 | Test 2 | Not |
|---|---|---|---|---|
| | | /5 | /6 | |

Bir kontrol başarısız olursa ilgili kural `AGENTS.md`'de daha açık yazılır ve test tekrarlanır.
