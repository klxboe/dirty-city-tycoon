import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Zweiter Build für die "eine Datei zum Mitnehmen"-Variante (npm run build:single).
 *
 * Zweck: das Spiel auf ein Handy bekommen, ohne Server, WLAN oder App Store –
 * man kopiert die fertige HTML-Datei aufs Gerät und öffnet sie direkt.
 *
 * Zwei Dinge sind dafür entscheidend und der Grund für diese eigene Config:
 *
 * 1. `format: 'iife'` statt ES-Module. Ein `<script type="module">` wird von
 *    Browsern über `file://` durch die CORS-Regeln BLOCKIERT – die Seite bliebe
 *    einfach schwarz. Ein klassisches Script läuft dort dagegen problemlos.
 * 2. Alles inline: `assetsInlineLimit` sehr hoch und `cssCodeSplit: false`,
 *    damit keine Datei nachgeladen werden muss.
 *
 * Das Zusammenfügen zu einer einzigen Datei macht danach scripts/bundle-single.mjs.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-single',
    // Praktisch unbegrenzt: alle Assets als data:-URI einbetten statt verlinken.
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    // Kein Hash im Namen – das Bündel-Skript sucht die Dateien unter festen Namen.
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
