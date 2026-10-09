// Telefon önizlemesi: uygulamayı (localhost:1420) telefon çerçevelerinin içinde gösteren geliştirme aracı.
// Kullanım: bun run telefon — sunucu kapalıysa `bun run dev`i başlatır, önizlemeyi tarayıcıda açar.
// Yalnızca geliştirme içindir; dist/ ve Tauri paketine girmez.
import { join } from "node:path";

const UYGULAMA = "http://localhost:1420";
const PORT = 1421;
const sayfa = Bun.file(join(import.meta.dir, "telefon.html"));

// Astro bazen yalnızca 127.0.0.1 (IPv4) dinler; "localhost" ise önce ::1 denenebilir — ikisine de bakılır
async function acikMi(): Promise<boolean> {
  for (const adres of [UYGULAMA, UYGULAMA.replace("localhost", "127.0.0.1")]) {
    try {
      await fetch(adres, { signal: AbortSignal.timeout(1500) });
      return true;
    } catch {
      // sıradaki adres denenir
    }
  }
  return false;
}

let gelistirme: ReturnType<typeof Bun.spawn> | null = null;
if (!(await acikMi())) {
  console.log("Uygulama sunucusu başlatılıyor (bun run dev)…");
  gelistirme = Bun.spawn(["bun", "run", "dev"], {
    cwd: join(import.meta.dir, ".."),
    stdout: "inherit",
    stderr: "inherit",
  });
  let bitti = false;
  gelistirme.exited.then(() => (bitti = true));
  for (let i = 0; i < 60 && !bitti && !(await acikMi()); i++) await Bun.sleep(500);
  if (bitti) {
    console.error("Uygulama sunucusu başlatılamadı; çıktıyı yukarıda kontrol edin.");
    process.exit(1);
  }
}

Bun.serve({
  port: PORT,
  hostname: "localhost",
  fetch: () => new Response(sayfa, { headers: { "content-type": "text/html; charset=utf-8" } }),
});

const adres = `http://localhost:${PORT}`;
console.log(`\nTelefon önizlemesi: ${adres}  (kapatmak için Ctrl+C)\n`);

const ac =
  process.platform === "win32"
    ? ["cmd", "/c", "start", "", adres]
    : process.platform === "darwin"
      ? ["open", adres]
      : ["xdg-open", adres];
Bun.spawn(ac, { stdout: "ignore", stderr: "ignore" });

function kapat() {
  gelistirme?.kill();
  process.exit(0);
}
process.on("SIGINT", kapat);
process.on("SIGTERM", kapat);
