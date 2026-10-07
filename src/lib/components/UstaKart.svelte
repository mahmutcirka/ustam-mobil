<script lang="ts">
  // Usta kartı — ilk bakışta: kim, ne iş yapar, güvenilir mi, ne kadar uzakta, ne zaman gelir, yaklaşık ne tutar.
  // Kartın tamamı detaya gider (aranan sorun varsa önceden seçili); kalp ve "Neden?" ayrı düğmelerdir.
  import Ikon from "./Ikon.svelte";
  import Yildizlar from "./Yildizlar.svelte";
  import type { Usta } from "../../types/ustam";
  import { basHarfler, kategoriIkon, mesafeKm, paraYaz, sayiYaz, ustaDurumu, varisDk } from "$lib/data";
  import { dil, dilAdlari } from "$lib/i18n.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { bildirim } from "$lib/bildirim.svelte";

  let {
    usta: u,
    sorun,
    nedenAc,
  }: { usta: Usta; sorun?: string; nedenAc?: (u: Usta) => void } = $props();

  const km = $derived(mesafeKm(u, profil.bilgi.semt));
  const durum = $derived(ustaDurumu(u, saat.simdi));
  const ozet = $derived(yorumlarim.ustaIcin(u));
  const favori = $derived(favoriler.var(u.id));
  const baglanti = $derived(sorun ? `/usta/${u.id}?sorun=${sorun}` : `/usta/${u.id}`);
  const guvenRozetleri = $derived(u.rozetler.filter((r) => r === "sigortali" || r === "7-24"));

  function favoriDegistir() {
    const eklendi = favoriler.degistir(u.id);
    bildirim.goster(dil.t(eklendi ? "kart.favoriEklendi" : "kart.favoriCikarildi", { ad: u.ad }), "bilgi", 2000);
  }
</script>

<article class="kart usta basilabilir" class:pasif={durum.tur !== "musait"}>
  <div class="ust">
    <div class="avatar" aria-hidden="true">
      {basHarfler(u.ad)}
      <span class="kategori"><Ikon ad={kategoriIkon[u.kategori]} boyut={12} /></span>
    </div>
    <div class="kimlik">
      <h3>
        <a href={baglanti} class="kart-baglanti">{u.ad}</a>
        {#if u.rozetler.includes("dogrulanmis")}
          <span class="dogrulanmis"><Ikon ad="kalkan" boyut={15} etiket={dil.t("rozet.dogrulanmis")} /></span>
        {/if}
      </h3>
      <p class="alt">{dil.t(`kategori.${u.kategori}`)} · {u.semt}</p>
      <p class="puan">
        <Yildizlar puan={ozet.puan} boyut={13} />
        <b>{sayiYaz(ozet.puan, dil.kod)}</b>
        <span>({sayiYaz(ozet.sayi, dil.kod)})</span>
      </p>
    </div>
    <button
      class="favori"
      class:aktif={favori}
      onclick={favoriDegistir}
      aria-pressed={favori}
      aria-label={dil.t(favori ? "kart.favoriCikar" : "kart.favoriEkle")}
    >
      <Ikon ad="kalp" boyut={20} dolu={favori} />
    </button>
  </div>

  <p class="durum {durum.tur}">
    <span class="nokta" aria-hidden="true"></span>
    {#if durum.tur === "musait"}{dil.t("kart.simdiGelebilir", { dk: sayiYaz(varisDk(km), dil.kod) })}
    {:else if durum.tur === "mesgul" && durum.dk}{dil.t("kart.mesgulSonra", { dk: sayiYaz(durum.dk, dil.kod) })}
    {:else if durum.tur === "mesgul"}{dil.t("kart.mesgul")}
    {:else}{dil.t("kart.kapali", { saat: durum.acilis })}{/if}
  </p>

  <div class="alt-satir">
    <span class="bilgi"><Ikon ad="konum" boyut={14} /> {dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}</span>
    <span class="diller">
      {#each u.diller as d}
        <abbr title={dilAdlari[d]} class:sizin={d === dil.kod && d !== "tr"}>{d.toUpperCase()}</abbr>
      {/each}
    </span>
    {#each guvenRozetleri as r}
      <span class="guven">{dil.t(`rozet.${r}`)}</span>
    {/each}
    <strong class="fiyat">{dil.t("kart.cikisDan", { tutar: paraYaz(u.cikisUcreti, dil.kod) })}</strong>
  </div>

  {#if nedenAc}
    <button class="neden" onclick={() => nedenAc(u)}>
      <Ikon ad="bilgi" boyut={14} /> {dil.t("neden.ac")}
    </button>
  {/if}
</article>

<style>
  .usta {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    transition:
      border-color var(--sure-hizli) var(--egri),
      box-shadow var(--sure-hizli) var(--egri),
      transform var(--sure-hizli) var(--egri);
  }

  @media (hover: hover) {
    .usta:hover {
      border-color: var(--yazi-soluk);
    }
  }

  .usta.pasif .avatar {
    opacity: 0.7;
  }

  /* Kartın tamamını tıklanabilir yapan bağlantı katmanı; düğmeler bunun üstünde kalır */
  .kart-baglanti::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--radius);
  }

  .kart-baglanti:focus-visible {
    outline: none;
  }

  .kart-baglanti:focus-visible::after {
    outline: 2px solid var(--renk-ana);
    outline-offset: 2px;
  }

  .ust {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .avatar {
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: var(--yuzey-2);
    color: var(--yazi);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--yz-lg);
    font-weight: 800;
  }

  .kategori {
    position: absolute;
    bottom: -3px;
    inset-inline-end: -3px;
    display: flex;
    padding: 4px;
    border-radius: 50%;
    border: 2px solid var(--kart);
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .kimlik {
    flex: 1;
    min-width: 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-size: var(--yz-md);
    line-height: 1.3;
  }

  .dogrulanmis {
    display: inline-flex;
    color: var(--basari);
  }

  p {
    margin: 0;
  }

  .alt {
    margin-top: 1px;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .puan {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .puan b {
    color: var(--yazi);
  }

  .favori {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--dokunma);
    height: var(--dokunma);
    margin: -10px;
    border: 0;
    border-radius: 50%;
    background: none;
    color: var(--yazi-soluk);
  }

  .favori:active {
    transform: scale(0.85);
  }

  .favori.aktif {
    color: var(--hata);
  }

  /* Müsaitlik — kartın en belirgin satırı */
  .durum {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--radius-kucuk);
    background: var(--yuzey-2);
    font-size: var(--yz-sm);
    font-weight: 700;
    color: var(--yazi-soluk);
  }

  .durum.musait {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .durum.kapali {
    background: var(--vurgu-yumusak);
    color: var(--yazi);
  }

  .nokta {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: currentColor;
  }

  .durum.musait .nokta {
    box-shadow: 0 0 0 3px var(--basari-yumusak);
    animation: nabiz 2s ease-in-out infinite;
  }

  .alt-satir {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .bilgi {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .diller {
    display: inline-flex;
    gap: 3px;
  }

  abbr {
    padding: 0 5px;
    border: 1px solid var(--kenar);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
  }

  abbr.sizin {
    border-color: var(--basari);
    color: var(--basari);
  }

  .guven {
    font-size: var(--yz-xs);
    font-weight: 600;
  }

  .fiyat {
    margin-inline-start: auto;
    color: var(--yazi);
    font-size: var(--yz-sm);
  }

  .neden {
    position: relative;
    z-index: 1;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    padding: 0 10px;
    border: 1px dashed var(--kenar);
    border-radius: 999px;
    background: var(--kart);
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
    font-weight: 600;
  }

  @keyframes nabiz {
    50% {
      box-shadow: 0 0 0 5px transparent;
    }
  }
</style>
