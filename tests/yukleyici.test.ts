// Liste yükleyicisi ve geliştirme sırasındaki ?durum= anahtarı (Görev 13)
import { describe, expect, test } from "bun:test";
import { listeDurumu, listeYukle, ustalariYukle, zorlananDurum } from "../src/lib/yukleyici";
import { ustalar } from "../src/lib/data";

describe("liste yükleyici", () => {
  test("normalde örnek veriyi döndürür", async () => {
    expect(await ustalariYukle()).toEqual(ustalar);
    expect(listeDurumu(await ustalariYukle())).toBe("dolu");
  });

  test("?durum=bos boş liste, ?durum=hata hata verir", async () => {
    expect(await listeYukle(() => ustalar, "bos")).toEqual([]);
    expect(listeDurumu([])).toBe("bos");
    await expect(listeYukle(() => ustalar, "hata")).rejects.toThrow();
  });

  test("?durum=yukleniyor hiç bitmez (iskelet ekranda kalır)", async () => {
    const sonuc = await Promise.race([listeYukle(() => ustalar, "yukleniyor"), new Promise((c) => setTimeout(() => c("bekliyor"), 20))]);
    expect(sonuc).toBe("bekliyor");
  });

  test("kaynağın kendi hatası ekrana ulaşır", async () => {
    await expect(
      listeYukle(() => {
        throw new Error("bozuk kayıt");
      }, null),
    ).rejects.toThrow("bozuk kayıt");
  });

  test("?durum= yalnız geliştirmede ve geçerli değerlerde etkili", () => {
    expect(zorlananDurum("?durum=hata", true)).toBe("hata");
    expect(zorlananDurum("?durum=bos&q=x", true)).toBe("bos");
    expect(zorlananDurum("?durum=hata", false)).toBeNull();
    expect(zorlananDurum("?durum=dolu", true)).toBeNull();
    expect(zorlananDurum("?durum=sacma", true)).toBeNull();
    expect(zorlananDurum("", true)).toBeNull();
  });
});
