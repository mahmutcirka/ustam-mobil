<script lang="ts">
  // Alt menü navigasyonu — bekleyen çağrı ve aktif iş emri rozetleri
  import { onMount } from "svelte";
  import { cagri } from "$lib/cagri.svelte";
  import { isEmirleri } from "$lib/isEmirleri.svelte";
  import { dil } from "$lib/i18n.svelte";
  import type { Anahtar } from "$lib/ceviriler";

  let yol = $state(typeof window !== "undefined" ? window.location.pathname : "/");

  const menu: { href: string; ad: Anahtar; ikon: string }[] = [
    { href: "/", ad: "nav.ustalar", ikon: "🔧" },
    { href: "/cagri", ad: "nav.cagri", ikon: "📋" },
    { href: "/is-emirlerim", ad: "nav.isEmirleri", ikon: "🧾" },
    { href: "/profil", ad: "nav.profil", ikon: "👤" },
  ];

  const rozet = (href: string) =>
    href === "/cagri" ? (cagri.taslak ? 1 : 0) : href === "/is-emirlerim" ? isEmirleri.aktifSayisi : 0;

  const aktif = (href: string) =>
    href === "/" ? yol === "/" || yol.startsWith("/usta/") : yol.startsWith(href);

  onMount(() => {
    const guncelle = () => (yol = window.location.pathname);
    document.addEventListener("astro:page-load", guncelle);
    window.addEventListener("popstate", guncelle);
    return () => {
      document.removeEventListener("astro:page-load", guncelle);
      window.removeEventListener("popstate", guncelle);
    };
  });
</script>

<nav class="alt-menu">
  {#each menu as m}
    <a href={m.href} class:aktif={aktif(m.href)}>
      <span class="ikon">{m.ikon}</span>
      {dil.t(m.ad)}
      {#if rozet(m.href) > 0}
        <b class="rozet">{rozet(m.href)}</b>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .alt-menu {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--kart);
    border-top: 1px solid var(--kenar);
    z-index: 20;
  }

  .alt-menu a {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 0;
    font-size: 11px;
    color: var(--yazi-soluk);
    text-decoration: none;
  }

  .alt-menu a.aktif {
    color: var(--renk-ana);
    font-weight: 600;
  }

  .ikon {
    font-size: 20px;
  }

  /* Tablet: menü öğeleri geniş ekranda dağılmasın diye ortalanır */
  @media (min-width: 768px) {
    .alt-menu {
      justify-content: center;
    }

    .alt-menu a {
      flex: 0 1 140px;
      font-size: 12px;
    }
  }

  /* Masaüstü: alt menü, başlığın altında başlayan dikey yan şeride dönüşür (RTL'de sağda) */
  @media (min-width: 1200px) {
    .alt-menu {
      top: 62px;
      bottom: 0;
      right: auto;
      left: auto;
      inset-inline-start: 0;
      width: 96px;
      flex-direction: column;
      justify-content: flex-start;
      gap: 4px;
      padding: 12px 0;
      border-top: 0;
      border-inline-end: 1px solid var(--kenar);
    }

    .alt-menu a {
      flex: 0 0 auto;
      padding: 14px 4px;
      text-align: center;
    }
  }

  .rozet {
    position: absolute;
    top: 4px;
    inset-inline-start: calc(50% + 6px);
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--renk-ana);
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }
</style>
