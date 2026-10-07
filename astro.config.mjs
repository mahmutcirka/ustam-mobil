// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [svelte(), react(), mdx()],
  server: {
    port: 1420,
    host: '127.0.0.1',
  },
  // Geliştirme araç çubuğu telefon genişliğinde alt menünün üstüne biniyor (bun run telefon ile görülür)
  devToolbar: {
    enabled: false,
  },
  vite: {
    resolve: {
      alias: {
        $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      },
    },
    // Tauri-recommended Vite settings (https://v2.tauri.app/start/frontend/):
    clearScreen: false,
    server: {
      strictPort: true,
    },
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    // QR kitaplığı ilk sayfa açılışında keşfedilirse dev sunucusu "Outdated Optimize Dep" verir; baştan hazırla
    optimizeDeps: {
      include: ['qrcode-generator'],
    },
  },
});
