<script lang="ts">
  // İlk açılış — 1) dil seçimi, 2) semt seçimi. Bir kez tamamlanır; bilgi sayfalarına doğrudan gelenlere gösterilmez.
  import Ikon from "$lib/components/Ikon.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import { dil, diller, dilAdlari } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import type { IkonAdi } from "$lib/ikonlar";
  import type { Anahtar } from "$lib/ceviriler";

  const goster = typeof document !== "undefined" && !document.documentElement.dataset.sabitDil && !profil.karsilamaTamam;

  let adim = $state<1 | 2>(1);

  const ozellikler: [IkonAdi, Anahtar][] = [
    ["konum", "karsilama.ozellik1"],
    ["dil", "karsilama.ozellik2"],
    ["kalkan", "karsilama.ozellik3"],
  ];
</script>

{#if goster && !profil.karsilamaTamam}
  <div class="perde" role="dialog" aria-modal="true" aria-labelledby="karsilama-baslik">
    <div class="pano">
      {#if adim === 1}
        <img src="/logo.svg" alt="" width="56" height="56" />
        <h2 id="karsilama-baslik">{dil.t("karsilama.baslik")}</h2>
        <p class="alt">{dil.t("karsilama.alt")}</p>

        <ul class="ozellikler">
          {#each ozellikler as [ikon, metin]}
            <li><span><Ikon ad={ikon} boyut={18} /></span>{dil.t(metin)}</li>
          {/each}
        </ul>

        <h3>{dil.t("karsilama.dilSec")}</h3>
        <div class="diller">
          {#each diller as d}
            <button class:aktif={dil.kod === d} aria-pressed={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>
              {dilAdlari[d]}
            </button>
          {/each}
        </div>
        <button class="btn" onclick={() => (adim = 2)}>{dil.t("karsilama.devam")}</button>
      {:else}
        <span class="buyuk-ikon"><Ikon ad="konum" boyut={28} /></span>
        <h2 id="karsilama-baslik">{dil.t("karsilama.semtSec")}</h2>
        <p class="alt">{dil.t("karsilama.semtNot")}</p>
        <SemtSecici secili={profil.bilgi.semt} sec={(s) => profil.guncelle({ semt: s })} />
        <div class="dugmeler">
          <button class="btn ikincil" onclick={() => (adim = 1)} aria-label={dil.t("detay.geri")}>
            <Ikon ad={dil.yon === "rtl" ? "ok-sag" : "ok-sol"} />
          </button>
          <button class="btn" onclick={() => profil.karsilamayiBitir()}>{dil.t("karsilama.basla")}</button>
        </div>
      {/if}
      <div class="noktalar" aria-hidden="true">
        <span class:aktif={adim === 1}></span><span class:aktif={adim === 2}></span>
      </div>
    </div>
  </div>
{/if}

<style>
  .perde {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: var(--perde);
    overflow-y: auto;
  }

  .pano {
    width: min(460px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 28px 20px 20px;
    border-radius: var(--radius-buyuk);
    background: var(--kart);
    box-shadow: var(--golge-yuksek);
    text-align: center;
    animation: belir var(--sure-orta) var(--egri);
  }

  h2 {
    margin: 0;
    font-size: 24px;
  }

  h3 {
    margin: 4px 0 0;
    font-size: 15px;
  }

  .alt {
    margin: -6px 0 0;
    color: var(--yazi-soluk);
    font-size: 15px;
    line-height: 1.5;
  }

  .ozellikler {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: start;
    font-size: 14px;
  }

  .ozellikler li {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ozellikler span {
    display: flex;
    padding: 7px;
    border-radius: 10px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .diller {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    width: 100%;
  }

  .diller button {
    padding: 14px 8px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    font-size: 16px;
    font-weight: 600;
  }

  .diller button.aktif {
    border-color: var(--renk-ana);
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
  }

  .buyuk-ikon {
    display: flex;
    padding: 14px;
    border-radius: 50%;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .pano :global(.semtler) {
    width: 100%;
    text-align: start;
  }

  .dugmeler {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .dugmeler .ikincil {
    width: auto;
    display: flex;
    align-items: center;
  }

  .noktalar {
    display: flex;
    gap: 6px;
  }

  .noktalar span {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: var(--kenar);
    transition: width var(--sure-orta) var(--egri);
  }

  .noktalar span.aktif {
    width: 22px;
    background: var(--renk-ana);
  }

  @keyframes belir {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.98);
    }
  }
</style>
