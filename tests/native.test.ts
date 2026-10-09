// native.ts — platform tespiti, özellik × platform tablosu ve tarayıcıdaki yedek yol (Görev 15)
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  DESTEK,
  destekleniyorMu,
  fiyatHesapla,
  hataAnahtari,
  isEmriKoduDogrula,
  isEmriKoduUret,
  NativeHata,
  platform,
  veriKayitYolu,
} from "../src/lib/native";
import { sozlukler } from "../src/lib/ceviriler";
import { OZELLIKLER, PLATFORMLAR, type KomutHatasi } from "../src/lib/types";

const UA = {
  android: "Mozilla/5.0 (Linux; Android 14; 23021RAAEG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0 Mobile Safari/537.36",
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)",
  windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0",
  linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
};

describe("platform", () => {
  test.each(Object.entries(UA))("%s WebView kimliği tanınır", (beklenen, kimlik) => {
    expect(platform(kimlik, true)).toBe(beklenen as keyof typeof UA);
  });

  test("Tauri dışında her zaman web", () => {
    expect(platform(UA.android, false)).toBe("web");
  });

  test("masaüstünde acil arama yok (düğme gizlenir), telefonda farklı yolla var", () => {
    for (const p of ["macos", "windows", "linux"] as const) expect(destekleniyorMu("acil-arama", p)).toBe(false);
    for (const p of ["android", "ios", "web"] as const) expect(destekleniyorMu("acil-arama", p)).toBe(true);
  });

  test("veri dışa aktarma yolu platforma göre", () => {
    expect(veriKayitYolu("web")).toBe("indirme");
    expect(veriKayitYolu("windows")).toBe("dosya");
    expect(veriKayitYolu("android")).toBe("pano");
  });

  test("tablo her özellik ve platformu kapsar; belgedeki tabloyla aynı", () => {
    const belge = readFileSync("docs/platform-destegi.md", "utf8");
    const simge = { destekleniyor: "✅", "farkli-yolla": "🔁", yok: "—" } as const;
    for (const o of OZELLIKLER) {
      const satir = belge.split("\n").find((s) => s.startsWith(`| \`${o}\``));
      expect(satir, `belgede satır yok: ${o}`).toBeDefined();
      const hucreler = satir!.split("|").slice(2, 2 + PLATFORMLAR.length).map((h) => h.trim());
      PLATFORMLAR.forEach((p, i) => expect(hucreler[i], `${o} / ${p}`).toBe(simge[DESTEK[o][p]]));
    }
  });
});

describe("tarayıcıdaki yedek yol (Rust yokken)", () => {
  test("kod üretimi tipli sonuç döner ve kendi doğrulamasından geçer", async () => {
    const k = await isEmriKoduUret("kombi", "2026-10-12T14:30");
    expect(k.kategoriKodu).toBe("KMB");
    expect(k.tarih).toBe("1210");
    expect(await isEmriKoduDogrula(k.kod)).toBe("gecerli");
  });

  test("geçersiz girdide çökmez, tipli hata verir", async () => {
    const girdi = { cikisUcreti: -5, aciliyet: "bugun" as const, zaman: "2026-10-07T14:00", iscilikMin: 0, iscilikMax: 0 };
    const hata = await fiyatHesapla(girdi).catch((e) => e);
    expect(hata).toBeInstanceOf(NativeHata);
    expect((hata as NativeHata).hata).toEqual({ tur: "gecersiz-tutar", ayrinti: "cikisUcreti" });
    const kodHatasi = await isEmriKoduUret("boyaci" as never, "2026-10-12T14:30").catch((e) => e);
    expect((kodHatasi as NativeHata).hata.tur).toBe("bilinmeyen-kategori");
    expect(await isEmriKoduDogrula("çöp")).toBe("bicim-hatali");
  });

  test("her hata türünün 4 dilde metni var", () => {
    const turler: KomutHatasi["tur"][] = [
      "bilinmeyen-kategori",
      "gecersiz-tarih",
      "bilinmeyen-aciliyet",
      "gecersiz-tutar",
      "aralik-ters",
      "gecersiz-icerik",
      "dosya-yazilamadi",
      "platform-desteklemiyor",
      "ic-hata",
    ];
    for (const tur of turler) {
      const anahtar = hataAnahtari({ tur } as KomutHatasi);
      for (const s of Object.values(sozlukler)) expect((s as Record<string, string>)[anahtar]).toBeTruthy();
    }
  });
});
