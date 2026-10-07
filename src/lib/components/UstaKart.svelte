<script lang="ts">
  // Liste ekranındaki tek usta kartı — dışarıdan "usta" prop'u alır
  import Ikon from "./Ikon.svelte";
  import type { Usta } from "../../types/ustam";
  import { kategoriIkon, paraYaz, sayiYaz } from "$lib/data";
  import { dil } from "$lib/i18n.svelte";

  let { usta }: { usta: Usta } = $props();
</script>

<a href="/usta/{usta.id}" class="kart usta">
  <div class="avatar" aria-hidden="true"><Ikon ad={kategoriIkon[usta.kategori]} boyut={28} /></div>
  <div class="bilgi">
    <div class="satir">
      <h3>{usta.ad}</h3>
      <span class="durum" class:musait={usta.musait}>
        {usta.musait ? dil.t("kart.musait") : dil.t("kart.mesgul")}
      </span>
    </div>
    <p class="uzmanlik">{dil.t(`kategori.${usta.kategori}`)} · {usta.bolge}</p>
    <p class="meta">
      <span>⭐ {sayiYaz(usta.puan, dil.kod)}</span>
      <span>({dil.t("kart.yorum", { n: sayiYaz(usta.yorumSayisi, dil.kod) })})</span>
      <span>📍 {dil.t("kart.km", { n: sayiYaz(usta.mesafeKm, dil.kod) })}</span>
    </p>
    <strong>{dil.t("kart.cikis", { tutar: paraYaz(usta.cikisUcreti, dil.kod) })}</strong>
  </div>
</a>

<style>
  .usta {
    display: flex;
    gap: 14px;
    padding: 14px;
    transition: border-color 0.15s;
  }

  .usta:hover {
    border-color: var(--renk-ana);
  }

  .avatar {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--renk-ana-yumusak);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .bilgi {
    flex: 1;
    min-width: 0;
  }

  .satir {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  h3 {
    margin: 0;
    font-size: 17px;
  }

  .durum {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--kenar);
    color: var(--yazi-soluk);
    font-size: 11px;
    font-weight: 600;
  }

  .durum.musait {
    background: var(--basari-yumusak);
    color: var(--basari);
  }

  p {
    margin: 3px 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    color: var(--renk-ana-yazi);
  }
</style>
