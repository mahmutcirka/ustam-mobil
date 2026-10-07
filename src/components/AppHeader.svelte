<script lang="ts">
  // Ortak başlık: logo, dil seçici ve gece / gündüz modu düğmesi
  import { tema } from "$lib/tema.svelte";
  import { bilgiSayfasiBul, dil, diller, sayfaYolu } from "$lib/i18n.svelte";
  import type { Dil } from "../types/ustam";

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
    <select
      class="dil-secici"
      aria-label={dil.t("dil.sec")}
      value={dil.kod}
      onchange={(e) => dilSec(e.currentTarget.value as Dil)}
    >
      {#each diller as d}
        <option value={d}>{d.toUpperCase()}</option>
      {/each}
    </select>
    <button
      class="tema-dugme"
      onclick={() => tema.degistir()}
      aria-label={tema.mod === "gece" ? dil.t("tema.gunduzeGec") : dil.t("tema.geceyeGec")}
    >
      {tema.mod === "gece" ? "☀️" : "🌙"}
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
    height: 38px;
    padding: 0 8px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 19px;
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    font-size: 13px;
    font-weight: 600;
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
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
