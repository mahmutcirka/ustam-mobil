<script lang="ts">
  // Çağrı özeti — fiyat dökümü Rust'tan (fiyat_hesapla), onayda iş emri kodu Rust'tan (is_emri_uret)
  import Ikon from "$lib/components/Ikon.svelte";
  import { aralikYaz, basHarfler, paraYaz, sorunBilgisi, tarihYaz } from "$lib/data";
  import { cagri } from "$lib/cagri.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { dil, sayfaYolu } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { fiyatHesapla, rustIcinde } from "$lib/motor";
  import type { FiyatDokumu } from "$lib/kurallar";
  import type { Anahtar } from "$lib/ceviriler";
  import type { OdemeTercihi } from "../types/ustam";

  let isleniyor = $state(false);
  let hata = $state("");
  let telefon = $state(profil.bilgi.telefon);
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
  const telefonGecerli = $derived(telefon.replace(/[^\d+]/g, "").length >= 10);
  const gonderilebilir = $derived(telefonGecerli && kosullar && !isleniyor);

  async function onayla() {
    if (!cagri.taslak || !cagri.usta || !gonderilebilir) return;
    isleniyor = true;
    hata = "";
    try {
      profil.guncelle({ telefon: telefon.trim() });
      const emir = await isEmirleri.olustur($state.snapshot(cagri.taslak), cagri.usta, { odeme, telefon: telefon.trim() });
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
    <div class="kart ozet">
      <a class="usta" href="/usta/{u.id}">
        <span class="avatar" aria-hidden="true">{basHarfler(u.ad)}</span>
        <div>
          <strong>{u.ad}</strong>
          <p>{dil.t(`kategori.${u.kategori}`)} · {u.semt}</p>
        </div>
        <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={18} />
      </a>
      <dl>
        <dt>{dil.t("cagri.sorun")}</dt>
        <dd>{dil.t(`sorun.${t.sorun}` as Anahtar)}</dd>
        <dt>{dil.t("cagri.zaman")}</dt>
        <dd>{dil.t(`aciliyet.${t.aciliyet}`)} · {tarihYaz(t.zaman, dil.kod)}</dd>
        {#if t.adresNotu}
          <dt>{dil.t("cagri.adres")}</dt>
          <dd>{t.adresNotu}</dd>
        {/if}
      </dl>
      {#if t.foto}<img class="foto" src={t.foto} alt="" />{/if}
    </div>

    {#if f}
      <div class="kart fiyat">
        <div><span>{dil.t("cagri.cikis")}</span><span>{paraYaz(f.cikis, dil.kod)}</span></div>
        {#if f.acil}<div><span>{dil.t("cagri.acil")}</span><span>{paraYaz(f.acil, dil.kod)}</span></div>{/if}
        {#if f.gece}<div><span>{dil.t("cagri.gece")}</span><span>{paraYaz(f.gece, dil.kod)}</span></div>{/if}
        {#if f.pazar}<div><span>{dil.t("cagri.pazar")}</span><span>{paraYaz(f.pazar, dil.kod)}</span></div>{/if}
        <div><span>{dil.t("cagri.iscilik")}</span><span>{aralikYaz(f.iscilikMin, f.iscilikMax, dil.kod)}</span></div>
        <div class="toplam"><span>{dil.t("cagri.toplam")}</span><b>{aralikYaz(f.toplamMin, f.toplamMax, dil.kod)}</b></div>
        <p>{dil.t("cagri.not")}</p>
        <span class="motor"><Ikon ad="kalkan" boyut={14} /> {dil.t(motor)}</span>
      </div>
    {/if}

    <label class="kart alan">
      <span class="etiket"><Ikon ad="telefon" boyut={16} /> {dil.t("cagri.iletisim")}</span>
      <input
        type="tel"
        dir="ltr"
        inputmode="tel"
        autocomplete="tel"
        placeholder="05xx xxx xx xx"
        bind:value={telefon}
        aria-invalid={telefon !== "" && !telefonGecerli}
      />
      <small class:hata={telefon !== "" && !telefonGecerli}>
        {telefon !== "" && !telefonGecerli ? dil.t("cagri.telefonHata") : dil.t("cagri.telefonNot")}
      </small>
    </label>

    <fieldset class="kart alan">
      <legend class="etiket"><Ikon ad="para" boyut={16} /> {dil.t("cagri.odeme")}</legend>
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

    <label class="onay">
      <input type="checkbox" bind:checked={kosullar} />
      <span><a href={sayfaYolu(dil.kod, "kosullar")} target="_blank">{dil.t("sayfa.kosullar")}</a> — {dil.t("cagri.kosullarOnay")}</span>
    </label>

    {#if hata}
      <p class="hata-kutu"><Ikon ad="uyari" boyut={18} /> {dil.t("cagri.hata")} {hata}</p>
    {/if}

    <button class="btn" onclick={onayla} disabled={!gonderilebilir}>
      {isleniyor ? dil.t("cagri.isleniyor") : dil.t("cagri.onayla")}
    </button>
    <button class="btn ikincil" onclick={() => cagri.temizle()} disabled={isleniyor}>{dil.t("cagri.vazgec")}</button>
  {:else}
    <div class="bos">
      <span class="bos-ikon"><Ikon ad="pano" boyut={32} /></span>
      <p>{dil.t("cagri.bos")}</p>
      <a class="btn" href="/">{dil.t("cagri.ustaSec")}</a>
    </div>
  {/if}
</div>

<style>
  h1 {
    margin: 0;
    font-size: 22px;
  }

  .ozet,
  .fiyat {
    padding: 16px;
  }

  .usta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--kenar);
  }

  .usta > div {
    flex: 1;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .usta p {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin: 12px 0 0;
    font-size: 14px;
  }

  dt {
    color: var(--yazi-soluk);
  }

  dd {
    margin: 0;
    font-weight: 600;
  }

  .foto {
    width: 100%;
    max-height: 180px;
    margin-top: 12px;
    object-fit: cover;
    border-radius: var(--radius-kucuk);
  }

  .fiyat div {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .fiyat .toplam {
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--kenar);
    font-size: 17px;
  }

  .fiyat p {
    margin: 8px 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .motor {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--basari-yumusak);
    color: var(--basari);
    font-size: 12px;
    font-weight: 700;
  }

  .alan {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 14px;
  }

  .etiket {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    font-size: 14px;
    font-weight: 700;
  }

  .alan input[type="tel"] {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
  }

  .alan input[aria-invalid="true"] {
    border-color: var(--hata);
  }

  .alan small {
    font-size: 12px;
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
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    font-size: 14px;
    cursor: pointer;
  }

  .odeme label.aktif {
    border-color: var(--renk-ana);
    box-shadow: 0 0 0 1px var(--renk-ana);
  }

  .odeme input,
  .onay input {
    accent-color: var(--renk-ana);
  }

  .onay {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .onay input {
    width: 18px;
    height: 18px;
    margin-top: 1px;
  }

  .onay a {
    color: var(--renk-ana-yazi);
    font-weight: 700;
  }

  .hata-kutu {
    display: flex;
    gap: 8px;
    margin: 0;
    color: var(--hata);
  }

  .bos {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .bos p {
    margin: 0;
  }

  .bos .btn {
    width: auto;
  }

  .bos-ikon {
    display: flex;
    padding: 18px;
    border-radius: 50%;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }
</style>
