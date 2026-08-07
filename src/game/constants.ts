// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import type { CityDef } from './types';

export const SAVE_VERSION = 1;

export const TICK_MS = 100;
export const TICKS_PER_SECOND = 1000 / TICK_MS;

export const TAP_BASE_VALUE = 1;

export const WORKER_BASE_COST = 15;
export const WORKER_RATE = 1.5;

export const TRANSPORTER_BASE_COST = 22;
export const TRANSPORTER_RATE = 1.5;
export const TRANSPORTER_START_COUNT = 1;

export const STORAGE_BASE_COST = 120;
export const STORAGE_CAPACITY_PER_UNIT = 40;
export const BASE_BUFFER_CAPACITY = 50;

export const COST_GROWTH_FACTOR = 1.15;

export const OFFLINE_CAP_HOURS = 8;
export const OFFLINE_CAP_MS = OFFLINE_CAP_HOURS * 60 * 60 * 1000;
/** Kürzere Abwesenheiten (z.B. kurz App gewechselt) lösen keine "Willkommen zurück"-Meldung aus. */
export const OFFLINE_MIN_MS = 60 * 1000;

export const STAR_MONEY_DIVISOR = 5000;
export const STAR_MULTIPLIER_BONUS = 0.1;

/**
 * Städte-Reihenfolge (fiktive Namen, keine echten Orte/Marken).
 * Jedes weitere Ziel ist grob ×8 des vorherigen.
 */
export const CITIES: CityDef[] = [
  { name: 'Krähenwinkel', tier: 'Dorf', goal: 2_500 },
  { name: 'Aschfeld', tier: 'Kleinstadt', goal: 20_000 },
  { name: 'Grauhafen', tier: 'Mittelstadt', goal: 160_000 },
  { name: 'Rußburg', tier: 'Großstadt', goal: 1_280_000 },
  { name: 'Nebelheim', tier: 'Metropole', goal: 10_240_000 },
];

/** Danach geht die Reise fiktiv weiter: gleiche Metropole, neue Runde, ×8-Ziel. */
export function getCityForIndex(index: number): CityDef {
  if (index < CITIES.length) return CITIES[index];
  const last = CITIES[CITIES.length - 1];
  const extraRounds = index - CITIES.length + 2;
  const goal = Math.round(last.goal * Math.pow(8, index - CITIES.length + 1));
  return { name: `${last.name} ${extraRounds}`, tier: last.tier, goal };
}

export const SAVE_KEY = 'dirty-city-tycoon-save-v1';
