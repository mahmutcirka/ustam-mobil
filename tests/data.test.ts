// Örnek verinin bütünlüğü ve veri yardımcıları
import { describe, expect, test } from "bun:test";
import {
  aralikYaz,
  kategoriSorunlari,
  mesafeKm,
  puanDagilimi,
  semtler,
  sorunBilgisi,
  ustaDurumu,
  ustalar,
  varisDk,
} from "../src/lib/data";
import { sozlukler } from "../src/lib/ceviriler";

const tr = sozlukler.tr as Record<string, string>;

describe("örnek veri", () => {
  test("usta kimlikleri benzersiz", () => {
    expect(new Set(ustalar.map((u) => u.id)).size).toBe(ustalar.length);
  });

  test("her sorunun fiyat bilgisi, çevirisi ve güvenlik ipucu var", () => {
    for (const sorun of Object.values(kategoriSorunlari).flat()) {
      expect(sorunBilgisi[sorun], sorun).toBeDefined();
      expect(tr[`sorun.${sorun}`], sorun).toBeDefined();
      expect(tr[`ipucu.${sorun}`], sorun).toBeDefined();
      const [min, max] = sorunBilgisi[sorun].iscilik;
      expect(min).toBeLessThanOrEqual(max);
    }
  });

  test.each(ustalar.map((u) => [u.ad, u] as const))("%s: konum haritada, semt ve saatler geçerli", (_ad, u) => {
    expect(u.konum.x).toBeGreaterThanOrEqual(0);
    expect(u.konum.x).toBeLessThanOrEqual(100);
    expect(u.konum.y).toBeGreaterThanOrEqual(0);
    expect(u.konum.y).toBeLessThanOrEqual(110);
    expect(semtler[u.semt]).toBeDefined();
    expect(u.diller).toContain("tr");
    if (u.calisma !== "7-24") expect(u.calisma[0] < u.calisma[1]).toBe(true);
    for (const y of u.yorumlar) expect(y.puan).toBeGreaterThanOrEqual(1);
  });

  test("dört dilin her birini konuşan en az bir usta var", () => {
    for (const d of ["tr", "en", "ar", "fa"] as const) expect(ustalar.some((u) => u.diller.includes(d))).toBe(true);
  });
});

describe("yardımcılar", () => {
  const hasan = ustalar.find((u) => u.ad === "Hasan Yıldız")!;

  test("aynı semtteki usta yakın, karşı yakadaki uzak", () => {
    expect(mesafeKm(hasan, "Kadıköy")).toBeLessThan(1.5);
    expect(mesafeKm(hasan, "Bakırköy")).toBeGreaterThan(10);
  });

  test("varış süresi mesafeyle artar", () => {
    expect(varisDk(1)).toBeLessThan(varisDk(10));
  });

  test("çalışma saatleri dışında usta kapalı görünür", () => {
    const gece = new Date(2026, 9, 7, 23, 30);
    const ogle = new Date(2026, 9, 7, 13, 0);
    expect(ustaDurumu(hasan, ogle).tur).toBe("musait");
    expect(ustaDurumu(hasan, gece)).toEqual({ tur: "kapali", acilis: "08:00" });
    const yedi24 = ustalar.find((u) => u.calisma === "7-24" && u.musait)!;
    expect(ustaDurumu(yedi24, gece).tur).toBe("musait");
    const mesgul = ustalar.find((u) => !u.musait)!;
    expect(ustaDurumu(mesgul, ogle).tur).toBe("mesgul");
  });

  test("puan dağılımı toplam yorum sayısını korur", () => {
    for (const u of ustalar) expect(puanDagilimi(u.puan, u.yorumSayisi).reduce((a, b) => a + b, 0)).toBe(u.yorumSayisi);
  });

  test("tek değerli aralık tek fiyat olarak yazılır", () => {
    expect(aralikYaz(450, 450, "en")).not.toContain("–");
    expect(aralikYaz(450, 850, "en")).toContain("–");
  });
});
