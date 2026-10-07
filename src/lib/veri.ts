// KVKK veri hakları — bu cihazdaki kişisel verileri dışa aktarma ve silme.
// Dil ve tema tercihleri kişisel veri olmadığı için silinmez; arayüz seçilen dilde kalır.

const KISISEL_ANAHTARLAR = [
  "profil",
  "karsilama-tamam",
  "is-emirleri",
  "cagri-taslagi",
  "favoriler",
  "yorumlarim",
  "liste-gorunum",
  "tekrar-taslagi",
];

export function verileriDisaAktar() {
  const veri: Record<string, unknown> = { uygulama: "Ustam", tarih: new Date().toISOString() };
  for (const anahtar of KISISEL_ANAHTARLAR) {
    try {
      const ham = localStorage.getItem(anahtar);
      if (ham !== null) veri[anahtar] = JSON.parse(ham);
    } catch {
      // okunamayan anahtar atlanır
    }
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(veri, null, 2)], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "ustam-verilerim.json" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function tumVerileriSil() {
  for (const anahtar of KISISEL_ANAHTARLAR) {
    try {
      localStorage.removeItem(anahtar);
    } catch {
      // depolama erişilemiyorsa silinecek veri de yoktur
    }
  }
}
