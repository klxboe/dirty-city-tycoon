// Tägliche Belohnung: reiner Kalendertag-Vergleich, keine Zeitzonen-Bibliothek
// nötig – für ein Handyspiel reicht die lokale Zeit des Geräts.
import { DAILY_REWARDS } from './constants';

export interface DailyReward {
  /** 1-basierte Position im 7-Tage-Zyklus (für die Anzeige, welcher Tag "heute" ist). */
  day: number;
  coins: number;
  gems: number;
}

export interface PendingDailyReward {
  /** Neue Serienlänge, FALLS jetzt abgeholt wird (noch nicht gespeichert). */
  streak: number;
  reward: DailyReward;
}

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit. */
export function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  // "T00:00:00" (ohne "Z") lässt new Date() die Zeichenkette als LOKALE Mitternacht
  // lesen statt als UTC – sonst verschöbe sich das Datum je nach Zeitzone um einen Tag.
  const from = new Date(`${fromISO}T00:00:00`).getTime();
  const to = new Date(`${toISO}T00:00:00`).getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Ob heute eine tägliche Belohnung wartet, und welche. `null`, wenn heute schon
 * abgeholt wurde (dann gibt's nichts zu zeigen).
 *
 * Regel: erst gestern abgeholt -> Serie geht weiter (+1). Länger her, in der
 * Zukunft (Systemuhr manipuliert) oder nie -> Serie beginnt neu bei 1. Der
 * 7er-Belohnungs-Zyklus wiederholt sich (Tag 8 zeigt wieder Tag-1-Belohnung),
 * die ANGEZEIGTE Serie zählt aber unbegrenzt weiter, fürs Prahlen "12 Tage in Folge".
 */
export function pendingDailyReward(lastClaim: string, streak: number): PendingDailyReward | null {
  const today = todayDateString();
  if (lastClaim === today) return null;

  const gap = lastClaim ? daysBetween(lastClaim, today) : null;
  const nextStreak = gap === 1 ? streak + 1 : 1;
  const tier = DAILY_REWARDS[(nextStreak - 1) % DAILY_REWARDS.length];
  const day = ((nextStreak - 1) % DAILY_REWARDS.length) + 1;

  return { streak: nextStreak, reward: { day, ...tier } };
}
