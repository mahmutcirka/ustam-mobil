// Akıllı arama ve "Önerilen" sıralama kuralı
import { describe, expect, test } from "bun:test";
import { normalle, sorunAra, ustaEslesir } from "../src/lib/arama";
import { oneriPuani } from "../src/lib/eslestirme";
import { ustalar } from "../src/lib/data";

const usta = (ad: string) => ustalar.find((u) => u.ad === ad)!;

describe("arama", () => {
  test("Türkçe karakter ve büyük harf farkı yok sayılır", () => {
    expect(normalle("KADIKÖY")).toBe(normalle("kadikoy"));
    expect(normalle("Sıcak  Su")).toBe("sicak su");
  });

  test("sorun adıyla arama ilgili sorunu ve kategoriyi bulur", () => {
    expect(sorunAra("musluk")).toEqual([{ sorun: "musluk-ariza", kategori: "tesisat" }]);
    expect(sorunAra("sicak su").map((s) => s.sorun)).toContain("sicak-su-yok");
    expect(sorunAra("boiler").map((s) => s.kategori)).toContain("kombi");
  });

  test("Arapça ve Farsça sorun adlarıyla da bulunur", () => {
    expect(sorunAra("تسرّب").map((s) => s.sorun)).toContain("su-sizintisi");
    expect(sorunAra("پکیج").map((s) => s.kategori)).toContain("kombi");
  });

  test("usta; adı, semti ya da çözdüğü sorunla eşleşir", () => {
    expect(ustaEslesir(usta("Hasan Yıldız"), "hasan")).toBe(true);
    expect(ustaEslesir(usta("Hasan Yıldız"), "kadikoy")).toBe(true);
    expect(ustaEslesir(usta("Hasan Yıldız"), "musluk")).toBe(true);
    expect(ustaEslesir(usta("Hasan Yıldız"), "kilit")).toBe(false);
  });

  test("tek harflik sorgu öneri üretmez", () => {
    expect(sorunAra("s")).toEqual([]);
  });
});

describe("önerilen sıralama", () => {
  const baglam = { semt: "Kadıköy" as const, dil: "tr" as const, simdi: new Date(2026, 9, 7, 13, 0) };

  test("müsait ve yakın usta, meşgul ustadan önce gelir", () => {
    const musait = oneriPuani(usta("Hasan Yıldız"), baglam);
    const mesgul = oneriPuani(usta("Murat Öztürk"), baglam);
    expect(musait.puan).toBeGreaterThan(mesgul.puan);
    expect(musait.nedenler[0]).toBe("musait");
    expect(mesgul.nedenler).not.toContain("musait");
  });

  test("kullanıcının dilini konuşmak yalnızca TR dışı dillerde katkı verir", () => {
    const ahmet = usta("Ahmet Halil");
    expect(oneriPuani(ahmet, { ...baglam, dil: "ar" }).nedenler).toContain("dil");
    expect(oneriPuani(ahmet, baglam).nedenler).not.toContain("dil");
  });

  test("puan 0 ile 100 arasında kalır", () => {
    for (const u of ustalar) {
      const { puan } = oneriPuani(u, baglam);
      expect(puan).toBeGreaterThanOrEqual(0);
      expect(puan).toBeLessThanOrEqual(100);
    }
  });
});
