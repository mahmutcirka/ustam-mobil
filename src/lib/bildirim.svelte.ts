// Kısa bildirimler (toast) — sayfa değiştirse bile gösterilebilmesi için sessionStorage kuyruğu kullanır
import type { Bildirim, BildirimTuru } from "./types";

const KUYRUK = "bildirim-kuyrugu";
let sayac = 0;

class Bildirimler {
  liste = $state<Bildirim[]>([]);

  goster(metin: string, tur: BildirimTuru = "basari", sureMs = 3200) {
    const id = ++sayac;
    this.liste.push({ id, metin, tur });
    setTimeout(() => this.kapat(id), sureMs);
  }

  // Tam sayfa geçişinden hemen önce çağrılır; bir sonraki sayfa açılınca gösterilir
  sonrakiSayfada(metin: string, tur: BildirimTuru = "basari") {
    try {
      const kuyruk = JSON.parse(sessionStorage.getItem(KUYRUK) ?? "[]");
      kuyruk.push({ metin, tur });
      sessionStorage.setItem(KUYRUK, JSON.stringify(kuyruk));
    } catch {
      // sessionStorage yoksa bildirim gösterilmeden geçilir
    }
  }

  kuyruguBosalt() {
    try {
      const kuyruk: { metin: string; tur: BildirimTuru }[] = JSON.parse(sessionStorage.getItem(KUYRUK) ?? "[]");
      sessionStorage.removeItem(KUYRUK);
      for (const b of kuyruk) this.goster(b.metin, b.tur);
    } catch {
      // bozuk kuyruk yok sayılır
    }
  }

  kapat(id: number) {
    const i = this.liste.findIndex((b) => b.id === id);
    if (i !== -1) this.liste.splice(i, 1);
  }
}

export const bildirim = new Bildirimler();
