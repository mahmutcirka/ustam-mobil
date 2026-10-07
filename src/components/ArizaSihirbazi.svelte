<script lang="ts">
  // "Ne oldu?" sihirbazı — alan → sorun → aciliyet → uygun ustalar. Mevcut veri ve "önerilen" kuralıyla çalışır;
  // seçilen usta, sorun ve aciliyet önceden doldurulmuş olarak usta sayfasına gidilir (çağrı otomatik oluşturulmaz).
  import Ikon from "$lib/components/Ikon.svelte";
  import { kategoriler, kategoriIkon, kategoriSorunlari, mesafeKm, sayiYaz, sorunBilgisi, ustaDurumu, ustalar, varisDk, basHarfler, aralikYaz } from "$lib/data";
  import { oneriPuani } from "$lib/eslestirme";
  import { dil } from "$lib/i18n.svelte";
  import { profil } from "$lib/profil.svelte";
  import { saat } from "$lib/saat.svelte";
  import type { Anahtar } from "$lib/ceviriler";
  import type { Aciliyet, Kategori } from "../types/ustam";

  let adim = $state<1 | 2 | 3 | 4>(1);
  let kategori = $state<Kategori>("tesisat");
  let sorun = $state("");
  let aciliyet = $state<Aciliyet>("hemen");

  const secenekler: Aciliyet[] = ["hemen", "bugun", "randevu"];

  // "Hemen" için yalnızca şu an müsait olanlar, "Bugün" için meşgul olmayanlar; en iyi 3 öneri
  const sonuclar = $derived(
    adim === 4
      ? ustalar
          .filter((u) => u.kategori === kategori)
          .filter((u) => (aciliyet === "hemen" ? ustaDurumu(u, saat.simdi).tur === "musait" : aciliyet === "bugun" ? u.musait : true))
          .map((u) => ({ u, o: oneriPuani(u, { semt: profil.bilgi.semt, dil: dil.kod, simdi: saat.simdi }) }))
          .sort((a, b) => b.o.puan - a.o.puan)
          .slice(0, 3)
      : [],
  );
</script>

<div class="sihirbaz">
  <div class="ilerleme" aria-hidden="true">
    {#each [1, 2, 3, 4] as n}<span class:dolu={n <= adim}></span>{/each}
  </div>

  {#if adim === 1}
    <p class="soru">{dil.t("sihirbaz.alanSoru")}</p>
    <div class="secenekler">
      {#each kategoriler as k}
        <button class="secenek" onclick={() => ((kategori = k), (adim = 2))}>
          <span class="ikon"><Ikon ad={kategoriIkon[k]} boyut={20} /></span>
          <span>{dil.t(`kategori.${k}`)}</span>
          <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={16} />
        </button>
      {/each}
    </div>
  {:else if adim === 2}
    <p class="soru">{dil.t("sihirbaz.sorunSoru")}</p>
    <div class="secenekler">
      {#each kategoriSorunlari[kategori] as s}
        <button class="secenek" onclick={() => ((sorun = s), (adim = 3))}>
          <span class="ikon" class:tehlike={sorunBilgisi[s].tehlikeli}>
            <Ikon ad={sorunBilgisi[s].tehlikeli ? "uyari" : kategoriIkon[kategori]} boyut={20} />
          </span>
          <span>
            {dil.t(`sorun.${s}` as Anahtar)}
            <small>{aralikYaz(sorunBilgisi[s].iscilik[0], sorunBilgisi[s].iscilik[1], dil.kod)}</small>
          </span>
          <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={16} />
        </button>
      {/each}
    </div>
  {:else if adim === 3}
    <p class="soru">{dil.t("sihirbaz.aciliyetSoru")}</p>
    <div class="ipucu">
      <Ikon ad={sorunBilgisi[sorun].tehlikeli ? "uyari" : "bilgi"} boyut={18} />
      <span>{dil.t(`ipucu.${sorun}` as Anahtar)}</span>
    </div>
    <div class="secenekler">
      {#each secenekler as a}
        <button class="secenek" onclick={() => ((aciliyet = a), (adim = 4))}>
          <span class="ikon"><Ikon ad={a === "hemen" ? "roket" : a === "bugun" ? "saat" : "takvim"} boyut={20} /></span>
          <span>{dil.t(`sihirbaz.${a}`)}</span>
          <Ikon ad={dil.yon === "rtl" ? "ok-sol" : "ok-sag"} boyut={16} />
        </button>
      {/each}
    </div>
  {:else}
    <p class="soru">{dil.t("sihirbaz.sonuc")}</p>
    {#each sonuclar as { u } (u.id)}
      {@const km = mesafeKm(u, profil.bilgi.semt)}
      <a class="sonuc" href="/usta/{u.id}?sorun={sorun}&aciliyet={aciliyet}">
        <span class="avatar" aria-hidden="true">{basHarfler(u.ad)}</span>
        <span class="bilgi">
          <b>{u.ad}</b>
          <small>
            {dil.t("kart.km", { n: sayiYaz(km, dil.kod) })}
            {#if ustaDurumu(u, saat.simdi).tur === "musait"} · {dil.t("kart.dk", { dk: sayiYaz(varisDk(km), dil.kod) })}{/if}
          </small>
        </span>
        <span class="sec">{dil.t("sihirbaz.sec")}</span>
      </a>
    {:else}
      <p class="yok">{dil.t("sihirbaz.sonucYok")}</p>
    {/each}
  {/if}

  {#if adim > 1}
    <button class="btn hayalet kucuk geri" onclick={() => adim--}>
      <Ikon ad={dil.yon === "rtl" ? "ok-sag" : "ok-sol"} boyut={16} /> {dil.t("detay.geri")}
    </button>
  {/if}
</div>

<style>
  .sihirbaz {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ilerleme {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .ilerleme span {
    height: 4px;
    border-radius: 2px;
    background: var(--kenar);
    transition: background var(--sure-orta) var(--egri);
  }

  .ilerleme span.dolu {
    background: var(--yazi);
  }

  .soru {
    margin: 4px 0 0;
    font-size: var(--yz-lg);
    font-weight: 700;
  }

  .secenekler {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .secenek {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    font-size: var(--yz-md);
    font-weight: 600;
    text-align: start;
  }

  .secenek:active {
    background: var(--yuzey-2);
  }

  .secenek > span:nth-child(2) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  small {
    font-size: var(--yz-xs);
    font-weight: 500;
    color: var(--yazi-soluk);
  }

  .ikon {
    display: flex;
    padding: 8px;
    border-radius: 12px;
    background: var(--yuzey-2);
  }

  .ikon.tehlike {
    background: var(--hata-yumusak);
    color: var(--hata);
  }

  .ipucu {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-kucuk);
    background: var(--vurgu-yumusak);
    font-size: var(--yz-sm);
    line-height: 1.5;
  }

  .sonuc {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--yuzey-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .bilgi {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sec {
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--renk-ana);
    color: var(--renk-ana-ustu);
    font-size: var(--yz-sm);
    font-weight: 700;
  }

  .yok {
    margin: 0;
    color: var(--yazi-soluk);
  }

  .geri {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
</style>
