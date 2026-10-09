// Profilin "Çağrıya hazırlık" ölçeri ve çağrı adresi
import { describe, expect, test } from "bun:test";
import { cagriAdresi, hazirlikYuzdesi, profilEksikleri, telefonGecerliMi, telefonYaz } from "../src/lib/profilHazirligi";
import type { ProfilBilgileri } from "../src/lib/types";

const bos: ProfilBilgileri = { ad: "", telefon: "", semt: "Kadıköy", adres: "", kapiNotu: "" };
const dolu: ProfilBilgileri = { ad: "Mahmut Çirka", telefon: "0555 123 45 67", semt: "Kadıköy", adres: "Moda Cad. 12", kapiNotu: "3. kat, zil 5" };

describe("çağrıya hazırlık", () => {
  test("boş profil %0, eksikler ölçer sırasında", () => {
    expect(hazirlikYuzdesi(bos)).toBe(0);
    expect(profilEksikleri(bos)).toEqual(["ad", "telefon", "adres", "kapiNotu"]);
  });

  test("dolu profil %100", () => {
    expect(hazirlikYuzdesi(dolu)).toBe(100);
    expect(profilEksikleri(dolu)).toEqual([]);
  });

  test("geçersiz telefon eksik sayılır; yalnız boşluk dolu sayılmaz", () => {
    const p = { ...dolu, telefon: "0555 12", adres: "   " };
    expect(profilEksikleri(p)).toEqual(["telefon", "adres"]);
    expect(hazirlikYuzdesi(p)).toBe(50);
  });

  test("telefon denetimi: 10–13 rakam, başta isteğe bağlı +", () => {
    expect(telefonGecerliMi("0555 123 45 67")).toBe(true);
    expect(telefonGecerliMi("+90 555 123 45 67")).toBe(true);
    expect(telefonGecerliMi("555-123-4567")).toBe(true);
    expect(telefonGecerliMi("12345")).toBe(false);
    expect(telefonGecerliMi("")).toBe(false);
  });

  test("çağrı adresi adres ve kapı notunu birleştirir, boşları atlar", () => {
    expect(cagriAdresi(dolu)).toBe("Moda Cad. 12 · 3. kat, zil 5");
    expect(cagriAdresi({ adres: "Moda Cad. 12", kapiNotu: " " })).toBe("Moda Cad. 12");
    expect(cagriAdresi({ adres: "", kapiNotu: "zil 5" })).toBe("zil 5");
  });

  test("telefon gösterimi", () => {
    expect(telefonYaz("05551234567")).toBe("0555 123 45 67");
    expect(telefonYaz("+90 555 123 45 67")).toBe("+90 555 123 45 67");
  });
});
