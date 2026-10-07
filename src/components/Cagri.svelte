<script lang="ts">
  // Çağrı özeti — "Çağrıyı onayla" Rust'taki is_emri_uret komutunu çağırır
  import { ACIL_UCRET, kategoriIkon, paraYaz, tarihYaz } from "$lib/data";
  import { cagri } from "$lib/cagri.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { dil } from "$lib/i18n.svelte";
  import type { Anahtar } from "$lib/ceviriler";

  let isleniyor = $state(false);
  let hata = $state("");

  async function onayla() {
    if (!cagri.taslak || !cagri.usta) return;
    isleniyor = true;
    hata = "";
    try {
      await isEmirleri.olustur($state.snapshot(cagri.taslak), cagri.usta);
      cagri.temizle();
      window.location.assign("/is-emirlerim"); // iş emri localStorage'a yazıldı, tam sayfa geçişinde kaybolmaz
    } catch (e) {
      hata = String(e);
    } finally {
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
      <div class="usta">
        <span class="avatar" aria-hidden="true">{kategoriIkon[u.kategori]}</span>
        <div>
          <strong>{u.ad}</strong>
          <p>{dil.t(`kategori.${u.kategori}`)} · {u.bolge}</p>
        </div>
      </div>
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
    </div>

    <div class="kart fiyat">
      <div><span>{dil.t("cagri.cikis")}</span><span>{paraYaz(u.cikisUcreti, dil.kod)}</span></div>
      {#if t.aciliyet === "hemen"}
        <div><span>{dil.t("cagri.acil")}</span><span>{paraYaz(ACIL_UCRET, dil.kod)}</span></div>
      {/if}
      <div class="toplam"><span>{dil.t("cagri.toplam")}</span><b>{paraYaz(cagri.tutar, dil.kod)}</b></div>
      <p>{dil.t("cagri.not")}</p>
    </div>

    {#if hata}
      <p class="hata">{dil.t("cagri.hata")} {hata}</p>
    {/if}

    <button class="btn" onclick={onayla} disabled={isleniyor}>
      {isleniyor ? dil.t("cagri.isleniyor") : dil.t("cagri.onayla")}
    </button>
    <button class="btn ikincil" onclick={() => cagri.temizle()} disabled={isleniyor}>{dil.t("cagri.vazgec")}</button>
  {:else}
    <p class="bos">{dil.t("cagri.bos")}<br /><a href="/">{dil.t("cagri.ustaSec")}</a></p>
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

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: var(--renk-ana-yumusak);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
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
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .hata {
    margin: 0;
    color: var(--hata);
  }

  .bos a {
    color: var(--renk-ana-yazi);
    font-weight: 600;
  }
</style>
