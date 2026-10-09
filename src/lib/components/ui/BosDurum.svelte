<script lang="ts">
  // Boş durum — gösterilecek kayıt yok: başlık, açıklama ve isteğe bağlı tek düğme (bağlantı ya da tıklama).
  // Metinleri ekran verir (çevrilmiş); bileşen veri tipi ve sözlük tanımaz.
  import Ikon from "../Ikon.svelte";
  import type { BosDurumGirdisi } from "../../types";

  let { baslik, aciklama, dugmeMetni, href, onclick, ikon = "ara", ikincil = false }: BosDurumGirdisi & { onclick?: () => void } =
    $props();
</script>

<div class="bos-durum">
  <span class="ikon" aria-hidden="true"><Ikon ad={ikon} boyut={28} /></span>
  <strong>{baslik}</strong>
  {#if aciklama}<p>{aciklama}</p>{/if}
  {#if dugmeMetni && href}
    <a class="btn kucuk" class:ikincil {href}>{dugmeMetni}</a>
  {:else if dugmeMetni && onclick}
    <button type="button" class="btn kucuk" class:ikincil {onclick}>{dugmeMetni}</button>
  {/if}
</div>

<style>
  .bos-durum {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--b-2);
    padding: var(--b-6) var(--b-5);
    text-align: center;
  }

  .ikon {
    display: flex;
    padding: var(--b-4);
    margin-bottom: var(--b-1);
    border-radius: var(--radius-hap);
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
  }

  strong {
    font-size: var(--yz-lg);
    overflow-wrap: anywhere;
  }

  p {
    max-width: 320px;
    margin: 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .btn {
    width: auto;
    margin-top: var(--b-2);
  }
</style>
