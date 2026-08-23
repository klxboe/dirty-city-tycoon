import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor-Grundkonfiguration für das native iOS-Projekt (App-Store-Vorbereitung,
 * 2026-08-22). `webDir` zeigt auf den normalen Vite-Build-Ausgabeordner (`npm run
 * build` erzeugt `dist/`) – Capacitor kopiert dessen Inhalt 1:1 als lokale, gebündelte
 * Web-Assets in die native App (kein Server, kein "localhost" zur Laufzeit).
 *
 * WICHTIG – appId ist nur ein sinnvoller PLATZHALTER (`com.klxboe.axethrow`, aus dem
 * GitHub-Nutzernamen abgeleitet): das muss VOR der echten Registrierung in App Store
 * Connect final festgelegt werden, idealerweise passend zu deiner bestehenden
 * Developer-Account-Struktur (z.B. falls deine andere App schon ein Namensschema
 * wie `com.<firma>.<appname>` nutzt). Einmal in App Store Connect registriert, lässt
 * sich die Bundle-ID NICHT mehr ändern – vorher aber schon.
 */
const config: CapacitorConfig = {
  appId: 'com.klxboe.axethrow',
  appName: 'Axe Throw Master',
  webDir: 'dist',
};

export default config;
