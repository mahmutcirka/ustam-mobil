// Canlı saat — açık/kapalı durumu, varış geri sayımı gibi zamana bağlı görünümler için 15 sn'de bir güncellenir
class Saat {
  simdi = $state(new Date());

  constructor() {
    if (typeof window !== "undefined") setInterval(() => (this.simdi = new Date()), 15_000);
  }
}

export const saat = new Saat();
