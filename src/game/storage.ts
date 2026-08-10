// Speicherung über localStorage: die über alle Durchläufe gesammelte Apfel-Währung.
import { CURRENCY_SAVE_KEY } from './constants';

function loadNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function loadCurrency(): number {
  return loadNumber(CURRENCY_SAVE_KEY);
}

export function saveCurrency(total: number): void {
  localStorage.setItem(CURRENCY_SAVE_KEY, String(total));
}
