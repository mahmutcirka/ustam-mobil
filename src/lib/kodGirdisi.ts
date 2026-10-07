// Kapıdaki ustanın söylediği kodun yazımını düzenler — bir iş kuralı değil, yalnızca giriş biçimlendirmesi.
// Doğrulama her zaman Rust (is_emri_dogrula) / kurallar.ts tarafından yapılır.
// "ust elk 1210 k7qz", "USTELK1210K7QZ", "ust-elk-1210-k7qz" → "UST-ELK-1210-K7QZ"
export function kodGirdisiniDuzenle(ham: string): string {
  const yalin = ham.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (yalin.length !== 14) return ham.trim().toUpperCase().replace(/\s+/g, "");
  return `${yalin.slice(0, 3)}-${yalin.slice(3, 6)}-${yalin.slice(6, 10)}-${yalin.slice(10)}`;
}
