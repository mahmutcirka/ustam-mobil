// Rust ile aynı kuralların TypeScript karşılığını ortak test vektörleriyle doğrular
import { describe, expect, test } from "bun:test";
import vektorler from "../src-tauri/test-vektorleri.json";
import { fiyatHesapla, haftaninGunu, kodDurumu, kodUret, kontrolKarakteri, zamanCoz, type FiyatGirdisi } from "../src/lib/kurallar";
import { kategoriler } from "../src/lib/data";

describe("ortak test vektörleri (Rust ile aynı)", () => {
  test.each(vektorler.kontrolKarakteri)("kontrol karakteri $govde → $beklenen", ({ govde, beklenen }) => {
    expect(kontrolKarakteri(govde)).toBe(beklenen);
  });

  test.each(vektorler.kodDurumu)("kod '$kod' → $durum", ({ kod, durum }) => {
    expect(kodDurumu(kod)).toBe(durum as ReturnType<typeof kodDurumu>);
  });

  test.each(vektorler.haftaninGunu)("$tarih → gün $gun", ({ tarih, gun }) => {
    const z = zamanCoz(tarih)!;
    expect(haftaninGunu(z.yil, z.ay, z.gun)).toBe(gun);
  });

  test.each(vektorler.fiyat)("fiyat: $aciklama", ({ girdi, beklenen }) => {
    expect(fiyatHesapla(girdi as FiyatGirdisi)).toEqual(beklenen);
  });
});

describe("kod üretimi", () => {
  test("her kategoride üretilen kod kendi doğrulamasından geçer", () => {
    for (const k of kategoriler) {
      for (let i = 0; i < 50; i++) expect(kodDurumu(kodUret(k, "2026-10-12T14:30"))).toBe("gecerli");
    }
  });

  test("tarih gün+ay olarak koda yazılır", () => {
    expect(kodUret("elektrik", "2026-10-12T14:30", "K7Q")).toBe("UST-ELK-1210-K7QM");
  });

  test("geçersiz tarih hata verir", () => {
    expect(() => kodUret("kombi", "2026-13-40T10:00")).toThrow();
  });
});
