<script lang="ts">
  // "Konumumdan bul" — cihaz konumunu bir kez okuyup en yakın semti seçer (SemtSecici'nin üstünde).
  // Yalnız kullanıcı dokunduğunda çalışır; izin daha önce sorulmadıysa sistem penceresi bu dokunuşla açılır.
  // Koordinat yalnız enYakinSemt() içinde kullanılır ve atılır; profile yalnız semt adı yazılır (docs/izinler.md).
  import Ikon from "./Ikon.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { sayiYaz } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";
  import { enYakinSemt } from "$lib/konum";
  import { hataAnahtari, izinDurumu, izinIste, konumOku, NativeHata } from "$lib/native";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IzinDurumu, Semt } from "$lib/types";

  let { sec }: { sec: (s: Semt) => void } = $props();

  let calisiyor = $state(false);
  let uyari = $state<{ anahtar: Anahtar; izinlere: boolean } | null>(null);

  const konumDurumu = (liste: IzinDurumu[]) => liste.find((i) => i.id === "konum");

  async function bul() {
    calisiyor = true;
    uyari = null;
    try {
      let d = konumDurumu(await izinDurumu());
      if (d && d.durum !== "verildi" && d.istenebilir) d = konumDurumu(await izinIste("konum"));
      if (d?.durum === "servis-kapali") throw new NativeHata({ tur: "konum-servisi-kapali" });
      if (d && ["reddedildi", "sorulmadi", "desteklenmiyor"].includes(d.durum)) {
        uyari = { anahtar: "konum.izinGerekli", izinlere: true };
        return;
      }
      const sonuc = enYakinSemt(await konumOku());
      if (!sonuc) {
        uyari = { anahtar: "konum.disarida", izinlere: false };
        return;
      }
      sec(sonuc.semt);
      bildirim.goster(dil.t("konum.bulundu", { semt: sonuc.semt, km: sayiYaz(sonuc.km, dil.kod) }));
    } catch (e) {
      const h = e instanceof NativeHata ? e.hata : ({ tur: "ic-hata", ayrinti: String(e) } as const);
      uyari = h.tur === "izin-yok" ? { anahtar: "konum.izinGerekli", izinlere: true } : { anahtar: hataAnahtari(h), izinlere: false };
    } finally {
      calisiyor = false;
    }
  }
</script>

<div class="konumdan">
  <button type="button" class="btn ikincil konum-dugme" onclick={bul} disabled={calisiyor} aria-busy={calisiyor}>
    <span class="ic" class:donuyor={calisiyor}><Ikon ad={calisiyor ? "yenile" : "konum"} boyut={18} /></span>
    {dil.t(calisiyor ? "konum.bulunuyor" : "konum.bul")}
  </button>
  <p class="not" aria-live="polite">
    {#if uyari}
      <span class="uyari">{dil.t(uyari.anahtar)}</span>
      {#if uyari.izinlere}<a href="/izinler">{dil.t("izin.baslik")}</a>{/if}
    {:else}
      {dil.t("konum.not")}
    {/if}
  </p>
</div>

<style>
  .konumdan {
    display: flex;
    flex-direction: column;
    gap: var(--b-1);
  }

  .konum-dugme {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--b-2);
  }

  .ic {
    display: inline-flex;
  }

  .donuyor {
    animation: don 900ms linear infinite;
  }

  @keyframes don {
    to {
      transform: rotate(360deg);
    }
  }

  .not {
    margin: 0;
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    line-height: 1.5;
  }

  .uyari {
    color: var(--yazi);
  }

  a {
    margin-inline-start: var(--b-1);
    font-weight: 600;
    color: var(--renk-ana-yazi);
  }
</style>
