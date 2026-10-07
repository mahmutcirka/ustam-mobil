<script lang="ts">
  // İş emri kodunun QR karşılığı — modüller tek bir SVG path'ine çevrilir, renkler token'dan gelir
  import qrcode from "qrcode-generator";

  let { metin, boyut = 168, etiket }: { metin: string; boyut?: number; etiket: string } = $props();

  const KENAR = 2; // sessiz bölge (modül)

  const qr = $derived.by(() => {
    const q = qrcode(0, "M");
    q.addData(metin);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + KENAR} ${r + KENAR}h1v1h-1z`;
    return { d, boyut: n + KENAR * 2 };
  });
</script>

<svg
  class="qr"
  width={boyut}
  height={boyut}
  viewBox="0 0 {qr.boyut} {qr.boyut}"
  role="img"
  aria-label={etiket}
  shape-rendering="crispEdges"
>
  <rect width={qr.boyut} height={qr.boyut} class="zemin" />
  <path d={qr.d} class="modul" />
</svg>

<style>
  .qr {
    border-radius: var(--radius-kucuk);
  }

  /* QR okuyucular koyu modül / açık zemin bekler; gece modunda da tersine çevrilmez */
  .zemin {
    fill: var(--qr-zemin);
  }

  .modul {
    fill: var(--qr-modul);
  }
</style>
