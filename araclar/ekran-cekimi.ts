// README ekran görüntüleri ve kullanım videosu: uygulamayı gizli Chrome'da telefon boyutunda (390×844) gerçekten
// kullanarak çeker. Kullanım: önce `bun run dev`, sonra `bun run ekran` (yalnız görüntü: `bun run ekran -- --gorsel`).
// Çıktı: docs/ekran-goruntuleri/*.png, ustam-kullanim.gif ve .webp. Yalnızca geliştirme içindir; pakete girmez.
// Chrome yolu CHROME ortam değişkeniyle değiştirilebilir. Kişi bilgileri uydurma örnek veridir.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

let UYGULAMA = "http://localhost:1420";
const CIKTI = join(import.meta.dir, "..", "docs", "ekran-goruntuleri");
const PORT = 9333;
const CHROME =
  process.env.CHROME ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find(existsSync);

const PROFIL = { ad: "Ayşe Demir", telefon: "0555 000 00 00", semt: "Kadıköy", adres: "Moda Cad. No: 12", kapiNotu: "3. kat, zil 5" };
// Gece de açık (7/24) olan usta ve sorunu — saat kaç olursa olsun çağrı "Hemen" gider
const USTA = "/usta/2";
const SORUN = "Sigorta sürekli atıyor";

const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- Chrome (DevTools protokolü)

type Sekme = Awaited<ReturnType<typeof ac>>;

async function ac(genislik = 390, yukseklik = 844, olcek = 2) {
  if (!CHROME) throw new Error("Chrome bulunamadı; CHROME ortam değişkenini ayarlayın");
  const profil = mkdtempSync(join(tmpdir(), "ustam-ekran-"));
  const surec = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profil}`,
    "--hide-scrollbars",
    "--no-first-run",
    `--window-size=${genislik},${yukseklik}`,
    "about:blank",
  ]);
  let adres: string | undefined;
  for (let i = 0; i < 50 && !adres; i++) {
    await bekle(200);
    try {
      const liste = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
      adres = liste.find((s) => s.type === "page")?.webSocketDebuggerUrl;
    } catch {
      // Chrome henüz açılmadı
    }
  }
  if (!adres) throw new Error("Chrome'a bağlanılamadı");
  const ws = new WebSocket(adres);
  await new Promise((r) => (ws.onopen = r));
  let sira = 0;
  const yanitlar = new Map<number, (sonuc: any) => void>();
  const dinleyiciler = new Set<(m: any) => void>();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id) yanitlar.get(m.id)?.(m.result), yanitlar.delete(m.id);
    else dinleyiciler.forEach((f) => f(m));
  };
  const gonder = (method: string, params: object = {}) =>
    new Promise<any>((coz) => {
      yanitlar.set(++sira, coz);
      ws.send(JSON.stringify({ id: sira, method, params }));
    });
  await gonder("Page.enable");
  await gonder("Emulation.setDeviceMetricsOverride", { width: genislik, height: yukseklik, deviceScaleFactor: olcek, mobile: genislik < 768 });
  await gonder("Emulation.setTouchEmulationEnabled", { enabled: genislik < 768 });
  await gonder("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

  const s = {
    async git(yol: string, sonra = 1800) {
      const yuklendi = new Promise<void>((coz) => {
        const f = (m: any) => m.method === "Page.loadEventFired" && (dinleyiciler.delete(f), coz());
        dinleyiciler.add(f);
      });
      await gonder("Page.navigate", { url: UYGULAMA + yol });
      await yuklendi;
      await bekle(sonra);
    },
    async js<T = unknown>(kod: string): Promise<T> {
      const r = await gonder("Runtime.evaluate", { expression: `(async () => { ${kod} })()`, awaitPromise: true, returnByValue: true });
      if (r?.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "sayfa hatası");
      return r?.result?.value as T;
    },
    /** Metni içeren görünür ilk öğeye dokunur */
    async dokun(metin: string, secici = "button, a, [role=radio], label") {
      const ok = await s.js<boolean>(`
        const el = [...document.querySelectorAll(${JSON.stringify(secici)})]
          .find((e) => e.offsetParent !== null && e.innerText.replace(/\\s+/g, " ").includes(${JSON.stringify(metin)}));
        if (!el) return false;
        el.scrollIntoView({ block: "center", behavior: "instant" });
        el.click();
        return true;`);
      if (!ok) throw new Error(`öğe bulunamadı: ${metin}`);
      await bekle(500);
    },
    async dokunSecici(css: string) {
      await s.dokun("", css);
    },
    async yaz(css: string, deger: string) {
      await s.js(`const el = document.querySelector(${JSON.stringify(css)});
        el.value = ${JSON.stringify(deger)}; el.dispatchEvent(new Event("input", { bubbles: true }));`);
      await bekle(400);
    },
    async kaydir(hedef: number, adim = 1, ms = 0) {
      const bas = await s.js<number>("return scrollY");
      for (let i = 1; i <= adim; i++) {
        await s.js(`scrollTo({ top: ${bas + ((hedef - bas) * i) / adim}, behavior: "instant" })`);
        await bekle(ms);
      }
      await bekle(250);
    },
    async haritaGoster() {
      await s.dokunSecici('button[aria-label="Harita"]');
      await bekle(600);
      await s.js(`const k = document.querySelector(".harita-kutu"); scrollTo({ top: k.getBoundingClientRect().top + scrollY - 130, behavior: "instant" })`);
      await bekle(600);
    },
    async goruntu(): Promise<Buffer> {
      const r = await gonder("Page.captureScreenshot", { format: "png" });
      if (!r?.data) throw new Error("ekran görüntüsü alınamadı");
      return Buffer.from(r.data, "base64");
    },
    async kaydet(ad: string) {
      await sharp(await s.goruntu()).png({ compressionLevel: 9 }).toFile(join(CIKTI, ad));
      console.log("  ✓", ad);
    },
    /** Arka planda kare toplar; dönen işlev kaydı durdurup [zaman, png] listesini verir */
    kayit(aralikMs = 120) {
      const kareler: [number, Buffer][] = [];
      let acik = true;
      const dongu = (async () => {
        while (acik) {
          const bas = Date.now();
          // Sayfa geçişi sırasında görüntü alınamazsa o kare atlanır
          await s.goruntu().then((k) => kareler.push([bas, k]), () => undefined);
          await bekle(Math.max(0, aralikMs - (Date.now() - bas)));
        }
      })();
      return async () => ((acik = false), await dongu, kareler);
    },
    async kapat() {
      ws.close();
      surec.kill();
      await bekle(500);
      rmSync(profil, { recursive: true, force: true });
    },
  };
  return s;
}

/** Karşılama atlanmış, örnek profil dolu bir başlangıç */
async function hazirla(s: Sekme, dil = "tr", tema = "gunduz") {
  await s.git("/", 300);
  await s.js(`
    localStorage.clear();
    localStorage.setItem("karsilama-tamam", "true");
    localStorage.setItem("profil", ${JSON.stringify(JSON.stringify(PROFIL))});
    localStorage.setItem("dil", ${JSON.stringify(dil)});
    localStorage.setItem("tema", ${JSON.stringify(JSON.stringify(tema))});
    localStorage.setItem("favoriler", "[1,7]");
    localStorage.setItem("ev-hazirligi", JSON.stringify({ "su-vanasi": true, "sigorta-kutusu": true, "dogalgaz-vanasi": false }));`);
}

// ---------------------------------------------------------------- ekran görüntüleri

async function gorseller() {
  console.log("Ekran görüntüleri");
  let s = await ac();
  await s.git("/");
  await s.kaydet("01-karsilama.png");
  await hazirla(s);
  await s.git("/");
  await s.kaydet("02-ustalar.png");
  await s.haritaGoster();
  await s.kaydet("03-harita.png");

  // Gerçek çağrı akışı: kod ve fiyat kural motorundan gelir
  await s.git(USTA);
  await s.dokun(SORUN, "label");
  await s.kaydir(0);
  await s.kaydet("04-usta-detay.png");
  await s.dokun("Ustayı çağır");
  await bekle(1500);
  await s.dokunSecici("label.onay");
  await s.kaydir(0);
  await s.kaydet("05-cagri-ozeti.png");
  await s.dokun("Çağrıyı onayla");
  await bekle(2500);

  // Takipte "Yolda" görünsün diye iş 3 dk önce oluşturulmuş sayılır; bildirimler gönderilmiş işaretlenir
  await s.js(`
    const l = JSON.parse(localStorage.getItem("is-emirleri"));
    l[0].olusturma = new Date(Date.now() - 3 * 60000).toISOString();
    localStorage.setItem("is-emirleri", JSON.stringify(l));
    const olaylar = ["onaylandi", "randevu-onaylandi", "randevu-yaklasiyor", "yolda", "kapida"];
    localStorage.setItem("gonderilen-bildirimler", JSON.stringify(l.flatMap((i) => olaylar.map((o) => i.kod + ":" + o))));`);
  await s.git("/is-emirlerim", 2200);
  await s.kaydet("06-canli-takip.png");
  await s.git("/profil", 2000);
  await s.kaydet("07-profil.png");
  await s.git("/izinler", 2000);
  await s.kaydet("08-izinler.png");
  await s.git("/");
  await s.dokun("Arızayı adım adım tarif et");
  await bekle(900);
  await s.kaydet("09-ariza-sihirbazi.png");
  await s.kapat();

  for (const [ad, dil, tema, yol] of [
    ["10-arapca-rtl.png", "ar", "gunduz", "/"],
    ["11-gece-temasi.png", "tr", "gece", USTA],
  ] as const) {
    s = await ac();
    await hazirla(s, dil, tema);
    await s.git(yol);
    await s.kaydet(ad);
    await s.kapat();
  }

  s = await ac(1366, 820, 1);
  await hazirla(s);
  await s.git("/");
  await s.kaydet("12-masaustu.png");
  await s.kapat();
}

// ---------------------------------------------------------------- kullanım videosu

async function video() {
  console.log("Kullanım videosu (~50 sn)");
  const s = await ac(390, 844, 1);
  await s.git("/", 1500);
  const durdur = s.kayit();

  await bekle(1600); // karşılama: tanıtım, dil, semt
  for (let i = 0; i < 4; i++) await s.dokun("İleri").then(() => bekle(1100));
  await s.dokun("Devam");
  await bekle(900);
  await s.dokun("Kadıköy", "[role=dialog] button");
  await bekle(700);
  await s.dokun("Başla");
  await bekle(1500);

  await s.kaydir(620, 16, 70); // ustalar
  await bekle(800);
  await s.kaydir(0, 10, 50);
  await s.haritaGoster();
  await bekle(1800);
  await s.dokunSecici('button[aria-label="Liste"]');

  await s.git(USTA, 1400); // usta detayı → çağır
  await s.kaydir(380, 10, 60);
  await s.dokun(SORUN, "label");
  await bekle(900);
  await s.dokun("Ustayı çağır");
  await bekle(1600);

  await s.yaz('input[type="tel"]', PROFIL.telefon); // çağrı özeti → onay
  await s.dokunSecici("label.onay");
  await bekle(800);
  await s.kaydir(0, 8, 50);
  await bekle(900);
  await s.dokun("Çağrıyı onayla");
  await bekle(2800);

  await s.kaydir(300, 10, 60); // canlı takip
  await bekle(1200);
  await s.kaydir(0, 8, 50);
  await bekle(800);

  await s.git("/profil", 1500);
  await s.kaydir(700, 14, 60);
  await bekle(900);
  await s.git("/izinler", 1800);
  await s.kaydir(420, 10, 60);
  await bekle(1200);

  await s.git("/profil", 1200); // gece teması ve Arapça
  await s.dokun("Gece", "button");
  await bekle(1200);
  await s.dokun("العربية", "button");
  await bekle(800);
  await s.git("/", 1600);
  await bekle(1800);

  const kareler = await durdur();
  await s.kapat();

  // Sabit 8 kare/sn'ye örnekle (her an için o ana kadarki son kare), 360 px genişliğe küçült
  const FPS = 8;
  const adim = 1000 / FPS;
  const secilen: Buffer[] = [];
  for (let t = kareler[0][0], j = 0; t <= kareler.at(-1)![0]; t += adim) {
    while (j + 1 < kareler.length && kareler[j + 1][0] <= t) j++;
    secilen.push(kareler[j][1]);
  }
  const kucuk = await Promise.all(secilen.map((k) => sharp(k).resize(360).png().toBuffer()));
  const gecikme = kucuk.map(() => adim);
  gecikme[gecikme.length - 1] = 2500;
  await sharp(kucuk, { join: { animated: true } })
    .gif({ delay: gecikme, loop: 0, effort: 10, colours: 128, dither: 0.6, interFrameMaxError: 6 })
    .toFile(join(CIKTI, "ustam-kullanim.gif"));
  await sharp(kucuk, { join: { animated: true } })
    .webp({ delay: gecikme, loop: 0, quality: 72, effort: 6 })
    .toFile(join(CIKTI, "ustam-kullanim.webp"));
  console.log(`  ✓ ustam-kullanim.gif / .webp (${kucuk.length} kare)`);
}

// Astro bazen yalnız 127.0.0.1 (IPv4) dinler; "localhost" önce ::1 denenebilir — ikisine de bakılır (telefon.ts gibi)
const acik = await Promise.any(
  [UYGULAMA, UYGULAMA.replace("localhost", "127.0.0.1")].map(async (a) => (await fetch(a, { signal: AbortSignal.timeout(2000) }), a)),
).catch(() => null);
if (!acik) {
  console.error(`Uygulama ${UYGULAMA} adresinde çalışmıyor; önce: bun run dev`);
  process.exit(1);
}
UYGULAMA = acik;
mkdirSync(CIKTI, { recursive: true });
await gorseller();
if (!process.argv.includes("--gorsel")) await video();
