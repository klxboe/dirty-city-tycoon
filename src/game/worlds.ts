// Die 100 Level sind in 5 Welten zu je 20 Leveln gruppiert – rein optisch/thematisch,
// die Schwierigkeits-Kurve in constants.ts läuft unverändert über die Levelnummer
// durch. Jede Welt tönt die Bühne per eigenen Farbwerten (siehe worldStyleVars) und
// bekommt eine kleine Deko-Silhouette in den unteren Bühnen-Ecken (siehe WorldDecor.tsx).
//
// Bewusst 5×20 statt mehr Level: das behält die 100 bekannten, ausbalancierten Level
// (siehe Schwierigkeits-Tabelle in CLAUDE.md), Welten sind eine zusätzliche Schicht
// darüber. "Mehr Level" im eigentlichen Sinn gibt der Endlos-Modus nach Level 100
// (siehe LEVEL_COUNT-Grenze in constants.ts).

export const WORLDS_LEVEL_COUNT = 20;

export type DecorKind = 'trees' | 'cacti' | 'icicles' | 'lava' | 'stars';

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
];

export function worldForLevel(levelIndex: number): World {
  // Level jenseits der Kampagne (Endlos-Modus) bleiben optisch in der letzten Welt (Kosmos).
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
  };
}
