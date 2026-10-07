<script lang="ts">
  // İş Emirlerim — Rust'ın ürettiği kodlar, durum yönetimi ve kapıdaki ustayı doğrulama
  import Ikon from "$lib/components/Ikon.svelte";
  import { kategoriIkon, paraYaz, tarihYaz } from "$lib/data";
  import { isEmirleri, kodBicimiGecerli } from "$lib/isEmirleri.svelte";
  import { dil } from "$lib/i18n.svelte";
  import type { Anahtar } from "$lib/ceviriler";

  let girilenKod = $state("");
  let sonuc = $state<"dogru" | "yanlis" | "format" | null>(null);

  async function dogrula(event: SubmitEvent) {
    event.preventDefault();
    const kod = girilenKod.trim().toUpperCase();
    if (!(await kodBicimiGecerli(kod))) sonuc = "format";
    else sonuc = isEmirleri.bul(kod) ? "dogru" : "yanlis";
  }
</script>

<div class="sayfa">
  <h1>{dil.t("is.baslik")}</h1>

  {#if isEmirleri.liste.length > 0}
    <form class="kart dogrula" onsubmit={dogrula}>
      <strong>🛡️ {dil.t("is.dogrulaBaslik")}</strong>
      <div class="satir">
        <input
          dir="ltr"
          placeholder={dil.t("is.dogrulaYer")}
          bind:value={girilenKod}
          oninput={() => (sonuc = null)}
          autocapitalize="characters"
        />
        <button class="btn" disabled={!girilenKod.trim()}>{dil.t("is.dogrulaBtn")}</button>
      </div>
      {#if sonuc === "dogru"}
        <p class="sonuc basari">✓ {dil.t("is.dogru")}</p>
      {:else if sonuc === "yanlis"}
        <p class="sonuc hata">✗ {dil.t("is.yanlis")}</p>
      {:else if sonuc === "format"}
        <p class="sonuc hata">{dil.t("is.formatHatali")}</p>
      {/if}
    </form>
  {/if}

  <div class="izgara">
    {#each isEmirleri.liste as i (i.kod)}
      <div class="kart emir" class:pasif={i.durum === "tamamlandi" || i.durum === "iptal"}>
        <div class="ust">
          <div class="baslik">
            <Ikon ad={kategoriIkon[i.kategori]} boyut={18} />
            <strong>{i.ustaAd}</strong>
            <span class="durum {i.durum}">{dil.t(`durum.${i.durum}`)}</span>
          </div>
          <p>{dil.t(`sorun.${i.sorun}` as Anahtar)}</p>
          <p>{dil.t(`aciliyet.${i.aciliyet}`)} · {tarihYaz(i.zaman, dil.kod)}</p>
          <p>{paraYaz(i.tutar, dil.kod)}</p>
        </div>
        <div class="kod">
          <span>{dil.t("is.kod")}</span>
          <code dir="ltr">{i.kod}</code>
        </div>
        {#if i.durum === "bekliyor" || i.durum === "yolda"}
          <p class="kod-not">{dil.t("is.kodNot")}</p>
          <div class="eylemler">
            <button onclick={() => isEmirleri.durumDegistir(i.kod, "tamamlandi")}>✓ {dil.t("is.tamamla")}</button>
            <button class="iptal" onclick={() => isEmirleri.durumDegistir(i.kod, "iptal")}>{dil.t("is.iptal")}</button>
          </div>
        {/if}
      </div>
    {:else}
      <p class="bos">{dil.t("is.bos")}<br /><a href="/">{dil.t("cagri.ustaSec")}</a></p>
    {/each}
  </div>
</div>

<style>
  h1 {
    margin: 0;
    font-size: 22px;
  }

  .dogrula {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .dogrula .satir {
    display: flex;
    gap: 8px;
  }

  .dogrula input {
    flex: 1;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: 10px;
    background: var(--zemin);
    font-family: ui-monospace, monospace;
    letter-spacing: 1px;
  }

  .dogrula input:not(:placeholder-shown) {
    text-transform: uppercase;
  }

  .dogrula .btn {
    width: auto;
  }

  .sonuc {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .basari {
    color: var(--basari);
  }

  .hata {
    color: var(--hata);
  }

  .emir {
    overflow: hidden;
  }

  .emir.pasif {
    opacity: 0.6;
  }

  .ust {
    padding: 14px;
    border-inline-start: 6px solid var(--renk-ana);
  }

  .baslik {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .baslik strong {
    flex: 1;
  }

  .ust p {
    margin: 2px 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .durum {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: var(--kenar);
    color: var(--yazi-soluk);
  }

  .durum.yolda {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .durum.bekliyor {
    background: var(--vurgu-yumusak);
    color: var(--yazi);
  }

  .kod {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-top: 2px dashed var(--kenar);
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  code {
    font-size: 16px;
    font-weight: 700;
    color: var(--yazi);
    letter-spacing: 1px;
  }

  .kod-not {
    margin: 0;
    padding: 0 14px 10px;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .eylemler {
    display: flex;
    border-top: 1px solid var(--kenar);
  }

  .eylemler button {
    flex: 1;
    padding: 12px;
    border: 0;
    background: none;
    font-weight: 600;
    color: var(--basari);
  }

  .eylemler .iptal {
    color: var(--hata);
    border-inline-start: 1px solid var(--kenar);
  }

  .bos a {
    color: var(--renk-ana-yazi);
    font-weight: 600;
  }
</style>
