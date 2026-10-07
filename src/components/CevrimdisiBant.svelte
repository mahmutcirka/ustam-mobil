<script lang="ts">
  // Bağlantı yokken üstte ince bilgi bandı. Uygulama yerel çalıştığı için yalnızca bilgilendirir, hiçbir şeyi engellemez.
  import { onMount } from "svelte";
  import Ikon from "$lib/components/Ikon.svelte";
  import { dil } from "$lib/i18n.svelte";

  let cevrimdisi = $state(typeof navigator !== "undefined" && !navigator.onLine);

  onMount(() => {
    const guncelle = () => (cevrimdisi = !navigator.onLine);
    window.addEventListener("online", guncelle);
    window.addEventListener("offline", guncelle);
    return () => {
      window.removeEventListener("online", guncelle);
      window.removeEventListener("offline", guncelle);
    };
  });
</script>

{#if cevrimdisi}
  <div class="bant" role="status">
    <Ikon ad="bilgi" boyut={16} />
    <span>{dil.t("genel.cevrimdisi")}</span>
  </div>
{/if}

<style>
  .bant {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--vurgu-yumusak);
    color: var(--yazi);
    font-size: var(--yz-sm);
  }
</style>
