<script lang="ts">
  // Ana sayfa — selamlama ve semt, aktif iş bandı, acil kısayollar, filtreler, sıralama ve liste/harita görünümü
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import UstaKart from "$lib/components/UstaKart.svelte";
  import UstaHaritasi from "./UstaHaritasi.svelte";
  import { acilKisayollar, kategoriler, kategoriIkon, mesafeKm, sayiYaz, tarihYaz, ustaDurumu, ustalar, varisDk } from "$lib/data";
  import { takip } from "$lib/takip";
  import type { Anahtar } from "$lib/ceviriler";
  import { dil } from "$lib/i18n.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { oku, yaz } from "$lib/depo";
  import type { Kategori, Usta } from "../types/ustam";

  type Siralama = "onerilen" | "yakin" | "puan" | "fiyat";
  type Gorunum = "liste" | "harita";

  let secili = $state<Kategori | "tumu">("tumu");
  let arama = $state("");
  let sadeceMusait = $state(false);
  let sadeceFavori = $state(false);
  let dilimiKonusan = $state(false);
  let siralama = $state<Siralama>("onerilen");
  let gorunum = $state<Gorunum>(oku<Gorunum>("liste-gorunum", "liste"));
  let semtPenceresi = $state(false);

  const semt = $derived(profil.bilgi.semt);
  const musaitMi = (u: Usta) => ustaDurumu(u, saat.simdi).tur === "musait";

  // Önerilen sıralama: müsaitler önce; sonra puanı yüksek ve yakın olanlar
  const skor = (u: Usta) => yorumlarim.ustaIcin(u).puan * 2 - mesafeKm(u, semt) * 0.3;

  const filtreli = $derived.by(() => {
    const q = arama.trim().toLocaleLowerCase(dil.kod);
    return ustalar.filter((u) => {
      if (secili !== "tumu" && u.kategori !== secili) return false;
      if (sadeceMusait && !musaitMi(u)) return false;
      if (sadeceFavori && !favoriler.var(u.id)) return false;
      if (dilimiKonusan && !u.diller.includes(dil.kod)) return false;
      if (!q) return true;
      const metin = [u.ad, u.semt, dil.t(`kategori.${u.kategori}`), dil.tr(`kategori.${u.kategori}`)].join(" ");
      return metin.toLocaleLowerCase(dil.kod).includes(q);
    });
  });

  const liste = $derived(
    [...filtreli].sort((a, b) => {
      if (siralama === "yakin") return mesafeKm(a, semt) - mesafeKm(b, semt);
      if (siralama === "puan") return yorumlarim.ustaIcin(b).puan - yorumlarim.ustaIcin(a).puan;
      if (siralama === "fiyat") return a.cikisUcreti - b.cikisUcreti;
      return Number(musaitMi(b)) - Number(musaitMi(a)) || skor(b) - skor(a);
    }),
  );

  const filtreVar = $derived(secili !== "tumu" || sadeceMusait || sadeceFavori || dilimiKonusan || arama.trim() !== "");

  // Her acil kısayol için en yakın müsait usta
  const acilSecenekler = $derived(
    acilKisayollar.map((k) => {
      const enYakin = ustalar
        .filter((u) => u.kategori === k.kategori && musaitMi(u))
        .sort((a, b) => mesafeKm(a, semt) - mesafeKm(b, semt))[0];
      return { ...k, usta: enYakin, dk: enYakin ? varisDk(mesafeKm(enYakin, semt)) : null };
    }),
  );

  // En yeni aktif işin canlı aşaması (takip.ts) — banttaki metin aşamaya göre değişir
  const aktifIs = $derived(isEmirleri.aktifler[0]);
  const aktifMetin = $derived.by(() => {
    if (!aktifIs) return "";
    const t = takip(aktifIs, saat.simdi);
    if (t.asama === "yolda") return dil.t("liste.aktifYolda", { usta: aktifIs.ustaAd, dk: sayiYaz(t.kalanDk, dil.kod) });
    if (aktifIs.aciliyet !== "hemen" && t.asama !== "kapida")
      return dil.t("liste.aktifRandevu", { usta: aktifIs.ustaAd, zaman: tarihYaz(aktifIs.zaman, dil.kod) });
    return `${aktifIs.ustaAd} · ${dil.t(`asama.${t.asama}`)}`;
  });

  const sayi = (k: Kategori | "tumu") => (k === "tumu" ? ustalar.length : ustalar.filter((u) => u.kategori === k).length);

  function gorunumSec(g: Gorunum) {
    gorunum = g;
    yaz("liste-gorunum", g);
  }

  function filtreleriTemizle() {
    secili = "tumu";
    arama = "";
    sadeceMusait = sadeceFavori = dilimiKonusan = false;
  }
</script>

<section class="karsilama">
  <div class="ic">
    <p class="merhaba">{profil.bilgi.ad ? dil.t("liste.merhabaAd", { ad: profil.bilgi.ad.split(" ")[0] }) : dil.t("liste.merhaba")}</p>
    <h1>{dil.t("liste.soru")}</h1>
    <button class="semt-dugme" onclick={() => (semtPenceresi = true)} aria-label={dil.t("liste.konumSec")}>
      <Ikon ad="konum" boyut={16} />
      <span>{semt}</span>
      <Ikon ad="ok-sag" boyut={14} />
    </button>
  </div>
</section>

<div class="sayfa">
  {#if aktifIs}
    <a class="aktif-is" href="/is-emirlerim">
      <span class="nabiz" aria-hidden="true"></span>
      <span class="metin">{aktifMetin}</span>
      <code dir="ltr">{aktifIs.kod}</code>
      <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={18} />
    </a>
  {/if}

  <section class="acil">
    <h2><Ikon ad="roket" boyut={18} /> {dil.t("liste.acilBaslik")}</h2>
    <div class="acil-izgara">
      {#each acilSecenekler as a}
        {#if a.usta}
          <a class="kart acil-kart" href="/usta/{a.usta.id}?sorun={a.sorun}&aciliyet=hemen">
            <span class="acil-ikon"><Ikon ad={kategoriIkon[a.kategori]} boyut={22} /></span>
            <span class="acil-ad">{dil.t(`sorun.${a.sorun}` as Anahtar)}</span>
            <span class="acil-eta"><Ikon ad="saat" boyut={13} /> {dil.t("kart.dk", { dk: sayiYaz(a.dk ?? 0, dil.kod) })}</span>
          </a>
        {:else}
          <div class="kart acil-kart pasif">
            <span class="acil-ikon"><Ikon ad={kategoriIkon[a.kategori]} boyut={22} /></span>
            <span class="acil-ad">{dil.t(`sorun.${a.sorun}` as Anahtar)}</span>
            <span class="acil-eta">{dil.t("liste.acilYok")}</span>
          </div>
        {/if}
      {/each}
    </div>
  </section>

  <label class="arama">
    <Ikon ad="ara" boyut={18} />
    <span class="gorunmez">{dil.t("liste.arama")}</span>
    <input type="search" placeholder={dil.t("liste.arama")} bind:value={arama} />
  </label>

  <div class="cipler" role="group" aria-label={dil.t("liste.baslik")}>
    {#each ["tumu", ...kategoriler] as const as k}
      <button class:aktif={secili === k} aria-pressed={secili === k} onclick={() => (secili = k)}>
        {#if k !== "tumu"}<Ikon ad={kategoriIkon[k]} boyut={16} />{/if}
        {k === "tumu" ? dil.t("liste.tumu") : dil.t(`kategori.${k}`)}
        <span class="adet">{sayi(k)}</span>
      </button>
    {/each}
  </div>

  <div class="arac-satiri">
    <div class="anahtarlar">
      <button class="anahtar" class:aktif={sadeceMusait} aria-pressed={sadeceMusait} onclick={() => (sadeceMusait = !sadeceMusait)}>
        <Ikon ad="onay" boyut={14} /> {dil.t("liste.sadeceMusait")}
      </button>
      <button class="anahtar" class:aktif={sadeceFavori} aria-pressed={sadeceFavori} onclick={() => (sadeceFavori = !sadeceFavori)}>
        <Ikon ad="kalp" boyut={14} dolu={sadeceFavori} /> {dil.t("liste.favoriler")}
      </button>
      {#if dil.kod !== "tr"}
        <button class="anahtar" class:aktif={dilimiKonusan} aria-pressed={dilimiKonusan} onclick={() => (dilimiKonusan = !dilimiKonusan)}>
          <Ikon ad="dil" boyut={14} /> {dil.t("liste.dilimiKonusan")}
        </button>
      {/if}
    </div>

    <div class="sag-araclar">
      <label class="siralama">
        <Ikon ad="sirala" boyut={16} />
        <span class="gorunmez">{dil.t("liste.sirala")}</span>
        <select bind:value={siralama}>
          {#each ["onerilen", "yakin", "puan", "fiyat"] as const as s}
            <option value={s}>{dil.t(`sirala.${s}`)}</option>
          {/each}
        </select>
      </label>
      <div class="gorunum" role="group" aria-label={dil.t("liste.gorunum")}>
        <button class:aktif={gorunum === "liste"} aria-pressed={gorunum === "liste"} onclick={() => gorunumSec("liste")}>
          <Ikon ad="liste" boyut={16} /> <span>{dil.t("liste.liste")}</span>
        </button>
        <button class:aktif={gorunum === "harita"} aria-pressed={gorunum === "harita"} onclick={() => gorunumSec("harita")}>
          <Ikon ad="harita" boyut={16} /> <span>{dil.t("liste.harita")}</span>
        </button>
      </div>
    </div>
  </div>

  <p class="sonuc" aria-live="polite">
    {dil.t("liste.sonuc", { n: sayiYaz(liste.length, dil.kod) })}
    {#if filtreVar}· <button class="temizle" onclick={filtreleriTemizle}>{dil.t("liste.filtreTemizle")}</button>{/if}
  </p>

  {#if gorunum === "harita"}
    <UstaHaritasi ustalar={liste} />
  {:else}
    <div class="izgara">
      {#each liste as u (u.id)}
        <UstaKart usta={u} />
      {:else}
        <p class="bos">{dil.t("liste.bos")}</p>
      {/each}
    </div>
  {/if}
</div>

<Pencere bind:acik={semtPenceresi} baslik={dil.t("liste.konumSec")} kapatEtiketi={dil.t("genel.kapat")}>
  <SemtSecici
    secili={semt}
    sec={(s) => {
      profil.guncelle({ semt: s });
      semtPenceresi = false;
    }}
  />
</Pencere>

<style>
  .karsilama {
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
    border-radius: 0 0 var(--radius-buyuk) var(--radius-buyuk);
  }

  .karsilama .ic {
    max-width: 1200px;
    margin-inline: auto;
    padding: 8px 16px 22px;
  }

  .merhaba {
    margin: 0;
    font-size: 15px;
    opacity: 0.8;
  }

  h1 {
    margin: 2px 0 12px;
    font-size: 26px;
    letter-spacing: -0.5px;
  }

  .semt-dugme {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 999px;
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    font-weight: 600;
  }

  :global([dir="rtl"]) .semt-dugme :global(.ikon:last-child) {
    transform: scaleX(-1);
  }

  .aktif-is {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--basari-yumusak);
    color: var(--basari);
    font-weight: 600;
    font-size: 14px;
  }

  .aktif-is .metin {
    flex: 1;
  }

  .aktif-is code {
    font-size: 12px;
    opacity: 0.85;
  }

  .nabiz {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--basari);
    animation: nabiz 1.4s ease-in-out infinite;
  }

  .acil h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 10px;
    font-size: 16px;
  }

  .acil-izgara {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .acil-kart {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    transition:
      transform var(--sure-hizli) var(--egri),
      border-color var(--sure-hizli);
  }

  .acil-kart:not(.pasif):hover {
    border-color: var(--renk-ana);
    transform: translateY(-2px);
  }

  .acil-kart.pasif {
    opacity: 0.55;
  }

  .acil-ikon {
    display: flex;
    width: fit-content;
    padding: 8px;
    border-radius: 12px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .acil-ad {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
  }

  .acil-eta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .arama {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi-soluk);
  }

  .arama:focus-within {
    border-color: var(--renk-ana);
  }

  .arama input {
    flex: 1;
    min-width: 0;
    padding: 13px 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--yazi);
  }

  .cipler {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: -16px;
    padding-inline: 16px;
  }

  .cipler button,
  .anahtar {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--kenar);
    border-radius: 999px;
    background: var(--kart);
    font-size: 13px;
    color: var(--yazi-soluk);
    transition: background var(--sure-hizli) var(--egri);
  }

  .cipler button.aktif {
    background: var(--renk-ana);
    border-color: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 600;
  }

  .adet {
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--zemin);
    color: var(--yazi-soluk);
    font-size: 11px;
    font-weight: 700;
    text-align: center;
  }

  .cipler button.aktif .adet {
    background: var(--koyu-cam);
    color: var(--renk-ana-ustu);
  }

  .arac-satiri {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .anahtarlar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .anahtar.aktif {
    border-color: var(--renk-ana);
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
    font-weight: 600;
  }

  .sag-araclar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .siralama {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
    color: var(--yazi-soluk);
  }

  .siralama select {
    padding: 8px 0;
    border: 0;
    background: transparent;
    font-size: 13px;
    color: var(--yazi);
  }

  .gorunum {
    display: flex;
    padding: 3px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
  }

  .gorunum button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border: 0;
    border-radius: 7px;
    background: none;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .gorunum button.aktif {
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 600;
  }

  .sonuc {
    margin: -4px 0 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .temizle {
    padding: 0;
    border: 0;
    background: none;
    color: var(--renk-ana-yazi);
    font-weight: 600;
    font-size: 13px;
  }

  @media (max-width: 420px) {
    .gorunum button span {
      display: none;
    }
  }

  @media (min-width: 768px) {
    .acil-izgara {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .karsilama .ic {
      padding: 16px 24px 28px;
    }
  }

  @keyframes nabiz {
    50% {
      opacity: 0.35;
      transform: scale(0.8);
    }
  }
</style>
