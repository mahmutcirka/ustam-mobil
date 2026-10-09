<script lang="ts">
  // Profil — özet, Hesabım, Konum, Favoriler, Görünüm, Dil, Gizlilik (KVKK) ve bilgi sayfaları
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import BosDurum from "$lib/components/ui/BosDurum.svelte";
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

  const SURUM = "0.3.0";

  let ad = $state(profil.bilgi.ad);
  let telefon = $state(profil.bilgi.telefon);
  let adres = $state(profil.bilgi.adres);
  let semtPenceresi = $state(false);
  let silPenceresi = $state(false);

  const tamamlananlar = $derived(isEmirleri.liste.filter((i) => i.durum === "tamamlandi"));
  const harcama = $derived(tamamlananlar.reduce((t, i) => t + i.fiyat.toplamMin, 0));
  const verilenPuan = $derived(
    yorumlarim.liste.length ? yorumlarim.liste.reduce((t, y) => t + y.puan, 0) / yorumlarim.liste.length : 0,
  );
  const favoriUstalar = $derived(favoriler.idler.map(ustaBul).filter((u) => u !== undefined));
  const degisti = $derived(ad.trim() !== profil.bilgi.ad || telefon.trim() !== profil.bilgi.telefon || adres.trim() !== profil.bilgi.adres);
  const ok = $derived(dil.yon === "rtl" ? "ok-sol" : "ok-sag");

  const istatistikler: [IkonAdi, Anahtar, () => string][] = [
    ["fis", "profil.toplamIs", () => sayiYaz(isEmirleri.liste.length, dil.kod)],
    ["onay", "profil.tamamlananIs", () => sayiYaz(tamamlananlar.length, dil.kod)],
    ["para", "profil.harcama", () => paraYaz(harcama, dil.kod)],
    ["yildiz", "profil.verilenPuan", () => (verilenPuan ? sayiYaz(Math.round(verilenPuan * 10) / 10, dil.kod) : "–")],
  ];

  const bilgiIkonu: Record<string, IkonAdi> = { hakkinda: "bilgi", iletisim: "yorum", kosullar: "pano", gizlilik: "kilit" };

  function kaydet(event: SubmitEvent) {
    event.preventDefault();
    profil.guncelle({ ad: ad.trim().slice(0, 80), telefon: telefon.trim().slice(0, 20), adres: adres.trim().slice(0, 300) });
    bildirim.goster(dil.t("profil.kaydedildi"));
  }

  function sil() {
    tumVerileriSil();
    bildirim.sonrakiSayfada(dil.t("profil.silindi"), "bilgi");
    window.location.assign("/");
  }
</script>

<div class="sayfa dar">
  <section class="kart ozet">
    <div class="kimlik">
      <div class="avatar">{profil.bilgi.ad ? basHarfler(profil.bilgi.ad) : "?"}</div>
      <div>
        <h1>{profil.bilgi.ad || dil.t("profil.misafir")}</h1>
        <p><Ikon ad="konum" boyut={14} /> {profil.bilgi.semt}</p>
      </div>
    </div>
    <div class="istatistik">
      {#each istatistikler as [ikon, etiket, deger]}
        <div>
          <Ikon ad={ikon} boyut={16} />
          <b>{deger()}</b>
          <span>{dil.t(etiket)}</span>
        </div>
      {/each}
    </div>
  </section>

  <form class="bolumler" onsubmit={kaydet}>
    <h2 class="bolum-baslik">{dil.t("profil.hesabim")}</h2>
    <div class="kart form">
      <label>
        {dil.t("profil.ad")}
        <input bind:value={ad} autocomplete="name" maxlength="80" />
      </label>
      <label>
        {dil.t("profil.telefon")}
        <input type="tel" dir="ltr" bind:value={telefon} autocomplete="tel" maxlength="20" placeholder="05xx xxx xx xx" />
      </label>
    </div>

    <h2 class="bolum-baslik">{dil.t("profil.konum")}</h2>
    <div class="kart form">
      <button type="button" class="satir-dugme" onclick={() => (semtPenceresi = true)}>
        <Ikon ad="konum" boyut={18} />
        <span>{dil.t("liste.konumSec")}</span>
        <b>{profil.bilgi.semt}</b>
        <Ikon ad={ok} boyut={16} />
      </button>
      <label>
        {dil.t("profil.adres")}
        <textarea rows="2" bind:value={adres} autocomplete="street-address" maxlength="300"></textarea>
      </label>
    </div>
    <button class="btn" disabled={!degisti}>{dil.t("profil.kaydet")}</button>
  </form>

  <h2 class="bolum-baslik">{dil.t("profil.favoriUstalar")}</h2>
  {#if favoriUstalar.length}
    <div class="favoriler">
      {#each favoriUstalar as u (u.id)}
        <a class="kart favori basilabilir" href="/usta/{u.id}">
          <span class="mini-avatar">{basHarfler(u.ad)}</span>
          <b>{u.ad}</b>
          <small><Ikon ad={kategoriIkon[u.kategori]} boyut={12} /> {dil.t(`kategori.${u.kategori}`)}</small>
        </a>
      {/each}
    </div>
  {:else}
    <div class="kart">
      <BosDurum
        ikon="kalp"
        baslik={dil.t("profil.favoriBosBaslik")}
        aciklama={dil.t("profil.favoriBosMetin")}
        dugmeMetni={dil.t("profil.ustalaraGoz")}
        href="/"
        ikincil
      />
    </div>
  {/if}

  <h2 class="bolum-baslik">{dil.t("profil.gorunum")}</h2>
  <div class="kart secenekler uc" role="radiogroup" aria-label={dil.t("profil.tema")}>
    {#each ["sistem", "gunduz", "gece"] as const as t}
      <button role="radio" aria-checked={tema.tercih === t} onclick={() => tema.sec(t)}>
        <Ikon ad={t === "sistem" ? "otomatik" : t === "gunduz" ? "gunes" : "ay"} boyut={18} />
        {dil.t(`tema.${t}`)}
      </button>
    {/each}
  </div>

  <h2 class="bolum-baslik">{dil.t("profil.dil")}</h2>
  <div class="kart secenekler dort" role="radiogroup" aria-label={dil.t("profil.dil")}>
    {#each diller as d}
      <button role="radio" aria-checked={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>{dilAdlari[d]}</button>
    {/each}
  </div>

  <h2 class="bolum-baslik">{dil.t("profil.gizlilik")}</h2>
  <div class="kart liste">
    <button onclick={verileriDisaAktar}><Ikon ad="kopyala" boyut={18} /> <span>{dil.t("profil.disaAktar")}</span></button>
    <button class="tehlike" onclick={() => (silPenceresi = true)}><Ikon ad="cop" boyut={18} /> <span>{dil.t("profil.sil")}</span></button>
  </div>

  <h2 class="bolum-baslik">{dil.t("profil.bilgi")}</h2>
  <nav class="kart liste">
    {#each bilgiSayfalari as s}
      <a href={sayfaYolu(dil.kod, s)}>
        <Ikon ad={bilgiIkonu[s]} boyut={18} />
        <span>{dil.t(`sayfa.${s}`)}</span>
        <Ikon ad={ok} boyut={16} />
      </a>
    {/each}
  </nav>

  <p class="surum">{dil.t("profil.surum", { surum: SURUM, motor: dil.t(rustIcinde() ? "motor.rust" : "motor.ts") })}</p>
</div>

<Pencere bind:acik={semtPenceresi} alt baslik={dil.t("liste.konumSec")} kapatEtiketi={dil.t("genel.kapat")}>
  <SemtSecici
    secili={profil.bilgi.semt}
    sec={(s) => {
      profil.guncelle({ semt: s });
      semtPenceresi = false;
    }}
  />
</Pencere>

<Pencere bind:acik={silPenceresi} alt baslik={dil.t("profil.silBaslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <p class="soluk">{dil.t("profil.silNot")}</p>
  {#snippet altBilgi()}
    <button class="btn ikincil" onclick={() => (silPenceresi = false)}>{dil.t("genel.vazgec")}</button>
    <button class="btn tehlike-dugme" onclick={sil}>{dil.t("profil.silOnay")}</button>
  {/snippet}
</Pencere>

<style>
  .ozet {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px;
  }

  .kimlik {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 20px;
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--yz-xl);
    font-weight: 800;
  }

  h1 {
    margin: 0;
    font-size: var(--yz-xl);
  }

  .kimlik p {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px 0 0;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .istatistik {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--kenar);
    padding-top: 14px;
  }

  .istatistik div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
    color: var(--yazi-soluk);
  }

  .istatistik b {
    font-size: var(--yz-md);
    color: var(--yazi);
  }

  .istatistik span {
    font-size: 11px;
  }

  .bolumler {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  input,
  textarea {
    min-height: 48px;
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-size: 16px;
    font-weight: 400;
    resize: vertical;
  }

  .satir-dugme {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    text-align: start;
  }

  .satir-dugme span {
    flex: 1;
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
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
    width: 124px;
    padding: 14px 8px;
    text-align: center;
    font-size: var(--yz-sm);
  }

  .favori small {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .mini-avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--yuzey-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .secenekler {
    display: grid;
    gap: 6px;
    padding: 6px;
  }

  .secenekler.uc {
    grid-template-columns: repeat(3, 1fr);
  }

  .secenekler.dort {
    grid-template-columns: repeat(4, 1fr);
  }

  .secenekler button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    min-height: 56px;
    padding: 6px 4px;
    border: 0;
    border-radius: var(--radius-kucuk);
    background: none;
    font-size: var(--yz-sm);
    font-weight: 600;
    color: var(--yazi-soluk);
  }

  .secenekler button[aria-checked="true"] {
    background: var(--secili);
    color: var(--secili-ustu);
  }

  .liste {
    display: flex;
    flex-direction: column;
  }

  .liste a,
  .liste button {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 0 16px;
    border: 0;
    background: none;
    font-size: var(--yz-md);
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
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    text-align: center;
  }

  .soluk {
    margin: 0;
    color: var(--yazi-soluk);
    line-height: 1.5;
  }

  .tehlike-dugme {
    background: var(--hata);
    color: var(--kart);
  }
</style>
