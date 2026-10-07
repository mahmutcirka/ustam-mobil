<script lang="ts">
  // Ekranın altında beliren kısa bildirimler — ekran okuyucular için aria-live bölgesi
  import { onMount } from "svelte";
  import Ikon from "$lib/components/Ikon.svelte";
  import { bildirim } from "$lib/bildirim.svelte";

  onMount(() => bildirim.kuyruguBosalt());
</script>

<div class="bolge" aria-live="polite" aria-atomic="false">
  {#each bildirim.liste as b (b.id)}
    <div class="bildirim {b.tur}" role="status">
      <Ikon ad={b.tur === "hata" ? "uyari" : b.tur === "bilgi" ? "bilgi" : "onay"} boyut={18} />
      <span>{b.metin}</span>
      <button onclick={() => bildirim.kapat(b.id)} aria-label="×"><Ikon ad="kapat" boyut={16} /></button>
    </div>
  {/each}
</div>

<style>
  .bolge {
    position: fixed;
    inset-inline: 16px;
    bottom: calc(88px + env(safe-area-inset-bottom));
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .bildirim {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 440px;
    padding: 12px 12px 12px 14px;
    border-radius: var(--radius);
    border: 1px solid var(--kenar);
    background: var(--kart);
    color: var(--yazi);
    font-size: 14px;
    font-weight: 600;
    box-shadow: var(--golge-yuksek);
    pointer-events: auto;
    animation: belir var(--sure-orta) var(--egri);
  }

  .bildirim span {
    flex: 1;
  }

  .basari {
    border-color: var(--basari);
  }

  .basari :global(.ikon:first-child) {
    color: var(--basari);
  }

  .hata {
    border-color: var(--hata);
  }

  .hata :global(.ikon:first-child) {
    color: var(--hata);
  }

  .bilgi :global(.ikon:first-child) {
    color: var(--renk-ana-yazi);
  }

  button {
    display: flex;
    padding: 4px;
    border: 0;
    border-radius: 6px;
    background: none;
    color: var(--yazi-soluk);
  }

  @keyframes belir {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
  }

  @media (min-width: 1200px) {
    .bolge {
      bottom: 24px;
    }
  }
</style>
