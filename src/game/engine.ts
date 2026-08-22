// Reine Spiellogik ohne React – gut einzeln nachvollziehbar und testbar.
import { APPLE_HIT_TOLERANCE_DEG, COLLISION_ANGLE_TOLERANCE_DEG, IMPACT_WORLD_ANGLE_DEG } from './constants';
import type { Apple, StuckAxe } from './types';

export function normalizeAngle(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** Kürzester Winkel-Abstand zwischen zwei Richtungen (immer 0-180). */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

/**
 * Winkel, an dem eine neue Axt in der (rotierenden) Scheibe "einwächst", im lokalen
 * Koordinatensystem der Scheibe.
 *
 * Der Einschlagpunkt ist IMMER derselbe Punkt auf dem Bildschirm (unten an der Scheibe,
 * `IMPACT_WORLD_ANGLE_DEG`) – egal, wo man tippt. Genau wie beim Vorbild "Knife Hit".
 * Es gab zwischendurch eine Ziel-Mechanik, bei der die Tippposition den Einschlagpunkt
 * verschob; die wurde auf Wunsch wieder entfernt, weil sie das Spiel unnötig kompliziert
 * gemacht hat. Der einzige Skill ist damit wieder das TIMING.
 */
export function computeBoardLocalAngle(worldBoardAngleDeg: number): number {
  return normalizeAngle(IMPACT_WORLD_ANGLE_DEG - worldBoardAngleDeg);
}

/** true, wenn der neue Einschlagpunkt zu nah an einer bereits steckenden Axt liegt. */
export function collidesWithStuckAxe(candidateLocalAngle: number, stuckAxes: StuckAxe[]): boolean {
  return stuckAxes.some((axe) => angularDistance(candidateLocalAngle, axe.boardLocalAngleDeg) < COLLISION_ANGLE_TOLERANCE_DEG);
}

/**
 * true, wenn der neue Einschlagpunkt zu nah an einem "Zacken"-Hindernis liegt (siehe
 * `LevelConfig.spikeAngles` – eigene, von den Hindernis-Äxten unabhängige Gefahrenzone
 * bei Bossen, sieht anders aus und braucht deshalb eine eigene Kollisionsprüfung statt
 * `collidesWithStuckAxe` wiederzuverwenden). Gleiche Toleranz wie bei Äxten, damit sich
 * die "Hitbox" für den Spieler nicht anders anfühlt als gewohnt – nur die Position ist
 * neu, nicht die Fairness-Regel dahinter.
 */
export function collidesWithSpike(candidateLocalAngle: number, spikeAngles: number[]): boolean {
  return spikeAngles.some((angle) => angularDistance(candidateLocalAngle, angle) < COLLISION_ANGLE_TOLERANCE_DEG);
}

/** Gibt den Apfel zurück, der von einem Einschlag an diesem Winkel abgeworfen würde (falls vorhanden). */
export function findHitApple(candidateLocalAngle: number, apples: Apple[]): Apple | null {
  return (
    apples.find((apple) => !apple.collected && angularDistance(candidateLocalAngle, apple.boardLocalAngleDeg) < APPLE_HIT_TOLERANCE_DEG) ??
    null
  );
}
