<script lang="ts">
  // Profil — istatistikler, iletişim bilgileri ve semt, favori ustalar, dil/tema, KVKK veri hakları ve bilgi sayfaları
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import { basHarfler, kategoriIkon, paraYaz, sayiYaz, ustaBul } from "$lib/data";
  import { tema } from "$lib/tema.svelte";
  import { bilgiSayfalari, dil, diller, dilAdlari, sayfaYolu } from "$lib/i18n.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { profil } from "$lib/profil.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { rustIcinde } from "$lib/motor";
  import { tumVerileriSil, verileriDisaAktar } from "$lib/veri";
  import type { IkonAdi } from "$lib/ikonlar";
  import type { Anahtar } from "$lib/ceviriler";

  const SURUM = "0.2.0";

  let ad = $state(profil.bilgi.ad);
  let telefon = $state(profil.bilgi.telefon);
  let adres = $state(profil.bilgi.adres);
  let semtPenceresi = $state(false);
  let silPenceresi = $state(false);

  const tamamlananlar = $derived(isEmirleri.liste.filter((i) => i.durum === "tamamlandi"));
  const harcama = $derived(tamamlananlar.reduce((t, i) => t + i.fiyat.toplamMin, 0));
  const favoriUstalar = $derived(favoriler.idler.map(ustaBul).filter((u) => u !== undefined));

  const istatistikler: [IkonAdi, Anahtar, () => string][] = [
    ["fis", "profil.toplamIs", () => sayiYaz(isEmirleri.liste.length, dil.kod)],
    ["onay", "profil.tamamlananIs", () => sayiYaz(tamamlananlar.length, dil.kod)],
    ["para", "profil.harcama", () => paraYaz(harcama, dil.kod)],
    ["yorum", "profil.yorumlarim", () => sayiYaz(yorumlarim.liste.length, dil.kod)],
  ];

  function kaydet(event: SubmitEvent) {
    event.preventDefault();
    profil.guncelle({ ad: ad.trim(), telefon: telefon.trim(), adres: adres.trim() });
    bildirim.goster(dil.t("profil.kaydedildi"));
  }

  function sil() {
    tumVerileriSil();
    bildirim.sonrakiSayfada(dil.t("profil.silindi"), "bilgi");
    window.location.assign("/");
  }
</script>

<div class="sayfa dar">
  <section class="kart kimlik">
    <div class="avatar">{profil.bilgi.ad ? basHarfler(profil.bilgi.ad) : "?"}</div>
    <div>
      <h1>{profil.bilgi.ad || dil.t("profil.misafir")}</h1>
      <button class="semt" onclick={() => (semtPenceresi = true)}>
        <Ikon ad="konum" boyut={14} /> {profil.bilgi.semt}
      </button>
    </div>
  </section>

  <div class="istatistik">
    {#each istatistikler as [ikon, etiket, deger]}
      <div class="kart">
        <Ikon ad={ikon} boyut={18} />
        <b>{deger()}</b>
        <span>{dil.t(etiket)}</span>
      </div>
    {/each}
  </div>

  <form class="kart form" onsubmit={kaydet}>
    <label>
      {dil.t("profil.ad")}
      <input bind:value={ad} autocomplete="name" />
    </label>
    <label>
      {dil.t("profil.telefon")}
      <input type="tel" dir="ltr" bind:value={telefon} autocomplete="tel" placeholder="05xx xxx xx xx" />
    </label>
    <label>
      {dil.t("profil.adres")}
      <textarea rows="2" bind:value={adres} autocomplete="street-address"></textarea>
    </label>
    <button class="btn">{dil.t("profil.kaydet")}</button>
  </form>

  <h2>{dil.t("profil.favoriUstalar")}</h2>
  {#if favoriUstalar.length}
    <div class="favoriler">
      {#each favoriUstalar as u (u.id)}
        <a class="kart favori" href="/usta/{u.id}">
          <span class="mini-avatar">{basHarfler(u.ad)}</span>
          <b>{u.ad}</b>
          <span><Ikon ad={kategoriIkon[u.kategori]} boyut={13} /> {dil.t(`kategori.${u.kategori}`)}</span>
        </a>
      {/each}
    </div>
  {:else}
    <p class="soluk">{dil.t("profil.favoriYok")}</p>
  {/if}

  <h2>{dil.t("profil.ayarlar")}</h2>
  <div class="kart ayarlar">
    <div class="ayar">
      <span><Ikon ad="dunya" boyut={16} /> {dil.t("profil.dil")}</span>
      <div class="secenekler dort">
        {#each diller as d}
          <button class:aktif={dil.kod === d} aria-pressed={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>{dilAdlari[d]}</button>
        {/each}
      </div>
    </div>
    <div class="ayar">
      <span><Ikon ad="otomatik" boyut={16} /> {dil.t("profil.tema")}</span>
      <div class="secenekler">
        {#each ["sistem", "gunduz", "gece"] as const as t}
          <button class:aktif={tema.tercih === t} aria-pressed={tema.tercih === t} onclick={() => tema.sec(t)}>
            <Ikon ad={t === "sistem" ? "otomatik" : t === "gunduz" ? "gunes" : "ay"} boyut={16} />
            {dil.t(`tema.${t}`)}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <h2>{dil.t("profil.veri")}</h2>
  <div class="kart liste">
    <button onclick={verileriDisaAktar}><Ikon ad="kopyala" boyut={18} /> <span>{dil.t("profil.disaAktar")}</span></button>
    <button class="tehlike" onclick={() => (silPenceresi = true)}><Ikon ad="cop" boyut={18} /> <span>{dil.t("profil.sil")}</span></button>
  </div>

  <h2>{dil.t("profil.bilgi")}</h2>
  <nav class="kart liste">
    {#each bilgiSayfalari as s}
      <a href={sayfaYolu(dil.kod, s)}>
        <Ikon ad={s === "hakkinda" ? "bilgi" : s === "iletisim" ? "yorum" : s === "kosullar" ? "pano" : "kilit"} boyut={18} />
        <span>{dil.t(`sayfa.${s}`)}</span>
        <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={16} />
      </a>
    {/each}
  </nav>

  <p class="surum">{dil.t("profil.surum", { surum: SURUM, motor: dil.t(rustIcinde() ? "motor.rust" : "motor.ts") })}</p>
</div>

<Pencere bind:acik={semtPenceresi} baslik={dil.t("liste.konumSec")} kapatEtiketi={dil.t("genel.kapat")}>
  <SemtSecici
    secili={profil.bilgi.semt}
    sec={(s) => {
      profil.guncelle({ semt: s });
      semtPenceresi = false;
    }}
  />
</Pencere>

<Pencere bind:acik={silPenceresi} baslik={dil.t("profil.silBaslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <p class="soluk">{dil.t("profil.silNot")}</p>
  <div class="pencere-dugmeleri">
    <button class="btn ikincil" onclick={() => (silPenceresi = false)}>{dil.t("genel.vazgec")}</button>
    <button class="btn tehlike-dugme" onclick={sil}>{dil.t("profil.silOnay")}</button>
  </div>
</Pencere>

<style>
  h2 {
    margin: 8px 0 -6px;
    font-size: 15px;
    color: var(--yazi-soluk);
  }

  .kimlik {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px;
  }

  .avatar {
    flex-shrink: 0;
    width: 68px;
    height: 68px;
    border-radius: 22px;
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
  }

  h1 {
    margin: 0 0 6px;
    font-size: 21px;
  }

  .semt {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid var(--kenar);
    border-radius: 999px;
    background: var(--zemin);
    font-size: 13px;
    font-weight: 600;
  }

  .istatistik {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .istatistik .kart {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 12px 4px;
    text-align: center;
    color: var(--renk-ana-yazi);
  }

  .istatistik b {
    font-size: 15px;
    color: var(--yazi);
  }

  .istatistik span {
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }

  input,
  textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-weight: 400;
    resize: vertical;
  }

  .favoriler {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .favori {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 120px;
    padding: 12px 8px;
    text-align: center;
    font-size: 13px;
  }

  .favori span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .mini-avatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi) !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 15px !important;
    font-weight: 800;
  }

  .soluk {
    margin: 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .ayarlar {
    padding: 4px 16px;
  }

  .ayar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 0;
    font-weight: 600;
    font-size: 14px;
  }

  .ayar > span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ayar + .ayar {
    border-top: 1px solid var(--kenar);
  }

  .secenekler {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .secenekler.dort {
    grid-template-columns: repeat(4, 1fr);
  }

  .secenekler button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 10px 4px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-size: 13px;
  }

  .secenekler button.aktif {
    background: var(--renk-ana);
    border-color: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-weight: 700;
  }

  .liste {
    display: flex;
    flex-direction: column;
  }

  .liste a,
  .liste button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 0;
    background: none;
    font-size: 15px;
    text-align: start;
  }

  .liste a span,
  .liste button span {
    flex: 1;
  }

  .liste > * + * {
    border-top: 1px solid var(--kenar) !important;
  }

  .liste .tehlike {
    color: var(--hata);
  }

  .surum {
    margin: 0;
    font-size: 12px;
    color: var(--yazi-soluk);
    text-align: center;
  }

  .pencere-dugmeleri {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .tehlike-dugme {
    background: var(--hata);
    color: var(--kart);
  }
</style>
