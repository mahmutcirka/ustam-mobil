<script lang="ts">
  // Aktif iş emri kartı — canlı aşama çizelgesi, varış geri sayımı, kod/QR, kapı doğrulaması ve işlemler
  import Ikon from "$lib/components/Ikon.svelte";
  import QrKod from "$lib/components/QrKod.svelte";
  import { aralikYaz, basHarfler, paraYaz, saatYaz, sayiYaz, tarihYaz } from "$lib/data";
  import { asamalar, takip } from "$lib/takip";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { isEmriKoduDogrula } from "$lib/motor";
  import { dil } from "$lib/i18n.svelte";
  import { saat } from "$lib/saat.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IsEmri } from "../types/ustam";

  let { is, iptalEt, bitir }: { is: IsEmri; iptalEt: (i: IsEmri) => void; bitir: (i: IsEmri) => void } = $props();

  const t = $derived(takip(is, saat.simdi));
  const sira = $derived(asamalar.indexOf(t.asama));
  const randevulu = $derived(is.aciliyet !== "hemen" && sira < 2);

  let qrAcik = $state(false);
  let girilenKod = $state("");
  let sonuc = $state<"dogru" | "yanlis" | "bicim" | "kontrol" | null>(null);

  async function dogrula(e: SubmitEvent) {
    e.preventDefault();
    const durum = await isEmriKoduDogrula(girilenKod);
    if (durum === "bicim-hatali") sonuc = "bicim";
    else if (durum === "kontrol-hatali") sonuc = "kontrol";
    else if (girilenKod.trim().toUpperCase() === is.kod) {
      sonuc = "dogru";
      isEmirleri.dogrula(is.kod);
      bildirim.goster(dil.t("is.dogrulandi"));
    } else sonuc = "yanlis";
  }

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(is.kod);
      bildirim.goster(dil.t("is.kopyalandi"), "bilgi", 1800);
    } catch {
      // pano izni yoksa sessizce geç
    }
  }
</script>

<article class="kart is">
  <header>
    <span class="avatar" aria-hidden="true">{basHarfler(is.ustaAd)}</span>
    <div class="kim">
      <strong>{is.ustaAd}</strong>
      <span>{dil.t(`kategori.${is.kategori}`)} · {dil.t(`sorun.${is.sorun}` as Anahtar)}</span>
    </div>
    {#if is.dogrulandi}
      <span class="dogrulandi"><Ikon ad="kalkan" boyut={14} /> {dil.t("is.dogrulandi")}</span>
    {/if}
  </header>

  <ol class="cizelge" aria-label={dil.t(`asama.${t.asama}`)}>
    {#each asamalar.slice(0, 4) as a, i}
      <li class:gecti={i < sira} class:simdi={i === sira} aria-current={i === sira ? "step" : undefined}>
        <span class="nokta">{#if i < sira}<Ikon ad="onay" boyut={12} />{/if}</span>
        <span class="ad">{dil.t(`asama.${a}`)}</span>
      </li>
    {/each}
  </ol>

  {#if t.asama === "yolda"}
    <div class="varis">
      <div class="varis-ust">
        <span><Ikon ad="yon" boyut={16} /> {dil.t("is.varis", { saat: saatYaz(t.varis.toISOString(), dil.kod) })}</span>
        <b>{dil.t("is.kalan", { dk: sayiYaz(t.kalanDk, dil.kod) })}</b>
      </div>
      <div class="ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(t.ilerleme * 100)}>
        <span style:width="{t.ilerleme * 100}%"></span>
      </div>
    </div>
  {:else if randevulu}
    <p class="bilgi-satiri"><Ikon ad="takvim" boyut={16} /> {dil.t("is.randevu", { zaman: tarihYaz(is.zaman, dil.kod) })}</p>
  {/if}

  {#if t.asama === "kapida" && !is.dogrulandi}
    <p class="kapida"><Ikon ad="uyari" boyut={18} /> {dil.t("is.kapidaNot")}</p>
  {/if}

  {#if is.telefon}
    {@const [once, sonra] = dil.t("is.ustaArayacak", { telefon: "\u0000" }).split("\u0000")}
    <!-- Numara, çeviri cümlesinin içindeki yerine yalıtılmış (LTR) olarak yerleştirilir -->
    <p class="bilgi-satiri"><Ikon ad="telefon" boyut={16} /> <span>{once}<bdi dir="ltr">{is.telefon}</bdi>{sonra}</span></p>
  {/if}

  <div class="kod-satiri">
    <div>
      <small>{dil.t("is.kod")}</small>
      <code dir="ltr">{is.kod}</code>
      <small>{dil.t("is.kodNot")}</small>
    </div>
    <button class="ikon-dugme" onclick={kopyala} aria-label={dil.t("is.kopyala")} title={dil.t("is.kopyala")}><Ikon ad="kopyala" boyut={18} /></button>
    <button class="ikon-dugme" class:aktif={qrAcik} onclick={() => (qrAcik = !qrAcik)} aria-expanded={qrAcik} aria-label={dil.t(qrAcik ? "is.qrGizle" : "is.qrGoster")}>
      <Ikon ad="qr" boyut={18} />
    </button>
  </div>

  {#if qrAcik}
    <div class="qr-kutu">
      <QrKod metin={is.kod} etiket={dil.t("is.qrEtiket", { kod: is.kod })} />
      <small>{dil.t("is.qrNot")}</small>
    </div>
  {/if}

  {#if !is.dogrulandi}
    <form class="dogrula" onsubmit={dogrula}>
      <label for="kod-{is.kod}"><Ikon ad="kalkan" boyut={16} /> {dil.t("is.dogrulaBaslik")}</label>
      <div class="satir">
        <input
          id="kod-{is.kod}"
          dir="ltr"
          placeholder={dil.t("is.dogrulaYer")}
          bind:value={girilenKod}
          oninput={() => (sonuc = null)}
          autocapitalize="characters"
          autocomplete="off"
        />
        <button class="btn" disabled={!girilenKod.trim()}>{dil.t("is.dogrulaBtn")}</button>
      </div>
      {#if sonuc === "yanlis"}<p class="sonuc hata">✗ {dil.t("is.yanlis")}</p>
      {:else if sonuc === "bicim"}<p class="sonuc hata">{dil.t("is.formatHatali")}</p>
      {:else if sonuc === "kontrol"}<p class="sonuc hata">{dil.t("is.kontrolHatali")}</p>{/if}
    </form>
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
    <button class="iptal" onclick={() => iptalEt(is)}><Ikon ad="kapat" boyut={16} /> {dil.t("is.iptal")}</button>
    <button class="bitir" onclick={() => bitir(is)} disabled={!is.dogrulandi} title={is.dogrulandi ? undefined : dil.t("is.bitirNot")}>
      <Ikon ad="onay" boyut={16} /> {dil.t("is.bitir")}
    </button>
  </div>
  {#if !is.dogrulandi}<p class="ipucu">{dil.t("is.bitirNot")}</p>{/if}
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
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .kim {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .kim strong {
    font-size: 16px;
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

  /* Aşama çizelgesi — noktalar arasında ilerleyen çizgi */
  .cizelge {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cizelge li {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .cizelge li:not(:first-child)::before {
    content: "";
    position: absolute;
    top: 9px;
    inset-inline-end: 50%;
    width: 100%;
    height: 2px;
    background: var(--kenar);
  }

  .cizelge li.gecti::before,
  .cizelge li.simdi::before {
    background: var(--renk-ana) !important;
  }

  .nokta {
    position: relative;
    z-index: 1;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--kenar);
    background: var(--kart);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--renk-ana-ustu);
  }

  .gecti .nokta {
    border-color: var(--renk-ana);
    background: var(--renk-ana);
  }

  .simdi .nokta {
    border-color: var(--renk-ana);
    box-shadow: 0 0 0 4px var(--renk-ana-yumusak);
  }

  .simdi .ad {
    color: var(--yazi);
    font-weight: 700;
  }

  .varis {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-kucuk);
    background: var(--renk-ana-yumusak);
    font-size: 14px;
  }

  .varis-ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .varis-ust span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ilerleme {
    height: 6px;
    border-radius: 3px;
    background: var(--kart);
    overflow: hidden;
  }

  .ilerleme span {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: var(--renk-ana);
    transition: width 1s linear;
  }

  .bilgi-satiri,
  .kapida {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .kapida {
    padding: 12px;
    border-radius: var(--radius-kucuk);
    background: var(--vurgu-yumusak);
    color: var(--yazi);
    font-weight: 600;
  }

  .kod-satiri {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 2px dashed var(--kenar);
    border-radius: var(--radius-kucuk);
  }

  .kod-satiri div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .kod-satiri small {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  code {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .ikon-dugme {
    display: flex;
    padding: 9px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
  }

  .ikon-dugme.aktif {
    border-color: var(--renk-ana);
    color: var(--renk-ana-yazi);
  }

  .qr-kutu {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .qr-kutu small {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .dogrula {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dogrula label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
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
    border-radius: var(--radius-kucuk);
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

  .hata {
    color: var(--hata);
  }

  .dokum summary {
    cursor: pointer;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .dokum b {
    color: var(--yazi);
  }

  .dokum dl {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px 12px;
    margin: 10px 0 0;
    font-size: 14px;
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
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .islemler button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 12px;
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
    font-size: 12px;
    color: var(--yazi-soluk);
    text-align: center;
  }
</style>
