<script lang="ts">
  // Ana sayfa (Ustalar) — arama + kategori filtresi + müsaitlik anahtarı + usta listesi
  import Ikon from "$lib/components/Ikon.svelte";
  import UstaKart from "$lib/components/UstaKart.svelte";
  import { kategoriler, kategoriIkon, ustalar } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";
  import type { Kategori } from "../types/ustam";

  let secili = $state<Kategori | "tumu">("tumu");
  let arama = $state("");
  let sadeceMusait = $state(false);

  // Arama hem Türkçe verinin hem de seçili dildeki kategori adının içinde yapılır
  const liste = $derived.by(() => {
    const q = arama.trim().toLocaleLowerCase(dil.kod);
    return ustalar
      .filter((u) => secili === "tumu" || u.kategori === secili)
      .filter((u) => !sadeceMusait || u.musait)
      .filter((u) => {
        if (!q) return true;
        const metin = [u.ad, u.bolge, dil.t(`kategori.${u.kategori}`), dil.tr(`kategori.${u.kategori}`)]
          .join(" ")
          .toLocaleLowerCase(dil.kod);
        return metin.includes(q);
      })
      .sort((a, b) => Number(b.musait) - Number(a.musait) || a.mesafeKm - b.mesafeKm);
  });
</script>

<div class="sayfa">
  <div class="baslik">
    <h1>{dil.t("liste.baslik")}</h1>
    <p>{dil.t("uygulama.slogan")}</p>
  </div>

  <input class="arama" type="search" placeholder={dil.t("liste.arama")} bind:value={arama} />

  <div class="cipler">
    <button class:aktif={secili === "tumu"} onclick={() => (secili = "tumu")}>{dil.t("liste.tumu")}</button>
    {#each kategoriler as k}
      <button class:aktif={secili === k} onclick={() => (secili = k)}>
        <Ikon ad={kategoriIkon[k]} boyut={16} /> {dil.t(`kategori.${k}`)}
      </button>
    {/each}
  </div>

  <div class="arac-satiri">
    <label class="anahtar">
      <input type="checkbox" bind:checked={sadeceMusait} />
      <span>{dil.t("liste.sadeceMusait")}</span>
    </label>
    <span class="sonuc">{dil.t("liste.sonuc", { n: liste.length })}</span>
  </div>

  <div class="izgara">
    {#each liste as u (u.id)}
      <UstaKart usta={u} />
    {:else}
      <p class="bos">{dil.t("liste.bos")}</p>
    {/each}
  </div>
</div>

<style>
  .baslik h1 {
    margin: 0;
    font-size: 22px;
  }

  .baslik p {
    margin: 2px 0 0;
    color: var(--yazi-soluk);
    font-size: 14px;
  }

  .arama {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
  }

  .cipler {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .cipler button {
    flex-shrink: 0;
    padding: 8px 14px;
    border: 1px solid var(--kenar);
    border-radius: 999px;
    background: var(--kart);
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .cipler button.aktif {
    background: var(--renk-ana);
    border-color: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 600;
  }

  .arac-satiri {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .anahtar {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .anahtar input {
    width: 18px;
    height: 18px;
    accent-color: var(--renk-ana);
  }

  .sonuc {
    color: var(--yazi-soluk);
  }
</style>
