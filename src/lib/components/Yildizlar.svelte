<script lang="ts">
  // 5 yıldızlık puan göstergesi — kesirli puanlar yıldızın bir kısmı doldurularak gösterilir
  import Ikon from "./Ikon.svelte";

  let { puan, boyut = 14 }: { puan: number; boyut?: number } = $props();
</script>

<span class="yildizlar" role="img" aria-label="{puan} / 5">
  {#each [0, 1, 2, 3, 4] as i}
    {@const doluluk = Math.max(0, Math.min(1, puan - i))}
    <span class="yildiz" style:--doluluk="{doluluk * 100}%">
      <span class="cerceve"><Ikon ad="yildiz" boyut={boyut} /></span>
      <span class="dolgu"><Ikon ad="yildiz" boyut={boyut} dolu /></span>
    </span>
  {/each}
</span>

<style>
  .yildizlar {
    display: inline-flex;
    gap: 1px;
    direction: ltr;
  }

  .yildiz {
    position: relative;
    display: inline-flex;
  }

  .cerceve {
    display: inline-flex;
    color: var(--kenar);
  }

  .dolgu {
    position: absolute;
    inset: 0;
    display: inline-flex;
    color: var(--vurgu);
    clip-path: inset(0 calc(100% - var(--doluluk)) 0 0);
  }
</style>
