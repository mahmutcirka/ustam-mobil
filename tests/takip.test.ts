// Canlı iş takibinin aşama geçişleri
import { describe, expect, test } from "bun:test";
import { ONAY_SN, YOLA_CIKIS_EN_ERKEN_SN, takip } from "../src/lib/takip";

const olusturma = new Date(2026, 9, 7, 20, 0, 0);
const sonra = (sn: number) => new Date(olusturma.getTime() + sn * 1000);

// "Hemen" çağrısı: 15 dk yol, varış 20:15
const hemen = {
  durum: "aktif" as const,
  olusturma: olusturma.toISOString(),
  zaman: "2026-10-07T20:15",
  varisDk: 15,
  dogrulandi: false,
};

describe("aşamalar", () => {
  test("talep alındı → onaylandı → yolda → kapıda", () => {
    expect(takip(hemen, sonra(5)).asama).toBe("alindi");
    expect(takip(hemen, sonra(ONAY_SN + 1)).asama).toBe("onaylandi");
    expect(takip(hemen, sonra(YOLA_CIKIS_EN_ERKEN_SN + 1)).asama).toBe("yolda");
    expect(takip(hemen, sonra(15 * 60)).asama).toBe("kapida");
  });

  test("kalan süre ve ilerleme yolda geçen zamanla değişir", () => {
    const yolda = takip(hemen, sonra(7 * 60));
    expect(yolda.kalanDk).toBe(8);
    expect(yolda.ilerleme).toBeGreaterThan(0.4);
    expect(yolda.ilerleme).toBeLessThan(0.5);
  });

  test("kod doğrulanınca varış beklenmeden kapıda sayılır", () => {
    expect(takip({ ...hemen, dogrulandi: true }, sonra(60)).asama).toBe("kapida");
  });

  test("tamamlanan iş her zaman tamamlandı", () => {
    expect(takip({ ...hemen, durum: "tamamlandi" }, sonra(5)).asama).toBe("tamamlandi");
  });

  test("randevulu iş, yola çıkış saatine kadar onaylandı aşamasında bekler", () => {
    const randevu = { ...hemen, zaman: "2026-10-08T14:00", varisDk: 20 };
    expect(takip(randevu, sonra(3600)).asama).toBe("onaylandi");
    expect(takip(randevu, new Date(2026, 9, 8, 13, 45)).asama).toBe("yolda");
  });
});
