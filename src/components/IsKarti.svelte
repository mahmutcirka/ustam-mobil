<script lang="ts">
  // Aktif iş kartı — 5 aşamalı zaman çizelgesi (saatleriyle), yoldayken geri sayım,
  // güvenlik kodu (kopyala / QR / doğrula) ve işlemler. Aşamalar takip.ts simülasyonundan gelir.
  import Ikon from "$lib/components/Ikon.svelte";
  import QrKod from "$lib/components/QrKod.svelte";
  import { aralikYaz, basHarfler, kategoriIkon, paraYaz, saatYaz, sayiYaz, tarihYaz, ustaBul } from "$lib/data";
  import { ONAY_SN, asamalar, takip } from "$lib/takip";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { isEmriKoduDogrula, panoyaKopyala } from "$lib/native";
  import { kodGirdisiniDuzenle } from "$lib/kodGirdisi";
  import { dil } from "$lib/i18n.svelte";
  import { saat } from "$lib/saat.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IsEmri } from "../lib/types";

  let { is, iptalEt, bitir }: { is: IsEmri; iptalEt: (i: IsEmri) => void; bitir: (i: IsEmri) => void } = $props();

  const t = $derived(takip(is, saat.simdi));
  const sira = $derived(asamalar.indexOf(t.asama));
  const usta = $derived(ustaBul(is.ustaId));
  const randevulu = $derived(is.aciliyet !== "hemen" && sira < 2);

  // Her aşamanın (tahmini) saati — çizelgede gösterilir
  const asamaSaatleri = $derived.by(() => {
    const olusma = new Date(is.olusturma).getTime();
    const yolaCikis = Math.max(t.varis.getTime() - is.varisDk * 60_000, olusma + 45_000);
    return [olusma, olusma + ONAY_SN * 1000, yolaCikis, t.varis.getTime()].map((z) => saatYaz(new Date(z).toISOString(), dil.kod));
  });

  let qrAcik = $state(false);
  let girilenKod = $state("");
  let sonuc = $state<"dogru" | "yanlis" | "bicim" | "kontrol" | null>(null);
  let kodKutusu = $state<HTMLInputElement>();

  async function dogrula(e: SubmitEvent) {
    e.preventDefault();
    const kod = kodGirdisiniDuzenle(girilenKod);
    girilenKod = kod;
    const durum = await isEmriKoduDogrula(kod);
    if (durum === "bicim-hatali") sonuc = "bicim";
    else if (durum === "kontrol-hatali") sonuc = "kontrol";
    else if (kod === is.kod) {
      sonuc = "dogru";
      isEmirleri.dogrula(is.kod);
      bildirim.goster(dil.t("is.dogrulandi"));
    } else sonuc = "yanlis";
  }

  function tekrarDene() {
    sonuc = null;
    girilenKod = "";
    kodKutusu?.focus();
  }

  async function kopyala() {
    if (await panoyaKopyala(is.kod)) bildirim.goster(dil.t("is.kopyalandi"), "bilgi", 1800);
  }
</script>

<article class="kart is">
  <header>
    <span class="avatar" aria-hidden="true">
      {basHarfler(is.ustaAd)}
      <span class="kategori"><Ikon ad={kategoriIkon[is.kategori]} boyut={11} /></span>
    </span>
    <div class="kim">
      <strong>{is.ustaAd}</strong>
      <span>{dil.t(`sorun.${is.sorun}` as Anahtar)}{#if usta} · {usta.semt}{/if}</span>
    </div>
    {#if is.dogrulandi}
      <span class="dogrulandi"><Ikon ad="kalkan" boyut={14} /> {dil.t("is.dogrulandi")}</span>
    {/if}
  </header>

  {#if t.asama === "yolda"}
    <div class="varis" role="status">
      <div class="varis-ust">
        <b class="kalan">{dil.t("is.kalan", { dk: sayiYaz(t.kalanDk, dil.kod) })}</b>
        <span>{dil.t("is.varis", { saat: saatYaz(t.varis.toISOString(), dil.kod) })}</span>
      </div>
      <div class="ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(t.ilerleme * 100)}>
        <span style:width="{t.ilerleme * 100}%"></span>
      </div>
    </div>
  {:else if randevulu}
    <p class="bilgi-satiri"><Ikon ad="takvim" boyut={16} /> {dil.t("is.randevu", { zaman: tarihYaz(is.zaman, dil.kod) })}</p>
  {:else if t.asama === "kapida" && !is.dogrulandi}
    <p class="kapida" role="status"><Ikon ad="uyari" boyut={18} /> {dil.t("is.kapidaNot")}</p>
  {/if}

  <ol class="cizelge">
    {#each asamalar as a, i}
      <li class:gecti={i < sira} class:simdi={i === sira} aria-current={i === sira ? "step" : undefined}>
        <span class="nokta">{#if i < sira}<Ikon ad="onay" boyut={11} />{/if}</span>
        <span class="ad">{dil.t(`asama.${a}`)}</span>
        {#if i < 4 && i <= sira}<span class="zaman" dir="ltr">{asamaSaatleri[i]}</span>{/if}
      </li>
    {/each}
  </ol>

  <section class="guvenlik" aria-labelledby="guvenlik-{is.kod}">
    <div class="guvenlik-ust">
      <span id="guvenlik-{is.kod}"><Ikon ad="kalkan" boyut={16} /> {dil.t("is.guvenlikKodu")}</span>
      <div class="aksiyonlar">
        <button class="ikon-dugme" onclick={kopyala} aria-label={dil.t("is.kopyala")} title={dil.t("is.kopyala")}><Ikon ad="kopyala" boyut={18} /></button>
        <button class="ikon-dugme" class:aktif={qrAcik} onclick={() => (qrAcik = !qrAcik)} aria-expanded={qrAcik} aria-label={dil.t(qrAcik ? "is.qrGizle" : "is.qrGoster")}>
          <Ikon ad="qr" boyut={18} />
        </button>
      </div>
    </div>
    <code dir="ltr">{is.kod}</code>
    <small>{dil.t("is.kodNot")}</small>

    {#if qrAcik}
      <div class="qr-kutu">
        <QrKod metin={is.kod} etiket={dil.t("is.qrEtiket", { kod: is.kod })} />
        <small>{dil.t("is.qrNot")}</small>
      </div>
    {/if}

    {#if !is.dogrulandi}
      <form class="dogrula" onsubmit={dogrula}>
        <label for="kod-{is.kod}">{dil.t("is.dogrulaBaslik")}</label>
        <div class="satir">
          <input
            bind:this={kodKutusu}
            id="kod-{is.kod}"
            dir="ltr"
            placeholder="UST-XXX-0000-XXXX"
            bind:value={girilenKod}
            oninput={() => (sonuc = null)}
            autocapitalize="characters"
            autocomplete="off"
            spellcheck="false"
            aria-invalid={sonuc === "yanlis" || sonuc === "bicim" || sonuc === "kontrol"}
          />
          <button class="btn" disabled={!girilenKod.trim()}>{dil.t("is.dogrulaBtn")}</button>
        </div>
      </form>
      {#if sonuc === "yanlis"}
        <div class="sonuc tehlike" role="alert">
          <Ikon ad="uyari" boyut={22} />
          <div>
            <b>{dil.t("is.yanlisBaslik")}</b>
            <p>{dil.t("is.yanlisMetin")}</p>
            <button class="btn ikincil kucuk" onclick={tekrarDene}>{dil.t("cagri.tekrarDene")}</button>
          </div>
        </div>
      {:else if sonuc === "bicim" || sonuc === "kontrol"}
        <p class="sonuc uyari" role="alert">
          <Ikon ad="bilgi" boyut={18} /> {dil.t(sonuc === "bicim" ? "is.formatHatali" : "is.kontrolHatali")}
        </p>
      {/if}
    {:else}
      <div class="sonuc basari" role="status">
        <Ikon ad="onay" boyut={22} />
        <div>
          <b>{dil.t("is.dogruBaslik")}</b>
          <p>{dil.t("is.dogruMetin")}</p>
        </div>
      </div>
    {/if}
  </section>

  {#if is.telefon}
    {@const [once, sonra] = dil.t("is.ustaArayacak", { telefon: "\u0000" }).split("\u0000")}
    <!-- Numara, çeviri cümlesinin içindeki yerine yalıtılmış (LTR) olarak yerleştirilir -->
    <p class="bilgi-satiri"><Ikon ad="telefon" boyut={16} /> <span>{once}<bdi dir="ltr">{is.telefon}</bdi>{sonra}</span></p>
  {/if}

  <details class="dokum">
    <summary>{dil.t("is.fiyatDokumu")} · <b>{aralikYaz(is.fiyat.toplamMin, is.fiyat.toplamMax, dil.kod)}</b></summary>
    <dl>
      <dt>{dil.t("cagri.cikis")}</dt><dd>{paraYaz(is.fiyat.cikis, dil.kod)}</dd>
      {#if is.fiyat.acil}<dt>{dil.t("cagri.acil")}</dt><dd>{paraYaz(is.fiyat.acil, dil.kod)}</dd>{/if}
      {#if is.fiyat.gece}<dt>{dil.t("cagri.gece")}</dt><dd>{paraYaz(is.fiyat.gece, dil.kod)}</dd>{/if}
      {#if is.fiyat.pazar}<dt>{dil.t("cagri.pazar")}</dt><dd>{paraYaz(is.fiyat.pazar, dil.kod)}</dd>{/if}
      <dt>{dil.t("cagri.iscilik")}</dt><dd>{aralikYaz(is.fiyat.iscilikMin, is.fiyat.iscilikMax, dil.kod)}</dd>
      <dt>{dil.t("is.odeme")}</dt><dd>{dil.t(`odeme.${is.odeme}`)}</dd>
    </dl>
    {#if is.foto}<img src={is.foto} alt="" />{/if}
  </details>

  <div class="islemler">
    <button class="iptal" onclick={() => iptalEt(is)}>{dil.t("is.iptal")}</button>
    <button class="bitir" onclick={() => bitir(is)} disabled={!is.dogrulandi} aria-describedby={is.dogrulandi ? undefined : `bitir-not-${is.kod}`}>
      <Ikon ad="onay" boyut={16} /> {dil.t("is.bitir")}
    </button>
  </div>
  {#if !is.dogrulandi}<p class="ipucu" id="bitir-not-{is.kod}">{dil.t("is.bitirNot")}</p>{/if}
</article>

<style>
  .is {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    position: relative;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 15px;
    background: var(--yuzey-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .avatar .kategori {
    position: absolute;
    bottom: -3px;
    inset-inline-end: -3px;
    display: flex;
    padding: 3px;
    border-radius: 50%;
    border: 2px solid var(--kart);
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .kim {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .kim strong {
    font-size: var(--yz-md);
    color: var(--yazi);
  }

  .dogrulandi {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--basari-yumusak);
    color: var(--basari);
    font-size: 11px;
    font-weight: 700;
  }

  .varis {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .varis-ust {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    font-size: var(--yz-sm);
  }

  .kalan {
    font-size: var(--yz-xl);
  }

  .ilerleme {
    height: 6px;
    border-radius: 3px;
    background: var(--koyu-cam);
    overflow: hidden;
  }

  .ilerleme span {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: var(--logo);
    transition: width 1s linear;
  }

  /* Dikey aşama çizelgesi */
  .cizelge {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cizelge li {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 36px;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .cizelge li:not(:last-child)::after {
    content: "";
    position: absolute;
    inset-inline-start: 9px;
    top: 26px;
    height: calc(100% - 16px);
    width: 2px;
    background: var(--kenar);
  }

  .cizelge li.gecti::after {
    background: var(--basari);
  }

  .nokta {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--kenar);
    background: var(--kart);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--kart);
  }

  .gecti .nokta {
    border-color: var(--basari);
    background: var(--basari);
  }

  .simdi .nokta {
    border-color: var(--yazi);
    box-shadow: 0 0 0 4px var(--yuzey-2);
  }

  .simdi .ad {
    color: var(--yazi);
    font-weight: 700;
  }

  .ad {
    flex: 1;
  }

  .zaman {
    font-variant-numeric: tabular-nums;
  }

  .bilgi-satiri,
  .kapida {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .kapida {
    padding: 12px;
    border-radius: var(--radius-kucuk);
    background: var(--vurgu-yumusak);
    color: var(--yazi);
    font-weight: 600;
  }

  /* Güvenlik kodu — kartın içinde ayrı, belirgin bir alan */
  .guvenlik {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--yuzey-2);
  }

  .guvenlik-ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .guvenlik-ust > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .aksiyonlar {
    display: flex;
    gap: 6px;
  }

  code {
    font-size: var(--yz-xl);
    font-weight: 800;
    letter-spacing: 1.5px;
    text-align: center;
  }

  .guvenlik small {
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    text-align: center;
  }

  .ikon-dugme {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
  }

  .ikon-dugme.aktif {
    border-color: var(--secili);
  }

  .qr-kutu {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    animation: sayfa-gir var(--sure-orta) var(--egri);
  }

  .dogrula {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dogrula label {
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .dogrula .satir {
    display: flex;
    gap: 8px;
  }

  .dogrula input {
    flex: 1;
    min-width: 0;
    min-height: 48px;
    padding: 0 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
    font-family: ui-monospace, monospace;
    font-size: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .dogrula input::placeholder {
    text-transform: none;
    letter-spacing: 0;
  }

  .dogrula input[aria-invalid="true"] {
    border-color: var(--hata);
  }

  .dogrula .btn {
    width: auto;
  }

  .sonuc {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 0;
    padding: 12px;
    border-radius: var(--radius-kucuk);
    font-size: var(--yz-sm);
  }

  .sonuc p {
    margin: 2px 0 8px;
  }

  .sonuc.tehlike {
    border: 1px solid var(--hata);
    background: var(--hata-yumusak);
    color: var(--yazi);
  }

  .sonuc.tehlike > :global(.ikon),
  .sonuc.tehlike b {
    color: var(--hata);
  }

  .sonuc.uyari {
    align-items: center;
    background: var(--vurgu-yumusak);
  }

  .sonuc.basari {
    background: var(--basari-yumusak);
  }

  .sonuc.basari > :global(.ikon),
  .sonuc.basari b {
    color: var(--basari);
  }

  .sonuc.basari p {
    margin-bottom: 0;
  }

  .dokum summary {
    min-height: 32px;
    cursor: pointer;
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .dokum b {
    color: var(--yazi);
  }

  .dokum dl {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px 12px;
    margin: 8px 0 0;
    font-size: var(--yz-sm);
  }

  .dokum dt {
    color: var(--yazi-soluk);
  }

  .dokum dd {
    margin: 0;
    font-weight: 600;
  }

  .dokum img {
    width: 100%;
    max-height: 160px;
    margin-top: 10px;
    object-fit: cover;
    border-radius: var(--radius-kucuk);
  }

  .islemler {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 8px;
  }

  .islemler button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    min-height: 48px;
    border-radius: var(--radius);
    font-weight: 700;
  }

  .iptal {
    border: 1px solid var(--kenar);
    background: var(--kart);
    color: var(--hata);
  }

  .bitir {
    border: 0;
    background: var(--basari);
    color: var(--kart);
  }

  .bitir:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ipucu {
    margin: -6px 0 0;
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    text-align: center;
  }
</style>
