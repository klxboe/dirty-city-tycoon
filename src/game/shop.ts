// Alle Designs an einem Ort: Äxte, Zielscheiben und die Boss-Früchte.
// Rein kosmetisch – kein Design verändert Balancing (Flugzeit, Hitbox, Tempo).
//
// Die Scheiben-Farben stehen bewusst HIER als Daten und nicht in TargetBoard.css:
// TargetBoard setzt sie als CSS-Variablen inline. So braucht eine neue Frucht nur
// einen Eintrag in dieser Datei statt zusätzlich einen CSS-Block.

export type SkinKind = 'axe' | 'board';
/**
 * `shop` = für Münzen kaufbar, `boss` = Belohnung aus einem Boss-Level,
 * `gem`  = für Diamanten kaufbar ("Legendär"-Reiter im Shop),
 * `egg`  = Oster-Ei – nur über ein verstecktes Geheimnis freischaltbar, nie kaufbar.
 */
export type SkinSource = 'shop' | 'boss' | 'gem' | 'egg';

export interface SkinDef {
  id: string;
  kind: SkinKind;
  name: string;
  /** Kurze Beschreibung für die Shop-Karte. */
  blurb: string;
  /**
   * Preis in Münzen (source 'shop') oder Diamanten (source 'gem'). 0 = von Anfang an
   * dabei. Bei 'boss'/'egg' ohne Bedeutung – die sind nie kaufbar.
   */
  price: number;
  source: SkinSource;
}

/** Farbwerte einer Zielscheibe. Landen 1:1 als CSS-Variablen auf dem Board-Element. */
export interface BoardStyle {
  rim: string;
  faceInner: string;
  faceOuter: string;
  wedge: string;
  glow: string;
  ringLight: string;
  ringAccent: string;
  core: string;
  coreEdge: string;
  coreGlow: string;
}

/** Farbwerte einer Axt. */
export interface AxeStyle {
  /** Klinge: Glanzkante -> Fläche -> Schattenseite. */
  steel: [string, string, string];
  /** Griff: hell -> dunkel. */
  wood: [string, string];
  /** Wicklungs-Ringe am Griff. */
  wrap: string;
  /** Kontur, hebt die Silhouette vom dunklen Hintergrund ab. */
  outline: string;
  /** Optionaler farbiger Schein um die Klinge. */
  glow?: string;
}

// ---------------------------------------------------------------------------
// Kaufbare Äxte
// ---------------------------------------------------------------------------

export const AXE_SKINS: SkinDef[] = [
  { id: 'axe-standard', kind: 'axe', name: 'Holzfäller', blurb: 'Die treue Standard-Axt.', price: 0, source: 'shop' },
  { id: 'axe-bronze', kind: 'axe', name: 'Bronzeklinge', blurb: 'Warmer Bronzeschimmer, dunkles Nussholz.', price: 150, source: 'shop' },
  { id: 'axe-frost', kind: 'axe', name: 'Frostkante', blurb: 'Eisblaue Klinge mit Raureif am Stiel.', price: 400, source: 'shop' },
  { id: 'axe-ember', kind: 'axe', name: 'Glutspalter', blurb: 'Glühende Schneide, rußgeschwärzter Griff.', price: 900, source: 'shop' },
  { id: 'axe-gold', kind: 'axe', name: 'Goldrausch', blurb: 'Massives Gold. Wirft sich erstaunlich gut.', price: 2000, source: 'shop' },
  { id: 'axe-jade', kind: 'axe', name: 'Jadeschneide', blurb: 'Polierter Jadestein auf schwarzem Schaft.', price: 3200, source: 'shop' },
  { id: 'axe-void', kind: 'axe', name: 'Leerenzahn', blurb: 'Schluckt das Licht, statt es zu spiegeln.', price: 5000, source: 'shop' },
];

// ---------------------------------------------------------------------------
// Kaufbare Zielscheiben
// ---------------------------------------------------------------------------

export const BOARD_SKINS: SkinDef[] = [
  { id: 'board-oak', kind: 'board', name: 'Eiche', blurb: 'Klassisches helles Zielholz.', price: 0, source: 'shop' },
  { id: 'board-walnut', kind: 'board', name: 'Nussbaum', blurb: 'Dunkles Holz, messingfarbener Ring.', price: 200, source: 'shop' },
  { id: 'board-ice', kind: 'board', name: 'Gletscher', blurb: 'Gefrorene Scheibe mit blauem Schimmer.', price: 600, source: 'shop' },
  { id: 'board-volcano', kind: 'board', name: 'Vulkan', blurb: 'Erkaltete Lava mit glühenden Rissen.', price: 1400, source: 'shop' },
  { id: 'board-ebony', kind: 'board', name: 'Ebenholz', blurb: 'Tiefschwarzes Holz mit Silberadern.', price: 2600, source: 'shop' },
];

// ---------------------------------------------------------------------------
// Boss-Früchte: jedes 5. Level ist ein Boss mit einer Frucht als Zielscheibe.
// Wer ihn schafft, bekommt die passende Axt geschenkt.
// ---------------------------------------------------------------------------

export interface BossFruit {
  id: string;
  name: string;
  /** Scheiben-Design des Boss-Levels (überschreibt das ausgerüstete). */
  boardSkinId: string;
  /** Axt, die es als Belohnung gibt. */
  axeSkinId: string;
}

export const BOSS_FRUITS: BossFruit[] = [
  { id: 'melon', name: 'Wassermelone', boardSkinId: 'board-melon', axeSkinId: 'axe-melon' },
  { id: 'orange', name: 'Orange', boardSkinId: 'board-orange', axeSkinId: 'axe-orange' },
  { id: 'kiwi', name: 'Kiwi', boardSkinId: 'board-kiwi', axeSkinId: 'axe-kiwi' },
  { id: 'dragon', name: 'Drachenfrucht', boardSkinId: 'board-dragon', axeSkinId: 'axe-dragon' },
  { id: 'pineapple', name: 'Ananas', boardSkinId: 'board-pineapple', axeSkinId: 'axe-pineapple' },
  { id: 'lemon', name: 'Zitrone', boardSkinId: 'board-lemon', axeSkinId: 'axe-lemon' },
  { id: 'berry', name: 'Blaubeere', boardSkinId: 'board-berry', axeSkinId: 'axe-berry' },
  { id: 'pomegranate', name: 'Granatapfel', boardSkinId: 'board-pomegranate', axeSkinId: 'axe-pomegranate' },
  { id: 'coconut', name: 'Kokosnuss', boardSkinId: 'board-coconut', axeSkinId: 'axe-coconut' },
  { id: 'grape', name: 'Traube', boardSkinId: 'board-grape', axeSkinId: 'axe-grape' },
];

/** Die Frucht-Äxte als Skins – tauchen im Shop unter "Boss-Beute" auf, nicht zum Kauf. */
export const BOSS_AXE_SKINS: SkinDef[] = BOSS_FRUITS.map((fruit) => ({
  id: fruit.axeSkinId,
  kind: 'axe',
  name: `${fruit.name}-Axt`,
  blurb: `Beute aus dem ${fruit.name}-Boss.`,
  price: 0,
  source: 'boss',
}));

// ---------------------------------------------------------------------------
// Legendär: für Diamanten statt Münzen, deutlich aufwendigere Designs.
// ---------------------------------------------------------------------------

export const LEGENDARY_AXE_SKINS: SkinDef[] = [
  {
    id: 'axe-legendary-meteor',
    kind: 'axe',
    name: 'Sternenhagel',
    blurb: 'Aus einem Meteoriten geschmiedet, glüht noch immer nach.',
    price: 45,
    source: 'gem',
  },
  {
    id: 'axe-legendary-phoenix',
    kind: 'axe',
    name: 'Phönixfeder',
    blurb: 'Verbrennt nie ganz – die Glut erlischt nur, um neu zu entfachen.',
    price: 60,
    source: 'gem',
  },
];

export const LEGENDARY_BOARD_SKINS: SkinDef[] = [
  {
    id: 'board-legendary-galaxy',
    kind: 'board',
    name: 'Galaxie',
    blurb: 'Ein Ausschnitt Sternennebel, eingefangen in Holz.',
    price: 50,
    source: 'gem',
  },
  {
    id: 'board-legendary-crystal',
    kind: 'board',
    name: 'Kristallkern',
    blurb: 'Gewachsener Kristall statt Holz – hart, klar, kalt.',
    price: 70,
    source: 'gem',
  },
];

export const LEGENDARY_SKINS: SkinDef[] = [...LEGENDARY_AXE_SKINS, ...LEGENDARY_BOARD_SKINS];

// ---------------------------------------------------------------------------
// Oster-Ei: kein Hinweis im Tutorial, nur über ein verstecktes Geheimnis zu
// finden (siehe StartScreen.tsx). Rein zum Spaß, kein Balancing-Effekt.
// ---------------------------------------------------------------------------

export const EASTER_EGG_SKINS: SkinDef[] = [
  {
    id: 'axe-egg-duck',
    kind: 'axe',
    name: 'Quietsche-Ente',
    blurb: 'Wie sie hier hineingeraten ist, weiß niemand.',
    price: 0,
    source: 'egg',
  },
];

export const ALL_SKINS: SkinDef[] = [
  ...AXE_SKINS,
  ...BOARD_SKINS,
  ...BOSS_AXE_SKINS,
  ...LEGENDARY_SKINS,
  ...EASTER_EGG_SKINS,
];

export const DEFAULT_AXE_SKIN = AXE_SKINS[0].id;
export const DEFAULT_BOARD_SKIN = BOARD_SKINS[0].id;

export function getSkin(id: string): SkinDef | undefined {
  return ALL_SKINS.find((skin) => skin.id === id);
}

/** Skins mit Preis 0 aus dem Shop gehören dem Spieler immer (Boss-Beute NICHT). */
export function isFreeSkin(id: string): boolean {
  const skin = getSkin(id);
  return skin?.source === 'shop' && skin.price === 0;
}

export function getBossFruit(id: string): BossFruit | undefined {
  return BOSS_FRUITS.find((fruit) => fruit.id === id);
}

// ---------------------------------------------------------------------------
// Farbwerte
// ---------------------------------------------------------------------------

export const BOARD_STYLES: Record<string, BoardStyle> = {
  'board-oak': {
    rim: 'linear-gradient(150deg, #c98a45, #8a5420 55%, #5c3512)',
    faceInner: '#ffd9a0',
    faceOuter: '#f0a94e',
    wedge: 'rgba(255, 255, 255, 0.55)',
    glow: 'rgba(255, 159, 28, 0.4)',
    ringLight: 'rgba(255, 255, 255, 0.5)',
    ringAccent: 'rgba(196, 106, 20, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #fff1d4, #f5c98a 70%, #d99a4e 100%)',
    coreEdge: 'rgba(140, 80, 20, 0.5)',
    coreGlow: 'rgba(255, 190, 90, 0.55)',
  },
  'board-walnut': {
    rim: 'linear-gradient(150deg, #a8843c, #6b4c10 55%, #40300a)',
    faceInner: '#c99a5e',
    faceOuter: '#8a5a34',
    wedge: 'rgba(255, 232, 190, 0.35)',
    glow: 'rgba(201, 153, 47, 0.35)',
    ringLight: 'rgba(255, 235, 190, 0.35)',
    ringAccent: 'rgba(60, 38, 10, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffe9b0, #c9992f 70%, #6b4c10 100%)',
    coreEdge: 'rgba(40, 26, 6, 0.6)',
    coreGlow: 'rgba(201, 153, 47, 0.5)',
  },
  'board-ice': {
    rim: 'linear-gradient(150deg, #eaf7ff, #7fb4d0 55%, #3d6f8c)',
    faceInner: '#f2fbff',
    faceOuter: '#a8d8ef',
    wedge: 'rgba(255, 255, 255, 0.85)',
    glow: 'rgba(140, 220, 255, 0.5)',
    ringLight: 'rgba(255, 255, 255, 0.7)',
    ringAccent: 'rgba(58, 166, 216, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #8ed6f2 70%, #2b7fa5 100%)',
    coreEdge: 'rgba(23, 90, 120, 0.6)',
    coreGlow: 'rgba(94, 196, 234, 0.7)',
  },
  'board-volcano': {
    rim: 'linear-gradient(150deg, #5c5c5c, #2e2e2e 55%, #141414)',
    faceInner: '#6b4a3a',
    faceOuter: '#33241e',
    wedge: 'rgba(255, 110, 40, 0.65)',
    glow: 'rgba(255, 110, 40, 0.5)',
    ringLight: 'rgba(255, 150, 80, 0.4)',
    ringAccent: 'rgba(255, 110, 40, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffe08a, #ff6e28 60%, #8a1c00 100%)',
    coreEdge: 'rgba(92, 20, 0, 0.7)',
    coreGlow: 'rgba(255, 110, 40, 0.85)',
  },
  'board-ebony': {
    rim: 'linear-gradient(150deg, #4a4a52, #23232a 55%, #0e0e12)',
    faceInner: '#3a3a44',
    faceOuter: '#1c1c22',
    wedge: 'rgba(200, 210, 230, 0.5)',
    glow: 'rgba(150, 170, 210, 0.3)',
    ringLight: 'rgba(210, 220, 240, 0.35)',
    ringAccent: 'rgba(150, 165, 195, 0.4)',
    core: 'radial-gradient(circle at 38% 32%, #e8ecf5, #9aa5bd 65%, #4a5266 100%)',
    coreEdge: 'rgba(20, 22, 30, 0.8)',
    coreGlow: 'rgba(170, 190, 225, 0.5)',
  },

  // --- Boss-Früchte ---
  'board-melon': {
    rim: 'linear-gradient(150deg, #7cc24a, #3f7a24 55%, #24501a)',
    faceInner: '#ff7a80',
    faceOuter: '#e0323f',
    wedge: 'rgba(255, 220, 220, 0.5)',
    glow: 'rgba(226, 60, 70, 0.5)',
    ringLight: 'rgba(255, 235, 235, 0.4)',
    ringAccent: 'rgba(120, 20, 26, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffd0d2, #ff6b72 65%, #b81f2a 100%)',
    coreEdge: 'rgba(90, 14, 18, 0.7)',
    coreGlow: 'rgba(255, 100, 110, 0.7)',
  },
  'board-orange': {
    rim: 'linear-gradient(150deg, #ffb648, #e07a10 55%, #9c4e00)',
    faceInner: '#ffd89a',
    faceOuter: '#ff9a2e',
    wedge: 'rgba(255, 248, 230, 0.85)',
    glow: 'rgba(255, 154, 46, 0.55)',
    ringLight: 'rgba(255, 250, 235, 0.6)',
    ringAccent: 'rgba(200, 100, 0, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fff2d0, #ffb44a 65%, #d97c00 100%)',
    coreEdge: 'rgba(140, 70, 0, 0.6)',
    coreGlow: 'rgba(255, 180, 74, 0.7)',
  },
  'board-kiwi': {
    rim: 'linear-gradient(150deg, #a8794a, #6b4526 55%, #3f2814)',
    faceInner: '#f2f6d8',
    faceOuter: '#8dc63f',
    wedge: 'rgba(255, 255, 240, 0.75)',
    glow: 'rgba(141, 198, 63, 0.45)',
    ringLight: 'rgba(250, 255, 230, 0.55)',
    ringAccent: 'rgba(80, 120, 30, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #eef4d0 65%, #b8c98a 100%)',
    coreEdge: 'rgba(70, 100, 30, 0.6)',
    coreGlow: 'rgba(200, 230, 140, 0.6)',
  },
  'board-dragon': {
    rim: 'linear-gradient(150deg, #ff5fa2, #c41e6e 55%, #7a0f42)',
    faceInner: '#ffffff',
    faceOuter: '#f0e2ec',
    wedge: 'rgba(60, 40, 55, 0.55)',
    glow: 'rgba(255, 95, 162, 0.5)',
    ringLight: 'rgba(120, 90, 110, 0.35)',
    ringAccent: 'rgba(196, 30, 110, 0.45)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #ffd8ea 65%, #ff86bb 100%)',
    coreEdge: 'rgba(150, 20, 85, 0.6)',
    coreGlow: 'rgba(255, 130, 185, 0.7)',
  },
  'board-pineapple': {
    rim: 'linear-gradient(150deg, #b8862f, #7a5412 55%, #47300a)',
    faceInner: '#fff3b0',
    faceOuter: '#f2c53d',
    wedge: 'rgba(180, 130, 20, 0.5)',
    glow: 'rgba(242, 197, 61, 0.5)',
    ringLight: 'rgba(255, 245, 200, 0.55)',
    ringAccent: 'rgba(150, 105, 15, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fffbe0, #ffe071 65%, #d9a800 100%)',
    coreEdge: 'rgba(110, 78, 0, 0.6)',
    coreGlow: 'rgba(255, 224, 113, 0.65)',
  },
  'board-lemon': {
    rim: 'linear-gradient(150deg, #fff07a, #e0c400 55%, #8a7500)',
    faceInner: '#fffce0',
    faceOuter: '#ffe94a',
    wedge: 'rgba(255, 255, 255, 0.9)',
    glow: 'rgba(255, 233, 74, 0.55)',
    ringLight: 'rgba(255, 255, 255, 0.7)',
    ringAccent: 'rgba(190, 165, 0, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #fff59a 65%, #e0c400 100%)',
    coreEdge: 'rgba(130, 112, 0, 0.55)',
    coreGlow: 'rgba(255, 245, 154, 0.7)',
  },
  'board-berry': {
    rim: 'linear-gradient(150deg, #6b7fd4, #3a4a9c 55%, #1e2657)',
    faceInner: '#9aa8e8',
    faceOuter: '#4a5aa8',
    wedge: 'rgba(210, 220, 255, 0.5)',
    glow: 'rgba(106, 127, 212, 0.5)',
    ringLight: 'rgba(220, 228, 255, 0.4)',
    ringAccent: 'rgba(30, 38, 87, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #e2e8ff, #8b9be0 65%, #3f4d9e 100%)',
    coreEdge: 'rgba(20, 26, 62, 0.7)',
    coreGlow: 'rgba(139, 155, 224, 0.7)',
  },
  'board-pomegranate': {
    rim: 'linear-gradient(150deg, #d4a04a, #8a5a1c 55%, #4a2c0a)',
    faceInner: '#ff8a8a',
    faceOuter: '#a8142c',
    wedge: 'rgba(255, 210, 210, 0.45)',
    glow: 'rgba(168, 20, 44, 0.5)',
    ringLight: 'rgba(255, 220, 220, 0.35)',
    ringAccent: 'rgba(90, 8, 22, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffc4c4, #e03a52 65%, #8a0f24 100%)',
    coreEdge: 'rgba(70, 6, 16, 0.7)',
    coreGlow: 'rgba(224, 58, 82, 0.7)',
  },
  'board-coconut': {
    rim: 'linear-gradient(150deg, #8a6440, #4f381f 55%, #2a1c0e)',
    faceInner: '#fffaf0',
    faceOuter: '#e8dcc4',
    wedge: 'rgba(150, 120, 85, 0.45)',
    glow: 'rgba(232, 220, 196, 0.35)',
    ringLight: 'rgba(255, 255, 255, 0.5)',
    ringAccent: 'rgba(120, 90, 55, 0.45)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #f0e6d2 65%, #c4b295 100%)',
    coreEdge: 'rgba(90, 66, 38, 0.6)',
    coreGlow: 'rgba(240, 230, 210, 0.5)',
  },
  'board-grape': {
    rim: 'linear-gradient(150deg, #a86bd4, #6b2f9c 55%, #3a1657)',
    faceInner: '#e0c4f5',
    faceOuter: '#9a4fd0',
    wedge: 'rgba(245, 230, 255, 0.55)',
    glow: 'rgba(154, 79, 208, 0.5)',
    ringLight: 'rgba(240, 225, 255, 0.45)',
    ringAccent: 'rgba(58, 22, 87, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #f5e6ff, #c48ae8 65%, #7a35b0 100%)',
    coreEdge: 'rgba(45, 16, 68, 0.7)',
    coreGlow: 'rgba(196, 138, 232, 0.7)',
  },

  // --- Legendär (Diamanten) ---
  'board-legendary-galaxy': {
    rim: 'linear-gradient(150deg, #6b4fd4, #2e1a6b 55%, #12082e)',
    faceInner: '#c8b8ff',
    faceOuter: '#4a2f9c',
    wedge: 'rgba(230, 220, 255, 0.5)',
    glow: 'rgba(154, 110, 255, 0.55)',
    ringLight: 'rgba(220, 210, 255, 0.5)',
    ringAccent: 'rgba(255, 200, 255, 0.4)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #b48aff 55%, #4a2f9c 100%)',
    coreEdge: 'rgba(30, 16, 74, 0.7)',
    coreGlow: 'rgba(180, 138, 255, 0.8)',
  },
  'board-legendary-crystal': {
    rim: 'linear-gradient(150deg, #eafcff, #7fd8e8 55%, #1c6b7a)',
    faceInner: '#ffffff',
    faceOuter: '#a0eaf5',
    wedge: 'rgba(255, 255, 255, 0.9)',
    glow: 'rgba(140, 240, 255, 0.6)',
    ringLight: 'rgba(255, 255, 255, 0.8)',
    ringAccent: 'rgba(60, 200, 220, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #baf5ff 60%, #3ec4d8 100%)',
    coreEdge: 'rgba(20, 90, 100, 0.6)',
    coreGlow: 'rgba(140, 240, 255, 0.85)',
  },
};

export const AXE_STYLES: Record<string, AxeStyle> = {
  'axe-standard': {
    steel: ['#ffffff', '#dbe4ec', '#9aa6b2'],
    wood: ['#a5713c', '#6b4420'],
    wrap: '#4a2c14',
    outline: '#141820',
  },
  'axe-bronze': {
    steel: ['#ffeec2', '#e0a959', '#9d5f24'],
    wood: ['#6b4a30', '#3a2417'],
    wrap: '#241509',
    outline: '#140d06',
  },
  'axe-frost': {
    steel: ['#ffffff', '#bfe7f8', '#5b9dc4'],
    wood: ['#8fa8b5', '#4a5c68'],
    wrap: '#2c3f49',
    outline: '#0e1d26',
    glow: 'rgba(130, 215, 255, 0.9)',
  },
  'axe-ember': {
    steel: ['#fff4d0', '#ff9a4d', '#b23412'],
    wood: ['#4a3a33', '#1e1512'],
    wrap: '#150e0b',
    outline: '#180a04',
    glow: 'rgba(255, 138, 61, 0.95)',
  },
  'axe-gold': {
    steel: ['#fffce8', '#ffd756', '#bf8c0d'],
    wood: ['#8a6b3a', '#4a361a'],
    wrap: '#2f2210',
    outline: '#17110a',
    glow: 'rgba(255, 210, 74, 0.8)',
  },
  'axe-jade': {
    steel: ['#eafff4', '#7fd9b0', '#2e8a63'],
    wood: ['#2a2a2e', '#131316'],
    wrap: '#0a0a0c',
    outline: '#08201a',
    glow: 'rgba(127, 217, 176, 0.75)',
  },
  'axe-void': {
    steel: ['#8a7fd4', '#3a2f6b', '#140f2e'],
    wood: ['#241f3a', '#0e0b1a'],
    wrap: '#06040e',
    outline: '#05030c',
    glow: 'rgba(138, 127, 212, 0.9)',
  },

  // --- Boss-Beute: passend zur jeweiligen Frucht ---
  'axe-melon': {
    steel: ['#ffd0d2', '#f0454f', '#9c1420'],
    wood: ['#5fa832', '#2e5c18'],
    wrap: '#1c3a0f',
    outline: '#14240a',
    glow: 'rgba(240, 69, 79, 0.75)',
  },
  'axe-orange': {
    steel: ['#fff0cc', '#ffa53d', '#c46000'],
    wood: ['#8a5a20', '#4a3010'],
    wrap: '#2e1c08',
    outline: '#1e1206',
    glow: 'rgba(255, 165, 61, 0.8)',
  },
  'axe-kiwi': {
    steel: ['#f6ffe0', '#a8d94a', '#5a8a1c'],
    wood: ['#8a6440', '#4a3320'],
    wrap: '#2a1c10',
    outline: '#1a2408',
    glow: 'rgba(168, 217, 74, 0.75)',
  },
  'axe-dragon': {
    steel: ['#ffffff', '#ff86bb', '#c41e6e'],
    wood: ['#3f8a4a', '#204a26'],
    wrap: '#122c16',
    outline: '#2a0a1c',
    glow: 'rgba(255, 134, 187, 0.85)',
  },
  'axe-pineapple': {
    steel: ['#fffbe0', '#ffd94a', '#c49400'],
    wood: ['#6b8a2f', '#3a4a18'],
    wrap: '#22300e',
    outline: '#2a2008',
    glow: 'rgba(255, 217, 74, 0.8)',
  },
  'axe-lemon': {
    steel: ['#ffffff', '#ffe94a', '#c4b000'],
    wood: ['#a8944a', '#5c5020'],
    wrap: '#3a3210',
    outline: '#2e2a06',
    glow: 'rgba(255, 233, 74, 0.85)',
  },
  'axe-berry': {
    steel: ['#e2e8ff', '#7f92e0', '#33409c'],
    wood: ['#3a4470', '#1c2140'],
    wrap: '#101430',
    outline: '#0c1030',
    glow: 'rgba(127, 146, 224, 0.8)',
  },
  'axe-pomegranate': {
    steel: ['#ffc4c4', '#e03a52', '#8a0f24'],
    wood: ['#a8823a', '#5c4418'],
    wrap: '#382a0e',
    outline: '#28060f',
    glow: 'rgba(224, 58, 82, 0.8)',
  },
  'axe-coconut': {
    steel: ['#ffffff', '#f0e6d2', '#b8a68a'],
    wood: ['#6b4d30', '#3a2818'],
    wrap: '#221708',
    outline: '#241c12',
    glow: 'rgba(240, 230, 210, 0.6)',
  },
  'axe-grape': {
    steel: ['#f5e6ff', '#b47ae0', '#6b2f9c'],
    wood: ['#4a6b2f', '#283a18'],
    wrap: '#182410',
    outline: '#22103a',
    glow: 'rgba(180, 122, 224, 0.8)',
  },

  // --- Legendär (Diamanten) ---
  'axe-legendary-meteor': {
    steel: ['#fff0d0', '#e07a3d', '#6b2f0f'],
    wood: ['#2a2a34', '#121218'],
    wrap: '#0a0a10',
    outline: '#180c04',
    glow: 'rgba(255, 138, 61, 0.95)',
  },
  'axe-legendary-phoenix': {
    steel: ['#fffbe0', '#ff8a3d', '#c41e1e'],
    wood: ['#5c2c14', '#2a1006'],
    wrap: '#1a0a04',
    outline: '#240a02',
    glow: 'rgba(255, 138, 61, 1)',
  },

  // --- Oster-Ei ---
  'axe-egg-duck': {
    steel: ['#fffde0', '#ffe135', '#c49a00'],
    wood: ['#ff8a3d', '#c46000'],
    wrap: '#ffffff',
    outline: '#8a5c00',
    glow: 'rgba(255, 225, 53, 0.7)',
  },
};

export function getBoardStyle(id: string): BoardStyle {
  return BOARD_STYLES[id] ?? BOARD_STYLES[DEFAULT_BOARD_SKIN];
}

export function getAxeStyle(id: string): AxeStyle {
  return AXE_STYLES[id] ?? AXE_STYLES[DEFAULT_AXE_SKIN];
}

/** Die Board-Farben als Inline-Style-Objekt (CSS-Variablen) für ein Element. */
export function boardStyleVars(id: string): Record<string, string> {
  const s = getBoardStyle(id);
  return {
    '--board-rim': s.rim,
    '--board-face-inner': s.faceInner,
    '--board-face-outer': s.faceOuter,
    '--board-wedge': s.wedge,
    '--board-glow': s.glow,
    '--board-ring-light': s.ringLight,
    '--board-ring-accent': s.ringAccent,
    '--board-core': s.core,
    '--board-core-edge': s.coreEdge,
    '--board-core-glow': s.coreGlow,
  };
}
