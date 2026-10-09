// Rust ile aynı kuralların TypeScript karşılığını ortak test vektörleriyle doğrular
import { describe, expect, test } from "bun:test";
import vektorler from "../src-tauri/test-vektorleri.json";
import {
  ALFABE,
  fiyatGirdisiDenetle,
  fiyatHesapla,
  haftaninGunu,
  kodDurumu,
  kodUret,
  kontrolKarakteri,
  KuralHatasi,
  zamanCoz,
} from "../src/lib/kurallar";
import type { FiyatGirdisi, Kategori, KomutHatasi } from "../src/lib/types";
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
    expect(kodUret("elektrik", "2026-10-12T14:30", "K7Q")).toBe("UST-ELK-1210-K7QZ");
  });

  test("rastgele kısımdaki her tek karakter hatası yakalanır (kapsamlı)", () => {
    for (let i = 0; i < 40; i++) {
      const kod = kodUret("kombi", "2026-10-12T14:30");
      for (let konum = kod.length - 4; konum < kod.length; konum++) {
        for (const yeni of ALFABE) {
          if (kod[konum] === yeni) continue;
          const bozuk = kod.slice(0, konum) + yeni + kod.slice(konum + 1);
          expect(kodDurumu(bozuk)).not.toBe("gecerli");
        }
      }
    }
  });

  test("geçersiz tarih hata verir", () => {
    expect(() => kodUret("kombi", "2026-13-40T10:00")).toThrow();
  });
});

describe("tipli hatalar (Görev 15) — Rust ile ortak örnekler", () => {
  test.each(vektorler.fiyatHatalari.map((v) => [v.aciklama, v] as const))("%s", (_a, v) => {
    const girdi = v.girdi as FiyatGirdisi;
    expect(fiyatGirdisiDenetle(girdi)).toEqual(v.hata as KomutHatasi);
    try {
      fiyatHesapla(girdi);
      throw new Error("hata beklenirdi");
    } catch (e) {
      expect(e).toBeInstanceOf(KuralHatasi);
      expect((e as KuralHatasi).hata).toEqual(v.hata as KomutHatasi);
    }
  });

  test.each(vektorler.kodHatalari.map((v) => [v.kategori, v] as const))("kod üretimi: %s", (_k, v) => {
    expect(() => kodUret(v.kategori as Kategori, v.zaman)).toThrow(KuralHatasi);
    try {
      kodUret(v.kategori as Kategori, v.zaman);
    } catch (e) {
      expect((e as KuralHatasi).hata).toEqual(v.hata as KomutHatasi);
    }
  });

  test("geçerli girdide denetim sorun bulmaz", () => {
    for (const v of vektorler.fiyat) expect(fiyatGirdisiDenetle(v.girdi as FiyatGirdisi)).toBeNull();
  });
});
