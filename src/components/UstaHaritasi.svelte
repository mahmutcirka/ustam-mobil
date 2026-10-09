<script lang="ts">
  // Stilize İstanbul haritası — Boğaz, iki yaka, semtler, usta pinleri ve kullanıcının konumu.
  // Harici harita kütüphanesi yoktur; koordinatlar data.ts'teki semtler ve usta konumlarıyla aynı sistemdedir.
  import Ikon from "$lib/components/Ikon.svelte";
  import Yildizlar from "$lib/components/Yildizlar.svelte";
  import { basHarfler, mesafeKm, sayiYaz, semtler, semtListesi, ustaDurumu, varisDk } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import type { Usta } from "../lib/types";

  let { ustalar, sorun, listeyeDon }: { ustalar: Usta[]; sorun?: string; listeyeDon: () => void } = $props();

  let seciliId = $state<number | null>(null);
  const secili = $derived(ustalar.find((u) => u.id === seciliId));
  const ben = $derived(semtler[profil.bilgi.semt]);
  const musait = (u: Usta) => ustaDurumu(u, saat.simdi).tur === "musait";
  // Seçili pin en üstte çizilsin; müsaitler meşgullerin üstünde
  const sirali = $derived([...ustalar].sort((a, b) => Number(a.id === seciliId) - Number(b.id === seciliId) || Number(musait(a)) - Number(musait(b))));

  // Kara parçaları: Boğaz'ın batı ve doğu kıyıları + Marmara kıyı şeridi
  const avrupa =
    "M0 6 L20 3 L45 4 L69.5 1 L63.5 14 L61.5 28 L57.5 42 L52.5 56 L47.5 68 L44 77 L38 79.5 L25 83.5 L12 87.5 L0 89.5 Z";
  const asya =
    "M74.5 1 L85 3 L100 4 L100 100 L88 96 L76 92 L64 86 L54 80 L49 77.5 L52.5 68 L57.5 56 L62.5 42 L66.5 28 L68.5 14 Z";

  function sec(id: number) {
    seciliId = seciliId === id ? null : id;
  }
</script>

<div class="harita-kutu">
  <!-- Coğrafya RTL dillerde aynalanmaz -->
  <div class="tuval" dir="ltr">
    <svg viewBox="0 0 100 110" role="group" aria-label={dil.t("harita.etiket")}>
      <rect width="100" height="110" class="su" />
      <path d={avrupa} class="kara" />
      <path d={asya} class="kara" />
      <ellipse cx="70" cy="101" rx="2.6" ry="1.6" class="kara" />
      <ellipse cx="75" cy="104.5" rx="1.8" ry="1.1" class="kara" />

      <text x="16" y="34" class="yaka">{dil.t("harita.avrupa")}</text>
      <text x="86" y="44" class="yaka" text-anchor="middle">{dil.t("harita.asya")}</text>

      {#each semtListesi as s}
        <text x={semtler[s].x} y={semtler[s].y + 5.4} class="semt" text-anchor="middle">{s}</text>
      {/each}

      <g class="ben" aria-label={dil.t("harita.sen")}>
        <circle cx={ben.x} cy={ben.y} r="4.5" class="ben-halka" />
        <circle cx={ben.x} cy={ben.y} r="1.8" class="ben-nokta" />
      </g>

      {#each sirali as u (u.id)}
        <g
          class="pin"
          class:musait={musait(u)}
          class:secili={u.id === seciliId}
          role="button"
          tabindex="0"
          aria-label="{u.ad}, {dil.t(`kategori.${u.kategori}`)}"
          aria-pressed={u.id === seciliId}
          onclick={() => sec(u.id)}
          onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), sec(u.id))}
        >
          <!-- Görünmez geniş dokunma alanı -->
          <circle cx={u.konum.x} cy={u.konum.y} r="5" class="dokunma" />
          <circle cx={u.konum.x} cy={u.konum.y} r={u.id === seciliId ? 3.4 : 2.4} class="nokta" />
          {#if u.id === seciliId && musait(u)}
            <g class="etiket">
              <rect x={u.konum.x - 7} y={u.konum.y - 10.5} width="14" height="5.5" rx="2.75" />
              <text x={u.konum.x} y={u.konum.y - 6.6} text-anchor="middle">
                ~{sayiYaz(varisDk(mesafeKm(u, profil.bilgi.semt)), dil.kod)}′
              </text>
            </g>
          {/if}
        </g>
      {/each}
    </svg>

    <button class="liste-dugme" onclick={listeyeDon}>
      <Ikon ad="liste" boyut={16} /> {dil.t("harita.listeyeDon")}
    </button>
  </div>

  {#if secili}
    {@const km = mesafeKm(secili, profil.bilgi.semt)}
    {@const ozet = yorumlarim.ustaIcin(secili)}
    <div class="kart secim">
      <span class="avatar" aria-hidden="true">{basHarfler(secili.ad)}</span>
      <div class="bilgi">
        <strong>{secili.ad}</strong>
        <span>{dil.t(`kategori.${secili.kategori}`)} · {secili.semt}</span>
        <span class="puan"><Yildizlar puan={ozet.puan} boyut={12} /> {sayiYaz(ozet.puan, dil.kod)}</span>
        <span class:yesil={musait(secili)}>
          {#if musait(secili)}{dil.t("kart.simdiGelebilir", { dk: sayiYaz(varisDk(km), dil.kod) })}
          {:else}{dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}{/if}
        </span>
      </div>
      <a class="btn kucuk" href={sorun ? `/usta/${secili.id}?sorun=${sorun}` : `/usta/${secili.id}`}>{dil.t("harita.profil")}</a>
    </div>
  {/if}
</div>

<style>
  .harita-kutu {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tuval {
    position: relative;
  }

  svg {
    display: block;
    width: 100%;
    max-height: 70dvh;
    border-radius: var(--radius-buyuk);
    border: 1px solid var(--kenar);
  }

  .su {
    fill: var(--su);
  }

  .kara {
    fill: var(--kara);
    stroke: var(--kenar);
    stroke-width: 0.3;
  }

  .yaka {
    fill: var(--yazi-soluk);
    font-size: 3px;
    font-weight: 700;
    opacity: 0.55;
  }

  .semt {
    fill: var(--yazi-soluk);
    font-size: 2.4px;
    font-weight: 600;
    pointer-events: none;
  }

  .ben-halka {
    fill: var(--basari);
    opacity: 0.25;
    transform-box: fill-box;
    transform-origin: center;
    animation: nabiz 1.8s var(--egri) infinite;
  }

  .ben-nokta {
    fill: var(--basari);
    stroke: var(--kart);
    stroke-width: 0.6;
  }

  .pin {
    cursor: pointer;
    outline: none;
  }

  .dokunma {
    fill: transparent;
  }

  .nokta {
    fill: var(--yazi-soluk);
    stroke: var(--kart);
    stroke-width: 0.7;
    transition: r var(--sure-hizli) var(--egri);
  }

  .pin.musait .nokta {
    fill: var(--renk-ana);
  }

  .pin.secili .nokta,
  .pin:focus-visible .nokta {
    stroke: var(--yazi);
    stroke-width: 0.9;
  }

  .etiket rect {
    fill: var(--yazi);
  }

  .etiket text {
    fill: var(--zemin);
    font-size: 3px;
    font-weight: 700;
  }

  .liste-dugme {
    position: absolute;
    top: 10px;
    inset-inline-start: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--kenar);
    border-radius: 999px;
    background: var(--kart);
    box-shadow: var(--golge-kart);
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .secim {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    box-shadow: var(--golge-yuksek);
    animation: sayfa-gir var(--sure-orta) var(--egri);
  }

  .avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    background: var(--yuzey-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .bilgi {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .bilgi strong {
    font-size: var(--yz-md);
    color: var(--yazi);
  }

  .puan {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .yesil {
    color: var(--basari);
    font-weight: 700;
  }

  /* Telefonda seçili usta kartı haritanın alt kenarında, başparmak erişiminde durur */
  @media (max-width: 767px) {
    .harita-kutu {
      position: relative;
    }

    .secim {
      position: sticky;
      bottom: calc(76px + env(safe-area-inset-bottom));
      z-index: 2;
      margin-top: -84px;
      margin-inline: 8px;
    }
  }

  @keyframes nabiz {
    0% {
      transform: scale(0.6);
      opacity: 0.45;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
</style>
