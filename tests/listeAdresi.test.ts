// Liste seçiminin adreste tutulması (Görev 14): detaydan dönüşte arama ve süzgeç korunur
import { describe, expect, test } from "bun:test";
import { BOS_FILTRE, VARSAYILAN_SECIM, secimOku, secimYaz } from "../src/lib/listeAdresi";
import type { ListeSecimi } from "../src/lib/types";

describe("liste adresi", () => {
  test("varsayılan seçim adrese bir şey yazmaz", () => {
    expect(secimYaz(VARSAYILAN_SECIM)).toBe("");
    expect(secimOku("")).toEqual(VARSAYILAN_SECIM);
  });

  test("yazılan seçim aynen geri okunur", () => {
    const s: ListeSecimi = {
      arama: "hasan",
      kategori: "elektrik",
      sorun: null,
      siralama: "yakin",
      filtre: { ...BOS_FILTRE, musait: true, puan: 4.5, dil: "ar" },
    };
    const adres = secimYaz(s);
    expect(adres).toBe("?q=hasan&kat=elektrik&sirala=yakin&musait=1&puan=4.5&dil=ar");
    expect(secimOku(adres)).toEqual(s);
  });

  test("sorun seçiliyse kategori sorundan gelir", () => {
    const s = secimOku("?sorun=sicak-su-yok&kat=tesisat");
    expect(s.sorun).toEqual({ sorun: "sicak-su-yok", kategori: "kombi" });
    expect(s.kategori).toBe("kombi");
    expect(secimYaz(s)).toBe("?sorun=sicak-su-yok");
  });

  test("tanınmayan değerler varsayılana düşer", () => {
    const s = secimOku("?kat=uzay&sirala=rastgele&dil=xx&mesafe=-3&sorun=yok-boyle");
    expect(s.kategori).toBe("tumu");
    expect(s.siralama).toBe("onerilen");
    expect(s.filtre.dil).toBe("");
    expect(s.filtre.mesafe).toBe(0);
    expect(s.sorun).toBeNull();
  });

  test("başka anahtarlara (ör. geliştirmedeki ?durum=) dokunmaz", () => {
    expect(secimYaz({ ...VARSAYILAN_SECIM, arama: "kombi" }, "?durum=bos&q=eski")).toBe("?durum=bos&q=kombi");
  });
});
