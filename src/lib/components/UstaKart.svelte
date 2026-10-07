<script lang="ts">
  // Liste ekranındaki usta kartı — kartın tamamı detaya gider, kalp düğmesi favoriyi değiştirir
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

  let { usta: u }: { usta: Usta } = $props();

  const km = $derived(mesafeKm(u, profil.bilgi.semt));
  const durum = $derived(ustaDurumu(u, saat.simdi));
  const ozet = $derived(yorumlarim.ustaIcin(u));
  const favori = $derived(favoriler.var(u.id));

  function favoriDegistir() {
    const eklendi = favoriler.degistir(u.id);
    bildirim.goster(dil.t(eklendi ? "kart.favoriEklendi" : "kart.favoriCikarildi", { ad: u.ad }), "bilgi", 2000);
  }
</script>

<article class="kart usta" class:pasif={durum.tur !== "musait"}>
  <div class="avatar" aria-hidden="true">
    {basHarfler(u.ad)}
    <span class="kategori"><Ikon ad={kategoriIkon[u.kategori]} boyut={13} /></span>
  </div>

  <div class="bilgi">
    <div class="satir">
      <h3>
        <a href="/usta/{u.id}" class="kart-baglanti">{u.ad}</a>
        {#if u.rozetler.includes("dogrulanmis")}
          <span class="dogrulanmis"><Ikon ad="kalkan" boyut={16} etiket={dil.t("rozet.dogrulanmis")} /></span>
        {/if}
      </h3>
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

    <p class="alt">{dil.t(`kategori.${u.kategori}`)} · {u.semt}</p>

    <p class="puan">
      <Yildizlar puan={ozet.puan} />
      <b>{sayiYaz(ozet.puan, dil.kod)}</b>
      <span>({sayiYaz(ozet.sayi, dil.kod)})</span>
    </p>

    <p class="meta">
      <span><Ikon ad="konum" boyut={14} /> {dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}</span>
      {#if durum.tur === "musait"}
        <span><Ikon ad="saat" boyut={14} /> {dil.t("kart.dk", { dk: sayiYaz(varisDk(km), dil.kod) })}</span>
      {/if}
      <span class="diller">
        {#each u.diller as d}
          <abbr title={dilAdlari[d]} class:sizin={d === dil.kod}>{d.toUpperCase()}</abbr>
        {/each}
      </span>
    </p>

    <div class="alt-satir">
      <strong>{dil.t("kart.cikis", { tutar: paraYaz(u.cikisUcreti, dil.kod) })}</strong>
      <span class="durum {durum.tur}">
        {#if durum.tur === "musait"}{dil.t("kart.musait")}
        {:else if durum.tur === "mesgul"}{dil.t("kart.mesgul")}
        {:else}{dil.t("kart.kapali", { saat: durum.acilis })}{/if}
      </span>
    </div>
  </div>
</article>

<style>
  .usta {
    position: relative;
    display: flex;
    gap: 14px;
    padding: 14px;
    transition:
      border-color var(--sure-hizli) var(--egri),
      transform var(--sure-hizli) var(--egri),
      box-shadow var(--sure-hizli) var(--egri);
  }

  .usta:hover {
    border-color: var(--renk-ana);
    transform: translateY(-2px);
    box-shadow: var(--golge-yuksek);
  }

  .usta.pasif .avatar {
    filter: grayscale(0.6);
  }

  /* Kartın tamamını tıklanabilir yapan bağlantı katmanı (kalp düğmesi bunun üstünde kalır) */
  .kart-baglanti::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--radius);
  }

  .avatar {
    position: relative;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .kategori {
    position: absolute;
    bottom: -4px;
    inset-inline-end: -4px;
    display: flex;
    padding: 4px;
    border-radius: 50%;
    border: 2px solid var(--kart);
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
  }

  .bilgi {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .satir {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-size: 17px;
  }

  .dogrulanmis {
    display: inline-flex;
    color: var(--basari);
  }

  .favori {
    position: relative;
    z-index: 1;
    display: flex;
    margin: -6px;
    padding: 6px;
    border: 0;
    border-radius: 50%;
    background: none;
    color: var(--yazi-soluk);
    transition: transform var(--sure-hizli) var(--egri);
  }

  .favori:active {
    transform: scale(0.85);
  }

  .favori.aktif {
    color: var(--hata);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .puan {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .puan b {
    color: var(--yazi);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
  }

  .meta > span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .diller {
    gap: 3px !important;
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

  .alt-satir {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  strong {
    font-size: 14px;
    color: var(--renk-ana-yazi);
  }

  .durum {
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    background: var(--kenar);
    color: var(--yazi-soluk);
    font-size: 11px;
    font-weight: 700;
  }

  .durum.musait {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .durum.kapali {
    background: var(--vurgu-yumusak);
    color: var(--yazi);
  }
</style>
