<script lang="ts">
  // Modal pencere — yerel <dialog>: odak tuzağı, Esc ile kapanma ve erişilebilirlik tarayıcıdan gelir.
  // alt=true → telefonda ekranın altından açılan panel (bottom sheet), tablet ve masaüstünde ortada pencere.
  import type { Snippet } from "svelte";
  import Ikon from "./Ikon.svelte";

  let {
    acik = $bindable(false),
    baslik,
    kapatEtiketi = "×",
    alt = false,
    children,
    altBilgi,
  }: {
    acik?: boolean;
    baslik: string;
    kapatEtiketi?: string;
    alt?: boolean;
    children: Snippet;
    altBilgi?: Snippet;
  } = $props();

  let dialog: HTMLDialogElement;
  const baslikId = `pencere-${Math.random().toString(36).slice(2, 8)}`;

  $effect(() => {
    if (acik && !dialog.open) dialog.showModal();
    if (!acik && dialog.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  class:alt
  onclose={() => (acik = false)}
  onclick={(e) => e.target === dialog && (acik = false)}
  aria-labelledby={baslikId}
>
  <div class="ic">
    {#if alt}<span class="tutamac" aria-hidden="true"></span>{/if}
    <header>
      <h2 id={baslikId}>{baslik}</h2>
      <button class="kapat" onclick={() => (acik = false)} aria-label={kapatEtiketi}><Ikon ad="kapat" /></button>
    </header>
    <div class="govde">
      {@render children()}
    </div>
    {#if altBilgi}
      <footer>{@render altBilgi()}</footer>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    width: min(480px, calc(100% - 32px));
    max-height: calc(100% - 32px);
    padding: 0;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-buyuk);
    background: var(--kart);
    color: var(--yazi);
    box-shadow: var(--golge-yuksek);
    overscroll-behavior: contain;
  }

  dialog[open] {
    animation: ac var(--sure-orta) var(--egri);
  }

  dialog::backdrop {
    background: var(--perde);
  }

  .ic {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 18px 8px;
  }

  h2 {
    margin: 0;
    font-size: var(--yz-lg);
  }

  .govde {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 6px 18px 18px;
    overflow-y: auto;
  }

  footer {
    display: flex;
    gap: 8px;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--kenar);
  }

  .kapat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
  }

  .tutamac {
    align-self: center;
    width: 40px;
    height: 4px;
    margin-top: 8px;
    border-radius: 2px;
    background: var(--kenar);
  }

  /* Telefon: alttan açılan panel — başparmak erişimi için ekranın alt kısmında */
  @media (max-width: 767px) {
    dialog.alt {
      width: 100%;
      max-width: 100%;
      max-height: 88dvh;
      margin: auto 0 0;
      border-radius: var(--radius-buyuk) var(--radius-buyuk) 0 0;
      border-bottom: 0;
    }

    dialog.alt[open] {
      animation: yukari var(--sure-orta) var(--egri);
    }

    dialog.alt .govde {
      padding-bottom: calc(18px + env(safe-area-inset-bottom));
    }
  }

  @keyframes ac {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
  }

  @keyframes yukari {
    from {
      transform: translateY(100%);
    }
  }
</style>
