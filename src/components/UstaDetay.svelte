<script lang="ts">
  // Usta detayı ve çağrı hazırlama — profil, rozetler, sorun seçimi, zaman, fotoğraf, yorumlar ve sabit çağrı çubuğu
  import { onMount, untrack } from "svelte";
  import Ikon from "$lib/components/Ikon.svelte";
  import Yildizlar from "$lib/components/Yildizlar.svelte";
  import {
    aciliyetler,
    aralikYaz,
    basHarfler,
    gunYaz,
    kategoriIkon,
    mesafeKm,
    paraYaz,
    puanDagilimi,
    saatDilimleri,
    sayiYaz,
    sorunBilgisi,
    tahminiFiyat,
    ustaDurumu,
    varisDk,
    yerelIso,
  } from "$lib/data";
  import { ACIL_UCRET } from "$lib/kurallar";
  import { cagri } from "$lib/cagri.svelte";
  import { dil, dilAdlari } from "$lib/i18n.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { fotoKucult } from "$lib/foto";
  import { oku, yaz } from "$lib/depo";
  import { sonListeAdresi } from "$lib/listeAdresi";
  import { destekleniyorMu, telefonAc } from "$lib/native";
  import { cagriAdresi } from "$lib/profilHazirligi";
  import type { Anahtar } from "$lib/ceviriler";
  import type { IkonAdi } from "$lib/ikonlar";
  import type { Aciliyet, Rozet, Usta } from "../lib/types";

  let { usta: u }: { usta: Usta } = $props();

  // Geri düğmesi listeyi son arama ve süzgeç seçimiyle açar (listeAdresi.ts); doğrudan açıldıysa ana sayfa
  const listeAdresi = sonListeAdresi();

  const rozetIkon: Record<Rozet, IkonAdi> = { dogrulanmis: "kalkan", sigortali: "onay", "7-24": "saat", "hizli-yanit": "simsek" };

  const simdi = new Date();
  const bugun = yerelIso(simdi).slice(0, 10);
  const yarin = yerelIso(new Date(simdi.getTime() + 86_400_000)).slice(0, 10);

  // Ziyaret saatleri ustanın çalışma saatleri içinde olmalı; bugün için en az 1 saat sonrası seçilebilir
  const calisma = untrack(() => u.calisma);
  const calismaIcinde = (s: string) => calisma === "7-24" || (s >= calisma[0] && s < calisma[1]);
  const birSaatSonra = yerelIso(new Date(simdi.getTime() + 3_600_000));
  const sinir = birSaatSonra.slice(0, 10) === bugun ? birSaatSonra.slice(11) : "24:00";
  const bugunSaatleri = saatDilimleri.filter((s) => s > sinir && calismaIcinde(s));
  const randevuSaatleri = saatDilimleri.filter(calismaIcinde);

  const durum = $derived(ustaDurumu(u, saat.simdi));
  const km = $derived(mesafeKm(u, profil.bilgi.semt));
  const ozet = $derived(yorumlarim.ustaIcin(u));
  const dagilim = $derived(puanDagilimi(ozet.puan, ozet.sayi));
  const favori = $derived(favoriler.var(u.id));
  const dilimiKonusuyor = $derived(u.diller.includes(dil.kod));

  // "Hemen" yalnızca şu an müsaitse; "Bugün" meşgul olmayan ve bugün boş saati olan ustada; randevu her zaman
  const izinli = (a: Aciliyet) =>
    a === "randevu" || (a === "hemen" ? durum.tur === "musait" : u.musait && bugunSaatleri.length > 0);

  // Varsayılan seçimler sayfa açılırken bir kez alınır (usta prop'u sayfa boyunca değişmez)
  let sorun = $state(untrack(() => u.sorunlar[0]));
  let aciliyet = $state<Aciliyet>(untrack(() => (ustaDurumu(u).tur === "musait" ? "hemen" : "randevu")));
  let tarih = $state(yarin);

  // Randevu için yarından itibaren 7 gün — tarayıcının tarih kutusu yerine dokunması kolay çipler
  const randevuGunleri = Array.from({ length: 7 }, (_, i) => yerelIso(new Date(simdi.getTime() + (i + 1) * 86_400_000)).slice(0, 10));
  const gunEtiketi = (g: string, i: number) =>
    i === 0
      ? dil.t("detay.yarin")
      : new Date(`${g}T12:00`).toLocaleDateString(dil.kod === "fa" ? "fa-IR" : dil.kod, { weekday: "short", day: "numeric" });

  const FOTO_SINIR = 15 * 1024 * 1024;
  let fotoHata = $state(false);
  let randevuSaat = $state(randevuSaatleri[1] ?? randevuSaatleri[0] ?? "12:00");
  let bugunSaat = $state(bugunSaatleri[0] ?? "");
  // Profildeki adres ve kapı notu hazır gelir: "Moda Cad. 12 · 3. kat, zil 5"
  let adresNotu = $state(untrack(() => cagriAdresi(profil.bilgi)));
  let foto = $state<string | undefined>();
  let fotoYukleniyor = $state(false);
  let tumYorumlar = $state(false);

  // Ana sayfadaki acil kısayoldan gelindiyse (?sorun=…&aciliyet=hemen) seçimleri doldur
  onMount(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("sorun");
    const a = p.get("aciliyet") as Aciliyet | null;
    if (s && u.sorunlar.includes(s)) sorun = s;
    const tekrar = oku<{ ustaId: number; adresNotu: string } | null>("tekrar-taslagi", null);
    if (tekrar?.ustaId === u.id && tekrar.adresNotu) adresNotu = tekrar.adresNotu;
    yaz("tekrar-taslagi", null);
    if (a && aciliyetler.includes(a) && izinli(a)) aciliyet = a;
  });

  const zaman = $derived.by(() => {
    if (aciliyet === "hemen") return yerelIso(new Date(saat.simdi.getTime() + varisDk(km) * 60_000));
    if (aciliyet === "bugun") return `${bugun}T${bugunSaat}`;
    return `${tarih}T${randevuSaat}`;
  });

  const gonderilebilir = $derived(
    izinli(aciliyet) && (aciliyet !== "bugun" || bugunSaatleri.length > 0) && (aciliyet !== "randevu" || tarih >= yarin),
  );

  const fiyat = $derived(tahminiFiyat(u, sorun, aciliyet, zaman));
  const yorumlar = $derived(tumYorumlar ? ozet.yorumlar : ozet.yorumlar.slice(0, 3));

  async function fotoSec(e: Event) {
    const dosya = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!dosya) return;
    fotoHata = !dosya.type.startsWith("image/") || dosya.size > FOTO_SINIR;
    if (fotoHata) return;
    fotoYukleniyor = true;
    try {
      foto = await fotoKucult(dosya);
    } catch {
      fotoHata = true;
    } finally {
      fotoYukleniyor = false;
    }
  }

  function favoriDegistir() {
    const eklendi = favoriler.degistir(u.id);
    bildirim.goster(dil.t(eklendi ? "kart.favoriEklendi" : "kart.favoriCikarildi", { ad: u.ad }), "bilgi", 2000);
  }

  function cagir() {
    if (!gonderilebilir) return;
    cagri.hazirla({ ustaId: u.id, sorun, aciliyet, zaman, adresNotu: adresNotu.trim(), foto });
    window.location.assign("/cagri"); // taslak localStorage'da, tam sayfa geçişinde kaybolmaz
  }
</script>

<div class="kapak">
  <div class="kapak-ic">
    <div class="ust-satir">
      <a class="yuvarlak" href={listeAdresi} aria-label={dil.t("detay.geri")}><Ikon ad={dil.yon === "rtl" ? "ok-sag" : "ok-sol"} /></a>
      <button
        class="yuvarlak"
        class:favori
        onclick={favoriDegistir}
        aria-pressed={favori}
        aria-label={dil.t(favori ? "kart.favoriCikar" : "kart.favoriEkle")}
      >
        <Ikon ad="kalp" dolu={favori} />
      </button>
    </div>
    <div class="kimlik">
      <div class="avatar" aria-hidden="true">
        {basHarfler(u.ad)}
        <span class="kategori"><Ikon ad={kategoriIkon[u.kategori]} boyut={16} /></span>
      </div>
      <div>
        <span class="etiket">{dil.t(`kategori.${u.kategori}`)} · {u.semt}</span>
        <h1>
          {u.ad}
          {#if u.rozetler.includes("dogrulanmis")}<Ikon ad="kalkan" boyut={20} etiket={dil.t("rozet.dogrulanmis")} />{/if}
        </h1>
        <p class="puan">
          <Yildizlar puan={ozet.puan} />
          <b>{sayiYaz(ozet.puan, dil.kod)}</b>
          · {dil.t("detay.yorumSayisi", { n: sayiYaz(ozet.sayi, dil.kod) })}
        </p>
      </div>
    </div>
    <p class="durum {durum.tur}">
      <span class="nokta"></span>
      {#if durum.tur === "musait"}{dil.t("kart.musait")}
      {:else if durum.tur === "mesgul"}{dil.t("kart.mesgul")}
      {:else}{dil.t("kart.kapali", { saat: durum.acilis })}{/if}
    </p>
  </div>
</div>

<div class="sayfa dar">
  {#if u.rozetler.length}
    <div class="rozetler">
      {#each u.rozetler as r}
        <span class="rozet"><Ikon ad={rozetIkon[r]} boyut={14} /> {dil.t(`rozet.${r}`)}</span>
      {/each}
    </div>
  {/if}

  <div class="istatistik">
    <div class="kart"><b>{dil.t("detay.yil", { n: sayiYaz(u.deneyimYil, dil.kod) })}</b><span>{dil.t("detay.deneyim")}</span></div>
    <div class="kart"><b>{sayiYaz(u.tamamlananIs, dil.kod)}</b><span>{dil.t("detay.tamamlanan")}</span></div>
    <div class="kart"><b>{dil.t("kart.dk", { dk: sayiYaz(u.yanitDk, dil.kod) })}</b><span>{dil.t("detay.yanit")}</span></div>
    {#if durum.tur === "musait"}
      <div class="kart"><b>{dil.t("kart.dk", { dk: sayiYaz(varisDk(km), dil.kod) })}</b><span>{dil.t("detay.varis")}</span></div>
    {:else}
      <div class="kart"><b>{dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}</b><span>{dil.t("detay.mesafe")}</span></div>
    {/if}
  </div>

  <div class="kart bilgiler">
    <div>
      <Ikon ad="saat" boyut={18} />
      <span>{dil.t("detay.calisma")}</span>
      <b dir="ltr">{u.calisma === "7-24" ? dil.t("detay.724") : `${u.calisma[0]} – ${u.calisma[1]}`}</b>
    </div>
    <div>
      <Ikon ad="dil" boyut={18} />
      <span>{dil.t("detay.diller")}</span>
      <b>{u.diller.map((d) => dilAdlari[d]).join(" · ")}</b>
    </div>
    {#if dilimiKonusuyor && dil.kod !== "tr"}
      <p class="dilinizi"><Ikon ad="onay" boyut={16} /> {dil.t("detay.dilinizi")}</p>
    {/if}
  </div>

  {#if durum.tur === "mesgul"}
    <p class="uyari"><Ikon ad="bilgi" boyut={18} /> {dil.t("detay.mesgulUyari")}</p>
  {:else if durum.tur === "kapali"}
    <p class="uyari"><Ikon ad="bilgi" boyut={18} /> {dil.t("detay.kapaliUyari", { saat: durum.acilis })}</p>
  {/if}

  <section>
    <h2>{dil.t("detay.sorunSec")}</h2>
    <div class="secenekler">
      {#each u.sorunlar as s}
        {@const b = sorunBilgisi[s]}
        <label class="kart secenek" class:aktif={sorun === s}>
          <input type="radio" name="sorun" value={s} bind:group={sorun} />
          <span class="secenek-ad">
            {dil.t(`sorun.${s}` as Anahtar)}
            {#if b.tehlikeli}<span class="tehlike"><Ikon ad="uyari" boyut={14} /></span>{/if}
          </span>
          <span class="secenek-fiyat">
            <b>{aralikYaz(b.iscilik[0], b.iscilik[1], dil.kod)}</b>
            <small>{dil.t("detay.sure", { dk: sayiYaz(b.sureDk, dil.kod) })}</small>
          </span>
        </label>
      {/each}
    </div>
    {#if dil.kod !== "tr"}
      <p class="iletilen">{dil.t("detay.ustayaIletilen")} <b lang="tr" dir="ltr">“{dil.tr(`sorun.${sorun}` as Anahtar)}”</b></p>
    {/if}
    <div class="ipucu" class:tehlikeli={sorunBilgisi[sorun]?.tehlikeli}>
      <Ikon ad={sorunBilgisi[sorun]?.tehlikeli ? "uyari" : "bilgi"} boyut={20} />
      <div>
        <b>{dil.t("detay.guvenlik")}</b>
        <p>{dil.t(`ipucu.${sorun}` as Anahtar)}</p>
        {#if sorunBilgisi[sorun]?.tehlikeli}
          <!-- Masaüstünde arayacak hat yok: düğme hiç gösterilmez (docs/platform-destegi.md → acil-arama) -->
          {#if destekleniyorMu("acil-arama")}
            <button type="button" class="acil-ara" onclick={() => telefonAc("112")}>
              <Ikon ad="telefon" boyut={14} /> {dil.t("detay.acilAra")}
            </button>
          {/if}
        {/if}
      </div>
    </div>
  </section>

  <section>
    <h2>{dil.t("detay.aciliyet")}</h2>
    <div class="aciliyet">
      {#each aciliyetler as a}
        <button class:aktif={aciliyet === a} aria-pressed={aciliyet === a} disabled={!izinli(a)} onclick={() => (aciliyet = a)}>
          <Ikon ad={a === "hemen" ? "roket" : a === "bugun" ? "saat" : "takvim"} boyut={18} />
          {dil.t(`aciliyet.${a}`)}
        </button>
      {/each}
    </div>

    {#if aciliyet === "hemen"}
      <p class="not">
        <Ikon ad="roket" boyut={18} />
        <span>
          {dil.t("detay.hemenVaris", { dk: sayiYaz(varisDk(km), dil.kod) })}
          <b>{dil.t("detay.acilUcret", { tutar: paraYaz(ACIL_UCRET, dil.kod) })}</b>
        </span>
      </p>
    {:else if aciliyet === "bugun"}
      {#if bugunSaatleri.length === 0}
        <p class="uyari">{dil.t("detay.bugunSaatYok")}</p>
      {:else}
        <div class="saatler" role="radiogroup" aria-label={dil.t("detay.saat")}>
          {#each bugunSaatleri as s}
            <button class:aktif={bugunSaat === s} role="radio" aria-checked={bugunSaat === s} onclick={() => (bugunSaat = s)}>{s}</button>
          {/each}
        </div>
      {/if}
    {:else}
      <div class="gunler" role="radiogroup" aria-label={dil.t("detay.tarih")}>
        {#each randevuGunleri as g, i}
          <button class:aktif={tarih === g} role="radio" aria-checked={tarih === g} onclick={() => (tarih = g)}>{gunEtiketi(g, i)}</button>
        {/each}
      </div>
      <small class="secilen-gun">{gunYaz(`${tarih}T12:00`, dil.kod)}</small>
      <div class="saatler" role="radiogroup" aria-label={dil.t("detay.saat")}>
        {#each randevuSaatleri as s}
          <button class:aktif={randevuSaat === s} role="radio" aria-checked={randevuSaat === s} onclick={() => (randevuSaat = s)}>{s}</button>
        {/each}
      </div>
    {/if}
  </section>

  <section>
    <h2>{dil.t("detay.foto")}</h2>
    {#if foto}
      <div class="foto">
        <img src={foto} alt="" />
        <button class="btn ikincil" onclick={() => (foto = undefined)}><Ikon ad="cop" boyut={16} /> {dil.t("detay.fotoKaldir")}</button>
      </div>
    {:else}
      <label class="foto-sec" class:yukleniyor={fotoYukleniyor}>
        <Ikon ad="kamera" boyut={26} />
        <span><b>{dil.t("detay.fotoSec")}</b><br />{dil.t("detay.fotoNot")}</span>
        <input type="file" accept="image/*" capture="environment" onchange={fotoSec} />
      </label>
    {/if}
    {#if fotoHata}<p class="foto-hata" role="alert"><Ikon ad="uyari" boyut={16} /> {dil.t("detay.fotoHata")}</p>{/if}
    <p class="foto-gizlilik"><Ikon ad="kilit" boyut={14} /> {dil.t("detay.fotoGizlilik")}</p>
  </section>

  <label class="alan">
    {dil.t("detay.adres")}
    <textarea rows="2" placeholder={dil.t("detay.adresOrnek")} bind:value={adresNotu}></textarea>
  </label>

  <section class="yorumlar">
    <h2>{dil.t("detay.yorumlar")}</h2>
    <div class="kart yorum-ozet">
      <div class="buyuk-puan">
        <b>{sayiYaz(ozet.puan, dil.kod)}</b>
        <Yildizlar puan={ozet.puan} boyut={16} />
        <span>{dil.t("detay.yorumSayisi", { n: sayiYaz(ozet.sayi, dil.kod) })}</span>
      </div>
      <div class="dagilim">
        {#each dagilim as adet, i}
          <div class="cubuk-satir">
            <span>{5 - i}</span>
            <div class="cubuk"><span style:width="{ozet.sayi ? (adet / ozet.sayi) * 100 : 0}%"></span></div>
          </div>
        {/each}
      </div>
    </div>

    {#each yorumlar as y}
      <article class="kart yorum" class:benim={y.benim}>
        <header>
          <b>{y.ad}</b>
          {#if y.benim}<span class="benim-etiket">{dil.t("detay.sizinYorumunuz")}</span>{/if}
          <span class="yorum-dil" title={dilAdlari[y.dil]}>{y.dil.toUpperCase()}</span>
        </header>
        <div class="yorum-meta"><Yildizlar puan={y.puan} boyut={12} /> <span>{gunYaz(`${y.tarih}T12:00`, dil.kod)}</span></div>
        <p lang={y.dil} dir="auto">{y.metin}</p>
      </article>
    {/each}
    {#if !tumYorumlar && ozet.yorumlar.length > 3}
      <button class="btn ikincil" onclick={() => (tumYorumlar = true)}>{dil.t("detay.tumYorumlar")}</button>
    {/if}
  </section>
</div>

<div class="cagri-cubugu">
  <div class="cubuk-ic">
    <div class="tutar">
      <small>{dil.t("cagri.toplam")}</small>
      <b>{aralikYaz(fiyat.toplamMin, fiyat.toplamMax, dil.kod)}</b>
    </div>
    <button class="btn" onclick={cagir} disabled={!gonderilebilir}>{dil.t("detay.cagirKisa")}</button>
  </div>
</div>

<style>
  .kapak {
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
    border-radius: 0 0 var(--radius-buyuk) var(--radius-buyuk);
  }

  .kapak-ic {
    max-width: 560px;
    margin-inline: auto;
    padding: 8px 16px 20px;
  }

  .ust-satir {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .yuvarlak {
    display: flex;
    padding: 9px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: 50%;
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
  }

  .yuvarlak.favori {
    color: var(--logo);
  }

  .kimlik {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar {
    position: relative;
    flex-shrink: 0;
    width: 76px;
    height: 76px;
    border-radius: 24px;
    background: var(--koyu-cam);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
  }

  .avatar .kategori {
    position: absolute;
    bottom: -4px;
    inset-inline-end: -4px;
    display: flex;
    padding: 5px;
    border-radius: 50%;
    border: 2px solid var(--renk-koyu);
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
  }

  .etiket {
    font-size: 13px;
    opacity: 0.8;
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 2px 0;
    font-size: 24px;
  }

  .puan {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  .durum {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 14px 0 0;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--koyu-cam);
    font-size: 13px;
    font-weight: 600;
  }

  .nokta {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--yazi-soluk);
  }

  .durum.musait .nokta {
    background: var(--basari);
  }

  .durum.kapali .nokta {
    background: var(--vurgu);
  }

  .rozetler {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .rozet {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--basari-yumusak);
    color: var(--basari);
    font-size: 12px;
    font-weight: 700;
  }

  .istatistik {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .istatistik .kart {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 6px;
    text-align: center;
  }

  .istatistik b {
    font-size: 15px;
  }

  .istatistik span {
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .bilgiler {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    font-size: 14px;
  }

  .bilgiler > div {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--yazi-soluk);
  }

  .bilgiler b {
    margin-inline-start: auto;
    color: var(--yazi);
    text-align: end;
  }

  .dilinizi {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: var(--basari);
    font-weight: 700;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  h2 {
    margin: 6px 0 0;
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
    transition: border-color var(--sure-hizli);
  }

  .secenek.aktif,
  .aciliyet button.aktif,
  .saatler button.aktif {
    border-color: var(--secili);
    box-shadow: 0 0 0 1px var(--secili);
  }

  .secenek input {
    accent-color: var(--secili);
  }

  .secenek-ad {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tehlike {
    display: inline-flex;
    color: var(--hata);
  }

  .secenek-fiyat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 13px;
  }

  .secenek-fiyat small {
    color: var(--yazi-soluk);
  }

  .iletilen {
    margin: 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .ipucu {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--vurgu-yumusak);
    color: var(--yazi);
    font-size: 14px;
  }

  .ipucu.tehlikeli {
    border: 1px solid var(--hata);
  }

  .ipucu.tehlikeli :global(.ikon) {
    color: var(--hata);
  }

  .ipucu p {
    margin: 2px 0 0;
  }

  .aciliyet {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .aciliyet button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
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
    display: flex;
    align-items: flex-start;
    gap: 8px;
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

  .alan textarea {
    padding: 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--kart);
    font-weight: 400;
    resize: vertical;
  }

  .gunler {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .gunler button {
    flex-shrink: 0;
    min-width: 72px;
    min-height: var(--dokunma);
    padding: 0 12px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    font-weight: 600;
  }

  .gunler button.aktif {
    border-color: var(--secili);
    background: var(--secili);
    color: var(--secili-ustu);
  }

  .secilen-gun {
    font-size: var(--yz-sm);
    color: var(--yazi-soluk);
  }

  .foto-hata {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: var(--hata);
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  .foto-gizlilik {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    line-height: 1.5;
  }

  .acil-ara {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    min-height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--radius-hap);
    background: var(--hata);
    color: var(--kart);
    font: inherit;
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .foto-sec {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 2px dashed var(--kenar);
    border-radius: var(--radius);
    color: var(--yazi-soluk);
    font-size: 14px;
    cursor: pointer;
  }

  .foto-sec:hover {
    border-color: var(--renk-ana);
  }

  .foto-sec.yukleniyor {
    opacity: 0.5;
  }

  .foto-sec input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .foto {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .foto img {
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    border-radius: var(--radius);
  }

  .foto .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }

  .yorum-ozet {
    display: flex;
    gap: 20px;
    padding: 16px;
  }

  .buyuk-puan {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .buyuk-puan b {
    font-size: 36px;
    line-height: 1;
  }

  .buyuk-puan span {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .dagilim {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .cubuk-satir {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .cubuk {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--zemin);
    overflow: hidden;
  }

  .cubuk span {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: var(--vurgu);
  }

  .yorum {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px;
  }

  .yorum.benim {
    border-color: var(--renk-ana);
  }

  .yorum header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .benim-etiket {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
    font-size: 11px;
    font-weight: 700;
  }

  .yorum-dil {
    margin-inline-start: auto;
    padding: 0 6px;
    border: 1px solid var(--kenar);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--yazi-soluk);
  }

  .yorum-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .yorum p {
    margin: 4px 0 0;
    font-size: 14px;
    line-height: 1.5;
  }

  /* Ekranın altına sabit çağrı çubuğu — alt menünün hemen üstünde durur */
  .cagri-cubugu {
    position: sticky;
    bottom: calc(64px + env(safe-area-inset-bottom));
    z-index: 15;
    margin-top: 8px;
    padding: 10px 16px;
    border-top: 1px solid var(--kenar);
    background: var(--kart);
    box-shadow: var(--golge-yuksek);
  }

  .cubuk-ic {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 560px;
    margin-inline: auto;
  }

  .tutar {
    display: flex;
    flex-direction: column;
  }

  .tutar small {
    font-size: 11px;
    color: var(--yazi-soluk);
  }

  .tutar b {
    font-size: 16px;
    white-space: nowrap;
  }

  .cubuk-ic .btn {
    flex: 1;
  }

  @media (min-width: 1200px) {
    .cagri-cubugu {
      bottom: 0;
    }
  }
</style>
