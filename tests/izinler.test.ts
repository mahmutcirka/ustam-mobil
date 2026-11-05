// İzinler: konumdan en yakın semt, iş bildirimi seçimi (tekrar, bayatlık, kategori) ve tarayıcı yedek yolu
import { afterEach, describe, expect, test } from "bun:test";
import { enYakinSemt, HIZMET_YARICAPI_KM, kusUcusuKm } from "../src/lib/konum";
import { bekleyenBildirimler, isOlaylari, RANDEVU_HATIRLATMA_DK, TAZELIK_DK } from "../src/lib/isBildirimleri";
import { bildirimGoster, destekleniyorMu, izinDurumu, konumOku, NativeHata } from "../src/lib/native";
import { semtler } from "../src/lib/data";
import type { BildirimTercihleri, IsEmri } from "../src/lib/types";

describe("konumdan en yakın semt", () => {
  test("semt merkezi kendi semtine eşlenir", () => {
    for (const [semt, k] of Object.entries(semtler)) expect(enYakinSemt(k)?.semt).toBe(semt as keyof typeof semtler);
  });

  test("gerçek noktalar: Moda → Kadıköy, Beşiktaş iskelesi → Beşiktaş", () => {
    expect(enYakinSemt({ enlem: 40.9807, boylam: 29.0257 })?.semt).toBe("Kadıköy");
    expect(enYakinSemt({ enlem: 41.0422, boylam: 29.0067 })?.semt).toBe("Beşiktaş");
  });

  test("hizmet bölgesi dışı ve geçersiz koordinat null", () => {
    expect(enYakinSemt({ enlem: 39.9334, boylam: 32.8597 })).toBeNull(); // Ankara
    expect(enYakinSemt({ enlem: Number.NaN, boylam: 29 })).toBeNull();
    expect(enYakinSemt({ enlem: 91, boylam: 29 })).toBeNull();
  });

  test("haversine: İstanbul–Ankara ≈ 350 km, yarıçap sınırı km cinsinden", () => {
    const km = kusUcusuKm({ enlem: 41.0082, boylam: 28.9784 }, { enlem: 39.9334, boylam: 32.8597 });
    expect(km).toBeGreaterThan(340);
    expect(km).toBeLessThan(360);
    expect(HIZMET_YARICAPI_KM).toBeLessThan(30);
  });
});

const T0 = new Date("2026-11-05T10:00:00").getTime();
const dk = (n: number) => n * 60_000;
const acik: BildirimTercihleri = { "is-durumu": true, randevu: true };

const isEmri = (ek: Partial<IsEmri> = {}): IsEmri =>
  ({
    kod: "UST-ELK-0511-K7QZ",
    ustaAd: "Mehmet Usta",
    aciliyet: "hemen",
    durum: "aktif",
    olusturma: new Date(T0).toISOString(),
    zaman: new Date(T0 + dk(20)).toISOString(),
    varisDk: 20,
    ...ek,
  }) as IsEmri;

const an = (ms: number) => new Date(T0 + ms);

describe("iş bildirimleri", () => {
  test("acil iş: onay → yolda → kapıda sırasıyla", () => {
    expect(isOlaylari(isEmri()).map((o) => o.olay)).toEqual(["onaylandi", "yolda", "kapida"]);
  });

  test("olay olmadan bildirim yok; onaydan sonra bir kez", () => {
    expect(bekleyenBildirimler([isEmri()], an(10_000), new Set(), acik).gonderilecek).toEqual([]);
    const ilk = bekleyenBildirimler([isEmri()], an(25_000), new Set(), acik);
    expect(ilk.gonderilecek.map((o) => o.olay)).toEqual(["onaylandi"]);
    // gönderilenler kaydedildikten sonra aynı olay tekrar gelmez
    const ikinci = bekleyenBildirimler([isEmri()], an(30_000), new Set(ilk.gorulen), acik);
    expect(ikinci.gonderilecek).toEqual([]);
    expect(ikinci.gorulen).toEqual([]);
  });

  test("birden çok aşama birikmişse yalnız en sonuncusu bildirilir, eskiler görüldü sayılır", () => {
    const s = bekleyenBildirimler([isEmri()], an(dk(21)), new Set(), acik);
    expect(s.gonderilecek.map((o) => o.olay)).toEqual(["kapida"]);
    expect(s.gorulen).toHaveLength(3);
  });

  test("bayat olay (uygulama uzun süre kapalı) bildirilmez ama görüldü sayılır", () => {
    const s = bekleyenBildirimler([isEmri()], an(dk(20 + TAZELIK_DK + 1)), new Set(), acik);
    expect(s.gonderilecek).toEqual([]);
    expect(s.gorulen).toHaveLength(3);
  });

  test("kodu kapıda doğrulayan kullanıcıya 'kapıda' bildirilmez; aktif olmayan iş izlenmez", () => {
    expect(bekleyenBildirimler([isEmri({ dogrulandi: true })], an(dk(21)), new Set(), acik).gonderilecek).toEqual([]);
    expect(bekleyenBildirimler([isEmri({ durum: "iptal" })], an(dk(21)), new Set(), acik).gorulen).toEqual([]);
  });

  test("kategorisi kapalı olay gönderilmez", () => {
    const s = bekleyenBildirimler([isEmri()], an(25_000), new Set(), { ...acik, "is-durumu": false });
    expect(s.gonderilecek).toEqual([]);
    expect(s.gorulen).toHaveLength(1);
  });

  test("randevu: onay ve bir saat önce hatırlatma 'randevu' kategorisinde", () => {
    const randevu = isEmri({ aciliyet: "randevu", zaman: new Date(T0 + dk(24 * 60)).toISOString() });
    const olaylar = isOlaylari(randevu);
    expect(olaylar.map((o) => o.olay)).toEqual(["randevu-onaylandi", "randevu-yaklasiyor", "yolda", "kapida"]);
    expect(olaylar.slice(0, 2).every((o) => o.kategori === "randevu")).toBe(true);
    const hatirlatma = an(dk(24 * 60 - RANDEVU_HATIRLATMA_DK + 1));
    expect(bekleyenBildirimler([randevu], hatirlatma, new Set(), acik).gonderilecek.map((o) => o.olay)).toEqual(["randevu-yaklasiyor"]);
    expect(bekleyenBildirimler([randevu], hatirlatma, new Set(), { ...acik, randevu: false }).gonderilecek).toEqual([]);
  });

  test("anahtar iş koduna ve olaya bağlı (iki iş birbirini engellemez)", () => {
    const iki = [isEmri(), isEmri({ kod: "UST-TES-0511-ABCD" })];
    const s = bekleyenBildirimler(iki, an(25_000), new Set(), acik);
    expect(s.gonderilecek.map((o) => o.anahtar)).toEqual(["UST-ELK-0511-K7QZ:onaylandi", "UST-TES-0511-ABCD:onaylandi"]);
  });
});

describe("izinler — tarayıcı yedek yolu (Rust yokken)", () => {
  const g = globalThis as Record<string, unknown>;
  afterEach(() => {
    delete g.Notification;
  });

  test("tarayıcı API'si yoksa durum 'desteklenmiyor'; tahmin edilmez", async () => {
    const liste = await izinDurumu();
    expect(liste.map((i) => i.id)).toEqual(["bildirim", "konum"]);
    expect(liste.every((i) => i.durum === "desteklenmiyor" && !i.istenebilir)).toBe(true);
  });

  test("Notification.permission birebir eşlenir", async () => {
    for (const [izin, durum, istenebilir] of [
      ["default", "sorulmadi", true],
      ["granted", "verildi", false],
      ["denied", "reddedildi", false],
    ] as const) {
      g.Notification = { permission: izin };
      const b = (await izinDurumu()).find((i) => i.id === "bildirim");
      expect(b).toEqual({ id: "bildirim", durum, istenebilir });
    }
  });

  test("izin yokken bildirim gösterilmez, diyalog açılmaz → 'izin-yok'", async () => {
    let soruldu = false;
    g.Notification = { permission: "default", requestPermission: () => (soruldu = true) };
    const h = await bildirimGoster("Ustam", "deneme").catch((e) => e);
    expect((h as NativeHata).hata).toEqual({ tur: "izin-yok" });
    expect(soruldu).toBe(false);
  });

  test("konum API'si olmayan ortamda tipli hata, çökme yok", async () => {
    const h = await konumOku().catch((e) => e);
    expect(h).toBeInstanceOf(NativeHata);
  });

  test("masaüstünde konum yok (düğme gizlenir), telefonda ve tarayıcıda var; Linux'ta ayar kısayolu yok", () => {
    for (const p of ["macos", "windows", "linux"] as const) expect(destekleniyorMu("konum", p)).toBe(false);
    for (const p of ["android", "ios", "web"] as const) expect(destekleniyorMu("konum", p)).toBe(true);
    expect(destekleniyorMu("sistem-ayarlari", "linux")).toBe(false);
    expect(destekleniyorMu("sistem-ayarlari", "android")).toBe(true);
  });
});
