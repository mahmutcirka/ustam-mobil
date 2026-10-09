<script lang="ts">
  // Profil — kimlik ve "Çağrıya hazırlık" ölçeri, Evim (semt, adres, kapı notu), "Evimi tanıyorum" listesi,
  // favori ustalar (ui/Kart), görünüm ve dil, gizlilik (KVKK), bilgi sayfaları. Düzenleme alttan açılan panelde.
  import { tick } from "svelte";
  import Ikon from "$lib/components/Ikon.svelte";
  import Pencere from "$lib/components/Pencere.svelte";
  import SemtSecici from "$lib/components/SemtSecici.svelte";
  import Kart from "$lib/components/ui/Kart.svelte";
  import BosDurum from "$lib/components/ui/BosDurum.svelte";
  import { basHarfler, mesafeKm, paraYaz, sayiYaz, ustaBul, ustaDurumu } from "$lib/data";
  import { tema } from "$lib/tema.svelte";
  import { bilgiSayfalari, dil, diller, dilAdlari, sayfaYolu } from "$lib/i18n.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { favoriler } from "$lib/favoriler.svelte";
  import { yorumlarim } from "$lib/yorumlar.svelte";
  import { profil } from "$lib/profil.svelte";
  import { evHazirligi } from "$lib/evHazirligi.svelte";
  import { saat } from "$lib/saat.svelte";
  import { bildirim } from "$lib/bildirim.svelte";
  import { hataAnahtari, NativeHata, platformAdi, rustIcinde, veriKayitYolu, verileriKaydet } from "$lib/native";
  import { hazirlikYuzdesi, profilEksikleri, telefonGecerliMi, telefonYaz } from "$lib/profilHazirligi";
  import { ustaKartGirdisi } from "$lib/ustaKarti";
  import { kisiselVeriler, tumVerileriSil } from "$lib/veri";
  import type { IkonAdi } from "$lib/ikonlar";
  import type { Anahtar } from "$lib/ceviriler";
  import { HAZIRLIK_MADDELERI, type HazirlikMaddesi, type ProfilAlani, type ProfilBilgileri, type Usta } from "../lib/types";

  const SURUM = "0.3.0";

  const alanAnahtari: Record<ProfilAlani, Anahtar> = {
    ad: "profil.ad",
    telefon: "profil.telefon",
    adres: "profil.adres",
    kapiNotu: "profil.kapiNotu",
  };
  const maddeIkonu: Record<HazirlikMaddesi, IkonAdi> = { "su-vanasi": "damla", "sigorta-kutusu": "simsek", "dogalgaz-vanasi": "alev" };
  const bilgiIkonu: Record<string, IkonAdi> = { hakkinda: "bilgi", iletisim: "yorum", kosullar: "pano", gizlilik: "kilit" };

  // ---- özet
  const eksikler = $derived(profilEksikleri(profil.bilgi));
  const yuzde = $derived(hazirlikYuzdesi(profil.bilgi));
  const tamamlananlar = $derived(isEmirleri.liste.filter((i) => i.durum === "tamamlandi"));
  const harcama = $derived(tamamlananlar.reduce((t, i) => t + i.fiyat.toplamMin, 0));
  const verilenPuan = $derived(
    yorumlarim.liste.length ? yorumlarim.liste.reduce((t, y) => t + y.puan, 0) / yorumlarim.liste.length : 0,
  );
  const istatistikler = $derived<[IkonAdi, Anahtar, string][]>([
    ["fis", "profil.toplamIs", sayiYaz(isEmirleri.liste.length, dil.kod)],
    ["onay", "profil.tamamlananIs", sayiYaz(tamamlananlar.length, dil.kod)],
    ["para", "profil.harcama", paraYaz(harcama, dil.kod)],
    ["yildiz", "profil.verilenPuan", verilenPuan ? sayiYaz(Math.round(verilenPuan * 10) / 10, dil.kod) : "–"],
  ]);
  const favoriUstalar = $derived(favoriler.idler.map(ustaBul).filter((u): u is Usta => u !== undefined));
  const ok = $derived(dil.yon === "rtl" ? "ok-sol" : "ok-sag");

  // ---- düzenleme paneli: alanlar taslakta değişir, "Kaydet" ile profile yazılır
  let duzenleAcik = $state(false);
  let taslak = $state<ProfilBilgileri>({ ...profil.bilgi });
  const alanlar: Partial<Record<ProfilAlani, HTMLInputElement | HTMLTextAreaElement>> = {};
  const telefonUyarisi = $derived(taslak.telefon.trim() !== "" && !telefonGecerliMi(taslak.telefon));
  const degisti = $derived((["ad", "telefon", "adres", "kapiNotu"] as const).some((a) => taslak[a].trim() !== profil.bilgi[a]));

  async function duzenle(odak: ProfilAlani | null = null) {
    taslak = { ...profil.bilgi };
    duzenleAcik = true;
    await tick();
    if (odak) alanlar[odak]?.focus();
  }

  function kaydet(event: SubmitEvent) {
    event.preventDefault();
    if (telefonUyarisi || !degisti) return;
    profil.guncelle({
      ad: taslak.ad.trim().slice(0, 80),
      telefon: taslak.telefon.trim().slice(0, 20),
      adres: taslak.adres.trim().slice(0, 300),
      kapiNotu: taslak.kapiNotu.trim().slice(0, 120),
    });
    duzenleAcik = false;
    bildirim.goster(dil.t("profil.kaydedildi"));
  }

  // ---- diğer paneller
  let semtPenceresi = $state(false);
  let silPenceresi = $state(false);

  function favoriCikar(u: Usta) {
    favoriler.degistir(u.id);
    bildirim.goster(dil.t("kart.favoriCikarildi", { ad: u.ad }), "bilgi", 2000);
  }

  // Tarayıcıda indirir, masaüstünde İndirilenler'e kaydeder, telefonda panoya kopyalar (native.ts)
  const disaAktarPano = veriKayitYolu() === "pano";

  async function disaAktar() {
    try {
      const sonuc = await verileriKaydet(kisiselVeriler(), "ustam-verilerim.json");
      if (sonuc.yol === "dosya") bildirim.goster(dil.t("profil.disaAktarDosya", { yol: sonuc.dosya }), "basari", 5000);
      else if (sonuc.yol === "pano") bildirim.goster(dil.t("profil.disaAktarPano"), "basari");
      else bildirim.goster(dil.t("profil.disaAktarIndirildi"), "basari");
    } catch (e) {
      const h = e instanceof NativeHata ? e.hata : ({ tur: "ic-hata", ayrinti: String(e) } as const);
      bildirim.goster(dil.t(hataAnahtari(h)), "hata", 5000);
    }
  }

  function sil() {
    tumVerileriSil();
    bildirim.sonrakiSayfada(dil.t("profil.silindi"), "bilgi");
    window.location.assign("/");
  }
</script>

<section class="kimlik-alani">
  <div class="kimlik-ic">
    <div class="kimlik">
      <div class="avatar" aria-hidden="true">
        {#if profil.bilgi.ad}{basHarfler(profil.bilgi.ad)}{:else}<Ikon ad="kisi" boyut={28} />{/if}
      </div>
      <div class="kim">
        <h1><bdi>{profil.bilgi.ad || dil.t("profil.misafir")}</bdi></h1>
        <p>
          <Ikon ad="telefon" boyut={14} />
          {#if profil.bilgi.telefon}<span dir="ltr">{telefonYaz(profil.bilgi.telefon)}</span>{:else}{dil.t("profil.telefonYok")}{/if}
        </p>
        <p><Ikon ad="konum" boyut={14} /> {profil.bilgi.semt}</p>
      </div>
      <button class="duzenle-dugme" onclick={() => duzenle()} aria-label={dil.t("profil.duzenle")}>
        <Ikon ad="kalem" boyut={18} />
      </button>
    </div>

    <div class="hazirlik">
      <div class="hazirlik-ust">
        <span>{dil.t("profil.hazirlik")}</span>
        <b>{dil.t("profil.yuzde", { n: sayiYaz(yuzde, dil.kod) })}</b>
      </div>
      <div class="cubuk" role="progressbar" aria-label={dil.t("profil.hazirlik")} aria-valuemin="0" aria-valuemax="100" aria-valuenow={yuzde}>
        <span style:inline-size="{yuzde}%"></span>
      </div>
      {#if eksikler.length}
        <p class="hazirlik-not">{dil.t("profil.hazirlikNot")}</p>
        <div class="eksikler">
          {#each eksikler as a (a)}
            <button class="eksik" onclick={() => duzenle(a)}><Ikon ad="arti" boyut={14} /> {dil.t(alanAnahtari[a])}</button>
          {/each}
        </div>
      {:else}
        <p class="hazirlik-not tamam"><Ikon ad="onay" boyut={16} /> {dil.t("profil.hazirlikTamam")}</p>
      {/if}
    </div>
  </div>
</section>

<div class="sayfa dar">
  <div class="kart istatistik">
    {#each istatistikler as [ikon, etiket, deger] (etiket)}
      <div>
        <Ikon ad={ikon} boyut={16} />
        <b>{deger}</b>
        <span>{dil.t(etiket)}</span>
      </div>
    {/each}
  </div>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.evim")}</h2>
    <div class="kart liste">
      <button onclick={() => (semtPenceresi = true)}>
        <Ikon ad="konum" boyut={18} />
        <span class="satir"><small>{dil.t("profil.semt")}</small>{profil.bilgi.semt}</span>
        <Ikon ad={ok} boyut={16} />
      </button>
      <button onclick={() => duzenle("adres")}>
        <Ikon ad="ev" boyut={18} />
        <span class="satir">
          <small>{dil.t("profil.adres")}</small>
          <span class:soluk={!profil.bilgi.adres}><bdi>{profil.bilgi.adres || dil.t("profil.eklenmedi")}</bdi></span>
        </span>
        <Ikon ad={ok} boyut={16} />
      </button>
      <button onclick={() => duzenle("kapiNotu")}>
        <Ikon ad="anahtar" boyut={18} />
        <span class="satir">
          <small>{dil.t("profil.kapiNotu")}</small>
          <span class:soluk={!profil.bilgi.kapiNotu}><bdi>{profil.bilgi.kapiNotu || dil.t("profil.eklenmedi")}</bdi></span>
        </span>
        <Ikon ad={ok} boyut={16} />
      </button>
    </div>
    <p class="aciklama">{dil.t("profil.evimNot")}</p>
  </section>

  <section>
    <h2 class="bolum-baslik baslik-sayacli">
      {dil.t("profil.evimiTaniyorum")}
      <span class="sayac" class:tamam={evHazirligi.tamamSayisi === HAZIRLIK_MADDELERI.length}>
        {dil.t("profil.hazirlikSayac", {
          n: sayiYaz(evHazirligi.tamamSayisi, dil.kod),
          toplam: sayiYaz(HAZIRLIK_MADDELERI.length, dil.kod),
        })}
      </span>
    </h2>
    <p class="aciklama ust">{dil.t("profil.evimiTaniyorumNot")}</p>
    <div class="kart maddeler">
      {#each HAZIRLIK_MADDELERI as m (m)}
        <label class="madde" class:isaretli={evHazirligi.durum[m]}>
          <input type="checkbox" checked={evHazirligi.durum[m]} onchange={() => evHazirligi.degistir(m)} />
          <span class="madde-ikon" aria-hidden="true"><Ikon ad={maddeIkonu[m]} boyut={18} /></span>
          <span class="madde-metin">
            <b>{dil.t(`hazirlik.${m}` as Anahtar)}</b>
            <small>{dil.t(`hazirlik.${m}.ipucu` as Anahtar)}</small>
          </span>
          <span class="kutucuk" aria-hidden="true"><Ikon ad="onay" boyut={14} /></span>
        </label>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.favoriUstalar")}</h2>
    {#if favoriUstalar.length}
      <div class="favoriler">
        {#each favoriUstalar as u (u.id)}
          {@const ozet = yorumlarim.ustaIcin(u)}
          <Kart
            {...ustaKartGirdisi(u, {
              km: mesafeKm(u, profil.bilgi.semt),
              durum: ustaDurumu(u, saat.simdi),
              puan: { deger: ozet.puan, sayi: ozet.sayi },
              dil: dil.kod,
              t: (a, d) => dil.t(a, d),
              dilAdi: (d) => dilAdlari[d],
            })}
          >
            {#snippet eylem()}
              <button class="favori-dugme" onclick={() => favoriCikar(u)} aria-label={dil.t("kart.favoriCikar")}>
                <Ikon ad="kalp" boyut={20} dolu />
              </button>
            {/snippet}
          </Kart>
        {/each}
      </div>
    {:else}
      <div class="kart">
        <BosDurum
          ikon="kalp"
          baslik={dil.t("profil.favoriBosBaslik")}
          aciklama={dil.t("profil.favoriBosMetin")}
          dugmeMetni={dil.t("profil.ustalaraGoz")}
          href="/"
          ikincil
        />
      </div>
    {/if}
  </section>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.gorunum")}</h2>
    <div class="kart secenekler uc" role="radiogroup" aria-label={dil.t("profil.tema")}>
      {#each ["sistem", "gunduz", "gece"] as const as t (t)}
        <button role="radio" aria-checked={tema.tercih === t} onclick={() => tema.sec(t)}>
          <Ikon ad={t === "sistem" ? "otomatik" : t === "gunduz" ? "gunes" : "ay"} boyut={18} />
          {dil.t(`tema.${t}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.dil")}</h2>
    <div class="kart secenekler dort" role="radiogroup" aria-label={dil.t("profil.dil")}>
      {#each diller as d (d)}
        <button role="radio" aria-checked={dil.kod === d} lang={d} onclick={() => dil.degistir(d)}>{dilAdlari[d]}</button>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.gizlilik")}</h2>
    <p class="aciklama ust"><Ikon ad="kilit" boyut={14} /> {dil.t("profil.gizlilikNot")}</p>
    <div class="kart liste">
      <button onclick={disaAktar}>
        <Ikon ad="kopyala" boyut={18} />
        <span>{dil.t(disaAktarPano ? "profil.disaAktarKopyala" : "profil.disaAktar")}</span>
      </button>
      <button class="tehlike" onclick={() => (silPenceresi = true)}>
        <Ikon ad="cop" boyut={18} />
        <span>{dil.t("profil.sil")}</span>
      </button>
    </div>
  </section>

  <section>
    <h2 class="bolum-baslik">{dil.t("profil.bilgi")}</h2>
    <nav class="kart liste">
      {#each bilgiSayfalari as s (s)}
        <a href={sayfaYolu(dil.kod, s)}>
          <Ikon ad={bilgiIkonu[s]} boyut={18} />
          <span>{dil.t(`sayfa.${s}`)}</span>
          <Ikon ad={ok} boyut={16} />
        </a>
      {/each}
    </nav>
  </section>

  <!-- Uygulamada platform adı da yazılır (Android, Windows …); tarayıcıda çekirdek adı zaten "tarayıcı" der -->
  <p class="surum">
    {#if platformAdi()}
      {dil.t("profil.surumPlatform", { surum: SURUM, motor: dil.t("motor.rust"), platform: platformAdi() ?? "" })}
    {:else}
      {dil.t("profil.surum", { surum: SURUM, motor: dil.t(rustIcinde() ? "motor.rust" : "motor.ts") })}
    {/if}
  </p>
</div>

<Pencere bind:acik={duzenleAcik} alt baslik={dil.t("profil.duzenleBaslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <form id="profil-formu" class="form" onsubmit={kaydet}>
    <label>
      {dil.t("profil.ad")}
      <input bind:this={alanlar.ad} bind:value={taslak.ad} autocomplete="name" maxlength="80" />
    </label>
    <label>
      {dil.t("profil.telefon")}
      <input
        bind:this={alanlar.telefon}
        type="tel"
        dir="ltr"
        bind:value={taslak.telefon}
        autocomplete="tel"
        maxlength="20"
        placeholder="05xx xxx xx xx"
        aria-invalid={telefonUyarisi}
        aria-describedby="telefon-uyari"
      />
      {#if telefonUyarisi}<small id="telefon-uyari" class="uyari">{dil.t("profil.telefonUyari")}</small>{/if}
    </label>
    <label>
      {dil.t("profil.adres")}
      <textarea bind:this={alanlar.adres} rows="2" bind:value={taslak.adres} autocomplete="street-address" maxlength="300"></textarea>
    </label>
    <label>
      {dil.t("profil.kapiNotu")}
      <input bind:this={alanlar.kapiNotu} bind:value={taslak.kapiNotu} maxlength="120" placeholder={dil.t("profil.kapiNotuOrnek")} />
    </label>
  </form>
  {#snippet altBilgi()}
    <button class="btn ikincil" onclick={() => (duzenleAcik = false)}>{dil.t("genel.vazgec")}</button>
    <button class="btn" type="submit" form="profil-formu" disabled={!degisti || telefonUyarisi}>{dil.t("profil.kaydet")}</button>
  {/snippet}
</Pencere>

<Pencere bind:acik={semtPenceresi} alt baslik={dil.t("liste.konumSec")} kapatEtiketi={dil.t("genel.kapat")}>
  <SemtSecici
    secili={profil.bilgi.semt}
    sec={(s) => {
      profil.guncelle({ semt: s });
      semtPenceresi = false;
    }}
  />
</Pencere>

<Pencere bind:acik={silPenceresi} alt baslik={dil.t("profil.silBaslik")} kapatEtiketi={dil.t("genel.kapat")}>
  <p class="aciklama">{dil.t("profil.silNot")}</p>
  {#snippet altBilgi()}
    <button class="btn ikincil" onclick={() => (silPenceresi = false)}>{dil.t("genel.vazgec")}</button>
    <button class="btn tehlike-dugme" onclick={sil}>{dil.t("profil.silOnay")}</button>
  {/snippet}
</Pencere>

<style>
  /* Kimlik alanı — ana sayfadaki koyu kahraman alanıyla aynı dil */
  .kimlik-alani {
    background: var(--renk-koyu);
    color: var(--koyu-ustu);
    border-end-start-radius: var(--radius-buyuk);
    border-end-end-radius: var(--radius-buyuk);
  }

  .kimlik-ic {
    display: flex;
    flex-direction: column;
    gap: var(--b-4);
    max-width: 560px; /* .sayfa.dar ile aynı genişlik */
    margin: 0 auto;
    padding: var(--b-2) var(--b-4) var(--b-5);
  }

  .kimlik {
    display: flex;
    align-items: center;
    gap: var(--b-3);
  }

  .avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border: 1px solid var(--koyu-cizgi);
    border-radius: var(--radius-buyuk);
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
    font-size: var(--yz-xl);
    font-weight: 800;
  }

  .kim {
    flex: 1;
    min-width: 0;
  }

  h1 {
    margin: 0;
    font-size: var(--yz-xl);
    overflow-wrap: anywhere;
  }

  .kim p {
    display: flex;
    align-items: center;
    gap: var(--b-1);
    margin: 2px 0 0;
    font-size: var(--yz-sm);
    opacity: 0.8;
  }

  .duzenle-dugme {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--dokunma);
    height: var(--dokunma);
    border: 1px solid var(--koyu-cizgi);
    border-radius: var(--radius-hap);
    background: var(--koyu-cam);
    color: var(--koyu-ustu);
  }

  .hazirlik {
    display: flex;
    flex-direction: column;
    gap: var(--b-2);
    padding: var(--b-3) var(--b-4);
    border: 1px solid var(--koyu-cizgi);
    border-radius: var(--radius);
    background: var(--koyu-cam);
  }

  .hazirlik-ust {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  .hazirlik-ust b {
    font-size: var(--yz-lg);
  }

  .cubuk {
    height: var(--b-2);
    border-radius: var(--radius-hap);
    background: var(--koyu-cizgi);
    overflow: hidden;
  }

  .cubuk span {
    display: block;
    height: 100%;
    border-radius: var(--radius-hap);
    background: var(--basari);
    transition: inline-size var(--sure-orta) var(--egri);
  }

  .hazirlik-not {
    display: flex;
    align-items: center;
    gap: var(--b-1);
    margin: 0;
    font-size: var(--yz-sm);
    opacity: 0.85;
  }

  .hazirlik-not.tamam {
    opacity: 1;
  }

  .eksikler {
    display: flex;
    flex-wrap: wrap;
    gap: var(--b-2);
  }

  .eksik {
    display: inline-flex;
    align-items: center;
    gap: var(--b-1);
    min-height: 36px;
    padding: 0 var(--b-3);
    border: 1px dashed var(--koyu-cizgi);
    border-radius: var(--radius-hap);
    background: none;
    color: var(--koyu-ustu);
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  /* Sayfa içi */
  .istatistik {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: var(--b-3) var(--b-1);
  }

  .istatistik div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
    color: var(--yazi-soluk);
  }

  .istatistik b {
    font-size: var(--yz-md);
    color: var(--yazi);
  }

  .istatistik span {
    font-size: var(--yz-xs);
  }

  .aciklama {
    margin: var(--b-2) 0 0;
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .aciklama.ust {
    display: flex;
    align-items: flex-start;
    gap: var(--b-1);
    margin: 0 0 var(--b-2);
  }

  .baslik-sayacli {
    display: flex;
    align-items: center;
    gap: var(--b-2);
  }

  .sayac {
    padding: 0 var(--b-2);
    border-radius: var(--radius-hap);
    background: var(--yuzey-2);
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
    font-weight: 700;
  }

  .sayac.tamam {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .liste {
    display: flex;
    flex-direction: column;
  }

  .liste a,
  .liste button {
    display: flex;
    align-items: center;
    gap: var(--b-3);
    min-height: 56px;
    padding: var(--b-2) var(--b-4);
    border: 0;
    background: none;
    font-size: var(--yz-md);
    text-align: start;
  }

  .liste a > span,
  .liste button > span {
    flex: 1;
    min-width: 0;
  }

  .liste > * + * {
    border-top: 1px solid var(--kenar) !important;
  }

  .satir {
    display: flex;
    flex-direction: column;
    overflow-wrap: anywhere;
  }

  .satir small {
    color: var(--yazi-soluk);
    font-size: var(--yz-xs);
  }

  .soluk {
    color: var(--yazi-soluk);
  }

  .liste .tehlike {
    color: var(--hata);
  }

  /* "Evimi tanıyorum" — kutunun tamamı dokunulabilir; seçili hali --secili değil başarı rengi (tamamlandı anlamı) */
  .maddeler {
    display: flex;
    flex-direction: column;
  }

  .madde {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--b-3);
    padding: var(--b-3) var(--b-4);
    cursor: pointer;
  }

  .madde + .madde {
    border-top: 1px solid var(--kenar);
  }

  .madde input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .madde:has(input:focus-visible) {
    outline: 2px solid var(--renk-ana);
    outline-offset: -2px;
    border-radius: var(--radius);
  }

  .madde-ikon {
    flex-shrink: 0;
    display: flex;
    padding: var(--b-2);
    border-radius: var(--radius-kucuk);
    background: var(--renk-ana-yumusak);
    color: var(--renk-ana-yazi);
  }

  .madde-metin {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .madde-metin b {
    font-size: var(--yz-md);
  }

  .madde-metin small {
    color: var(--yazi-soluk);
    font-size: var(--yz-sm);
    line-height: 1.45;
  }

  .kutucuk {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    margin-top: 2px;
    border: 2px solid var(--kenar);
    border-radius: var(--radius-hap);
    color: transparent;
    transition: background var(--sure-hizli) var(--egri);
  }

  .madde.isaretli .kutucuk {
    border-color: var(--basari);
    background: var(--basari);
    color: var(--kart);
  }

  .madde.isaretli .madde-ikon {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  .favoriler {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--b-3);
  }

  @media (min-width: 768px) {
    .favoriler {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .favori-dugme {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--dokunma);
    height: var(--dokunma);
    border: 0;
    border-radius: var(--radius-hap);
    background: none;
    color: var(--hata);
  }

  .secenekler {
    display: grid;
    gap: var(--b-1);
    padding: var(--b-1);
  }

  .secenekler.uc {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .secenekler.dort {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .secenekler button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--b-1);
    min-height: 56px;
    padding: var(--b-1);
    border: 0;
    border-radius: var(--radius-kucuk);
    background: none;
    font-size: var(--yz-sm);
    font-weight: 600;
    color: var(--yazi-soluk);
  }

  .secenekler button[aria-checked="true"] {
    background: var(--secili);
    color: var(--secili-ustu);
  }

  .surum {
    margin: 0;
    font-size: var(--yz-xs);
    color: var(--yazi-soluk);
    text-align: center;
  }

  /* Düzenleme paneli */
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--b-4);
  }

  .form label {
    display: flex;
    flex-direction: column;
    gap: var(--b-1);
    font-size: var(--yz-sm);
    font-weight: 600;
  }

  .form input,
  .form textarea {
    min-height: 48px;
    padding: var(--b-3);
    border: 1px solid var(--kenar);
    border-radius: var(--radius-kucuk);
    background: var(--zemin);
    font-size: 16px;
    font-weight: 400;
    resize: vertical;
  }

  .form input[aria-invalid="true"] {
    border-color: var(--hata);
  }

  .uyari {
    color: var(--hata);
    font-weight: 500;
  }

  .tehlike-dugme {
    background: var(--hata);
    color: var(--kart);
  }
</style>
