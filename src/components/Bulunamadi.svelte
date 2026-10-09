<script lang="ts">
  // Olmayan adres — ör. /usta/999. Boş sayfa yerine HataDurumu ile ne olduğunu söyler ve listeye döndürür.
  import HataDurumu from "$lib/components/ui/HataDurumu.svelte";
  import { dil } from "$lib/i18n.svelte";
  import { sonListeAdresi } from "$lib/listeAdresi";

  const yol = window.location.pathname;
  const ustaAdresi = /^\/usta\//.test(yol);
</script>

<div class="sayfa dar">
  <HataDurumu
    baslik={dil.t(ustaAdresi ? "bulunamadi.ustaBaslik" : "bulunamadi.sayfaBaslik")}
    mesaj={dil.t(ustaAdresi ? "bulunamadi.ustaMetin" : "bulunamadi.sayfaMetin")}
    ayrinti={yol}
    donusMetni={dil.t("bulunamadi.donus")}
    donusHref={ustaAdresi ? sonListeAdresi() : "/"}
  />
</div>
