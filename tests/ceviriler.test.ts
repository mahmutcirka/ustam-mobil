// 4 dilli sözlüğün tutarlılığı: aynı anahtarlar, boş metin yok, {yer tutucular} her dilde aynı
import { describe, expect, test } from "bun:test";
import { sozlukler } from "../src/lib/ceviriler";

const diller: ("tr" | "en" | "ar" | "fa")[] = ["tr", "en", "ar", "fa"];
const anahtarlar = Object.keys(sozlukler.tr) as (keyof typeof sozlukler.tr)[];
const yerTutucular = (metin: string) => [...metin.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

// Arap alfabesi (Arapça ve Farsça) — Unicode betik özelliğiyle
const ARAP_ALFABESI = /\p{Script=Arabic}/u;

describe("çeviri sözlüğü", () => {
  test.each(diller)("%s: Türkçe ile aynı anahtar kümesi", (d) => {
    expect(Object.keys(sozlukler[d]).sort()).toEqual([...anahtarlar].sort());
  });

  test.each(diller)("%s: boş metin yok", (d) => {
    const bos = anahtarlar.filter((k) => !sozlukler[d][k]?.trim());
    expect(bos).toEqual([]);
  });

  test.each(diller.slice(1))("%s: yer tutucular Türkçe ile aynı", (d) => {
    const farkli = anahtarlar.filter((k) => yerTutucular(sozlukler[d][k]).join() !== yerTutucular(sozlukler.tr[k]).join());
    expect(farkli).toEqual([]);
  });

  test.each(diller.slice(2))("%s: metinler gerçekten sağdan sola yazı içeriyor", (d) => {
    // Marka adları ve teknik terimler (Rust, TypeScript) dışındaki metinlerin çoğu Arap alfabesinde olmalı
    const oran = anahtarlar.filter((k) => ARAP_ALFABESI.test(sozlukler[d][k])).length / anahtarlar.length;
    expect(oran).toBeGreaterThan(0.9);
  });
});
