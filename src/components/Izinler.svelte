<script lang="ts">
  // İzin merkezi (/izinler) — her iznin işletim sisteminden okunan anlık durumu, ne için istendiği ve verinin nereye
  // gittiği; izin isteme, reddedilmişse sistem ayarlarına yönlendirme, bildirim kategorileri ve deneme bildirimi.
  // Ekran açılınca yalnız durum okunur (diyalog açılmaz); diyalog yalnız "İzin ver" düğmesiyle açılır. docs/izinler.md
  import { onMount } from "svelte";
  import Ikon from "$lib/components/Ikon.svelte";
  import Yukleniyor from "$lib/components/ui/Yukleniyor.svelte";
  import HataDurumu from "$lib/components/ui/HataDurumu.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { bildirimTercihleri } from "$lib/bildirimIzleyici.svelte";
  import { dil } from "$lib/i18n.svelte";
  import { bildirimGoster, destekleniyorMu, hataAnahtari, izinDurumu, izinIste, NativeHata, sistemAyarlariniAc } from "$lib/native";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IkonAdi } from "$lib/ikonlar";
  import { BILDIRIM_KATEGORILERI, type BildirimKategorisi, type IzinDegeri, type IzinDurumu, type IzinKimligi } from "../lib/types";

  const metin: Record<IzinKimligi, { ad: Anahtar; neden: Anahtar; veri: Anahtar; ikon: IkonAdi }> = {
    bildirim: { ad: "izin.bildirim", neden: "izin.bildirimNeden", veri: "izin.bildirimVeri", ikon: "zil" },
    konum: { ad: "izin.konum", neden: "izin.konumNeden", veri: "izin.konumVeri", ikon: "konum" },
  };
  const durumMetni: Record<IzinDegeri, Anahtar> = {
    verildi: "izin.durum.verildi",
    reddedildi: "izin.durum.reddedildi",
    sorulmadi: "izin.durum.sorulmadi",
    "servis-kapali": "izin.durum.servisKapali",
    gerekmiyor: "izin.durum.gerekmiyor",
    desteklenmiyor: "izin.durum.desteklenmiyor",
    okunamadi: "izin.durum.okunamadi",
  };
  // Rozet tonu ve ikonu: yeşil açık, kırmızı engelli, sarı karar bekliyor, gri yok
  const ton: Record<IzinDegeri, ["acik" | "engel" | "bekliyor" | "yok", IkonAdi]> = {
    verildi: ["acik", "onay"],
    gerekmiyor: ["acik", "onay"],
    reddedildi: ["engel", "kapat"],
    "servis-kapali": ["engel", "uyari"],
    sorulmadi: ["bekliyor", "saat"],
    okunamadi: ["bekliyor", "uyari"],
    desteklenmiyor: ["yok", "eksi"],
  };
  const kategoriMetni: Record<BildirimKategorisi, [Anahtar, Anahtar]> = {
    "is-durumu": ["izin.kategori.isDurumu", "izin.kategori.isDurumuNot"],
    randevu: ["izin.kategori.randevu", "izin.kategori.randevuNot"],
  };

  let izinler = $state<IzinDurumu[]>([]);
  let durum = $state<"yukleniyor" | "hazir" | "hata">("yukleniyor");
  let yenileniyor = $state(false);
  let isteniyor = $state<IzinKimligi | null>(null);
  let deneniyor = $state(false);

  const ayarlarVar = destekleniyorMu("sistem-ayarlari");
  const bildirimAcik = $derived(izinler.some((i) => i.id === "bildirim" && (i.durum === "verildi" || i.durum === "gerekmiyor")));

  /** Reddedilip artık uygulama içinden sorulamayan izin; masaüstünde bildirim ayarları da sistemdedir */
  const ayarlardan = (i: IzinDurumu) => (i.durum === "reddedildi" && !i.istenebilir) || i.durum === "gerekmiyor";

  function ipucu(i: IzinDurumu): Anahtar | null {
    if (i.durum === "reddedildi" && !i.istenebilir) return ayarlarVar ? "izin.ipucu.ayarlar" : "izin.ipucu.tarayici";
    if (i.durum === "servis-kapali") return "izin.ipucu.servisKapali";
    if (i.durum === "gerekmiyor") return "izin.ipucu.gerekmiyor";
    if (i.durum === "okunamadi") return "izin.ipucu.okunamadi";
    if (i.durum === "desteklenmiyor" && i.id === "konum") return "izin.ipucu.konumYok";
    return null;
  }

  function hataGoster(e: unknown) {
    const h = e instanceof NativeHata ? e.hata : ({ tur: "ic-hata", ayrinti: String(e) } as const);
    bildirim.goster(dil.t(hataAnahtari(h)), "hata", 5000);
  }

  async function yukle(duyur = false) {
    yenileniyor = true;
    try {
      izinler = await izinDurumu();
      durum = "hazir";
      if (duyur) bildirim.goster(dil.t("izin.yenilendi"), "bilgi", 1800);
    } catch {
      if (durum !== "hazir") durum = "hata";
      else bildirim.goster(dil.t("izin.okunamadiHata"), "hata");
    } finally {
      yenileniyor = false;
    }
  }

  async function iste(id: IzinKimligi) {
    isteniyor = id;
    try {
      izinler = await izinIste(id);
      const ad = dil.t(metin[id].ad);
      const sonuc = izinler.find((i) => i.id === id)?.durum;
      if (sonuc === "verildi") bildirim.goster(dil.t("izin.verildiMesaj", { izin: ad }));
      else bildirim.goster(dil.t("izin.reddedildiMesaj", { izin: ad }), "bilgi", 5000);
    } catch (e) {
      hataGoster(e);
      await yukle();
    } finally {
      isteniyor = null;
    }
  }

  async function ayarlariAc() {
    try {
      await sistemAyarlariniAc();
    } catch (e) {
      hataGoster(e);
    }
  }

  async function dene() {
    deneniyor = true;
    try {
      await bildirimGoster(dil.t("cihazBildirimi.denemeBaslik"), dil.t("cihazBildirimi.deneme"));
      bildirim.goster(dil.t("izin.denendi"));
    } catch (e) {
      hataGoster(e);
    } finally {
      deneniyor = false;
    }
  }

  onMount(() => {
    yukle();
    // Ayarlardan dönünce (uygulama yeniden öne gelince) durum kendiliğinden yenilenir
    const gorunurluk = () => document.visibilityState === "visible" && durum === "hazir" && yukle();
    document.addEventListener("visibilitychange", gorunurluk);
    return () => document.removeEventListener("visibilitychange", gorunurluk);
  });
</script>

<div class="sayfa dar">
  <div class="ust">
    <h1>{dil.t("izin.baslik")}</h1>
    <button type="button" class="cip" onclick={() => yukle(true)} disabled={yenileniyor || durum === "yukleniyor"} aria-busy={yenileniyor}>
      <span class="ic" class:donuyor={yenileniyor}><Ikon ad="yenile" boyut={16} /></span>
      {dil.t(yenileniyor ? "izin.yenileniyor" : "izin.yenile")}
    </button>
  </div>
  <p class="giris"><Ikon ad="kalkan" boyut={16} /> <span>{dil.t("izin.giris")}</span></p>

  {#if durum === "yukleniyor"}
    <Yukleniyor etiket={dil.t("durum.yukleniyor")} adet={2} />
  {:else if durum === "hata"}
    <HataDurumu
      baslik={dil.t("durum.hataBaslik")}
      mesaj={dil.t("izin.okunamadiHata")}
      tekrarMetni={dil.t("durum.tekrarDene")}
      tekrarDene={() => yukle()}
    />
  {:else}
    {#each izinler as izin (izin.id)}
      {@const m = metin[izin.id]}
      {@const [renk, rozetIkonu] = ton[izin.durum]}
      {@const not = ipucu(izin)}
      <section class="kart izin" aria-labelledby="izin-{izin.id}">
        <div class="bas">
          <span class="simge" aria-hidden="true"><Ikon ad={m.ikon} boyut={22} /></span>
          <h2 id="izin-{izin.id}">{dil.t(m.ad)}</h2>
          <span class="rozet {renk}"><Ikon ad={rozetIkonu} boyut={14} /> {dil.t(durumMetni[izin.durum])}</span>
        </div>

        <dl>
          <dt>{dil.t("izin.neIcin")}</dt>
          <dd>{dil.t(m.neden)}</dd>
          <dt>{dil.t("izin.veri")}</dt>
          <dd>{dil.t(m.veri)}</dd>
        </dl>

        {#if not}<p class="ipucu"><Ikon ad="bilgi" boyut={16} /> <span>{dil.t(not)}</span></p>{/if}

        {#if izin.istenebilir || (ayarlarVar && ayarlardan(izin))}
          <div class="eylemler">
            {#if izin.istenebilir}
              <button type="button" class="btn kucuk" onclick={() => iste(izin.id)} disabled={isteniyor !== null} aria-busy={isteniyor === izin.id}>
                {#if isteniyor === izin.id}<span class="ic donuyor"><Ikon ad="yenile" boyut={16} /></span>{/if}
                {dil.t(isteniyor === izin.id ? "izin.isteniyor" : "izin.ver")}
              </button>
            {/if}
            {#if ayarlarVar && ayarlardan(izin)}
              <button type="button" class="btn kucuk ikincil" onclick={ayarlariAc}>
                <Ikon ad="anahtar" boyut={16} />
                {dil.t("izin.ayarlariAc")}
              </button>
            {/if}
          </div>
        {/if}

        {#if izin.id === "bildirim" && bildirimAcik}
          <fieldset class="kategoriler">
            <legend>{dil.t("izin.kategoriler")}</legend>
            {#each BILDIRIM_KATEGORILERI as k (k)}
              <label class="anahtar">
                <span>
                  <strong>{dil.t(kategoriMetni[k][0])}</strong>
                  <small>{dil.t(kategoriMetni[k][1])}</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={bildirimTercihleri.secim[k]}
                  onchange={(e) => bildirimTercihleri.degistir(k, e.currentTarget.checked)}
                />
              </label>
            {/each}
          </fieldset>
          <button type="button" class="btn kucuk ikincil dene" onclick={dene} disabled={deneniyor} aria-busy={deneniyor}>
            <Ikon ad="zil" boyut={16} />
            {dil.t("izin.dene")}
          </button>
          <p class="kucuk-not">{dil.t("izin.acikKapali")}</p>
        {/if}
      </section>
    {/each}

    <section>
      <h2 class="bolum-baslik">{dil.t("izin.izinsizBaslik")}</h2>
      <ul class="kart izinsiz">
        {#if destekleniyorMu("foto-ekleme")}
          <li><Ikon ad="kamera" boyut={18} /><span><strong>{dil.t("izin.foto")}</strong><small>{dil.t("izin.fotoNot")}</small></span></li>
        {/if}
        {#if destekleniyorMu("acil-arama")}
          <li><Ikon ad="telefon" boyut={18} /><span><strong>{dil.t("izin.arama")}</strong><small>{dil.t("izin.aramaNot")}</small></span></li>
        {/if}
      </ul>
      <p class="kucuk-not">{dil.t("izin.istenmeyen")}</p>
    </section>
  {/if}
</div>

<style>
  .ust {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--b-2);
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
  }

  .giris,
  .ipucu {
    display: flex;
    align-items: flex-start;
    gap: var(--b-2);
    margin: 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .giris :global(svg),
  .ipucu :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .ic {
    display: inline-flex;
  }

  .donuyor {
    animation: don 900ms linear infinite;
  }

  @keyframes don {
    to {
      transform: rotate(360deg);
    }
  }

  .izin {
    display: flex;
    flex-direction: column;
    gap: var(--b-3);
    padding: var(--b-4);
  }

  .bas {
    display: flex;
    align-items: center;
    gap: var(--b-3);
  }

  .bas h2 {
    flex: 1;
    margin: 0;
    font-size: var(--yz-lg);
  }

  .simge {
    display: grid;
    place-items: center;
    width: var(--dokunma);
    height: var(--dokunma);
    flex-shrink: 0;
    border-radius: var(--radius-kucuk);
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .rozet {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: var(--radius-hap);
    font-size: var(--yz-xs);
    font-weight: 700;
    white-space: nowrap;
  }

  .rozet.acik {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .rozet.engel {
    background: var(--hata-yumusak);
    color: var(--hata);
  }

  .rozet.bekliyor {
    background: var(--vurgu-yumusak);
    color: var(--yazi);
  }

  .rozet.yok {
    background: var(--zemin);
    color: var(--yazi-soluk);
  }

  dl {
    display: grid;
    gap: 2px;
    margin: 0;
  }

  dt {
    font-size: var(--yz-xs);
    font-weight: 700;
    color: var(--yazi-soluk);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  dd {
    margin: 0 0 var(--b-2);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .ipucu {
    padding: var(--b-2) var(--b-3);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    color: var(--yazi);
  }

  .eylemler {
    display: flex;
    flex-wrap: wrap;
    gap: var(--b-2);
  }

  .eylemler .btn,
  .dene {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--b-1);
    min-height: var(--dokunma);
  }

  .dene {
    align-self: flex-start;
  }

  .kategoriler {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
  }

  legend {
    padding: 0 var(--b-1);
    margin-inline-start: var(--b-2);
    font-size: var(--yz-xs);
    font-weight: 700;
    color: var(--yazi-soluk);
  }

  .anahtar {
    display: flex;
    align-items: center;
    gap: var(--b-3);
    min-height: 56px;
    padding: var(--b-2) var(--b-3);
    cursor: pointer;
  }

  .anahtar + .anahtar {
    border-top: 1px solid var(--kenar);
  }

  .anahtar > span,
  .izinsiz span {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  small {
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
    line-height: 1.4;
  }

  /* Açık/kapalı anahtarı: yerel onay kutusu, erişilebilirliği tarayıcıdan gelir (role="switch") */
  input[type="checkbox"] {
    appearance: none;
    position: relative;
    flex-shrink: 0;
    width: 44px;
    height: 26px;
    margin: 0;
    border-radius: var(--radius-hap);
    background: var(--kenar);
    cursor: pointer;
    transition: background var(--sure-hizli) var(--egri);
  }

  input[type="checkbox"]::after {
    content: "";
    position: absolute;
    inset-block-start: 3px;
    inset-inline-start: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--kart);
    box-shadow: var(--golge-kart);
    transition: transform var(--sure-hizli) var(--egri);
  }

  input[type="checkbox"]:checked {
    background: var(--secili);
  }

  input[type="checkbox"]:checked::after {
    transform: translateX(18px);
  }

  :global([dir="rtl"]) input[type="checkbox"]:checked::after {
    transform: translateX(-18px);
  }

  .kucuk-not {
    margin: 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
    line-height: 1.5;
  }

  .izinsiz {
    margin: var(--b-2) 0;
    padding: 0;
    list-style: none;
  }

  .izinsiz li {
    display: flex;
    align-items: flex-start;
    gap: var(--b-3);
    padding: var(--b-3) var(--b-4);
  }

  .izinsiz li + li {
    border-top: 1px solid var(--kenar);
  }

  .izinsiz li :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--yazi-soluk);
  }
</style>
