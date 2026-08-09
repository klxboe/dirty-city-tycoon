// Reine Spiellogik ohne React – gut einzeln nachvollziehbar und testbar.
import {
  BASE_BOARD_SPEED_DEG_PER_SEC,
  BASE_SPIN_PERIOD_MS,
  BASE_SWEET_SPOT_TOLERANCE,
  BOARD_SPEED_INCREMENT_PER_HIT,
  COLLISION_ANGLE_TOLERANCE_DEG,
  IMPACT_WORLD_ANGLE_DEG,
  MAX_BOARD_SPEED_DEG_PER_SEC,
  MIN_SWEET_SPOT_TOLERANCE,
  SPIN_PERIOD_MIN_MS,
  SPIN_PERIOD_SHRINK_PER_HIT,
  SWEET_SPOT_SHRINK_PER_HIT,
} from './constants';
import type { StuckAxe } from './types';

export function normalizeAngle(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** Kürzester Winkel-Abstand zwischen zwei Richtungen (immer 0-180). */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

/** Je höher der Score, desto schneller der Lade-Zyklus (schwerer zu treffen). */
export function spinPeriodForScore(score: number): number {
  return Math.max(SPIN_PERIOD_MIN_MS, BASE_SPIN_PERIOD_MS - score * SPIN_PERIOD_SHRINK_PER_HIT);
}

/** Je höher der Score, desto schmaler das Zeitfenster für einen sauberen Treffer. */
export function sweetSpotToleranceForScore(score: number): number {
  return Math.max(MIN_SWEET_SPOT_TOLERANCE, BASE_SWEET_SPOT_TOLERANCE - score * SWEET_SPOT_SHRINK_PER_HIT);
}

/** Je höher der Score, desto schneller dreht sich die Zielscheibe. */
export function boardSpeedForScore(score: number): number {
  return Math.min(MAX_BOARD_SPEED_DEG_PER_SEC, BASE_BOARD_SPEED_DEG_PER_SEC + score * BOARD_SPEED_INCREMENT_PER_HIT);
}

/** Wie weit ist der Lade-Zyklus gerade (0-1, wiederholt sich). Für die Anzeige des Drehreglers. */
export function spinProgress(holdMs: number, spinPeriodMs: number): number {
  return (holdMs % spinPeriodMs) / spinPeriodMs;
}

/** true, wenn beim Loslassen genau jetzt die Axt sauber (mit der Klinge voran) treffen würde. */
export function isGoodTiming(holdMs: number, spinPeriodMs: number, tolerance: number): boolean {
  const progress = spinProgress(holdMs, spinPeriodMs);
  return progress <= tolerance || progress >= 1 - tolerance;
}

/** Winkel, an dem eine neue Axt in der (rotierenden) Scheibe "einwächst", im lokalen Koordinatensystem der Scheibe. */
export function computeBoardLocalAngle(worldBoardAngleDeg: number): number {
  return normalizeAngle(IMPACT_WORLD_ANGLE_DEG - worldBoardAngleDeg);
}

/** true, wenn der neue Einschlagpunkt zu nah an einer bereits steckenden Axt liegt. */
export function collidesWithStuckAxe(candidateLocalAngle: number, stuckAxes: StuckAxe[]): boolean {
  return stuckAxes.some((axe) => angularDistance(candidateLocalAngle, axe.boardLocalAngleDeg) < COLLISION_ANGLE_TOLERANCE_DEG);
}
