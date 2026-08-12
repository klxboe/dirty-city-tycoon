// Dauerhafte Speicherung über localStorage: Münzen, gekaufte/ausgerüstete Skins,
// bestes erreichtes Level. Alles, was einen Game Over überlebt.
//
// Der Level-Fortschritt eines LAUFENDEN Durchgangs wird bewusst NICHT gespeichert –
// jeder Run startet bei Level 1 (siehe useAxeGame.ts).
import { COINS_PER_LEGACY_APPLE, CURRENCY_SAVE_KEY, SAVE_KEY } from './constants';
import { DEFAULT_AXE_SKIN, DEFAULT_BOARD_SKIN } from './shop';

export interface SaveData {
  coins: number;
  /** IDs gekaufter Skins. Gratis-Skins stehen hier nicht drin, die gehören immer. */
  ownedSkins: string[];
  equippedAxeSkin: string;
  equippedBoardSkin: string;
  /** Höchstes je erreichtes Level, nur als Anzeige/Motivation. */
  bestLevel: number;
}

const EMPTY_SAVE: SaveData = {
  coins: 0,
  ownedSkins: [],
  equippedAxeSkin: DEFAULT_AXE_SKIN,
  equippedBoardSkin: DEFAULT_BOARD_SKIN,
  bestLevel: 1,
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
        ownedSkins: Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter((id) => typeof id === 'string') : [],
        equippedAxeSkin: typeof parsed.equippedAxeSkin === 'string' ? parsed.equippedAxeSkin : DEFAULT_AXE_SKIN,
        equippedBoardSkin: typeof parsed.equippedBoardSkin === 'string' ? parsed.equippedBoardSkin : DEFAULT_BOARD_SKIN,
        bestLevel: Math.max(1, Math.floor(toFiniteNumber(parsed.bestLevel, 1))),
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
