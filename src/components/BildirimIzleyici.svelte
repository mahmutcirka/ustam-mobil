<script lang="ts">
  // Görünmez: iş emri aşamalarını izleyip olay olduğunda bildirim verir (bildirimIzleyici.svelte.ts).
  // Layout'ta bir kez bulunur; sayfa geçişinde yeniden kurulsa da gönderilen bildirimler kayıtlı olduğu için tekrar etmez.
  import { onMount } from "svelte";
  import { izlemeyiBaslat } from "$lib/bildirimIzleyici.svelte";

  onMount(izlemeyiBaslat);
</script>
