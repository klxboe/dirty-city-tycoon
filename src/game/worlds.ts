// Die 100 Level sind in 5 Welten zu je 20 Leveln gruppiert – rein optisch/thematisch,
// die Schwierigkeits-Kurve in constants.ts läuft unverändert über die Levelnummer
// durch. Jede Welt tönt die Bühne per eigenen Farbwerten (siehe worldStyleVars) und
// bekommt eine kleine Deko-Silhouette in den unteren Bühnen-Ecken (siehe WorldDecor.tsx).
//
// 6×20 Level: die ersten 5 Welten behalten die ursprüngliche Schwierigkeits-Kurve
// (siehe Tabelle in CLAUDE.md), die 6. Welt "Heldenstadt" (Level 101-120) nutzt
// dieselbe Formel einfach weiter – ab Level 31/26/50 sind Axt-/Hindernis-/Apfelzahl
// ohnehin schon am Anschlag, Heldenstadt bringt also keine neue Kurve, nur eigene
// Optik + eigene Bosse (siehe HERO_BOSSES in shop.ts). "Mehr Level" im eigentlichen
// Sinn gibt der Endlos-Modus nach Level 120 (siehe LEVEL_COUNT-Grenze in constants.ts).

export const WORLDS_LEVEL_COUNT = 20;

/**
 * Erster Level-Index der Heldenstadt-Welt (siehe WORLDS unten) – als eigene
 * Konstante exportiert, weil `constants.ts` (Boss-Rotation) und `Shop.tsx`
 * (Beute-Anzeige) beide wissen müssen, ab wo die Helden-Bosse statt der
 * Boss-Früchte laufen, ohne den ganzen WORLDS-Eintrag zu importieren.
 */
export const HERO_WORLD_START = 100;

export type DecorKind = 'trees' | 'cacti' | 'icicles' | 'lava' | 'stars' | 'city';

export interface World {
  id: string;
  name: string;
  /** 0-basierter erster Level-Index dieser Welt. */
  startLevelIndex: number;
  decor: DecorKind;
  colors: {
    bgTop: string;
    bgBottom: string;
    shardLight: string;
    shardDark: string;
    /** Lichtkegel hinter der Scheibe (siehe .stage::before in App.css). */
    glow: string;
    /** Leitfarbe für die Weltkarte (Kartenrand/Icon). */
    accent: string;
  };
}

export const WORLDS: World[] = [
  {
    id: 'forest',
    name: 'Wald',
    startLevelIndex: 0,
    decor: 'trees',
    colors: {
      bgTop: '#1e2620',
      bgBottom: '#0a0f0a',
      shardLight: 'rgba(180, 255, 200, 0.04)',
      shardDark: 'rgba(0, 0, 0, 0.32)',
      glow: 'rgba(255, 159, 28, 0.2)',
      accent: '#5fae4a',
    },
  },
  {
    id: 'desert',
    name: 'Wüste',
    startLevelIndex: 20,
    decor: 'cacti',
    colors: {
      bgTop: '#2b2015',
      bgBottom: '#120c07',
      shardLight: 'rgba(255, 220, 160, 0.05)',
      shardDark: 'rgba(0, 0, 0, 0.3)',
      glow: 'rgba(255, 200, 60, 0.24)',
      accent: '#e0a83e',
    },
  },
  {
    id: 'ice',
    name: 'Eis',
    startLevelIndex: 40,
    decor: 'icicles',
    colors: {
      bgTop: '#151f2b',
      bgBottom: '#070b11',
      shardLight: 'rgba(180, 230, 255, 0.06)',
      shardDark: 'rgba(0, 0, 0, 0.34)',
      glow: 'rgba(94, 196, 234, 0.26)',
      accent: '#5ec4ea',
    },
  },
  {
    id: 'volcano',
    name: 'Vulkan',
    startLevelIndex: 60,
    decor: 'lava',
    colors: {
      bgTop: '#241412',
      bgBottom: '#0d0605',
      shardLight: 'rgba(255, 140, 90, 0.05)',
      shardDark: 'rgba(0, 0, 0, 0.36)',
      glow: 'rgba(255, 90, 40, 0.3)',
      accent: '#ff6e28',
    },
  },
  {
    id: 'cosmos',
    name: 'Kosmos',
    startLevelIndex: 80,
    decor: 'stars',
    colors: {
      bgTop: '#1a1330',
      bgBottom: '#08061450',
      shardLight: 'rgba(200, 180, 255, 0.06)',
      shardDark: 'rgba(0, 0, 0, 0.3)',
      glow: 'rgba(154, 79, 208, 0.28)',
      accent: '#a86bd4',
    },
  },
  {
    id: 'metro',
    name: 'Heldenstadt',
    startLevelIndex: HERO_WORLD_START,
    decor: 'city',
    colors: {
      bgTop: '#0d1b3a',
      bgBottom: '#020610',
      shardLight: 'rgba(224, 36, 47, 0.06)',
      shardDark: 'rgba(0, 0, 0, 0.36)',
      glow: 'rgba(224, 36, 47, 0.22)',
      accent: '#e0242f',
    },
  },
];

export interface WorldBoss {
  name: string;
  /** Eigenes Scheiben-Design für den Kampf – überschreibt für dieses eine Level das
   *  ausgerüstete Design, genau wie `bossFruit.boardSkinId` es für die normalen
   *  5-Level-Bosse schon tut (siehe `activeBoardSkin` in useAxeGame.ts). Bild folgt
   *  separat per Gemini (siehe Prompt-Sammlung am Ende dieser Datei/CLAUDE.md), bis
   *  dahin rendert es über den Farb-Fallback in `BOARD_STYLES` (shop.ts).
   */
  boardSkinId: string;
}

/**
 * Weltboss je Welt – erscheint GENAU am ersten Level der jeweiligen Welt (siehe
 * `isWorldBossLevel()` unten), als große, deutlich härtere Prüfung "vor dem Tor" zur
 * restlichen Welt. Wald (Level 1) bekommt bewusst KEINEN Weltboss – das ist der
 * Tutorial-Einstieg für neue Spieler, siehe eigener Kommentar bei `isWorldBossLevel()`.
 */
export const WORLD_BOSSES: Record<string, WorldBoss> = {
  desert: { name: 'Sandkolossos', boardSkinId: 'board-boss-desert' },
  ice: { name: 'Frostwardin', boardSkinId: 'board-boss-ice' },
  volcano: { name: 'Aschenschlund', boardSkinId: 'board-boss-volcano' },
  cosmos: { name: 'Leerenwächter', boardSkinId: 'board-boss-cosmos' },
  metro: { name: 'Turmbrecher', boardSkinId: 'board-boss-metro' },
};

/**
 * Ob `levelIndex` das "Tor" vor einer Welt ist – GENAU der erste Level jeder Welt,
 * außer Wald (Level 1): das ist für jeden neuen Spieler der allererste Level
 * überhaupt und muss ein sanfter Tutorial-Einstieg bleiben (siehe Level-System-
 * Abschnitt in CLAUDE.md, "Level 1-5 nervig" – ein Weltboss ausgerechnet dort wäre
 * das genaue Gegenteil von diesem Feedback). Weil `nextLevel()`/Weltkarten-Sprünge
 * (siehe `onSelectLevel` in WorldMap.tsx) IMMER exakt auf `world.startLevelIndex`
 * landen, ist dieser Level automatisch ein echtes "Tor": man kann die restlichen
 * Level einer Welt nicht erreichen, ohne hier zuerst durchzukommen – ganz ohne
 * eigene Freischalt-/Speicher-Logik.
 */
export function isWorldBossLevel(levelIndex: number): boolean {
  return WORLDS.some((w) => w.startLevelIndex === levelIndex && w.startLevelIndex > 0);
}

export function worldForLevel(levelIndex: number): World {
  // Level jenseits der Kampagne (Endlos-Modus) bleiben optisch in der letzten Welt
  // (aktuell Heldenstadt) – generisch über WORLDS.length, nicht auf eine bestimmte
  // Welt fest verdrahtet, damit eine neue letzte Welt hier nichts ändern muss.
  const clamped = Math.max(0, Math.min(levelIndex, WORLDS.length * WORLDS_LEVEL_COUNT - 1));
  const index = Math.min(WORLDS.length - 1, Math.floor(clamped / WORLDS_LEVEL_COUNT));
  return WORLDS[index];
}

/** Die Welt-Farben als Inline-Style-Objekt (CSS-Variablen) für die Bühne. */
export function worldStyleVars(levelIndex: number): Record<string, string> {
  const w = worldForLevel(levelIndex).colors;
  return {
    '--color-bg-top': w.bgTop,
    '--color-bg-bottom': w.bgBottom,
    '--color-shard-light': w.shardLight,
    '--color-shard-dark': w.shardDark,
    '--stage-glow': w.glow,
    /** Für Deko, die sich an der Welt orientieren soll (z.B. Staub-Tönung) statt
     *  überall gleich amberfarben zu wirken – siehe .stage__dust in App.css. */
    '--world-accent': w.accent,
  };
}
