<script lang="ts">
  // Semt seçimi — Avrupa ve Anadolu yakası olarak gruplanmış düğmeler
  import Ikon from "./Ikon.svelte";
  import { semtler, semtListesi } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";
  import type { Semt } from "../../types/ustam";

  let { secili, sec }: { secili: Semt; sec: (s: Semt) => void } = $props();

  const yakalar = ["avrupa", "asya"] as const;
</script>

<div class="semtler">
  {#each yakalar as yaka}
    <div class="yaka">
      <span class="baslik">{dil.t(`harita.${yaka}`)}</span>
      <div class="liste">
        {#each semtListesi.filter((s) => semtler[s].yaka === yaka) as s}
          <button class:aktif={s === secili} aria-pressed={s === secili} onclick={() => sec(s)}>
            {#if s === secili}<Ikon ad="konum" boyut={14} />{/if}
            {s}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .semtler {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .yaka {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .baslik {
    font-size: 12px;
    font-weight: 700;
    color: var(--yazi-soluk);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .liste {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 6px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-size: 14px;
  }

  button.aktif {
    border-color: var(--renk-ana);
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 700;
  }
</style>
