<script lang="ts">
  // Ana sayfa — "Ne oldu?" acil kısayolları, sihirbaz, akıllı arama, kategori çipleri, filtre/sıralama panelleri,
  // liste ⇄ harita. Sıralama kuralı eslestirme.ts'te; arama arama.ts'te (ikisi de testli, saf modüller).
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import UstaKart from "$lib/components/UstaKart.svelte";
  import BosDurum from "$lib/components/BosDurum.svelte";
  import UstaHaritasi from "./UstaHaritasi.svelte";
  import ArizaSihirbazi from "./ArizaSihirbazi.svelte";
  import { acilKisayollar, basHarfler, kategoriler, kategoriIkon, mesafeKm, paraYaz, sayiYaz, tarihYaz, ustaDurumu, ustalar, varisDk } from "$lib/data";
  import { sorunAra, ustaEslesir, type SorunOnerisi } from "$lib/arama";
  import { oneriPuani, type NedenTuru } from "$lib/eslestirme";
  import { takip } from "$lib/takip";
  import type { Anahtar } from "$lib/ceviriler";
  import { dil, diller, dilAdlari } from "$lib/i18n.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { oku, yaz } from "$lib/depo";
  import type { Dil, Kategori, Usta } from "../types/ustam";

  type Siralama = "onerilen" | "yakin" | "puan" | "fiyat";
  type Gorunum = "liste" | "harita";
  interface Filtre {
    musait: boolean;
    favori: boolean;
    mesafe: number; // 0 = hepsi
    puan: number; // 0 = hepsi
    fiyat: number; // 0 = hepsi
    dil: Dil | "";
  }

  const BOS_FILTRE: Filtre = { musait: false, favori: false, mesafe: 0, puan: 0, fiyat: 0, dil: "" };
  const siralamalar: Siralama[] = ["onerilen", "yakin", "puan", "fiyat"];

  let kategori = $state<Kategori | "tumu">("tumu");
  let arama = $state("");
  let seciliSorun = $state<SorunOnerisi | null>(null);
  let filtre = $state<Filtre>({ ...BOS_FILTRE });
  let taslakFiltre = $state<Filtre>({ ...BOS_FILTRE });
  let siralama = $state<Siralama>("onerilen");
  let gorunum = $state<Gorunum>(oku<Gorunum>("liste-gorunum", "liste"));

  let semtPenceresi = $state(false);
  let filtrePenceresi = $state(false);
  let siralaPenceresi = $state(false);
  let sihirbazPenceresi = $state(false);
  let nedenUsta = $state<Usta | null>(null);
  let nedenPenceresi = $state(false);

  const semt = $derived(profil.bilgi.semt);
  const baglam = $derived({ semt, dil: dil.kod, simdi: saat.simdi });
  const musaitMi = (u: Usta) => ustaDurumu(u, saat.simdi).tur === "musait";
  const oneriler = $derived(new Map(ustalar.map((u) => [u.id, oneriPuani(u, baglam, yorumlarim.ustaIcin(u).puan)])));

  const sorunOnerileri = $derived(seciliSorun ? [] : sorunAra(arama));

  function uygun(u: Usta, f: Filtre): boolean {
    if (kategori !== "tumu" && u.kategori !== kategori) return false;
    if (seciliSorun && !u.sorunlar.includes(seciliSorun.sorun)) return false;
    if (!seciliSorun && arama.trim() && !ustaEslesir(u, arama)) return false;
    if (f.musait && !musaitMi(u)) return false;
    if (f.favori && !favoriler.var(u.id)) return false;
    if (f.mesafe && mesafeKm(u, semt) > f.mesafe) return false;
    if (f.puan && yorumlarim.ustaIcin(u).puan < f.puan) return false;
    if (f.fiyat && u.cikisUcreti > f.fiyat) return false;
    if (f.dil && !u.diller.includes(f.dil)) return false;
    return true;
  }

  const liste = $derived(
    ustalar
      .filter((u) => uygun(u, filtre))
      .sort((a, b) => {
        if (siralama === "yakin") return mesafeKm(a, semt) - mesafeKm(b, semt);
        if (siralama === "puan") return yorumlarim.ustaIcin(b).puan - yorumlarim.ustaIcin(a).puan;
        if (siralama === "fiyat") return a.cikisUcreti - b.cikisUcreti;
        return oneriler.get(b.id)!.puan - oneriler.get(a.id)!.puan;
      }),
  );

  const taslakSayisi = $derived(ustalar.filter((u) => uygun(u, taslakFiltre)).length);
  const filtreSayisi = $derived(
    Number(filtre.musait) + Number(filtre.favori) + Number(!!filtre.mesafe) + Number(!!filtre.puan) + Number(!!filtre.fiyat) + Number(!!filtre.dil),
  );
  const daraltildi = $derived(filtreSayisi > 0 || kategori !== "tumu" || !!seciliSorun || arama.trim() !== "");

  // Her acil kısayol için en yakın müsait usta
  const acilSecenekler = $derived(
    acilKisayollar.map((k) => {
      const enYakin = ustalar
        .filter((u) => u.kategori === k.kategori && musaitMi(u))
        .sort((a, b) => mesafeKm(a, semt) - mesafeKm(b, semt))[0];
      return { ...k, usta: enYakin, dk: enYakin ? varisDk(mesafeKm(enYakin, semt)) : 0 };
    }),
  );

  const aktifIs = $derived(isEmirleri.aktifler[0]);
  const aktifMetin = $derived.by(() => {
    if (!aktifIs) return "";
    const t = takip(aktifIs, saat.simdi);
    if (t.asama === "yolda") return dil.t("liste.aktifYolda", { usta: aktifIs.ustaAd, dk: sayiYaz(t.kalanDk, dil.kod) });
    if (aktifIs.aciliyet !== "hemen" && t.asama !== "kapida")
      return dil.t("liste.aktifRandevu", { usta: aktifIs.ustaAd, zaman: tarihYaz(aktifIs.zaman, dil.kod) });
    return `${aktifIs.ustaAd} · ${dil.t(`asama.${t.asama}`)}`;
  });

  const kategoriSayisi = (k: Kategori | "tumu") => (k === "tumu" ? ustalar.length : ustalar.filter((u) => u.kategori === k).length);
  const ok = $derived(dil.yon === "rtl" ? "ok-sol" : "ok-sag");

  function sorunSec(o: SorunOnerisi) {
    seciliSorun = o;
    kategori = o.kategori;
    arama = "";
  }

  function sorunKaldir() {
    seciliSorun = null;
    kategori = "tumu";
  }

  function filtreAc() {
    taslakFiltre = { ...filtre };
    filtrePenceresi = true;
  }

  function filtreUygula() {
    filtre = { ...taslakFiltre };
    filtrePenceresi = false;
  }

  function hepsiniTemizle() {
    filtre = { ...BOS_FILTRE };
    kategori = "tumu";
    arama = "";
    seciliSorun = null;
  }

  function gorunumSec(g: Gorunum) {
    gorunum = g;
    yaz("liste-gorunum", g);
  }

  function nedenAc(u: Usta) {
    nedenUsta = u;
    nedenPenceresi = true;
  }

  function nedenMetni(n: NedenTuru, u: Usta): string {
    if (n === "musait") return dil.t("neden.musait");
    if (n === "yakin") return dil.t("neden.yakin", { km: sayiYaz(mesafeKm(u, semt), dil.kod) });
    if (n === "puan") return dil.t("neden.puan", { puan: sayiYaz(yorumlarim.ustaIcin(u).puan, dil.kod) });
    if (n === "hizli") return dil.t("neden.hizli", { dk: sayiYaz(u.yanitDk, dil.kod) });
    if (n === "dil") return dil.t("neden.dil", { dil: dilAdlari[dil.kod] });
    return dil.t("neden.fiyat");
  }
</script>

<section class="ust-bolum">
  <div class="ic">
    <div class="ust-satir">
      <button class="semt-dugme" onclick={() => (semtPenceresi = true)} aria-label={dil.t("liste.konumDegistir", { semt })}>
        <Ikon ad="konum" boyut={16} />
        <span>{semt}</span>
        <Ikon ad={ok} boyut={14} />
      </button>
      <a class="profil-dugme" href="/profil" aria-label={dil.t("nav.profil")}>
        {#if profil.bilgi.ad}{basHarfler(profil.bilgi.ad)}{:else}<Ikon ad="kisi" boyut={18} />{/if}
      </a>
    </div>
    <p class="merhaba">{profil.bilgi.ad ? dil.t("liste.merhabaAd", { ad: profil.bilgi.ad.split(" ")[0] }) : dil.t("liste.merhaba")}</p>
    <h1>{dil.t("liste.neOldu")}</h1>
    <p class="acil-alt">{dil.t("liste.acilAlt")}</p>

    <div class="acil-izgara">
      {#each acilSecenekler as a}
        {#if a.usta}
          <a class="acil basilabilir" href="/usta/{a.usta.id}?sorun={a.sorun}&aciliyet=hemen">
            <span class="acil-ust">
              <span class="acil-ikon"><Ikon ad={kategoriIkon[a.kategori]} boyut={20} /></span>
              <span class="acil-eta"><span class="nokta"></span>{dil.t("kart.dk", { dk: sayiYaz(a.dk, dil.kod) })}</span>
            </span>
            <span class="acil-ad">{dil.t(`sorun.${a.sorun}` as Anahtar)}</span>
            <span class="acil-usta">{a.usta.ad}</span>
          </a>
        {:else}
          <div class="acil pasif">
            <span class="acil-ust"><span class="acil-ikon"><Ikon ad={kategoriIkon[a.kategori]} boyut={20} /></span></span>
            <span class="acil-ad">{dil.t(`sorun.${a.sorun}` as Anahtar)}</span>
            <span class="acil-usta">{dil.t("liste.acilYok")}</span>
          </div>
        {/if}
      {/each}
    </div>

    <button class="sihirbaz-dugme" onclick={() => (sihirbazPenceresi = true)}>
      <Ikon ad="pano" boyut={18} />
      <span>{dil.t("liste.tarifEt")}</span>
      <Ikon ad={ok} boyut={16} />
    </button>
  </div>
</section>

<div class="sayfa">
  {#if aktifIs}
    <a class="aktif-is" href="/is-emirlerim">
      <span class="nabiz" aria-hidden="true"></span>
      <span class="metin">{aktifMetin}</span>
      <code dir="ltr">{aktifIs.kod}</code>
      <Ikon ad={ok} boyut={18} />
    </a>
  {/if}

  <div class="arama-kutusu">
    <label class="arama">
      <Ikon ad="ara" boyut={18} />
      <span class="gorunmez">{dil.t("liste.arama")}</span>
      <input type="search" placeholder={dil.t("liste.arama")} bind:value={arama} oninput={() => (seciliSorun = null)} autocomplete="off" />
    </label>
    {#if sorunOnerileri.length}
      <div class="oneriler" role="listbox" aria-label={dil.t("liste.aramaOneri")}>
        <span class="oneri-baslik">{dil.t("liste.aramaOneri")}</span>
        {#each sorunOnerileri as o}
          <button role="option" aria-selected="false" onclick={() => sorunSec(o)}>
            <Ikon ad={kategoriIkon[o.kategori]} boyut={16} />
            <span>{dil.t(`sorun.${o.sorun}` as Anahtar)}</span>
            <small>{dil.t(`kategori.${o.kategori}`)}</small>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if seciliSorun}
    <div class="secili-sorun">
      <span>{dil.t(`sorun.${seciliSorun.sorun}` as Anahtar)}</span>
      <button onclick={sorunKaldir} aria-label={dil.t("genel.kapat")}><Ikon ad="kapat" boyut={14} /></button>
    </div>
  {/if}

  <div class="cipler" role="group" aria-label={dil.t("liste.baslik")}>
    {#each ["tumu", ...kategoriler] as const as k}
      <button class="cip" aria-pressed={kategori === k} onclick={() => ((kategori = k), (seciliSorun = null))}>
        {#if k !== "tumu"}<Ikon ad={kategoriIkon[k]} boyut={15} />{/if}
        {k === "tumu" ? dil.t("liste.tumu") : dil.t(`kategori.${k}`)}
        <span class="adet">{kategoriSayisi(k)}</span>
      </button>
    {/each}
  </div>

  <div class="arac-satiri">
    <button class="arac" class:aktif={filtreSayisi > 0} onclick={filtreAc}>
      <Ikon ad="sirala" boyut={16} />
      {dil.t("liste.filtrele")}
      {#if filtreSayisi}<span class="rozet">{filtreSayisi}</span>{/if}
    </button>
    <button class="arac" onclick={() => (siralaPenceresi = true)}>
      {dil.t("liste.siralaEtiket", { ad: dil.t(`sirala.${siralama}`) })}
    </button>
    <div class="gorunum" role="group" aria-label={dil.t("liste.gorunum")}>
      <button aria-pressed={gorunum === "liste"} onclick={() => gorunumSec("liste")} aria-label={dil.t("liste.liste")}><Ikon ad="liste" boyut={18} /></button>
      <button aria-pressed={gorunum === "harita"} onclick={() => gorunumSec("harita")} aria-label={dil.t("liste.harita")}><Ikon ad="harita" boyut={18} /></button>
    </div>
  </div>

  <p class="sonuc" aria-live="polite">
    {dil.t("liste.sonuc", { n: sayiYaz(liste.length, dil.kod) })}
    {#if daraltildi}· <button class="temizle" onclick={hepsiniTemizle}>{dil.t("liste.filtreTemizle")}</button>{/if}
  </p>

  {#if gorunum === "harita"}
    <UstaHaritasi ustalar={liste} sorun={seciliSorun?.sorun} listeyeDon={() => gorunumSec("liste")} />
  {:else if liste.length}
    <div class="izgara">
      {#each liste as u, i (u.id)}
        <UstaKart usta={u} sorun={seciliSorun?.sorun} nedenAc={siralama === "onerilen" && i === 0 ? nedenAc : undefined} />
      {/each}
    </div>
  {:else}
    <BosDurum ikon="ara" baslik={dil.t("liste.bos")}>
      <button class="btn ikincil kucuk" onclick={hepsiniTemizle}>{dil.t("liste.filtreTemizle")}</button>
    </BosDurum>
  {/if}
</div>

<Pencere bind:acik={semtPenceresi} alt baslik={dil.t("liste.konumSec")} kapatEtiketi={dil.t("genel.kapat")}>
  <SemtSecici
    secili={semt}
    sec={(s) => {
      profil.guncelle({ semt: s });
      semtPenceresi = false;
    }}
  />
</Pencere>

<Pencere bind:acik={sihirbazPenceresi} alt baslik={dil.t("liste.neOldu")} kapatEtiketi={dil.t("genel.kapat")}>
  {#if sihirbazPenceresi}<ArizaSihirbazi />{/if}
</Pencere>

<Pencere bind:acik={filtrePenceresi} alt baslik={dil.t("filtre.baslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <fieldset>
    <legend>{dil.t("filtre.durum")}</legend>
    <div class="cip-grup">
      <button class="cip" aria-pressed={taslakFiltre.musait} onclick={() => (taslakFiltre.musait = !taslakFiltre.musait)}>
        <Ikon ad="onay" boyut={14} /> {dil.t("liste.sadeceMusait")}
      </button>
      <button class="cip" aria-pressed={taslakFiltre.favori} onclick={() => (taslakFiltre.favori = !taslakFiltre.favori)}>
        <Ikon ad="kalp" boyut={14} /> {dil.t("liste.favoriler")}
      </button>
    </div>
  </fieldset>
  <fieldset>
    <legend>{dil.t("filtre.mesafe")}</legend>
    <div class="cip-grup">
      {#each [0, 2, 5, 10] as m}
        <button class="cip" aria-pressed={taslakFiltre.mesafe === m} onclick={() => (taslakFiltre.mesafe = m)}>
          {m ? dil.t("filtre.mesafeKm", { n: sayiYaz(m, dil.kod) }) : dil.t("filtre.tumu")}
        </button>
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend>{dil.t("filtre.puan")}</legend>
    <div class="cip-grup">
      {#each [0, 4.5, 4.7] as p}
        <button class="cip" aria-pressed={taslakFiltre.puan === p} onclick={() => (taslakFiltre.puan = p)}>
          {#if p}<Ikon ad="yildiz" boyut={14} dolu /> {sayiYaz(p, dil.kod)}+{:else}{dil.t("filtre.tumu")}{/if}
        </button>
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend>{dil.t("filtre.fiyat")}</legend>
    <div class="cip-grup">
      {#each [0, 350, 400] as f}
        <button class="cip" aria-pressed={taslakFiltre.fiyat === f} onclick={() => (taslakFiltre.fiyat = f)}>
          {f ? dil.t("filtre.fiyatEnFazla", { tutar: paraYaz(f, dil.kod) }) : dil.t("filtre.tumu")}
        </button>
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend>{dil.t("filtre.dil")}</legend>
    <div class="cip-grup">
      <button class="cip" aria-pressed={taslakFiltre.dil === ""} onclick={() => (taslakFiltre.dil = "")}>{dil.t("filtre.tumu")}</button>
      {#each diller as d}
        <button class="cip" aria-pressed={taslakFiltre.dil === d} lang={d} onclick={() => (taslakFiltre.dil = d)}>{dilAdlari[d]}</button>
      {/each}
    </div>
  </fieldset>
  {#snippet altBilgi()}
    <button class="btn ikincil" onclick={() => (taslakFiltre = { ...BOS_FILTRE })}>{dil.t("filtre.temizle")}</button>
    <button class="btn" onclick={filtreUygula}>{dil.t("filtre.goster", { n: sayiYaz(taslakSayisi, dil.kod) })}</button>
  {/snippet}
</Pencere>

<Pencere bind:acik={siralaPenceresi} alt baslik={dil.t("sirala.baslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <div class="sirala-liste" role="radiogroup" aria-label={dil.t("sirala.baslik")}>
    {#each siralamalar as s}
      <button
        role="radio"
        aria-checked={siralama === s}
        onclick={() => {
          siralama = s;
          siralaPenceresi = false;
        }}
      >
        <span>
          <b>{dil.t(`sirala.${s}`)}</b>
          <small>{dil.t(`sirala.${s}Aciklama`)}</small>
        </span>
        {#if siralama === s}<Ikon ad="onay" boyut={20} />{/if}
      </button>
    {/each}
  </div>
</Pencere>

<Pencere bind:acik={nedenPenceresi} alt baslik={dil.t("neden.baslik")} kapatEtiketi={dil.t("genel.kapat")}>
  {#if nedenUsta}
    {@const o = oneriler.get(nedenUsta.id)!}
    <p class="neden-usta"><b>{nedenUsta.ad}</b> · {dil.t(`kategori.${nedenUsta.kategori}`)}</p>
    <ul class="nedenler">
      {#each o.nedenler as n}
        <li><Ikon ad="onay" boyut={16} /> {nedenMetni(n, nedenUsta)}</li>
      {/each}
    </ul>
    <p class="neden-not">{dil.t("neden.not")}</p>
  {/if}
</Pencere>

<style>
  .ust-bolum {
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .ust-bolum .ic {
    max-width: 960px;
    margin-inline: auto;
    padding: 4px 16px 20px;
  }

  .ust-satir {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .semt-dugme {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 999px;
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    font-weight: 600;
  }

  .profil-dugme {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--koyu-cam);
    border: 1px solid var(--koyu-cizgi);
    font-size: var(--yz-sm);
    font-weight: 800;
  }

  .merhaba {
    margin: 0;
    font-size: var(--yz-sm);
    opacity: 0.75;
  }

  h1 {
    margin: 2px 0 0;
    font-size: var(--yz-2xl);
    letter-spacing: -0.5px;
  }

  .acil-alt {
    margin: 2px 0 14px;
    font-size: var(--yz-sm);
    opacity: 0.75;
  }

  .acil-izgara {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .acil {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 112px;
    padding: 12px;
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
  }

  .acil.pasif {
    opacity: 0.6;
  }

  .acil-ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .acil-ikon {
    display: flex;
    padding: 8px;
    border-radius: 12px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .acil-eta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--basari-yumusak);
    color: var(--basari);
    font-size: var(--yz-xs);
    font-weight: 700;
  }

  .acil-eta .nokta {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .acil-ad {
    margin-top: auto;
    font-size: var(--yz-md);
    font-weight: 700;
    line-height: 1.25;
  }

  .acil-usta {
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
  }

  .sihirbaz-dugme {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 48px;
    margin-top: 10px;
    padding: 0 14px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: var(--radius);
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    font-weight: 600;
    text-align: start;
  }

  .sihirbaz-dugme span {
    flex: 1;
  }

  .aktif-is {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--basari);
    border-radius: var(--radius);
    background: var(--basari-yumusak);
    color: var(--basari);
    font-weight: 600;
    font-size: var(--yz-sm);
  }

  .aktif-is .metin {
    flex: 1;
  }

  .aktif-is code {
    font-size: var(--yz-xs);
  }

  .nabiz {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--basari);
    animation: nabiz 1.4s ease-in-out infinite;
  }

  .arama-kutusu {
    position: relative;
  }

  .arama {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi-soluk);
  }

  .arama:focus-within {
    border-color: var(--yazi);
  }

  .arama input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--yazi);
    font-size: 16px; /* iOS'ta odaklanınca yakınlaştırmayı önler */
  }

  .oneriler {
    position: absolute;
    inset-inline: 0;
    top: calc(100% + 6px);
    z-index: 5;
    display: flex;
    flex-direction: column;
    padding: 6px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    box-shadow: var(--golge-yuksek);
  }

  .oneri-baslik {
    padding: 6px 10px 4px;
    font-size: var(--yz-xs);
    font-weight: 700;
    color: var(--yazi-soluk);
  }

  .oneriler button {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: var(--dokunma);
    padding: 0 10px;
    border: 0;
    border-radius: var(--radius-kucuk);
    background: none;
    text-align: start;
  }

  .oneriler button:hover,
  .oneriler button:focus-visible {
    background: var(--yuzey-2);
  }

  .oneriler span {
    flex: 1;
    font-weight: 600;
  }

  .oneriler small {
    color: var(--yazi-soluk);
  }

  .secili-sorun {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 6px;
    padding: 4px 4px 4px 12px;
    padding-inline: 12px 4px;
    border-radius: 999px;
    background: var(--secili);
    color: var(--secili-ustu);
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  .secili-sorun button {
    display: flex;
    padding: 6px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
  }

  .cipler {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: -16px;
    padding-inline: 16px;
  }

  .adet {
    font-size: var(--yz-xs);
    opacity: 0.6;
  }

  .arac-satiri {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .arac {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  .arac.aktif {
    border-color: var(--secili);
  }

  .rozet {
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--secili);
    color: var(--secili-ustu);
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }

  .gorunum {
    display: flex;
    margin-inline-start: auto;
    padding: 3px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
  }

  .gorunum button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    border: 0;
    border-radius: 7px;
    background: none;
    color: var(--yazi-soluk);
  }

  .gorunum button[aria-pressed="true"] {
    background: var(--secili);
    color: var(--secili-ustu);
  }

  .sonuc {
    margin: -4px 0 0;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .temizle {
    padding: 0;
    border: 0;
    background: none;
    color: var(--yazi);
    font-weight: 700;
    text-decoration: underline;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 8px;
    padding: 0;
    font-size: var(--yz-sm);
    font-weight: 700;
    color: var(--yazi-soluk);
  }

  .cip-grup {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sirala-liste {
    display: flex;
    flex-direction: column;
  }

  .sirala-liste button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 60px;
    padding: 8px 4px;
    border: 0;
    border-bottom: 1px solid var(--kenar);
    background: none;
    text-align: start;
  }

  .sirala-liste span {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sirala-liste small {
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
  }

  .neden-usta {
    margin: 0;
  }

  .nedenler {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .nedenler li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nedenler :global(.ikon) {
    color: var(--basari);
  }

  .neden-not {
    margin: 0;
    padding: 10px 12px;
    border-radius: var(--radius-kucuk);
    background: var(--yuzey-2);
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  @media (min-width: 768px) {
    .acil-izgara {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .ust-bolum .ic {
      padding: 12px 24px 28px;
    }
  }

  @keyframes nabiz {
    50% {
      opacity: 0.35;
      transform: scale(0.8);
    }
  }
</style>
