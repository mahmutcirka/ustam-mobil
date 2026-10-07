<script lang="ts">
  // Çağrı özeti — Usta → Sorun → Zaman → Adres → İletişim → Ödeme → Onay.
  // Fiyat dökümü Rust'tan (fiyat_hesapla); onayda iş emri kodu Rust'tan (is_emri_uret). Ödeme alınmaz.
  import Ikon from "$lib/components/Ikon.svelte";
  import BosDurum from "$lib/components/BosDurum.svelte";
  import { aralikYaz, basHarfler, paraYaz, sorunBilgisi, tarihYaz } from "$lib/data";
  import { cagri } from "$lib/cagri.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { dil, sayfaYolu } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { fiyatHesapla, rustIcinde } from "$lib/motor";
  import { ACIL_UCRET, type FiyatDokumu } from "$lib/kurallar";
  import type { Anahtar } from "$lib/ceviriler";
  import type { OdemeTercihi } from "../types/ustam";

  let isleniyor = $state(false);
  let hata = $state("");
  let telefon = $state(profil.bilgi.telefon);
  let adres = $state(cagri.taslak?.adresNotu ?? "");
  let odeme = $state<OdemeTercihi>("nakit");
  let kosullar = $state(false);
  let rustDokumu = $state<FiyatDokumu | null>(null);

  const motor = rustIcinde() ? "cagri.motorRust" : "cagri.motorTs";

  // Ekrandaki döküm, uygulamanın kural motorundan (Tauri'de Rust) istenir; gelene kadar TS tahmini gösterilir
  $effect(() => {
    const t = cagri.taslak;
    const u = cagri.usta;
    if (!t || !u) return;
    const [iscilikMin, iscilikMax] = sorunBilgisi[t.sorun]?.iscilik ?? [0, 0];
    fiyatHesapla({ cikisUcreti: u.cikisUcreti, aciliyet: t.aciliyet, zaman: t.zaman, iscilikMin, iscilikMax })
      .then((f) => (rustDokumu = f))
      .catch(() => (rustDokumu = null));
  });

  const f = $derived(rustDokumu ?? cagri.fiyat);
  const telefonRakam = $derived(telefon.replace(/[^\d+]/g, ""));
  const telefonGecerli = $derived(/^\+?\d{10,13}$/.test(telefonRakam));
  const gonderilebilir = $derived(telefonGecerli && kosullar && !isleniyor);

  async function onayla() {
    if (!cagri.taslak || !cagri.usta || !gonderilebilir) return;
    isleniyor = true;
    hata = "";
    try {
      profil.guncelle({ telefon: telefon.trim() });
      const taslak = { ...$state.snapshot(cagri.taslak), adresNotu: adres.trim().slice(0, 300) };
      const emir = await isEmirleri.olustur(taslak, cagri.usta, { odeme, telefon: telefon.trim() });
      cagri.temizle();
      bildirim.sonrakiSayfada(dil.t("cagri.olusturuldu", { kod: emir.kod }));
      window.location.assign("/is-emirlerim"); // iş emri localStorage'a yazıldı, tam sayfa geçişinde kaybolmaz
    } catch (e) {
      hata = String(e);
      isleniyor = false;
    }
  }
</script>

<div class="sayfa dar">
  <h1>{dil.t("cagri.baslik")}</h1>

  {#if cagri.taslak && cagri.usta}
    {@const t = cagri.taslak}
    {@const u = cagri.usta}

    <ol class="adimlar kart">
      <li>
        <span class="no"><Ikon ad="onay" boyut={14} /></span>
        <span class="etiket">{dil.t("cagri.adimUsta")}</span>
        <span class="deger usta">
          <span class="avatar" aria-hidden="true">{basHarfler(u.ad)}</span>
          <span><b>{u.ad}</b><small>{dil.t(`kategori.${u.kategori}`)} · {u.semt}</small></span>
        </span>
      </li>
      <li>
        <span class="no"><Ikon ad="onay" boyut={14} /></span>
        <span class="etiket">{dil.t("cagri.sorun")}</span>
        <span class="deger"><b>{dil.t(`sorun.${t.sorun}` as Anahtar)}</b></span>
      </li>
      <li>
        <span class="no"><Ikon ad="onay" boyut={14} /></span>
        <span class="etiket">{dil.t("cagri.zaman")}</span>
        <span class="deger"><b>{dil.t(`aciliyet.${t.aciliyet}`)}</b><small>{tarihYaz(t.zaman, dil.kod)}</small></span>
        <a class="degistir" href="/usta/{u.id}?sorun={t.sorun}&aciliyet={t.aciliyet}">{dil.t("cagri.degistir")}</a>
      </li>
    </ol>
    {#if t.foto}<img class="foto" src={t.foto} alt="" />{/if}

    <label class="kart alan">
      <span class="baslik"><Ikon ad="ev" boyut={16} /> {dil.t("cagri.adres")}</span>
      <textarea rows="2" maxlength="300" placeholder={dil.t("detay.adresOrnek")} bind:value={adres}></textarea>
    </label>

    <label class="kart alan">
      <span class="baslik"><Ikon ad="telefon" boyut={16} /> {dil.t("cagri.iletisim")}</span>
      <input
        type="tel"
        dir="ltr"
        inputmode="tel"
        autocomplete="tel"
        maxlength="20"
        placeholder="05xx xxx xx xx"
        bind:value={telefon}
        aria-invalid={telefon !== "" && !telefonGecerli}
        aria-describedby="telefon-not"
      />
      <small id="telefon-not" class:hata={telefon !== "" && !telefonGecerli}>
        {telefon !== "" && !telefonGecerli ? dil.t("cagri.telefonHata") : dil.t("cagri.telefonNot")}
      </small>
    </label>

    <fieldset class="kart alan">
      <legend class="baslik"><Ikon ad="para" boyut={16} /> {dil.t("cagri.odeme")}</legend>
      <div class="odeme">
        {#each ["nakit", "kart"] as const as o}
          <label class:aktif={odeme === o}>
            <input type="radio" name="odeme" value={o} bind:group={odeme} />
            {dil.t(`odeme.${o}`)}
          </label>
        {/each}
      </div>
      <small>{dil.t("cagri.odemeNot")}</small>
    </fieldset>

    {#if f}
      <section class="kart fiyat" aria-label={dil.t("is.fiyatDokumu")}>
        <div><span>{dil.t("cagri.cikis")}</span><span>{paraYaz(f.cikis, dil.kod)}</span></div>
        {#if f.acil}<div><span>{dil.t("cagri.acil")}</span><span>{paraYaz(f.acil, dil.kod)}</span></div>{/if}
        {#if f.gece}<div><span>{dil.t("cagri.gece")}</span><span>{paraYaz(f.gece, dil.kod)}</span></div>{/if}
        {#if f.pazar}<div><span>{dil.t("cagri.pazar")}</span><span>{paraYaz(f.pazar, dil.kod)}</span></div>{/if}
        <div><span>{dil.t("cagri.iscilik")}</span><span>{aralikYaz(f.iscilikMin, f.iscilikMax, dil.kod)}</span></div>
        <div class="toplam"><span>{dil.t("cagri.toplam")}</span><b>{aralikYaz(f.toplamMin, f.toplamMax, dil.kod)}</b></div>
        <details class="nasil">
          <summary><Ikon ad="bilgi" boyut={14} /> {dil.t("fiyat.nasil")}</summary>
          <ul>
            <li>{dil.t("fiyat.kuralCikis")}</li>
            <li>{dil.t("fiyat.kuralAcil", { tutar: paraYaz(ACIL_UCRET, dil.kod) })}</li>
            <li>{dil.t("fiyat.kuralGece")}</li>
            <li>{dil.t("fiyat.kuralPazar")}</li>
            <li>{dil.t("fiyat.kuralIscilik")}</li>
          </ul>
          <span class="motor"><Ikon ad="kalkan" boyut={13} /> {dil.t(motor)}</span>
        </details>
      </section>
    {/if}

    <label class="onay">
      <input type="checkbox" bind:checked={kosullar} />
      <span>
        <a href={sayfaYolu(dil.kod, "kosullar")} target="_blank" rel="noopener noreferrer">{dil.t("sayfa.kosullar")}</a>
        — {dil.t("cagri.kosullarOnay")}
      </span>
    </label>

    {#if hata}
      <div class="hata-kutu" role="alert">
        <Ikon ad="uyari" boyut={18} />
        <span>{dil.t("cagri.hata")} {hata}</span>
        <button class="btn ikincil kucuk" onclick={onayla}>{dil.t("cagri.tekrarDene")}</button>
      </div>
    {/if}

    <div class="onay-cubugu">
      <div class="tutar">
        <small>{dil.t("cagri.toplam")}</small>
        <b>{f ? aralikYaz(f.toplamMin, f.toplamMax, dil.kod) : ""}</b>
      </div>
      <button class="btn" onclick={onayla} disabled={!gonderilebilir} aria-busy={isleniyor}>
        {isleniyor ? dil.t("cagri.isleniyor") : dil.t("cagri.onayla")}
      </button>
    </div>
    <button class="btn hayalet" onclick={() => cagri.temizle()} disabled={isleniyor}>{dil.t("cagri.vazgec")}</button>
  {:else}
    <BosDurum ikon="pano" baslik={dil.t("cagri.bos")}>
      <a class="btn kucuk" href="/">{dil.t("cagri.ustaSec")}</a>
    </BosDurum>
  {/if}
</div>

<style>
  h1 {
    margin: 0;
    font-size: var(--yz-xl);
  }

  .adimlar {
    margin: 0;
    padding: 4px 14px;
    list-style: none;
  }

  .adimlar li {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding: 8px 0;
  }

  .adimlar li + li {
    border-top: 1px solid var(--kenar);
  }

  .no {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .etiket {
    width: 64px;
    flex-shrink: 0;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .deger {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: var(--yz-sm);
  }

  .deger small {
    color: var(--yazi-soluk);
  }

  .deger.usta {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .deger.usta > span:last-child {
    display: flex;
    flex-direction: column;
  }

  .avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 12px;
    background: var(--yuzey-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--yz-xs);
    font-weight: 800;
  }

  .degistir {
    font-size: var(--yz-sm);
    font-weight: 700;
    text-decoration: underline;
  }

  .foto {
    width: 100%;
    max-height: 160px;
    object-fit: cover;
    border-radius: var(--radius);
  }

  .alan {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 14px;
  }

  .baslik {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .alan input[type="tel"],
  .alan textarea {
    min-height: 48px;
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-size: 16px; /* iOS yakınlaştırmasını önler */
    resize: vertical;
  }

  .alan input[aria-invalid="true"] {
    border-color: var(--hata);
  }

  .alan small {
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
  }

  .alan small.hata {
    color: var(--hata);
  }

  .odeme {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .odeme label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    font-size: var(--yz-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .odeme label.aktif {
    border-color: var(--secili);
    box-shadow: 0 0 0 1px var(--secili);
  }

  .odeme input,
  .onay input {
    accent-color: var(--secili);
  }

  .fiyat {
    padding: 14px 16px;
    font-size: var(--yz-sm);
  }

  .fiyat > div {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .fiyat > div > span:first-child {
    color: var(--yazi-soluk);
  }

  .fiyat .toplam {
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--kenar);
    font-size: var(--yz-md);
  }

  .fiyat .toplam span {
    color: var(--yazi) !important;
    font-weight: 600;
  }

  .nasil {
    margin-top: 8px;
  }

  .nasil summary {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    cursor: pointer;
    font-weight: 700;
    list-style: none;
  }

  .nasil summary::-webkit-details-marker {
    display: none;
  }

  .nasil ul {
    margin: 4px 0 10px;
    padding-inline-start: 18px;
    color: var(--yazi-soluk);
    line-height: 1.6;
  }

  .motor {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
    font-weight: 600;
  }

  .onay {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: var(--yz-sm);
    cursor: pointer;
  }

  .onay input {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .onay a {
    font-weight: 700;
    text-decoration: underline;
  }

  .hata-kutu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-kucuk);
    background: var(--hata-yumusak);
    color: var(--hata);
    font-size: var(--yz-sm);
  }

  .hata-kutu span {
    flex: 1;
  }

  /* Onay çubuğu: telefonda alt menünün hemen üstünde sabit */
  .onay-cubugu {
    position: sticky;
    bottom: calc(72px + env(safe-area-inset-bottom));
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    box-shadow: var(--golge-yuksek);
  }

  .tutar {
    display: flex;
    flex-direction: column;
  }

  .tutar small {
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
  }

  .tutar b {
    font-size: var(--yz-md);
    white-space: nowrap;
  }

  .onay-cubugu .btn {
    flex: 1;
  }

  @media (min-width: 1200px) {
    .onay-cubugu {
      bottom: 16px;
    }
  }
</style>
