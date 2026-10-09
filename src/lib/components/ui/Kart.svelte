<script lang="ts">
  // Genel liste kartı — uygulamanın veri tiplerini tanımaz; yalnız KartGirdisi alır (src/lib/types/ui.ts).
  // Kartın tamamı tek bir bağlantı ya da düğmedir (başlık öğesinin ::after katmanı); "eylem" ve "children"
  // içindeki düğmeler bu katmanın üstünde kalır. Tab ile başlığa odaklanır, Enter ile açılır.
  import type { Snippet } from "svelte";
  import Ikon from "../Ikon.svelte";
  import Yildizlar from "../Yildizlar.svelte";
  import type { KartGirdisi } from "../../types";

  let {
    baslik,
    altMetin,
    gorsel,
    etiket,
    etiketTuru = "bilgi",
    href,
    puan,
    bilgiler = [],
    deger,
    soluk = false,
    onclick,
    baslikEki,
    eylem,
    children,
  }: KartGirdisi & {
    /** href yoksa kartın tıklama olayı */
    onclick?: () => void;
    /** Başlığın hemen yanında küçük içerik (ör. doğrulanmış ikonu) */
    baslikEki?: Snippet;
    /** Sağ üst köşedeki ayrı eylem (ör. favori düğmesi) */
    eylem?: Snippet;
    /** Kartın altına eklenen içerik */
    children?: Snippet;
  } = $props();

  const etkilesimli = $derived(!!href || !!onclick);
</script>

<article class="kart genel-kart" class:etkilesimli class:basilabilir={etkilesimli}>
  <div class="ust">
    {#if gorsel}
      <div class="gorsel" class:soluk>
        {#if gorsel.src}
          <img src={gorsel.src} alt={gorsel.alt} loading="lazy" />
        {:else}
          <span class="harfler" role="img" aria-label={gorsel.alt}>{gorsel.harfler ?? ""}</span>
        {/if}
        {#if gorsel.ikon}
          <span class="kose" aria-hidden="true"><Ikon ad={gorsel.ikon} boyut={12} /></span>
        {/if}
      </div>
    {/if}

    <div class="govde">
      <h3>
        {#if href}
          <a {href} class="baslik">{baslik}</a>
        {:else if onclick}
          <button type="button" class="baslik" {onclick}>{baslik}</button>
        {:else}
          <span class="baslik">{baslik}</span>
        {/if}
        {#if baslikEki}<span class="ek">{@render baslikEki()}</span>{/if}
      </h3>
      {#if altMetin}<p class="alt-metin">{altMetin}</p>{/if}
      {#if puan}
        <p class="puan">
          <Yildizlar puan={puan.deger} boyut={13} />
          <span>{puan.metin}</span>
        </p>
      {/if}
    </div>

    {#if eylem}<div class="eylem">{@render eylem()}</div>{/if}
  </div>

  {#if etiket}
    <p class="etiket {etiketTuru}">
      <span class="nokta" aria-hidden="true"></span>
      {etiket}
    </p>
  {/if}

  {#if bilgiler.length || deger}
    <div class="bilgiler">
      {#each bilgiler as b}
        {#if b.kutulu}
          <abbr class="kutu" class:vurgulu={b.vurgulu} title={b.ipucu}>{b.metin}</abbr>
        {:else}
          <span class="bilgi" class:vurgulu={b.vurgulu} title={b.ipucu}>
            {#if b.ikon}<Ikon ad={b.ikon} boyut={14} />{/if}
            {b.metin}
          </span>
        {/if}
      {/each}
      {#if deger}<strong class="deger">{deger}</strong>{/if}
    </div>
  {/if}

  {#if children}<div class="ek-icerik">{@render children()}</div>{/if}
</article>

<style>
  .genel-kart {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--b-3);
    padding: var(--b-4);
    min-width: 0;
    transition:
      border-color var(--sure-hizli) var(--egri),
      transform var(--sure-hizli) var(--egri);
  }

  @media (hover: hover) {
    .genel-kart.etkilesimli:hover {
      border-color: var(--yazi-soluk);
    }
  }

  .ust {
    display: flex;
    align-items: flex-start;
    gap: var(--b-3);
  }

  /* Görsel — RTL'de kendiliğinden sağa geçer (flex sırası); köşe ikonu mantıksal konumla */
  .gorsel {
    position: relative;
    flex-shrink: 0;
    width: var(--kart-gorsel);
    height: var(--kart-gorsel);
  }

  .gorsel.soluk img,
  .gorsel.soluk .harfler {
    opacity: 0.7;
  }

  img,
  .harfler {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: var(--radius);
    object-fit: cover;
    background: var(--yuzey-2);
    color: var(--yazi);
    font-size: var(--yz-lg);
    font-weight: 800;
  }

  .kose {
    position: absolute;
    bottom: calc(var(--b-1) * -1);
    inset-inline-end: calc(var(--b-1) * -1);
    display: flex;
    padding: var(--b-1);
    border: 2px solid var(--kart);
    border-radius: var(--radius-hap);
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .govde {
    flex: 1;
    min-width: 0;
  }

  h3 {
    display: flex;
    align-items: flex-start;
    gap: var(--b-1);
    margin: 0;
    font-size: var(--yz-md);
    line-height: 1.3;
  }

  /* Uzun başlık: en çok iki satır, kelime ortasından da kırılabilir (taşma yok) */
  .baslik {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    min-width: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    text-decoration: none;
  }

  /* Kartın tamamını tıklanabilir yapan katman; eylem ve ek içerik bunun üstünde (z-index) kalır */
  a.baslik::after,
  button.baslik::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--radius);
  }

  a.baslik:focus-visible,
  button.baslik:focus-visible {
    outline: none;
  }

  a.baslik:focus-visible::after,
  button.baslik:focus-visible::after {
    outline: 2px solid var(--renk-ana);
    outline-offset: 2px;
  }

  .ek {
    display: inline-flex;
    flex-shrink: 0;
    padding-top: calc(var(--b-1) / 2);
  }

  p {
    margin: 0;
  }

  .alt-metin {
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
    overflow-wrap: anywhere;
  }

  .puan {
    display: flex;
    align-items: center;
    gap: var(--b-1);
    margin-top: var(--b-1);
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .eylem,
  .ek-icerik {
    position: relative;
    z-index: 1;
  }

  .eylem {
    margin: calc(var(--b-2) * -1);
  }

  .ek-icerik {
    align-self: flex-start;
  }

  /* children verilmiş ama içi koşula bağlı olarak boşsa boşluk bırakmasın */
  .ek-icerik:empty {
    display: none;
  }

  /* Etiket — kartın en belirgin satırı; türü renkten değil metinden de anlaşılır */
  .etiket {
    display: flex;
    align-items: center;
    gap: var(--b-2);
    padding: var(--b-2) var(--b-3);
    border-radius: var(--radius-kucuk);
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .etiket.bilgi {
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
  }

  .etiket.basari {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .etiket.uyari {
    background: var(--vurgu-yumusak);
    color: var(--yazi);
  }

  .etiket.hata {
    background: var(--hata-yumusak);
    color: var(--hata);
  }

  .nokta {
    width: var(--b-2);
    height: var(--b-2);
    flex-shrink: 0;
    border-radius: var(--radius-hap);
    background: currentColor;
  }

  .etiket.uyari .nokta {
    background: var(--vurgu);
  }

  .etiket.basari .nokta {
    box-shadow: 0 0 0 3px var(--basari-yumusak);
    animation: nabiz 2s ease-in-out infinite;
  }

  .bilgiler {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--b-1) var(--b-3);
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .bilgi {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--b-1) / 2);
  }

  .kutu {
    padding: 0 var(--b-1);
    border: 1px solid var(--kenar);
    border-radius: var(--radius-mini);
    font-size: var(--yz-xs);
    font-weight: 700;
    text-decoration: none;
  }

  .vurgulu {
    color: var(--basari);
  }

  .kutu.vurgulu {
    border-color: var(--basari);
  }

  .deger {
    margin-inline-start: auto;
    color: var(--yazi);
  }

  @keyframes nabiz {
    50% {
      box-shadow: 0 0 0 5px transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .etiket.basari .nokta {
      animation: none;
    }
  }
</style>
