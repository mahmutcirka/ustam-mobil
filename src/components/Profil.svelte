<script lang="ts">
  // Profil — iletişim bilgileri (localStorage), dil ve tema ayarları
  import { tema } from "$lib/tema.svelte";
  import { bilgiSayfalari, dil, diller, dilAdlari, sayfaYolu } from "$lib/i18n.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { profil } from "$lib/profil.svelte";

  const kayitli = profil.bilgi;

  let ad = $state(kayitli.ad);
  let telefon = $state(kayitli.telefon);
  let adres = $state(kayitli.adres);
  let kaydedilenAd = $state(kayitli.ad);
  let kaydedildi = $state(false);

  function kaydet(event: SubmitEvent) {
    event.preventDefault();
    profil.guncelle({ ad: ad.trim(), telefon: telefon.trim(), adres: adres.trim() });
    kaydedilenAd = ad.trim();
    kaydedildi = true;
    setTimeout(() => (kaydedildi = false), 2000);
  }
</script>

<div class="sayfa dar">
  <div class="kart profil">
    <div class="avatar">{(kaydedilenAd[0] ?? "?").toLocaleUpperCase("tr")}</div>
    <h2>{kaydedilenAd || dil.t("profil.misafir")}</h2>
    <p>{dil.t("profil.isSayisi", { n: isEmirleri.liste.length })}</p>
  </div>

  <form class="kart form" onsubmit={kaydet}>
    <label>
      {dil.t("profil.ad")}
      <input bind:value={ad} autocomplete="name" />
    </label>
    <label>
      {dil.t("profil.telefon")}
      <input type="tel" dir="ltr" bind:value={telefon} autocomplete="tel" placeholder="05xx xxx xx xx" />
    </label>
    <label>
      {dil.t("profil.adres")}
      <textarea rows="2" bind:value={adres} autocomplete="street-address"></textarea>
    </label>
    <button class="btn">{kaydedildi ? dil.t("profil.kaydedildi") : dil.t("profil.kaydet")}</button>
  </form>

  <h3>{dil.t("profil.ayarlar")}</h3>
  <div class="kart ayarlar">
    <div class="ayar">
      <span>{dil.t("profil.dil")}</span>
      <div class="diller">
        {#each diller as d}
          <button class:aktif={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>{dilAdlari[d]}</button>
        {/each}
      </div>
    </div>
    <div class="ayar">
      <span>{dil.t("profil.tema")}</span>
      <div class="diller temalar">
        {#each ["sistem", "gunduz", "gece"] as const as t}
          <button class:aktif={tema.tercih === t} onclick={() => tema.sec(t)}>{dil.t(`tema.${t}`)}</button>
        {/each}
      </div>
    </div>
  </div>

  <h3>{dil.t("profil.bilgi")}</h3>
  <nav class="kart baglantilar">
    {#each bilgiSayfalari as s}
      <a href={sayfaYolu(dil.kod, s)}>
        <span>{dil.t(`sayfa.${s}`)}</span>
        <span class="ok" aria-hidden="true">›</span>
      </a>
    {/each}
  </nav>
</div>

<style>
  h3 {
    margin: 8px 0 -6px;
    font-size: 15px;
    color: var(--yazi-soluk);
  }

  .profil {
    padding: 24px;
    text-align: center;
  }

  .profil h2 {
    margin: 12px 0 4px;
  }

  .profil p {
    margin: 0;
    color: var(--yazi-soluk);
  }

  .avatar {
    width: 72px;
    height: 72px;
    margin: 0 auto;
    border-radius: 50%;
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-size: 32px;
    font-weight: 700;
    line-height: 72px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }

  input,
  textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: 10px;
    background: var(--zemin);
    font-weight: 400;
    resize: vertical;
  }

  .ayarlar {
    padding: 4px 16px;
  }

  .ayar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 0;
    font-weight: 600;
    font-size: 14px;
  }

  .ayar + .ayar {
    border-top: 1px solid var(--kenar);
  }

  .diller {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .diller.temalar {
    grid-template-columns: repeat(3, 1fr);
  }

  .diller button {
    padding: 10px 4px;
    border: 1px solid var(--kenar);
    border-radius: 10px;
    background: var(--zemin);
    font-size: 13px;
  }

  .baglantilar {
    display: flex;
    flex-direction: column;
  }

  .baglantilar a {
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 15px;
  }

  .baglantilar a + a {
    border-top: 1px solid var(--kenar);
  }

  .ok {
    display: inline-block;
    color: var(--yazi-soluk);
  }

  :global([dir="rtl"]) .ok {
    transform: scaleX(-1);
  }

  .diller button.aktif {
    background: var(--renk-ana);
    border-color: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 700;
  }
</style>
