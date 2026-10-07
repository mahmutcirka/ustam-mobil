<script lang="ts">
  // 1–5 yıldız seçimi — radyo grubu olarak erişilebilir, ok tuşlarıyla da değişir
  import Ikon from "./Ikon.svelte";
  import { dil } from "$lib/i18n.svelte";

  let { puan = $bindable(0) }: { puan?: number } = $props();
  let uzerinde = $state(0);
</script>

<div class="secici" role="radiogroup" aria-label={dil.t("is.puaniniz")} dir="ltr">
  {#each [1, 2, 3, 4, 5] as n}
    <button
      role="radio"
      aria-checked={puan === n}
      aria-label={dil.t("is.puanSec", { n })}
      class:dolu={n <= (uzerinde || puan)}
      onclick={() => (puan = n)}
      onmouseenter={() => (uzerinde = n)}
      onmouseleave={() => (uzerinde = 0)}
      onkeydown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") puan = Math.min(5, puan + 1);
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") puan = Math.max(1, puan - 1);
      }}
    >
      <Ikon ad="yildiz" boyut={34} dolu={n <= (uzerinde || puan)} />
    </button>
  {/each}
</div>

<style>
  .secici {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  button {
    display: flex;
    padding: 4px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--kenar);
    transition: transform var(--sure-hizli) var(--egri);
  }

  button.dolu {
    color: var(--vurgu);
  }

  button:active {
    transform: scale(0.88);
  }
</style>
