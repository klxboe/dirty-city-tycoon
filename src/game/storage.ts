// Speichern/Laden des Spielstands. In Phase 2 wird dies auf Capacitor Preferences umgestellt,
// darum bleibt der Zugriff hier gebündelt statt über die App verstreut.
import { SAVE_KEY, SAVE_VERSION, TRANSPORTER_START_COUNT } from './constants';
import type { GameState } from './types';

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    money: 0,
    totalEarnedThisCity: 0,
    workers: 0,
    transporters: TRANSPORTER_START_COUNT,
    storages: 0,
    buffer: 0,
    bufferOverflowing: false,
    cityIndex: 0,
    prestigeMultiplier: 1,
    totalStars: 0,
    lastSavedAt: Date.now(),
  };
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (typeof parsed.money !== 'number') return null;
    return parsed;
  } catch {
    // Kaputter oder fremder Inhalt im localStorage -> einfach neu anfangen.
    return null;
  }
}

export function saveState(state: GameState): void {
  const toSave: GameState = { ...state, lastSavedAt: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
}
