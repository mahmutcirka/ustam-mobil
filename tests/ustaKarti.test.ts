// Usta → genel kart girdisi dönüşümü (Görev 12)
import { describe, expect, test } from "bun:test";
import { ustalar } from "../src/lib/data";
import { ustaKartGirdisi } from "../src/lib/ustaKarti";
import { sozlukler } from "../src/lib/ceviriler";
import type { UstaKartBaglami } from "../src/lib/types";

const t: UstaKartBaglami["t"] = (a, d = {}) =>
  Object.entries(d).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), (sozlukler.tr as Record<string, string>)[a]);

const baglam = (ek: Partial<UstaKartBaglami> = {}): UstaKartBaglami => ({
  km: 2.4,
  durum: { tur: "musait" },
  puan: { deger: 4.8, sayi: 129 },
  dil: "tr",
  t,
  dilAdi: (d) => d,
  ...ek,
});

describe("usta kartı girdisi", () => {
  const u = ustalar.find((x) => x.ad === "Ahmet Halil")!;

  test("yalnız genel kart alanları üretir; adres usta kimliğini içerir", () => {
    const g = ustaKartGirdisi(u, baglam());
    expect(g.baslik).toBe("Ahmet Halil");
    expect(g.href).toBe(`/usta/${u.id}`);
    expect(g.gorsel).toEqual({ harfler: "AH", alt: "Ahmet Halil", ikon: "damla" });
    expect(Object.keys(g)).not.toContain("usta");
  });

  test("aranan sorun detaya taşınır", () => {
    expect(ustaKartGirdisi(u, baglam({ sorun: "su-sizintisi" })).href).toBe(`/usta/${u.id}?sorun=su-sizintisi`);
  });

  test("durum etiket türüne çevrilir; müsait değilse görsel soluk", () => {
    expect(ustaKartGirdisi(u, baglam()).etiketTuru).toBe("basari");
    const mesgul = ustaKartGirdisi(u, baglam({ durum: { tur: "mesgul", dk: 20 } }));
    expect(mesgul.etiketTuru).toBe("uyari");
    expect(mesgul.etiket).toContain("20");
    expect(mesgul.soluk).toBe(true);
    expect(ustaKartGirdisi(u, baglam({ durum: { tur: "kapali", acilis: "09:00" } })).etiketTuru).toBe("bilgi");
  });

  test("kullanıcının dili (TR dışı) konuşulan diller arasında vurgulanır", () => {
    const ar = ustaKartGirdisi(u, baglam({ dil: "ar" })).bilgiler!.find((b) => b.metin === "AR")!;
    expect(ar.vurgulu).toBe(true);
    const tr = ustaKartGirdisi(u, baglam()).bilgiler!.find((b) => b.metin === "TR")!;
    expect(tr.vurgulu).toBe(false);
  });
});
