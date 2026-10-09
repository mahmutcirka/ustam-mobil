<script lang="ts">
  // Ortak başlık: logo, dil seçici ve tema düğmesi (Sistem → Gündüz → Gece)
  import Ikon from "$lib/components/Ikon.svelte";
  import { tema } from "$lib/tema.svelte";
  import { bilgiSayfasiBul, dil, diller, sayfaYolu } from "$lib/i18n.svelte";
  import type { Dil } from "../lib/types";

  const temaIkonu = { sistem: "otomatik", gunduz: "gunes", gece: "ay" } as const;

  // Sabit dilli bilgi sayfasındaysak (ör. /en/gizlilik) seçilen dildeki karşılığına geç
  function dilSec(d: Dil) {
    dil.degistir(d);
    const sayfa = bilgiSayfasiBul(window.location.pathname);
    if (document.documentElement.dataset.sabitDil && sayfa) window.location.assign(sayfaYolu(d, sayfa));
  }
</script>

<header class="ust">
  <a href="/" class="logo">
    <img src="/logo.svg" alt="" width="28" height="28" />
    <b>ust<span>am</span></b>
  </a>
  <div class="araclar">
    <label class="dil-secici">
      <Ikon ad="dunya" boyut={16} />
      <span class="gorunmez">{dil.t("dil.sec")}</span>
      <select value={dil.kod} onchange={(e) => dilSec(e.currentTarget.value as Dil)}>
        {#each diller as d}
          <option value={d}>{d.toUpperCase()}</option>
        {/each}
      </select>
    </label>
    <button
      class="tema-dugme"
      onclick={() => tema.siradaki()}
      aria-label={dil.t("tema.degistir", { ad: dil.t(`tema.${tema.tercih}`) })}
      title={dil.t(`tema.${tema.tercih}`)}
    >
      <Ikon ad={temaIkonu[tema.tercih]} boyut={18} />
    </button>
  </div>
</header>

<style>
  .ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
    padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--koyu-ustu);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-decoration: none;
  }

  .logo b {
    font-weight: inherit;
  }

  .logo span {
    color: var(--logo);
  }

  .araclar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dil-secici {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 38px;
    padding-inline: 10px 6px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 19px;
    background: var(--koyu-cam);
    cursor: pointer;
  }

  .dil-secici select {
    border: 0;
    background: transparent;
    color: var(--koyu-ustu);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .dil-secici option {
    color: var(--yazi);
    background: var(--kart);
  }

  .tema-dugme {
    width: 38px;
    height: 38px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 50%;
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--sure-hizli) var(--egri);
  }

  .tema-dugme:active {
    transform: rotate(-20deg) scale(0.94);
  }
</style>
