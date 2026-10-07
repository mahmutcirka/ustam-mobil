<script lang="ts">
  // Boş / hata durumu — ikon, başlık, açıklama ve isteğe bağlı aksiyon
  import type { Snippet } from "svelte";
  import Ikon from "./Ikon.svelte";
  import type { IkonAdi } from "$lib/ikonlar";

  let {
    ikon,
    baslik,
    metin,
    tur = "bos",
    children,
  }: { ikon: IkonAdi; baslik: string; metin?: string; tur?: "bos" | "hata"; children?: Snippet } = $props();
</script>

<div class="durum {tur}" role={tur === "hata" ? "alert" : undefined}>
  <span class="ikon"><Ikon ad={ikon} boyut={28} /></span>
  <strong>{baslik}</strong>
  {#if metin}<p>{metin}</p>{/if}
  {#if children}<div class="aksiyon">{@render children()}</div>{/if}
</div>

<style>
  .durum {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    text-align: center;
  }

  .ikon {
    display: flex;
    padding: 16px;
    margin-bottom: 4px;
    border-radius: 50%;
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
  }

  .hata .ikon {
    background: var(--hata-yumusak);
    color: var(--hata);
  }

  strong {
    font-size: var(--yz-lg);
  }

  p {
    max-width: 320px;
    margin: 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .aksiyon {
    margin-top: 8px;
  }
</style>
