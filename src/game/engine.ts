// Reine Spiellogik ohne React – gut einzeln nachvollziehbar und testbar.
import {
  BASE_BUFFER_CAPACITY,
  COST_GROWTH_FACTOR,
  OFFLINE_CAP_MS,
  OFFLINE_MIN_MS,
  STAR_MONEY_DIVISOR,
  STAR_MULTIPLIER_BONUS,
  STORAGE_BASE_COST,
  STORAGE_CAPACITY_PER_UNIT,
  TICKS_PER_SECOND,
  TRANSPORTER_BASE_COST,
  TRANSPORTER_RATE,
  WORKER_BASE_COST,
  WORKER_RATE,
} from './constants';
import type { GameState, OfflineReport } from './types';

/** Preis der nächsten Einheit: Grundpreis × 1.15^(bereits vorhandene Einheiten). */
export function costFor(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(COST_GROWTH_FACTOR, owned));
}

export function workerCost(state: GameState): number {
  return costFor(WORKER_BASE_COST, state.workers);
}

export function transporterCost(state: GameState): number {
  return costFor(TRANSPORTER_BASE_COST, state.transporters);
}

export function storageCost(state: GameState): number {
  return costFor(STORAGE_BASE_COST, state.storages);
}

/** Müll, den die Arbeiter pro Sekunde einsammeln. */
export function collectRate(state: GameState): number {
  return state.workers * WORKER_RATE;
}

/** Müll, den die Transporter pro Sekunde abfahren (= Geld/s, vor dem Engpass). */
export function dispatchRate(state: GameState): number {
  return state.transporters * TRANSPORTER_RATE * state.prestigeMultiplier;
}

export function bufferCapacity(state: GameState): number {
  return BASE_BUFFER_CAPACITY + state.storages * STORAGE_CAPACITY_PER_UNIT;
}

/** Der tatsächliche Verdienst/s: immer der Engpass aus Sammeln und Abfahren. */
export function effectiveRate(state: GameState): number {
  return Math.min(collectRate(state), dispatchRate(state));
}

/** true, wenn im letzten Tick Müll verloren ging, weil der Puffer voll war (Engpass-Warnung). */
export function isBottlenecked(state: GameState): boolean {
  return state.bufferOverflowing;
}

/**
 * Simuliert einen einzelnen Tick (100ms) der Kernschleife:
 * Puffer füllt sich aus der Sammelrate (Überschuss geht verloren),
 * Transporter leeren den Puffer und erzeugen Geld.
 */
export function tick(state: GameState): GameState {
  const capacity = bufferCapacity(state);
  const collected = collectRate(state) / TICKS_PER_SECOND;
  const rawBufferAfterCollect = state.buffer + collected;
  const bufferAfterCollect = Math.min(rawBufferAfterCollect, capacity);

  const dispatchable = dispatchRate(state) / TICKS_PER_SECOND;
  const dispatched = Math.min(bufferAfterCollect, dispatchable);

  return {
    ...state,
    buffer: bufferAfterCollect - dispatched,
    // Puffer war zu klein für den gesammelten Müll -> etwas ist verloren gegangen.
    bufferOverflowing: rawBufferAfterCollect > capacity,
    money: state.money + dispatched,
    totalEarnedThisCity: state.totalEarnedThisCity + dispatched,
  };
}

/** Der Spieler tippt selbst auf "Selber kehren". */
export function applyTap(state: GameState, tapValue: number): GameState {
  const gained = tapValue * state.prestigeMultiplier;
  return {
    ...state,
    money: state.money + gained,
    totalEarnedThisCity: state.totalEarnedThisCity + gained,
  };
}

export function buyWorker(state: GameState): GameState {
  const cost = workerCost(state);
  if (state.money < cost) return state;
  return { ...state, money: state.money - cost, workers: state.workers + 1 };
}

export function buyTransporter(state: GameState): GameState {
  const cost = transporterCost(state);
  if (state.money < cost) return state;
  return { ...state, money: state.money - cost, transporters: state.transporters + 1 };
}

export function buyStorage(state: GameState): GameState {
  const cost = storageCost(state);
  if (state.money < cost) return state;
  return { ...state, money: state.money - cost, storages: state.storages + 1 };
}

/** Wie viele Sterne ein Umzug beim aktuellen Stand der Stadt bringen würde. */
export function starsForCurrentCity(state: GameState): number {
  return Math.floor(Math.sqrt(state.totalEarnedThisCity / STAR_MONEY_DIVISOR));
}

export function multiplierForStars(totalStars: number): number {
  return 1 + totalStars * STAR_MULTIPLIER_BONUS;
}

/**
 * Umzug in die nächste Stadt: Sterne einsammeln, Multiplikator erhöhen,
 * alles außer Sternen/Multiplikator/Stadt-Fortschritt zurücksetzen.
 */
export function prestige(state: GameState): GameState {
  const gainedStars = starsForCurrentCity(state);
  const totalStars = state.totalStars + gainedStars;
  return {
    ...state,
    money: 0,
    totalEarnedThisCity: 0,
    workers: 0,
    transporters: 1,
    storages: 0,
    buffer: 0,
    cityIndex: state.cityIndex + 1,
    totalStars,
    prestigeMultiplier: multiplierForStars(totalStars),
  };
}

/**
 * Verdienst während der Spieler weg war: vergangene Zeit × effektiver Verdienst/s,
 * gedeckelt auf OFFLINE_CAP_MS. Sehr kurze Abwesenheiten werden ignoriert.
 */
export function computeOfflineReport(state: GameState, now: number): OfflineReport {
  const elapsedMs = Math.min(Math.max(now - state.lastSavedAt, 0), OFFLINE_CAP_MS);
  if (elapsedMs < OFFLINE_MIN_MS) return { earned: 0, elapsedMs: 0 };
  const earned = effectiveRate(state) * (elapsedMs / 1000);
  return { earned, elapsedMs };
}

export function applyOfflineReport(state: GameState, report: OfflineReport): GameState {
  if (report.earned <= 0) return state;
  return {
    ...state,
    money: state.money + report.earned,
    totalEarnedThisCity: state.totalEarnedThisCity + report.earned,
  };
}
