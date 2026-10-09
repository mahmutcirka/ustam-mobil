<script lang="ts">
  // Yükleniyor — liste gelene kadar kart iskeletleri. Gerçek bir yükleme anını kapsar; yapay gecikme eklenmez.
  // Ekran okuyucu yalnız "etiket" metnini duyar; iskelet kutuları gizlidir.
  let { etiket, adet = 4 }: { etiket: string; adet?: number } = $props();
</script>

<div class="yukleniyor" role="status" aria-live="polite" aria-busy="true">
  <span class="gizli">{etiket}</span>
  {#each Array.from({ length: adet }) as _, i (i)}
    <div class="kart iskelet-kart" aria-hidden="true">
      <div class="ust">
        <span class="kutu gorsel"></span>
        <div class="satirlar">
          <span class="kutu cizgi genis"></span>
          <span class="kutu cizgi"></span>
          <span class="kutu cizgi kisa"></span>
        </div>
      </div>
      <span class="kutu etiket"></span>
    </div>
  {/each}
</div>

<style>
  .yukleniyor {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--b-3);
  }

  @media (min-width: 768px) {
    .yukleniyor {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1200px) {
    .yukleniyor {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .gizli {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .iskelet-kart {
    display: flex;
    flex-direction: column;
    gap: var(--b-3);
    padding: var(--b-4);
  }

  .ust {
    display: flex;
    gap: var(--b-3);
  }

  .satirlar {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--b-2);
  }

  .kutu {
    display: block;
    border-radius: var(--radius-kucuk);
    background: var(--kenar);
    animation: soluk 1.4s ease-in-out infinite;
  }

  .gorsel {
    width: var(--kart-gorsel);
    height: var(--kart-gorsel);
    border-radius: var(--radius);
  }

  .cizgi {
    height: var(--b-3);
    width: 60%;
  }

  .cizgi.genis {
    width: 80%;
    height: var(--b-4);
  }

  .cizgi.kisa {
    width: 40%;
  }

  .etiket {
    height: calc(var(--b-6) + var(--b-1));
  }

  @keyframes soluk {
    50% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kutu {
      animation: none;
    }
  }
</style>
