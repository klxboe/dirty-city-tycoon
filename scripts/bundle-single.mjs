/**
 * Baut aus dem Ergebnis von `vite build --config vite.config.single.ts` EINE
 * einzelne, in sich geschlossene HTML-Datei: dist-single/axe-throw.html
 *
 * Damit lässt sich das Spiel ohne Server, WLAN oder App Store auf ein Handy
 * bringen – Datei rüberkopieren, antippen, spielen.
 *
 * Aufruf über: npm run build:single
 */
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'dist-single';
const ZIEL = join(OUT_DIR, 'axe-throw.html');

const js = readFileSync(join(OUT_DIR, 'app.js'), 'utf8');
const css = readFileSync(join(OUT_DIR, 'app.css'), 'utf8');
const icon = readFileSync('public/icon-192.png').toString('base64');

let html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');

// Manifest und Icon-Verweise raus: über file:// gibt es keine erreichbaren
// Nachbardateien, und ein Manifest ergibt ohne Server ohnehin keinen Sinn.
html = html.replace(/\s*<link rel="manifest"[^>]*>/g, '');
html = html.replace(/\s*<link rel="icon"[^>]*>/g, '');
html = html.replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '');

/*
 * WICHTIG: eingefügter Inhalt IMMER über eine Ersetzungs-FUNKTION übergeben.
 * Bei einem Ersetzungs-String deutet JavaScript `$&`, `$'` und `` $` `` als
 * Sonderzeichen und schiebt Teile des Originaltextes ein. Der gebaute Code
 * enthält solche Folgen – als String übergeben blähte das die Datei von
 * ~280 kB auf 1,8 MB auf. Eine Funktion wird wörtlich eingesetzt.
 */
const einfuegen = (text) => () => text;

// Icon als data:-URI einbetten, damit das Lesezeichen ein Bild bekommt.
html = html.replace(
  '</head>',
  einfuegen(
    `  <link rel="icon" type="image/png" href="data:image/png;base64,${icon}" />\n` +
      `  <link rel="apple-touch-icon" href="data:image/png;base64,${icon}" />\n` +
      '</head>',
  ),
);

// CSS inline
html = html.replace(/\s*<link rel="stylesheet"[^>]*>/g, '');
html = html.replace('</head>', einfuegen(`  <style>\n${css}\n  </style>\n</head>`));

// JS inline. `</script>` im Code würde das Tag vorzeitig schließen – daher
// maskieren. (Kommt in gebautem Code praktisch nicht vor, kostet aber nichts.)
html = html.replace(/\s*<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
const sicheresJs = js.replace(/<\/script>/gi, '<\\/script>');
html = html.replace('</body>', einfuegen(`  <script>\n${sicheresJs}\n  </script>\n</body>`));

writeFileSync(ZIEL, html, 'utf8');

// Einzelteile aufräumen, damit im Ordner wirklich nur die eine Datei liegt.
for (const datei of readdirSync(OUT_DIR)) {
  if (datei !== 'axe-throw.html') rmSync(join(OUT_DIR, datei), { recursive: true, force: true });
}

const kb = (readFileSync(ZIEL).length / 1024).toFixed(0);
console.log(`${ZIEL} geschrieben (${kb} kB) – eine Datei, alles drin.`);
