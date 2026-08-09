// Highscore-Speicherung über localStorage.
import { SAVE_KEY } from './constants';

export function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  localStorage.setItem(SAVE_KEY, String(score));
}
