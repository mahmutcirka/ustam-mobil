# Ustam — Marka ve Tasarım Kılavuzu

> Görev tanımı: [`docs/tasks/week-3/05-branding.task.md`](tasks/week-3/05-branding.task.md)
>
> Bu belge renklerin **tek doğru kaynağıdır**. Aynı değerler [`src/styles/app.css`](../src/styles/app.css)
> içinde `:root` (gündüz) ve `:root[data-tema="gece"]` (gece) altında birebir tanımlıdır. Arayüzde
> ad-hoc renk yazılmaz; yalnızca aşağıdaki CSS değişkenleri kullanılır.

---

## 1. Marka Kimliği

- **Ad:** Ustam
- **Slogan:** *Arıza senden, usta bizden.*
- **Kişilik:** Hızlı, güvenilir, yardımsever. Turuncu, iş güvenliği yeleklerinin ve "acil ama kontrol altında"
  hissinin rengidir; lacivert güven ve profesyonellik verir.

---

## 2. Renk Token'ları

Kontrast oranları WCAG 2.1 bağıl parlaklık formülüyle hesaplanmıştır; metin/zemin çiftlerinin tamamı
**AA (≥ 4.5:1)** eşiğini geçer.

| Token | Gündüz (light) | Gece (dark) | Kullanım yeri | Kontrast (gündüz · gece) |
|---|---|---|---|---|
| `--renk-ana` | `#c2410c` | `#f97316` | Birincil buton, aktif çip/sekme, seçili kenarlık | `--renk-ana-ustu` ile 5.18 · 6.24 |
| `--renk-ana-yazi` | `#c2410c` | `#fb923c` | Vurgulu metin (fiyat, bağlantı) | kart üzerinde 5.18 · 6.46 |
| `--renk-ana-ustu` | `#ffffff` | `#1c1917` | Birincil renk üzerindeki yazı | — |
| `--renk-ana-yumusak` | `#ffedd5` | `#3b1d0b` | Avatar zemini, bilgi kutusu | `--yazi` ile 15.58 · 14.69 |
| `--renk-koyu` | `#1e293b` | `#020617` | Üst bar ve usta kapak alanı | beyaz yazı 14.63 · 20.17 |
| `--koyu-ustu` | `#ffffff` | `#ffffff` | `--renk-koyu` üzerindeki yazı (logo, kapak) | 14.63 · 20.17 |
| `--koyu-cam` | `#ffffff1f` | `#ffffff1f` | Koyu alan üstündeki yarı saydam düğme/avatar zemini | — (dekoratif) |
| `--koyu-cizgi` | `#ffffff33` | `#ffffff33` | Koyu alan üstündeki düğme kenarlığı | — (dekoratif) |
| `--golge` | `#0f172a2e` | `#0000005c` | Bildirim kutusu gölgesi | — (dekoratif) |
| `--logo` | `#f97316` | `#f97316` | Logodaki "am" vurgusu (yalnızca `--renk-koyu` üstünde) | 5.22 · — |
| `--vurgu` | `#f59e0b` | `#fbbf24` | Rozet / uyarı ikonu (metin rengi olarak kullanılmaz) | — |
| `--vurgu-yumusak` | `#fef3c7` | `#3a2a06` | Uyarı kutusu, "Bekliyor" rozeti | `--yazi` ile 16.03 · 13.26 |
| `--basari` | `#15803d` | `#4ade80` | "Şu an müsait", "Usta yolda", doğrulama başarılı | rozet zemininde 4.57 · 8.45 |
| `--basari-yumusak` | `#dcfce7` | `#0f2e1b` | Başarı rozeti zemini | — |
| `--hata` | `#b91c1c` | `#f87171` | İptal, hatalı kod uyarısı | kart üzerinde 6.47 · 5.29 |
| `--zemin` | `#f8fafc` | `#0f172a` | Sayfa arka planı | `--yazi` ile 17.06 · 17.06 |
| `--kart` | `#ffffff` | `#1e293b` | Kartlar, form alanları, alt menü | `--yazi` ile 17.85 · 13.98 |
| `--yazi` | `#0f172a` | `#f8fafc` | Başlık ve gövde metni | — |
| `--yazi-soluk` | `#475569` | `#94a3b8` | İkincil bilgi (semt, tarih, açıklama) | zemin 7.24 · 6.96, kart 7.58 · 5.71 |
| `--kenar` | `#e2e8f0` | `#334155` | Kart ve input sınırları, ayırıcılar | — (dekoratif) |

### Yüzey, harita ve hareket token'ları

| Token | Gündüz (light) | Gece (dark) | Kullanım yeri |
|---|---|---|---|
| `--golge-kart` | `0 1px 2px #0f172a0f, 0 2px 8px #0f172a0a` | `0 1px 2px #00000066` | Kartların hafif gölgesi |
| `--golge-yuksek` | `0 12px 32px #0f172a29` | `0 16px 40px #000000a6` | Modal pencere, bildirim, harita kartı |
| `--perde` | `#0f172a73` | `#000000a6` | Modal arkasındaki karartma |
| `--yuzey-2` | `#f1f5f9` | `#273449` | İkinci yüzey: avatar, çip zemini, güvenlik kodu alanı, iskelet | `--yazi` 16.30 · 11.99, `--yazi-soluk` 6.92 · 4.89 |
| `--secili` / `--secili-ustu` | `#0f172a` / `#ffffff` | `#f8fafc` / `#0f172a` | Seçili çip, sekme ve seçenekler (nötr) | 17.85 · 17.06 |
| `--hata-yumusak` | `#fee2e2` | `#3b1414` | "Kapıyı açmayın" ve hata kutuları | `--hata` 5.30 · 5.86 |
| `--basili` | `#0f172a0d` | `#ffffff14` | Basılı durum katmanı | — (dekoratif) |
| `--qr-zemin` / `--qr-modul` | `#ffffff` / `#0f172a` | aynı (QR okuyucular için ters çevrilmez) | İş emri QR kodu — kontrast 17.85:1 |
| `--su` | `#bfdbfe` | `#1e3a5f` | Harita: Boğaz ve Marmara |
| `--kara` | `#e9eef4` | `#1a2536` | Harita: kara parçası |
| `--radius-kucuk` / `--radius` / `--radius-buyuk` | `10px` / `14px` / `20px` | aynı | Input · kart ve buton · modal |
| `--sure-hizli` / `--sure-orta` | `150ms` / `260ms` | aynı | Basma geri bildirimi · giriş animasyonları |
| `--egri` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | aynı | Tüm geçişlerin hız eğrisi |

### Boşluk, yazı ve dokunma ölçeği

| Token | Değerler | Kullanım |
|---|---|---|
| `--b-1` … `--b-6` | 4 · 8 · 12 · 16 · 24 · 32 px | Boşluklar |
| `--yz-xs` … `--yz-2xl` | 12 · 13 · 15 · 17 · 22 · 28 px | Yazı boyutları (etiket → sayfa başlığı) |
| `--dokunma` | 44 px | En küçük dokunma hedefi (Apple HIG) |
| `--kart-gorsel` | 52 px | Kart bileşenindeki görsel / baş harf kutusu (`ui/Kart.svelte`) |
| `--radius-hap` | 999 px | Çip, rozet ve hap biçimli düğmeler |
| `--radius-mini` | 6 px | Küçük kutulu etiketler (dil kısaltması "TR", "AR") |

### Renk kullanım ilkesi

- **Turuncu (`--renk-ana`) yalnızca birincil aksiyondadır:** "Ustayı çağır", "Çağrıyı onayla", filtre uygulama.
- **Seçili durumlar nötrdür (`--secili`):** kategori çipleri, sekmeler, sıralama, gün ve saat seçimi.
- Durum renkleri anlam taşır: yeşil = müsait / doğrulandı, sarı = bekleme / kapalı, kırmızı = tehlike / iptal.

`prefers-reduced-motion: reduce` açık olan cihazlarda tüm animasyonlar kapatılır. Klavye odağı her öğede
`--renk-ana` renginde 2px `:focus-visible` halkasıyla gösterilir.

> Neden gündüz modunda `#f97316` değil `#c2410c`? Beyaz yazı `#f97316` üzerinde yalnızca 2.8:1 kontrast
> verir ve AA'yı geçemez. Parlak turuncu yalnızca koyu zeminde (logo, gece modu) kullanılır.

---

## 3. Tipografi, Boşluk ve Köşe

- **Yazı tipi:** Sistem yazı tipi yığını — `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  (Arapça ve Farsça için işletim sisteminin yerel yazı tipine otomatik düşer).
- **Ölçek:** Sayfa başlığı 22px/700 · kart başlığı 17px/700 · gövde 14–16px/400 · rozet 11px/600.
- **Köşe yuvarlaklığı (`--radius`):** `14px` (kart, buton, input). Avatarlar 16–20px, çipler ve rozetler `999px`.
- **Boşluk:** 4'ün katları — kart iç boşluğu 14–16px, liste aralığı 12px, sayfa kenarı 16px.

---

## 4. Logo ve İkon

- **Sembol:** Konum işareti içinde İngiliz anahtarı → "yakınındaki usta".
- **Kelime işareti:** `ust` beyaz + `am` turuncu (`--logo`), 22px / 800, üst barda `public/logo.svg` ile birlikte.
- **Kaynak dosya:** [`app-icon.svg`](../app-icon.svg) (1024×1024, köşeleri şeffaf). Tüm platform ikonları bu tek
  dosyadan üretilir; renkler yalnızca bu belgedeki token'lardan alınır (`#f97316 → #c2410c` gradyan, `#1e293b` çekirdek).

### Arayüz ikon seti

Arayüzde emoji kullanılmaz; tüm ikonlar [`src/lib/ikonlar.ts`](../src/lib/ikonlar.ts) içindeki 24×24, 2px çizgili,
yuvarlak uçlu SVG path'lerinden `<Ikon ad="…" />` bileşeniyle çizilir. Renk her zaman `currentColor`'dan, yani
çevredeki metnin token'ından gelir. Kategori ikonları: Tesisat `damla` · Elektrik `simsek` · Çilingir `anahtar` ·
Kombi `alev` · Beyaz Eşya `camasir`.

### Platform ikon ve launcher tablosu

| Platform | Dosya / Konum | Boyut ve format | Üretim |
|---|---|---|---|
| macOS | `src-tauri/icons/icon.icns` | 1024×1024 kaynak, `.icns` | `bun run tauri icon app-icon.svg` |
| Windows | `src-tauri/icons/icon.ico`, `Square*Logo.png`, `StoreLogo.png` | Çok boyutlu `.ico` (16–256) | `bun run tauri icon app-icon.svg` |
| Linux | `src-tauri/icons/32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.png` | 32, 128, 256, 512 px | `bun run tauri icon app-icon.svg` |
| iOS | `src-tauri/icons/ios/` | AppIcon seti (20–1024 px) | `bun run tauri icon app-icon.svg` |
| Android | `src-tauri/icons/android/` | `mipmap-*` (mdpi–xxxhdpi), adaptive icon | `bun run tauri icon app-icon.svg` |
| Web | `public/favicon.png`, `public/apple-touch-icon.png`, `public/logo.svg` | 64 px, 180 px PNG, SVG | `bun run tauri icon app-icon.svg -o <dizin> -p 64 -p 180` |

---

## 5. Uygulama Kimliği (Tauri)

| Alan | Değer | Dosya |
|---|---|---|
| `productName` | `Ustam` | [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json) |
| `identifier` | `edu.istinye.ustam` | [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json) |
| Pencere başlığı | `Ustam — Acil Usta` (420×820) | [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json) |
