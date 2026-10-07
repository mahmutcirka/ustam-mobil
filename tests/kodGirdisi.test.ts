// Kod girişinin biçimlendirilmesi — doğrulama kurallar.ts / Rust tarafında kalır
import { describe, expect, test } from "bun:test";
import { kodGirdisiniDuzenle } from "../src/lib/kodGirdisi";
import { kodDurumu } from "../src/lib/kurallar";

describe("kod girişi", () => {
  test.each(["ust elk 1210 k7qm", "USTELK1210K7QM", " ust-elk-1210-k7qm ", "UST.ELK.1210.K7QM"])("'%s' düzgün biçime gelir", (ham) => {
    expect(kodGirdisiniDuzenle(ham)).toBe("UST-ELK-1210-K7QM");
    expect(kodDurumu(kodGirdisiniDuzenle(ham))).toBe("gecerli");
  });

  test("eksik kod uydurulmaz, doğrulamada biçim hatası verir", () => {
    expect(kodDurumu(kodGirdisiniDuzenle("UST ELK 1210"))).toBe("bicim-hatali");
  });
});
