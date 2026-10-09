<script lang="ts">
  // Hata durumu — bir şey ters gitti: mesaj ve "Tekrar dene". Ekran okuyucuya hemen duyurulur (role="alert").
  // Metinleri ekran verir (çevrilmiş); bileşen veri tipi ve sözlük tanımaz.
  import Ikon from "../Ikon.svelte";
  import type { HataDurumuGirdisi } from "../../types";

  let { baslik, mesaj, tekrarMetni, ayrinti, donusMetni, donusHref, tekrarDene }: HataDurumuGirdisi & { tekrarDene?: () => void } =
    $props();
</script>

<div class="hata-durumu" role="alert">
  <span class="ikon" aria-hidden="true"><Ikon ad="uyari" boyut={28} /></span>
  <strong>{baslik}</strong>
  <p>{mesaj}</p>
  {#if ayrinti}<code dir="ltr">{ayrinti}</code>{/if}
  {#if tekrarDene && tekrarMetni}
    <button type="button" class="btn kucuk" onclick={tekrarDene}>
      <Ikon ad="yenile" boyut={16} />
      {tekrarMetni}
    </button>
  {/if}
  {#if donusMetni && donusHref}
    <a class="btn kucuk ikincil" href={donusHref}>{donusMetni}</a>
  {/if}
</div>

<style>
  .hata-durumu {
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

  code {
    padding: var(--b-1) var(--b-2);
    border-radius: var(--radius-mini);
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--b-2);
    width: auto;
    margin-top: var(--b-2);
  }
</style>
