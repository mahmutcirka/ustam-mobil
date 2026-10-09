# Geliştirme Notları

Uygulamayı elle denerken kullanılan kısa yollar. Bunlar yalnız `bun run dev` sırasında çalışır; derlenmiş uygulamada
(`bun run build`, Tauri paketi) etkisizdir.

## Liste ekranlarının dört hali — `?durum=`

> Görev tanımı: [`docs/tasks/week-4/13-liste-ve-uc-durum.task.md`](tasks/week-4/13-liste-ve-uc-durum.task.md).

Liste ekranları veriyi tek bir yükleme işlevinden alır ([`src/lib/yukleyici.ts`](../src/lib/yukleyici.ts)) ve dört
halden birini gösterir. Adres çubuğuna `?durum=` yazarak her hali zorlayabilirsiniz:

| Adres | Ne görünür | Bileşen |
|---|---|---|
| `http://localhost:1420/?durum=yukleniyor` | Kart iskeletleri; yükleme hiç bitmez | `ui/Yukleniyor.svelte` |
| `http://localhost:1420/?durum=hata` | "Bir şeyler ters gitti" + **Tekrar dene**. Hata geçici arıza gibi davranır: bir kez gösterilir, "Tekrar dene" listeyi getirir | `ui/HataDurumu.svelte` |
| `http://localhost:1420/?durum=bos` | "Bu bölgede henüz usta yok" | `ui/BosDurum.svelte` |
| `http://localhost:1420/` | Dolu liste (17 usta) | `ui/Kart.svelte` |

Aynı anahtar ikinci liste ekranında da çalışır: `http://localhost:1420/is-emirlerim?durum=hata` (ya da `yukleniyor`, `bos`).

**Arama / süzgeç boş hali:** ana ekranda arama kutusuna anlamsız bir kelime (`zzqxw`) yazın → "Aramanıza uygun usta
bulunamadı" ve **Filtreleri temizle** düğmesi.

**Dil denemesi:** sağ üstteki dil menüsünden EN / AR / FA seçin; üç durumun metinleri `src/lib/ceviriler.ts` içindeki
`durum.*` anahtarlarından gelir. AR ve FA'da düzen sağdan sola döner.

## Diğer kısa yollar

| Ne | Nasıl |
|---|---|
| Telefon çerçevesinde açmak | `bun run telefon` → [http://localhost:1421](http://localhost:1421) ([`docs/kurulum.md`](kurulum.md)) |
| Karşılama sihirbazını yeniden görmek | Profil → Verilerimi sil, ya da tarayıcı konsolunda `localStorage.removeItem("karsilama-tamam")` |
| Ustanın detayını doğrudan açmak | `http://localhost:1420/usta/3` (kimlik 1–17) |
| Detayı bir sorun seçili açmak | `http://localhost:1420/usta/9?sorun=su-sizintisi&aciliyet=hemen` |
