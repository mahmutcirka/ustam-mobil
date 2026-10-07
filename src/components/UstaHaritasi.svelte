<script lang="ts">
  // Stilize İstanbul haritası — Boğaz, iki yaka, semtler, usta pinleri ve kullanıcının konumu.
  // Harici harita kütüphanesi yoktur; koordinatlar data.ts'teki semtler ve usta konumlarıyla aynı sistemdedir.
  import Ikon from "$lib/components/Ikon.svelte";
  import Yildizlar from "$lib/components/Yildizlar.svelte";
  import { kategoriIkon, mesafeKm, sayiYaz, semtler, semtListesi, ustaDurumu, varisDk } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import type { Usta } from "../types/ustam";

  let { ustalar }: { ustalar: Usta[] } = $props();

  let seciliId = $state<number | null>(null);
  const secili = $derived(ustalar.find((u) => u.id === seciliId));
  const ben = $derived(semtler[profil.bilgi.semt]);

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
  <div dir="ltr">
  <svg viewBox="0 0 100 110" role="group" aria-label={dil.t("harita.etiket")}>
    <rect width="100" height="110" class="su" />
    <path d={avrupa} class="kara" />
    <path d={asya} class="kara" />
    <!-- Adalar -->
    <ellipse cx="70" cy="101" rx="2.6" ry="1.6" class="kara" />
    <ellipse cx="75" cy="104.5" rx="1.8" ry="1.1" class="kara" />

    <text x="16" y="34" class="yaka">{dil.t("harita.avrupa")}</text>
    <text x="86" y="44" class="yaka" text-anchor="middle">{dil.t("harita.asya")}</text>

    {#each semtListesi as s}
      <text x={semtler[s].x} y={semtler[s].y + 5.4} class="semt" text-anchor="middle">{s}</text>
    {/each}

    <!-- Kullanıcının semti -->
    <g class="ben" aria-label={dil.t("harita.sen")}>
      <circle cx={ben.x} cy={ben.y} r="4.5" class="ben-halka" />
      <circle cx={ben.x} cy={ben.y} r="1.8" class="ben-nokta" />
    </g>

    {#each ustalar as u (u.id)}
      {@const musait = ustaDurumu(u, saat.simdi).tur === "musait"}
      <g
        class="pin"
        class:musait
        class:secili={u.id === seciliId}
        role="button"
        tabindex="0"
        aria-label="{u.ad}, {dil.t(`kategori.${u.kategori}`)}"
        aria-pressed={u.id === seciliId}
        onclick={() => sec(u.id)}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), sec(u.id))}
      >
        <circle cx={u.konum.x} cy={u.konum.y} r={u.id === seciliId ? 3.6 : 2.6} />
      </g>
    {/each}
  </svg>
  </div>

  {#if secili}
    {@const km = mesafeKm(secili, profil.bilgi.semt)}
    {@const ozet = yorumlarim.ustaIcin(secili)}
    <div class="kart secim">
      <span class="ikon"><Ikon ad={kategoriIkon[secili.kategori]} boyut={22} /></span>
      <div class="bilgi">
        <strong>{secili.ad}</strong>
        <span>{dil.t(`kategori.${secili.kategori}`)} · {secili.semt}</span>
        <span class="puan"><Yildizlar puan={ozet.puan} boyut={12} /> {sayiYaz(ozet.puan, dil.kod)}</span>
        <span>
          {dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}
          {#if ustaDurumu(secili, saat.simdi).tur === "musait"}· {dil.t("kart.dk", { dk: sayiYaz(varisDk(km), dil.kod) })}{/if}
        </span>
      </div>
      <a class="btn" href="/usta/{secili.id}">{dil.t("harita.profil")}</a>
    </div>
  {/if}
</div>

<style>
  .harita-kutu {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  svg {
    width: 100%;
    max-height: 68vh;
    border-radius: var(--radius-buyuk);
    border: 1px solid var(--kenar);
    box-shadow: var(--golge-kart);
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
    letter-spacing: 0.2px;
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

  .pin circle {
    fill: var(--yazi-soluk);
    stroke: var(--kart);
    stroke-width: 0.7;
    transition: r var(--sure-hizli) var(--egri);
  }

  .pin.musait circle {
    fill: var(--renk-ana);
  }

  .pin.secili circle,
  .pin:focus-visible circle {
    stroke: var(--yazi);
    stroke-width: 0.9;
  }

  .secim {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    box-shadow: var(--golge-yuksek);
    animation: sayfa-gir var(--sure-orta) var(--egri);
  }

  .ikon {
    display: flex;
    padding: 10px;
    border-radius: 14px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .bilgi {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .bilgi strong {
    font-size: 15px;
    color: var(--yazi);
  }

  .puan {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .secim .btn {
    width: auto;
    padding: 10px 14px;
    font-size: 14px;
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
