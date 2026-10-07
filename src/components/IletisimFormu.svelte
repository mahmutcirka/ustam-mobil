<script lang="ts">
  // İletişim formu — doğrulama, sahte gönderim, başarı bildirimi ve form temizleme
  import { dil } from "$lib/i18n.svelte";
  import type { Anahtar } from "$lib/ceviriler";

  const konular: Anahtar[] = ["konu.genel", "konu.usta", "konu.sikayet", "konu.oneri"];

  let ad = $state("");
  let eposta = $state("");
  let konu = $state<Anahtar>("konu.genel");
  let mesaj = $state("");
  let gonderiliyor = $state(false);
  let bildirim = $state(false);

  const gecerli = $derived(
    ad.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta.trim()) && mesaj.trim().length >= 10,
  );

  async function gonder(event: SubmitEvent) {
    event.preventDefault();
    if (!gecerli) return;
    gonderiliyor = true;
    // Sunucu yok: gönderimi kısa bir gecikmeyle taklit et
    await new Promise((r) => setTimeout(r, 600));
    gonderiliyor = false;
    ad = "";
    eposta = "";
    konu = "konu.genel";
    mesaj = "";
    bildirim = true;
    setTimeout(() => (bildirim = false), 4000);
  }
</script>

<form class="kart form" onsubmit={gonder}>
  <p class="aciklama">{dil.t("iletisim.aciklama")}</p>
  <label>
    {dil.t("iletisim.ad")}
    <input bind:value={ad} autocomplete="name" required />
  </label>
  <label>
    {dil.t("iletisim.eposta")}
    <input type="email" dir="ltr" bind:value={eposta} autocomplete="email" required />
  </label>
  <label>
    {dil.t("iletisim.konu")}
    <select bind:value={konu}>
      {#each konular as k}
        <option value={k}>{dil.t(k)}</option>
      {/each}
    </select>
  </label>
  <label>
    {dil.t("iletisim.mesaj")}
    <textarea rows="5" bind:value={mesaj} required minlength="10"></textarea>
  </label>
  {#if !gecerli}
    <p class="ipucu">{dil.t("iletisim.ipucu")}</p>
  {/if}
  <button class="btn" disabled={!gecerli || gonderiliyor}>
    {gonderiliyor ? dil.t("iletisim.gonderiliyor") : dil.t("iletisim.gonder")}
  </button>
</form>

{#if bildirim}
  <div class="bildirim" role="status">✓ {dil.t("iletisim.basarili")}</div>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  .aciklama,
  .ipucu {
    margin: 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }

  input,
  select,
  textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: 10px;
    background: var(--zemin);
    font-weight: 400;
    resize: vertical;
  }

  .bildirim {
    position: fixed;
    inset-inline: 16px;
    bottom: calc(88px + env(safe-area-inset-bottom));
    z-index: 30;
    max-width: 480px;
    margin-inline: auto;
    padding: 14px 16px;
    border-radius: var(--radius);
    background: var(--basari-yumusak);
    color: var(--basari);
    border: 1px solid var(--basari);
    font-weight: 600;
    box-shadow: 0 8px 24px #0000002e;
  }
</style>
