<script lang="ts">
  // İş Emirlerim — Aktif / Geçmiş sekmeleri, canlı iş kartları, iptal nedeni ve iş sonu değerlendirmesi
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import Yildizlar from "$lib/components/Yildizlar.svelte";
  import YildizSecici from "$lib/components/YildizSecici.svelte";
  import IsKarti from "./IsKarti.svelte";
  import BosDurum from "$lib/components/ui/BosDurum.svelte";
  import HataDurumu from "$lib/components/ui/HataDurumu.svelte";
  import Yukleniyor from "$lib/components/ui/Yukleniyor.svelte";
  import { listeYukle } from "$lib/yukleyici";
  import { aralikYaz, basHarfler, kategoriIkon, tarihYaz, ustaBul } from "$lib/data";
  import { yaz } from "$lib/depo";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { profil } from "$lib/profil.svelte";
  import { dil } from "$lib/i18n.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IptalNedeni, IsEmri, ListeDurumu } from "../lib/types";

  const nedenler: IptalNedeni[] = ["vazgectim", "gecikti", "baskasi", "cozuldu"];

  // Liste, ana ekrandaki gibi tek yükleme işlevinden geçer (yukleyici.ts): yükleniyor → hata | boş | dolu.
  // Yüklendikten sonra kartlar store'u canlı izler (iptal, tamamlama anında görünür).
  let durum = $state<ListeDurumu>("yukleniyor");
  let bosZorla = $state(false);

  async function yukle() {
    durum = "yukleniyor";
    try {
      const liste = await listeYukle(() => isEmirleri.liste);
      bosZorla = liste.length === 0;
      durum = "dolu";
    } catch {
      durum = "hata";
    }
  }

  yukle();

  const aktifler = $derived(bosZorla ? [] : isEmirleri.aktifler);
  const gecmis = $derived(bosZorla ? [] : isEmirleri.gecmis);

  let sekme = $state<"aktif" | "gecmis">(isEmirleri.aktifSayisi > 0 || isEmirleri.gecmis.length === 0 ? "aktif" : "gecmis");

  let iptalIs = $state<IsEmri | null>(null);
  let iptalNedeni = $state<IptalNedeni>("vazgectim");
  let iptalAcik = $state(false);

  let degerlendirIs = $state<IsEmri | null>(null);
  let puan = $state(0);
  let yorum = $state("");
  let degerlendirAcik = $state(false);

  // Aynı usta, sorun ve aciliyetle detaya gider; adres notu cihazda taşınır. Çağrıyı yine kullanıcı onaylar.
  function tekrarCagir(i: IsEmri) {
    yaz("tekrar-taslagi", { ustaId: i.ustaId, adresNotu: i.adresNotu });
    window.location.assign(`/usta/${i.ustaId}?sorun=${i.sorun}&aciliyet=${i.aciliyet}`);
  }

  function iptalEt(i: IsEmri) {
    iptalIs = i;
    iptalNedeni = "vazgectim";
    iptalAcik = true;
  }

  function iptalOnayla() {
    if (!iptalIs) return;
    isEmirleri.iptal(iptalIs.kod, iptalNedeni);
    iptalAcik = false;
    bildirim.goster(dil.t("is.iptalEdildi"), "bilgi");
  }

  function bitir(i: IsEmri) {
    isEmirleri.tamamla(i.kod);
    degerlendirmeAc(i);
  }

  function degerlendirmeAc(i: IsEmri) {
    degerlendirIs = i;
    puan = 5;
    yorum = "";
    degerlendirAcik = true;
  }

  function degerlendirmeGonder(e: SubmitEvent) {
    e.preventDefault();
    const i = degerlendirIs;
    if (!i || puan < 1) return;
    yorumlarim.ekle({
      ustaId: i.ustaId,
      isKodu: i.kod,
      ad: profil.bilgi.ad.trim() || dil.t("profil.misafir"),
      puan,
      metin: yorum.trim(),
      dil: dil.kod,
      tarih: new Date().toISOString().slice(0, 10),
    });
    degerlendirAcik = false;
    sekme = "gecmis";
    bildirim.goster(dil.t("is.tesekkur"));
  }
</script>

<div class="sayfa dar">
  <h1>{dil.t("is.baslik")}</h1>

  {#if durum === "yukleniyor"}
    <Yukleniyor etiket={dil.t("durum.yukleniyor")} adet={2} />
  {:else if durum === "hata"}
    <HataDurumu
      baslik={dil.t("durum.hataBaslik")}
      mesaj={dil.t("durum.isEmirleriHata")}
      tekrarMetni={dil.t("durum.tekrarDene")}
      tekrarDene={yukle}
    />
  {:else}
  <div class="sekmeler" role="tablist">
    <button role="tab" aria-selected={sekme === "aktif"} class:aktif={sekme === "aktif"} onclick={() => (sekme = "aktif")}>
      {dil.t("is.aktif")} <span class="adet">{aktifler.length}</span>
    </button>
    <button role="tab" aria-selected={sekme === "gecmis"} class:aktif={sekme === "gecmis"} onclick={() => (sekme = "gecmis")}>
      {dil.t("is.gecmis")} <span class="adet">{gecmis.length}</span>
    </button>
  </div>

  {#if sekme === "aktif"}
    {#each aktifler as i (i.kod)}
      <IsKarti is={i} {iptalEt} {bitir} />
    {:else}
      <BosDurum
        ikon="fis"
        baslik={dil.t("is.aktifYok")}
        aciklama={dil.t("durum.aktifYokMetin")}
        dugmeMetni={dil.t("cagri.ustaSec")}
        href="/"
      />
    {/each}
  {:else}
    {#each gecmis as i (i.kod)}
      {@const benimYorum = yorumlarim.isIcin(i.kod)}
      <article class="kart gecmis">
        <header>
          <span class="avatar" aria-hidden="true"><Ikon ad={kategoriIkon[i.kategori]} boyut={20} /></span>
          <div class="kim">
            <strong>{i.ustaAd}</strong>
            <span>{dil.t(`sorun.${i.sorun}` as Anahtar)} · {tarihYaz(i.bitis ?? i.zaman, dil.kod)}</span>
          </div>
          <span class="durum {i.durum}">{dil.t(i.durum === "iptal" ? "durum.iptal" : "durum.tamamlandi")}</span>
        </header>
        <div class="alt">
          <code dir="ltr">{i.kod}</code>
          <b>{aralikYaz(i.fiyat.toplamMin, i.fiyat.toplamMax, dil.kod)}</b>
        </div>
        {#if i.durum === "iptal" && i.iptalNedeni}
          <p class="neden">{dil.t(`iptal.${i.iptalNedeni}`)}</p>
        {/if}
        <div class="islemler">
          {#if i.durum === "tamamlandi"}
            {#if benimYorum}
              <span class="puanim">{dil.t("is.puaniniz")}: <Yildizlar puan={benimYorum.puan} /></span>
            {:else}
              <button class="btn ikincil" onclick={() => degerlendirmeAc(i)}><Ikon ad="yildiz" boyut={16} /> {dil.t("is.degerlendir")}</button>
            {/if}
          {/if}
          {#if ustaBul(i.ustaId)}
            <button class="btn ikincil" onclick={() => tekrarCagir(i)}><Ikon ad="roket" boyut={16} /> {dil.t("is.tekrar")}</button>
          {/if}
        </div>
      </article>
    {:else}
      <BosDurum ikon="fis" baslik={dil.t("is.gecmisYok")} aciklama={dil.t("durum.gecmisYokMetin")} />
    {/each}
  {/if}
  {/if}
</div>

<Pencere bind:acik={iptalAcik} baslik={dil.t("is.iptalBaslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <p class="soru">{dil.t("is.iptalSoru")}</p>
  <div class="nedenler">
    {#each nedenler as n}
      <label class:aktif={iptalNedeni === n}>
        <input type="radio" name="iptal-nedeni" value={n} bind:group={iptalNedeni} />
        {dil.t(`iptal.${n}`)}
      </label>
    {/each}
  </div>
  <div class="pencere-dugmeleri">
    <button class="btn ikincil" onclick={() => (iptalAcik = false)}>{dil.t("genel.vazgec")}</button>
    <button class="btn tehlike" onclick={iptalOnayla}>{dil.t("is.iptalOnay")}</button>
  </div>
</Pencere>

<Pencere
  bind:acik={degerlendirAcik}
  baslik={dil.t("is.degerlendirBaslik", { usta: degerlendirIs?.ustaAd ?? "" })}
  kapatEtiketi={dil.t("genel.kapat")}
>
  <form class="degerlendirme" onsubmit={degerlendirmeGonder}>
    <YildizSecici bind:puan />
    <textarea rows="3" placeholder={dil.t("is.yorumYer")} bind:value={yorum}></textarea>
    <button class="btn" disabled={puan < 1}>{dil.t("is.gonder")}</button>
  </form>
</Pencere>

<style>
  h1 {
    margin: 0;
    font-size: 22px;
  }

  .sekmeler {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 4px;
    border-radius: var(--radius);
    background: var(--kart);
    border: 1px solid var(--kenar);
  }

  .sekmeler button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 10px;
    border: 0;
    border-radius: var(--radius-kucuk);
    background: none;
    color: var(--yazi-soluk);
    font-weight: 600;
  }

  .sekmeler button.aktif {
    background: var(--secili);
    color: var(--secili-ustu);
  }

  .adet {
    min-width: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--zemin);
    color: var(--yazi-soluk);
    font-size: 12px;
  }

  .sekmeler button.aktif .adet {
    background: var(--koyu-cam);
    color: var(--secili-ustu);
  }

  .gecmis {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .gecmis header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--zemin);
    color: var(--yazi-soluk);
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
    font-size: 15px;
    color: var(--yazi);
  }

  .durum {
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: var(--kenar);
    color: var(--yazi-soluk);
  }

  .durum.tamamlandi {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .alt {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .alt code {
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--yazi-soluk);
  }

  .neden {
    margin: 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .islemler {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .islemler .btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 10px;
    font-size: 14px;
  }

  .puanim {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .soru {
    margin: 0;
    color: var(--yazi-soluk);
  }

  .nedenler {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nedenler label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    cursor: pointer;
  }

  .nedenler label.aktif {
    border-color: var(--renk-ana);
    box-shadow: 0 0 0 1px var(--renk-ana);
  }

  .nedenler input {
    accent-color: var(--renk-ana);
  }

  .pencere-dugmeleri {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .btn.tehlike {
    background: var(--hata);
    color: var(--kart);
  }

  .degerlendirme {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .degerlendirme textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    resize: vertical;
  }
</style>
