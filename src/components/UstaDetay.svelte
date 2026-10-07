<script lang="ts">
  // Detay ve seçim ekranı — sorun tipi, aciliyet, ziyaret zamanı ve adres notu
  import { ACIL_UCRET, aciliyetler, kategoriIkon, paraYaz, saatDilimleri, sayiYaz, tutarHesapla, yerelIso } from "$lib/data";
  import { cagri } from "$lib/cagri.svelte";
  import { dil } from "$lib/i18n.svelte";
  import type { Anahtar } from "$lib/ceviriler";
  import type { Aciliyet, Usta } from "../types/ustam";

  let { usta: u }: { usta: Usta } = $props();

  const simdi = new Date();
  const bugun = yerelIso(simdi).slice(0, 10);
  const yarin = yerelIso(new Date(simdi.getTime() + 86_400_000)).slice(0, 10);
  // Bugün için en az 1 saat sonraki dilimler seçilebilir (gece yarısını geçerse hiçbiri)
  const birSaatSonra = yerelIso(new Date(simdi.getTime() + 3_600_000));
  const sinir = birSaatSonra.slice(0, 10) === bugun ? birSaatSonra.slice(11) : "24:00";
  const bugunSaatleri = saatDilimleri.filter((s) => s > sinir);

  // Meşgul usta yalnızca randevu kabul eder
  const izinli = (a: Aciliyet) => u.musait || a === "randevu";

  let sorun = $state(u.sorunlar[0]);
  let aciliyet = $state<Aciliyet>(u.musait ? "hemen" : "randevu");
  let tarih = $state(yarin);
  let saat = $state(saatDilimleri[1]);
  let bugunSaat = $state(bugunSaatleri[0] ?? "");
  let adresNotu = $state("");

  const zaman = $derived.by(() => {
    if (aciliyet === "hemen") return yerelIso(new Date(simdi.getTime() + 30 * 60_000));
    if (aciliyet === "bugun") return `${bugun}T${bugunSaat}`;
    return `${tarih}T${saat}`;
  });

  const gonderilebilir = $derived(
    izinli(aciliyet) && (aciliyet !== "bugun" || bugunSaatleri.length > 0) && (aciliyet !== "randevu" || tarih >= yarin),
  );

  const tutar = $derived(tutarHesapla(u, aciliyet));

  function cagir() {
    if (!gonderilebilir) return;
    cagri.hazirla({ ustaId: u.id, sorun, aciliyet, zaman, adresNotu: adresNotu.trim() });
    window.location.assign("/cagri"); // taslak localStorage'da, tam sayfa geçişinde kaybolmaz
  }
</script>

<div class="kapak">
  <div class="avatar" aria-hidden="true">{kategoriIkon[u.kategori]}</div>
  <div>
    <span class="etiket">{dil.t(`kategori.${u.kategori}`)}</span>
    <h1>{u.ad}</h1>
    <p>⭐ {sayiYaz(u.puan, dil.kod)} · {dil.t("kart.yorum", { n: sayiYaz(u.yorumSayisi, dil.kod) })}</p>
  </div>
</div>

<div class="sayfa dar">
  <div class="istatistik">
    <div class="kart"><b>{dil.t("detay.yil", { n: sayiYaz(u.deneyimYil, dil.kod) })}</b><span>{dil.t("detay.deneyim")}</span></div>
    <div class="kart"><b>{sayiYaz(u.tamamlananIs, dil.kod)}</b><span>{dil.t("detay.tamamlanan")}</span></div>
    <div class="kart"><b>{u.bolge}</b><span>{dil.t("detay.bolge")} · {dil.t("kart.km", { n: sayiYaz(u.mesafeKm, dil.kod) })}</span></div>
  </div>

  {#if !u.musait}
    <p class="uyari">{dil.t("detay.mesgulUyari")}</p>
  {/if}

  <section>
    <h2>{dil.t("detay.sorunSec")}</h2>
    <div class="secenekler">
      {#each u.sorunlar as s}
        <label class="kart secenek" class:aktif={sorun === s}>
          <input type="radio" name="sorun" value={s} bind:group={sorun} />
          <span>{dil.t(`sorun.${s}` as Anahtar)}</span>
        </label>
      {/each}
    </div>
    {#if dil.kod !== "tr"}
      <p class="iletilen">{dil.t("detay.ustayaIletilen")} <b lang="tr" dir="ltr">“{dil.tr(`sorun.${sorun}` as Anahtar)}”</b></p>
    {/if}
  </section>

  <section>
    <h2>{dil.t("detay.aciliyet")}</h2>
    <div class="aciliyet">
      {#each aciliyetler as a}
        <button class:aktif={aciliyet === a} disabled={!izinli(a)} onclick={() => (aciliyet = a)}>
          {dil.t(`aciliyet.${a}`)}
        </button>
      {/each}
    </div>

    {#if aciliyet === "hemen"}
      <p class="not">🚀 {dil.t("detay.hemenNot")} <b>{dil.t("detay.acilUcret", { tutar: paraYaz(ACIL_UCRET, dil.kod) })}</b></p>
    {:else if aciliyet === "bugun"}
      {#if bugunSaatleri.length === 0}
        <p class="uyari">{dil.t("detay.bugunSaatYok")}</p>
      {:else}
        <div class="saatler" role="radiogroup" aria-label={dil.t("detay.saat")}>
          {#each bugunSaatleri as s}
            <button class:aktif={bugunSaat === s} onclick={() => (bugunSaat = s)}>{s}</button>
          {/each}
        </div>
      {/if}
    {:else}
      <label class="alan">
        {dil.t("detay.tarih")}
        <input type="date" min={yarin} bind:value={tarih} />
      </label>
      <div class="saatler" role="radiogroup" aria-label={dil.t("detay.saat")}>
        {#each saatDilimleri as s}
          <button class:aktif={saat === s} onclick={() => (saat = s)}>{s}</button>
        {/each}
      </div>
    {/if}
  </section>

  <label class="alan">
    {dil.t("detay.adres")}
    <textarea rows="2" placeholder={dil.t("detay.adresOrnek")} bind:value={adresNotu}></textarea>
  </label>

  <button class="btn" onclick={cagir} disabled={!gonderilebilir}>
    {dil.t("detay.cagir", { tutar: paraYaz(tutar, dil.kod) })}
  </button>
</div>

<style>
  .kapak {
    display: flex;
    align-items: center;
    gap: 16px;
    /* İçerik .sayfa.dar (560px) ile aynı hizada başlasın */
    padding: 28px max(16px, calc((100% - 560px) / 2 + 16px)) 20px;
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
  }

  .avatar {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    border-radius: 20px;
    background: var(--koyu-cam);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
  }

  .etiket {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.85;
  }

  .kapak h1 {
    margin: 2px 0;
    font-size: 24px;
  }

  .kapak p {
    margin: 0;
    font-size: 14px;
    opacity: 0.85;
  }

  .istatistik {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .istatistik .kart {
    padding: 12px 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .istatistik span {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  h2 {
    margin: 4px 0 0;
    font-size: 17px;
  }

  .secenekler {
    display: grid;
    gap: 8px;
  }

  .secenek {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px;
    cursor: pointer;
  }

  .secenek.aktif,
  .aciliyet button.aktif,
  .saatler button.aktif {
    border-color: var(--renk-ana);
    box-shadow: 0 0 0 1px var(--renk-ana);
  }

  .secenek input {
    accent-color: var(--renk-ana);
  }

  .iletilen {
    margin: 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .aciliyet {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .aciliyet button,
  .saatler button {
    padding: 12px 6px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    font-weight: 600;
  }

  .aciliyet button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .saatler {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .not,
  .uyari {
    margin: 0;
    padding: 12px 14px;
    border-radius: var(--radius);
    font-size: 14px;
  }

  .not {
    background: var(--renk-ana-yumusak);
  }

  .uyari {
    background: var(--vurgu-yumusak);
  }

  .alan {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }

  .alan input,
  .alan textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: 10px;
    background: var(--kart);
    font-weight: 400;
    resize: vertical;
  }
</style>
