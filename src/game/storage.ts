// Dauerhafte Speicherung über localStorage: Münzen, gekaufte/ausgerüstete Skins,
// bestes erreichtes Level, aktuelles Level, Serie und Einstellungen.
//
// Lesen UND Schreiben sind bewusst in try/catch: im Privatmodus und beim Öffnen
// als lokale Datei (file://) kann localStorage komplett fehlen oder werfen. Das
// Spiel läuft dann trotzdem, der Fortschritt ist eben nur nicht dauerhaft.
import { COINS_PER_LEGACY_APPLE, CURRENCY_SAVE_KEY, SAVE_KEY } from './constants';
import { DEFAULT_AXE_SKIN, DEFAULT_BOARD_SKIN } from './shop';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface SaveData {
  coins: number;
  /** Zweite, seltenere Währung aus goldenen Äpfeln – kauft "Legendäre" Skins im Shop. */
  gems: number;
  /**
   * Dauerhafte Fortschritts-Ressource, unabhängig vom aktuellen Lauf – übersteht ein
   * Game Over (anders als `currentLevel`, das dann auf 0 zurückspringt). Schaltet
   * Welten auf der Weltkarte frei (siehe XP_PER_LEVEL in constants.ts).
   */
  xp: number;
  /** IDs gekaufter bzw. erspielter Skins. Gratis-Shop-Skins stehen hier nicht drin. */
  ownedSkins: string[];
  equippedAxeSkin: string;
  equippedBoardSkin: string;
  /** Höchstes je erreichtes Level, nur als Anzeige/Motivation. */
  bestLevel: number;
  /**
   * Level, bei dem der laufende Durchgang gerade steht (0-basiert). Wird mitgespeichert,
   * damit ein weggewischtes Handy-Fenster den Lauf nicht wegwirft – ohne das fing man
   * nach jedem App-Wechsel wieder bei Level 1 an.
   */
  currentLevel: number;
  /** Serie geschaffter Level ohne Game Over (Münz-Multiplikator). */
  streak: number;
  /** Ton an/aus. */
  soundOn: boolean;
  /** Wurde die Einstiegs-Erklärung schon gezeigt? */
  tutorialSeen: boolean;
  /** Sammelfiguren aus der Heldenstadt-Welt, gegen Diamanten eintauschbar (siehe Shop). */
  figurines: number;
  /** Tage in Folge eingeloggt (für die tägliche Belohnung), siehe game/daily.ts. */
  dailyStreak: number;
  /** Datum (YYYY-MM-DD, lokale Zeit) der letzten abgeholten täglichen Belohnung. Leer = nie. */
  lastDailyClaim: string;
  /**
   * Zählt, wie oft schon (neu) bei Level 1 gestartet wurde – rotiert damit Bosse und
   * Level-Layouts von Runde zu Runde (siehe `bossFruitForLevel`/`generateLevel` in
   * constants.ts), damit ein wiederholter Durchlauf nicht exakt gleich aussieht.
   * Steigt NUR beim tatsächlichen Beginn eines neuen Laufs (Game Over oder "Von Level 1
   * starten"), nicht bei jedem Levelwechsel – siehe useAxeGame.ts.
   */
  runSeed: number;
  /**
   * Welche von 5 Varianten (0-4) das aktuelle Level (nur Level 1-30, siehe
   * `LEVEL_VARIANT_MAX_LEVEL_INDEX` in constants.ts) gerade zeigt – anders als `runSeed`
   * (rotiert nur zwischen ganzen LÄUFEN) wird das bei JEDEM Betreten eines NEUEN
   * Levels neu ausgewürfelt (echtes `Math.random()`, siehe `rollLevelVariantSeed()` in
   * useAxeGame.ts), damit sich "immer dieselben Level" (Klaus' Feedback) auch innerhalb
   * eines Laufs unterschiedlich anfühlen. Ein Retry DESSELBEN Levels (Boss-Wiederholung,
   * Video-Rettung) würfelt bewusst NICHT neu, damit ein Übungsversuch dieselbe Anordnung
   * zeigt wie der Fehlversuch davor.
   */
  levelVariantSeed: number;
}

const EMPTY_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  xp: 0,
  ownedSkins: [],
  equippedAxeSkin: DEFAULT_AXE_SKIN,
  equippedBoardSkin: DEFAULT_BOARD_SKIN,
  bestLevel: 1,
  currentLevel: 0,
  streak: 0,
  soundOn: true,
  tutorialSeen: false,
  figurines: 0,
  dailyStreak: 0,
  lastDailyClaim: '',
  runSeed: 0,
  levelVariantSeed: 0,
};

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Liest den Spielstand. Fällt bei fehlenden/kaputten Daten auf sinnvolle Werte zurück,
 * damit ein beschädigter localStorage-Eintrag nie das ganze Spiel blockiert.
 *
 * Migration: frühere Versionen hatten nur eine Apfel-Zahl unter CURRENCY_SAVE_KEY.
 * Die wird beim ersten Start in Münzen umgerechnet, damit alte Spielstände nicht
 * einfach auf 0 stehen.
 */
export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        coins: Math.max(0, Math.floor(toFiniteNumber(parsed.coins, 0))),
        gems: Math.max(0, Math.floor(toFiniteNumber(parsed.gems, 0))),
        xp: Math.max(0, Math.floor(toFiniteNumber(parsed.xp, 0))),
        ownedSkins: Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter((id) => typeof id === 'string') : [],
        equippedAxeSkin: typeof parsed.equippedAxeSkin === 'string' ? parsed.equippedAxeSkin : DEFAULT_AXE_SKIN,
        equippedBoardSkin: typeof parsed.equippedBoardSkin === 'string' ? parsed.equippedBoardSkin : DEFAULT_BOARD_SKIN,
        bestLevel: Math.max(1, Math.floor(toFiniteNumber(parsed.bestLevel, 1))),
        currentLevel: Math.max(0, Math.floor(toFiniteNumber(parsed.currentLevel, 0))),
        streak: Math.max(0, Math.floor(toFiniteNumber(parsed.streak, 0))),
        soundOn: parsed.soundOn !== false,
        tutorialSeen: parsed.tutorialSeen === true,
        figurines: Math.max(0, Math.floor(toFiniteNumber(parsed.figurines, 0))),
        dailyStreak: Math.max(0, Math.floor(toFiniteNumber(parsed.dailyStreak, 0))),
        lastDailyClaim: typeof parsed.lastDailyClaim === 'string' && ISO_DATE_PATTERN.test(parsed.lastDailyClaim) ? parsed.lastDailyClaim : '',
        runSeed: Math.max(0, Math.floor(toFiniteNumber(parsed.runSeed, 0))),
        levelVariantSeed: Math.max(0, Math.floor(toFiniteNumber(parsed.levelVariantSeed, 0))),
      };
    }

    const legacyApples = toFiniteNumber(localStorage.getItem(CURRENCY_SAVE_KEY), 0);
    if (legacyApples > 0) {
      return { ...EMPTY_SAVE, coins: Math.floor(legacyApples) * COINS_PER_LEGACY_APPLE };
    }
  } catch {
    // Kaputtes JSON oder localStorage nicht verfügbar (Privatmodus) -> frischer Stand.
  }
  return { ...EMPTY_SAVE };
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Kein Speicher verfügbar: das Spiel läuft weiter, der Fortschritt ist dann nur nicht dauerhaft.
  }
}
