<script lang="ts">
  // İlk açılış: marka → 3 tanıtım adımı → dil → semt. Tanıtım "Atla" ile geçilebilir; akış bir kez gösterilir.
  // Bilgi sayfalarına doğrudan gelenlere (sabit dilli sayfalar) gösterilmez.
  import Ikon from "$lib/components/Ikon.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import { dil, diller, dilAdlari } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import type { IkonAdi } from "$lib/ikonlar";
  import type { Anahtar } from "$lib/ceviriler";

  const goster = typeof document !== "undefined" && !document.documentElement.dataset.sabitDil && !profil.karsilamaTamam;

  const tanitim: [IkonAdi, Anahtar, Anahtar][] = [
    ["anahtar", "karsilama.adim1Baslik", "karsilama.adim1Metin"],
    ["konum", "karsilama.adim2Baslik", "karsilama.adim2Metin"],
    ["kalkan", "karsilama.adim3Baslik", "karsilama.adim3Metin"],
  ];
  const DIL_ADIMI = tanitim.length + 1;
  const SEMT_ADIMI = DIL_ADIMI + 1;
  const TOPLAM = SEMT_ADIMI + 1;

  let adim = $state(0);
</script>

{#if goster && !profil.karsilamaTamam}
  <div class="perde" role="dialog" aria-modal="true" aria-labelledby="karsilama-baslik">
    <div class="pano">
      <div class="ust">
        <span class="sayac">{dil.t("karsilama.adim", { n: adim + 1, toplam: TOPLAM })}</span>
        {#if adim < DIL_ADIMI}
          <button class="btn hayalet kucuk" onclick={() => (adim = DIL_ADIMI)}>{dil.t("karsilama.atla")}</button>
        {/if}
      </div>

      {#key adim}
        <div class="icerik">
          {#if adim === 0}
            <img src="/logo.svg" alt="" width="72" height="72" />
            <h2 id="karsilama-baslik">{dil.t("karsilama.baslik")}</h2>
            <p class="slogan">{dil.t("karsilama.slogan")}</p>
            <p class="alt">{dil.t("karsilama.alt")}</p>
          {:else if adim <= tanitim.length}
            {@const [ikon, baslik, metin] = tanitim[adim - 1]}
            <span class="buyuk-ikon"><Ikon ad={ikon} boyut={34} /></span>
            <h2 id="karsilama-baslik">{dil.t(baslik)}</h2>
            <p class="alt">{dil.t(metin)}</p>
          {:else if adim === DIL_ADIMI}
            <span class="buyuk-ikon"><Ikon ad="dunya" boyut={30} /></span>
            <h2 id="karsilama-baslik">{dil.t("karsilama.dilSec")}</h2>
            <div class="diller">
              {#each diller as d}
                <button class:secili={dil.kod === d} aria-pressed={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>
                  {dilAdlari[d]}
                  {#if dil.kod === d}<Ikon ad="onay" boyut={18} />{/if}
                </button>
              {/each}
            </div>
          {:else}
            <span class="buyuk-ikon"><Ikon ad="konum" boyut={30} /></span>
            <h2 id="karsilama-baslik">{dil.t("karsilama.semtSec")}</h2>
            <p class="alt">{dil.t("karsilama.semtNot")}</p>
            <SemtSecici secili={profil.bilgi.semt} sec={(s) => profil.guncelle({ semt: s })} />
          {/if}
        </div>
      {/key}

      <div class="noktalar" aria-hidden="true">
        {#each Array.from({ length: TOPLAM }) as _, i}
          <span class:aktif={i === adim}></span>
        {/each}
      </div>

      <div class="dugmeler">
        {#if adim > 0}
          <button class="btn ikincil geri" onclick={() => adim--} aria-label={dil.t("detay.geri")}>
            <Ikon ad={dil.yon === "rtl" ? "ok-sag" : "ok-sol"} />
          </button>
        {/if}
        {#if adim === SEMT_ADIMI}
          <button class="btn" onclick={() => profil.karsilamayiBitir()}>{dil.t("karsilama.basla")}</button>
        {:else}
          <button class="btn" onclick={() => adim++}>{dil.t(adim === DIL_ADIMI ? "karsilama.devam" : "karsilama.ileri")}</button>
        {/if}
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
    background: var(--zemin);
    overflow-y: auto;
  }

  .pano {
    width: min(440px, 100%);
    min-height: min(640px, calc(100dvh - 32px));
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px calc(20px + env(safe-area-inset-bottom));
  }

  .ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 36px;
  }

  .sayac {
    font-size: var(--yz-xs);
    font-weight: 600;
    color: var(--yazi-soluk);
  }

  .icerik {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
    animation: kay var(--sure-orta) var(--egri);
  }

  h2 {
    margin: 4px 0 0;
    font-size: var(--yz-xl);
    letter-spacing: -0.3px;
  }

  .slogan {
    margin: 0;
    font-size: var(--yz-lg);
    font-weight: 700;
    color: var(--renk-ana-yazi);
  }

  .alt {
    max-width: 340px;
    margin: 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-md);
    line-height: 1.55;
  }

  .buyuk-ikon {
    display: flex;
    padding: 20px;
    border-radius: 28px;
    background: var(--yuzey-2);
    color: var(--yazi);
  }

  .diller {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-top: 8px;
  }

  .diller button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 52px;
    padding: 0 16px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    font-size: var(--yz-md);
    font-weight: 600;
    text-align: start;
  }

  .diller button.secili {
    border-color: var(--secili);
    box-shadow: 0 0 0 1px var(--secili);
  }

  .icerik :global(.semtler) {
    width: 100%;
    text-align: start;
  }

  .noktalar {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .noktalar span {
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background: var(--kenar);
    transition: width var(--sure-orta) var(--egri);
  }

  .noktalar span.aktif {
    width: 20px;
    background: var(--yazi);
  }

  .dugmeler {
    display: flex;
    gap: 8px;
  }

  .dugmeler .geri {
    width: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes kay {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
</style>
