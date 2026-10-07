<script lang="ts">
  // Modal pencere — yerel <dialog> kullanır: odak tuzağı, Esc ile kapanma ve erişilebilirlik tarayıcıdan gelir
  import type { Snippet } from "svelte";
  import Ikon from "./Ikon.svelte";

  let {
    acik = $bindable(false),
    baslik,
    kapatEtiketi = "×",
    children,
  }: { acik?: boolean; baslik: string; kapatEtiketi?: string; children: Snippet } = $props();

  let dialog: HTMLDialogElement;

  $effect(() => {
    if (acik && !dialog.open) dialog.showModal();
    if (!acik && dialog.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  onclose={() => (acik = false)}
  onclick={(e) => e.target === dialog && (acik = false)}
  aria-labelledby="pencere-baslik"
>
  <div class="ic">
    <header>
      <h2 id="pencere-baslik">{baslik}</h2>
      <button class="kapat" onclick={() => (acik = false)} aria-label={kapatEtiketi}><Ikon ad="kapat" /></button>
    </header>
    {@render children()}
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
    gap: 14px;
    padding: 18px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
  }

  .kapat {
    display: flex;
    padding: 6px;
    border: 0;
    border-radius: 50%;
    background: var(--zemin);
    color: var(--yazi-soluk);
  }

  @keyframes ac {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
  }
</style>
