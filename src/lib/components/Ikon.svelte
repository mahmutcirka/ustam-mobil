<script lang="ts">
  // Tek ikon — renk her zaman çevredeki metinden (currentColor) gelir; ad-hoc renk almaz
  import { ikonlar, type IkonAdi } from "$lib/ikonlar";

  let {
    ad,
    boyut = 20,
    dolu = false,
    etiket,
  }: { ad: IkonAdi; boyut?: number; dolu?: boolean; etiket?: string } = $props();
</script>

<svg
  class="ikon"
  width={boyut}
  height={boyut}
  viewBox="0 0 24 24"
  fill={dolu ? "currentColor" : "none"}
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={etiket ? "img" : undefined}
  aria-label={etiket}
  aria-hidden={etiket ? undefined : "true"}
>
  {#each ikonlar[ad] as d}
    <path {d} />
  {/each}
</svg>

<style>
  .ikon {
    flex-shrink: 0;
    vertical-align: middle;
  }
</style>
