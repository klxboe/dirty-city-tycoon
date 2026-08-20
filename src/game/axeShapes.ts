// Eigene Silhouetten für die zwölf neuen Äxte (siehe shop.ts, Gemini-
// Konzeptbilder). Vorher teilten sich ALLE Skins dieselbe Form aus Axe.tsx
// und unterschieden sich nur in der Farbe – das reichte nicht.
//
// WICHTIG (Lehre aus der ersten Fassung): Die Werkstatt zeigt jede Axt nur
// bei 26px (`Shop.tsx`), das Axt-Inventar bei 30px. Feine Kurven-Unterschiede
// und kleine Zier-Elemente (Edelstein, Stern, Zahnrad-Zeiger, ...) gehen bei
// der Größe komplett unter – erkennbar bleibt NUR die grobe Silhouette
// (breit/schmal, spitz/rund, symmetrisch/einseitig, glatt/gezackt). Die
// Formen unten sind deshalb bewusst GROSSFLÄCHIG unterschiedlich, nicht nur
// in Details verändert. Die kleinen Zier-Elemente bleiben trotzdem drin,
// weil die Axt an anderer Stelle deutlich größer erscheint (Start-Bildschirm
// 92px, Game-Over-Zersplittern 54px, fliegend/bereit 42px) – dort sind sie
// ein netter Bonus, tragen aber NICHT die Wiedererkennung.
//
// Skins OHNE Eintrag hier (Standard-Axt, Boss-Beute, Legendär, Oster-Ei)
// nutzen weiterhin exakt die alte, feste Form aus Axe.tsx – unverändert.

export interface AxeAccentFill {
  d: string;
  /** Fehlt = nutzt style.steel[0] (hellster Stahlton) des jeweiligen Skins. */
  color?: string;
}

export interface AxeAccentStroke {
  d: string;
  color?: string;
  width?: number;
}

export interface AxeShape {
  /** Hauptklinge (rechte/vordere Seite). Ersetzt das "Blatt". */
  front: string;
  /** Zweite Klinge/Sporn (linke/hintere Seite). Fehlt = einseitige Axt. */
  back?: string;
  /** Wanderndes Glanzlicht entlang der Außenkante. Fehlt = kein Glint. */
  edgeGlint?: string;
  /** Kleine flächige Zier-Elemente (Edelstein, Blatt, Schädel, ...). Nur bei
   *  größerer Darstellung sichtbar, siehe Kommentar oben. */
  accentFills?: AxeAccentFill[];
  /** Kleine linienhafte Zier-Elemente (Riss, Zeigernadel, Schaltkreis, ...). */
  accentStrokes?: AxeAccentStroke[];
}

export const AXE_SHAPES: Record<string, AxeShape> = {
  // --- Runenbeil: symmetrische Doppelaxt, Runen auf beiden Seiten, Gesicht am Griffende ---
  'axe-rune': {
    front: 'M12.5 3.2 C20 1.3 27.5 5 28 11 C28.5 16.5 22.5 20.3 16.5 19.2 L12.5 19.8 Z',
    back: 'M19.5 3.2 C12 1.3 4.5 5 4 11 C3.5 16.5 9.5 20.3 15.5 19.2 L19.5 19.8 Z',
    edgeGlint: 'M14.5 5 C20 3.6 25.5 6.5 26 11',
    accentFills: [
      { d: 'M16 6.8 L18.2 9 L16 11.2 L13.8 9 Z' },
      // Gesicht am unteren Griffende (Anspielung aufs Referenzbild)
      { d: 'M14.7 50.5 A1.3 1.3 0 1 1 14.71 50.5 Z', color: '#c7cdd6' },
    ],
    accentStrokes: [
      // Runen-Kerben in beiden Klingen
      { d: 'M9 7.8 L9 11.2', color: '#c7cdd6', width: 0.9 },
      { d: 'M23 7.8 L23 11.2', color: '#c7cdd6', width: 0.9 },
      { d: 'M7 12.5 L11 12.5', color: '#c7cdd6', width: 0.7 },
      { d: 'M21 12.5 L25 12.5', color: '#c7cdd6', width: 0.7 },
    ],
  },

  // --- Dornengift: lange Sichel, Gift-Tropfen an der Schneide, Dornen am Griff ---
  'axe-thorn': {
    front:
      'M11 4 C24 1 32 8 29 15 C26.5 21.5 18.5 26 12.5 27.5 C8.5 28.5 6 25.5 8 22 C9.7 19 14 18 17.5 15 C21.5 11.5 21 7 17 5.5 C14.5 4.5 12.5 4.5 11 6 Z',
    accentFills: [
      { d: 'M11.5 30.5 L8.5 33 L11.5 35.5 Z M20.5 30.5 L23.5 33 L20.5 35.5 Z' },
      // Gift-Tropfen, die von der Klinge herabhängen
      { d: 'M17 22 A1 1 0 1 1 17.01 22 Z M22.5 17.5 A0.9 0.9 0 1 1 22.51 17.5 Z M13.5 25.5 A0.8 0.8 0 1 1 13.51 25.5 Z' },
    ],
  },

  // --- Sternenschneide: Mond-Sichel mit Sternenfeld, Kandis-Streifen-Griff, Edelstein am Knauf ---
  'axe-cosmic': {
    front:
      'M13 3 C22.5 1.3 30 6 30.5 12.5 C31 19 24.5 24 17 22.5 C22 20.3 25.5 15.8 25 11.5 C24.5 7.2 19.8 4.3 14 5 Z',
    back: 'M13.5 8 L6.5 9.8 L13.5 13.3 Z',
    accentFills: [
      {
        d: 'M17.5 6 L18.4 8.4 L20.8 8.9 L18.7 10.5 L19.3 12.9 L17.5 11.4 L15.7 12.9 L16.3 10.5 L14.2 8.9 L16.6 8.4 Z',
        color: '#ffffff',
      },
      { d: 'M25 15 L25.4 15.8 L26.2 15.9 L25.6 16.5 L25.8 17.3 L25 16.9 L24.2 17.3 L24.4 16.5 L23.8 15.9 L24.6 15.8 Z', color: '#ffffff' },
      { d: 'M9 10 L9.3 10.6 L9.9 10.7 L9.4 11.1 L9.6 11.7 L9 11.4 L8.4 11.7 L8.6 11.1 L8.1 10.7 L8.7 10.6 Z', color: '#ffffff' },
      // Edelstein-Knauf am Griffende
      { d: 'M16 52.3 L17.4 54 L16 55.7 L14.6 54 Z', color: '#7fd0ff' },
    ],
    accentStrokes: [
      // Kandis-Streifen-Wicklung diagonal über den Griff
      { d: 'M13 20 L19 26 M13 28 L19 34 M13 36 L19 42 M13 44 L19 50', color: '#ffffff', width: 1.3 },
    ],
  },

  // --- Wurzelhieb: Astgabel mit mehreren Blättern und Ranke am Griff ---
  'axe-nature': {
    front:
      'M12.5 4 C14.5 1.8 16.5 4.5 15.3 8 C18 6 21.5 7 22 10.8 C25 9 28.5 11.5 27 15.5 C25.2 20 18.5 21.5 15 19 C12.2 17 11.5 13 12 9.5 C12.2 7.6 12.3 5.7 12.5 4 Z',
    back: 'M13 10.5 L6.5 12 C4.5 12.8 4.8 15.3 6.8 15.9 L13 16.8 Z',
    accentFills: [
      { d: 'M20 4.5 C23.5 3.3 26.5 5 27 8 C25 9.7 21.5 9.2 20 6.8 Z', color: '#8fce6a' },
      { d: 'M13.5 14.5 C15 13 17 14 16.5 16 C15 17 13.3 16.3 13.5 14.5 Z', color: '#8fce6a' },
      { d: 'M11.5 23.5 C13 22.5 14.5 23.8 13.5 25.5 C12.2 26 11.2 25 11.5 23.5 Z', color: '#8fce6a' },
    ],
    accentStrokes: [
      // Ranke, die am Griff herunterläuft
      { d: 'M15 18 C13.5 22 17 26 14.5 30 C13 34 17 38 15 42 C13.5 46 16.5 50 15.5 54', color: '#4a8a2a', width: 1 },
    ],
  },

  // --- Dampfschmiede: Zahnrad mit Druckanzeige, kleines Zweitrad, Propeller am Griffende ---
  'axe-steampunk': {
    front:
      'M27.5 10 L25 5.5 L20 2.3 L15 5.5 L12.5 10 L15 14.5 L20 17.7 L25 14.5 Z',
    back: 'M13 10.5 L7.5 11 L7.5 13.5 L13 13 Z',
    accentStrokes: [{ d: 'M20 10 L20 5.8', width: 1 }],
    accentFills: [
      { d: 'M19 10 A1 1 0 1 1 19.01 10 Z', color: '#2a1a08' },
      { d: 'M9.5 11.4 L10.1 12 L9.5 12.6 L8.9 12 Z' },
      // kleines Zweitrad oben links
      { d: 'M9.5 5 L10.8 6.5 L9.5 8 L8.2 6.5 Z' },
      // Propeller-Flügel am unteren Griffende
      {
        d: 'M12.5 55 C10 53.5 8 55 9 57 C10.5 58 12 56.5 12.5 55 Z M19.5 55 C22 53.5 24 55 23 57 C21.5 58 20 56.5 19.5 55 Z',
        color: '#2a1a08',
      },
    ],
  },

  // --- Gezeitenklinge: geschwungene Einzelklinge mit Muschel-Spirale am Griffende ---
  'axe-tide': {
    front:
      'M12.5 3.5 C19 1.5 25.5 4 27.5 9 C29 13 26 17.5 20.5 18.5 C17.5 19 16.5 19.8 16.5 20.6 L12.5 19.8 C12 14 12 8.5 12.5 3.5 Z',
    edgeGlint: 'M14 5 C19.5 3.4 24.5 6 26 9.5',
    accentStrokes: [
      { d: 'M17.8 53 A1.8 1.8 0 1 1 17.79 53', width: 0.9 },
      { d: 'M17.3 53 A0.9 0.9 0 1 1 17.29 53', width: 0.7 },
    ],
  },

  // --- Lavabruch: gezacktes Kristall-Bruchstück mit X-Riss und Nieten ---
  'axe-magma': {
    front:
      'M12.5 4 L20.5 2.5 L27 6 L31.5 11.5 L27.5 15.5 L30 20 L21.5 18.5 L18 22 L16.5 20.6 L12.5 19.8 L14.5 14 L11 10.5 L14 6.5 Z',
    accentStrokes: [
      { d: 'M15 6.5 L19.5 10 L16 12.5 L21 17', color: '#ff6e28', width: 1.3 },
      { d: 'M23 6 L18 10 L22 13 L17.5 17', color: '#ff6e28', width: 1.3 },
    ],
    accentFills: [
      { d: 'M27 13 A0.7 0.7 0 1 1 27.01 13 Z', color: '#1a1210' },
      { d: 'M13.5 17 A0.7 0.7 0 1 1 13.51 17 Z', color: '#1a1210' },
    ],
  },

  // --- Korallenschneide: weit gespreizte Riff-Äste mit Muschel-Spirale am Griffende ---
  'axe-coral': {
    front:
      'M12.5 4 C14 1.7 16.3 3.2 15.5 6.5 C18.3 4 21 5.3 20.2 8.8 C23.5 6.8 26.5 8.7 25 12 C28.5 11 31 14 28.5 17 C26 20 22 18.3 21 15 C19.2 18.5 16.5 17.5 16.5 20.6 L12.5 19.8 C12 14 12 9 12.5 4 Z',
    accentStrokes: [
      { d: 'M17.8 53 A1.8 1.8 0 1 1 17.79 53', color: '#eafffb', width: 0.9 },
      { d: 'M17.3 53 A0.9 0.9 0 1 1 17.29 53', color: '#eafffb', width: 0.7 },
    ],
  },

  // --- Pestbeil: Totenkopf mit Knochen, Gift-Blasen, Bandagen-Wicklung am Griff ---
  'axe-plague': {
    front:
      'M12.5 3.5 C17.5 2.2 21 3 23.5 5 C22.3 6.3 24 7.6 22.6 8.8 C25.3 9.6 24.6 12 22.2 12.3 C24.3 14.3 22 16.5 19.6 15 C19.6 17.5 17.5 19 16.5 20.6 L12.5 19.8 Z',
    back: 'M13 7.5 L6 9.2 C3.6 10.1 3.8 13.4 6.3 14.5 L13 17 Z',
    accentFills: [
      { d: 'M22.3 6.6 A2 2 0 1 1 22.29 6.6 Z', color: '#e8e4d0' },
      // Gift-Blasen um den Kopf
      { d: 'M9 12 A1 1 0 1 1 9.01 12 Z M26 10 A0.8 0.8 0 1 1 26.01 10 Z M8 18 A0.7 0.7 0 1 1 8.01 18 Z', color: '#a566c9' },
    ],
    accentStrokes: [
      // Gekreuzte Knochen unterm Schädel
      { d: 'M20.5 8.5 L23.5 10 M23.5 8.5 L20.5 10', color: '#e8e4d0', width: 0.8 },
      // Bandagen-Wicklung am Griff
      { d: 'M13 22 L19 24 M13 30 L19 32 M13 38 L19 40', color: '#c4b89a', width: 2 },
    ],
  },

  // --- Königsbeil: große Doppelaxt mit Diamant-Edelstein, Ziernieten und Spitze ---
  'axe-royal': {
    front: 'M12.5 2.5 C23 0.3 33 6 32 13.5 C31 20 22.5 24 16.5 21.5 L12.5 19.8 Z',
    back: 'M19.5 2.5 C9 0.3 -1 6 0 13.5 C1 20 9.5 24 15.5 21.5 L19.5 19.8 Z',
    edgeGlint: 'M14.5 4.5 C22 2.6 29 6.5 30 12.5',
    accentFills: [
      { d: 'M12 8.3 L14.3 11 L12 13.7 L9.7 11 Z', color: '#5a96ff' },
      { d: 'M16 0.5 L17 3 L15 3 Z' },
      { d: 'M18 4.5 A0.6 0.6 0 1 1 18.01 4.5 Z', color: '#2a1c10' },
      { d: 'M14 4.5 A0.6 0.6 0 1 1 14.01 4.5 Z', color: '#2a1c10' },
    ],
  },

  // --- Datenbeil: eckige Tech-Platte mit verzweigtem Schaltkreis und LED-Kette ---
  'axe-cyber': {
    front: 'M12.5 3 L24 2 L30 8 L30 14 L24 18 L17 20.6 L12.5 19.8 L12.5 11 L15 6 Z',
    back: 'M13 7 L6 8 L5 13 L9 16 L13 14.5 Z',
    accentStrokes: [
      { d: 'M15 8 L19 8 L19 11 L22 11', width: 0.9 },
      { d: 'M24 10 L26 10 L26 13', width: 0.9 },
    ],
    accentFills: [
      {
        d: 'M16 22 A0.5 0.5 0 1 1 16.01 22 Z M16 30 A0.5 0.5 0 1 1 16.01 30 Z M16 38 A0.5 0.5 0 1 1 16.01 38 Z M16 46 A0.5 0.5 0 1 1 16.01 46 Z',
      },
    ],
  },

  // --- Lichtschwinge: Flügelform mit Feder-Linien, Diamant-Kern, Strahlenkranz am Griffende ---
  'axe-holy': {
    front:
      'M12.5 3 C20 0.5 29 1.5 31 7 C32.3 11 28 16 22 15.3 C17.5 14.6 14 11.5 12.5 7.5 Z',
    back:
      'M19.5 3 C12 0.5 3 1.5 1 7 C-0.3 11 4 16 10 15.3 C14.5 14.6 18 11.5 19.5 7.5 Z',
    edgeGlint: 'M14 4.5 C21 2.4 27.5 4.5 29.5 8.5',
    accentFills: [
      { d: 'M16 5 L18 8.5 L16 12 L14 8.5 Z', color: '#fff6d0' },
    ],
    accentStrokes: [
      // Feder-Linien auf beiden Flügeln
      { d: 'M14 6 L20 4.5 M14 8.5 L22 7.5 M14 11 L24 10.5', color: '#fff0b0', width: 0.7 },
      { d: 'M18 6 L12 4.5 M18 8.5 L10 7.5 M18 11 L8 10.5', color: '#fff0b0', width: 0.7 },
      // Strahlenkranz am unteren Griffende
      { d: 'M16 51 L16 55 M13 53 L19 53 M14 51.5 L18 54.5 M18 51.5 L14 54.5', color: '#fff0b0', width: 0.8 },
    ],
  },
};

const DEFAULT_SHAPE: AxeShape = {
  front: 'M12.5 3.5 C21.5 2 30 6.5 30.8 12.5 C31.5 18 24.5 22 16.5 20.6 L12.5 19.8 Z',
  back: 'M13 7.5 L5.5 8.8 C2.6 9.4 2.2 13.4 4.8 14.8 L13 18.6 Z',
  edgeGlint: 'M15.5 5 C22.8 4.2 28.6 7.8 29.2 12.8',
};

/** Skins ohne eigenen Eintrag behalten exakt die alte Standardform. */
export function getAxeShape(id: string): AxeShape {
  return AXE_SHAPES[id] ?? DEFAULT_SHAPE;
}

// ---------------------------------------------------------------------------
// Echte Bild-Skins: pixelgenaue Gemini-Bilder statt nachgezeichneter Vektor-
// Form. Quelle liegt in `reference/`, verarbeitet (Hintergrund entfernt,
// zugeschnitten) in `public/axes/`. Skins hier überschreiben komplett das
// SVG-Rendering aus Axe.tsx (kein Recolor/Glanz-Effekt mehr möglich – die
// Farbe steckt im Bild selbst).
export const AXE_IMAGES: Record<string, string> = {
  'axe-standard': '/axes/axe-standard.png',
  'axe-rune': '/axes/axe-rune.png',
  'axe-nature': '/axes/axe-nature.png',
  'axe-coral': '/axes/axe-coral.png',
  'axe-steampunk': '/axes/axe-steampunk.png',
  'axe-tide': '/axes/axe-tide.png',
  'axe-cosmic': '/axes/axe-cosmic.png',
  'axe-thorn': '/axes/axe-thorn.png',
  'axe-magma': '/axes/axe-magma.png',
  'axe-plague': '/axes/axe-plague.png',
  'axe-royal': '/axes/axe-royal.png',
  'axe-cyber': '/axes/axe-cyber.png',
  'axe-holy': '/axes/axe-holy.png',
  'axe-melon': '/axes/axe-melon.png',
  'axe-orange': '/axes/axe-orange.png',
  'axe-kiwi': '/axes/axe-kiwi.png',
  'axe-dragon': '/axes/axe-dragon.png',
  'axe-pineapple': '/axes/axe-pineapple.png',
  'axe-lemon': '/axes/axe-lemon.png',
  'axe-berry': '/axes/axe-berry.png',
  'axe-pomegranate': '/axes/axe-pomegranate.png',
  'axe-coconut': '/axes/axe-coconut.png',
  'axe-legendary-meteor': '/axes/axe-legendary-meteor.png',
  'axe-legendary-phoenix': '/axes/axe-legendary-phoenix.png',
  'axe-grape': '/axes/axe-grape.png',
  'axe-drone': '/axes/axe-drone.png',
  'axe-neon': '/axes/axe-neon.png',
  'axe-gargoyle': '/axes/axe-gargoyle.png',
  'axe-antenna': '/axes/axe-antenna.png',
  'axe-egg-duck': '/axes/axe-egg-duck.png',
};

export function getAxeImage(id: string): string | undefined {
  return AXE_IMAGES[id];
}
