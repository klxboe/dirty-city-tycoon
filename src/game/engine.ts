// Reine Spiellogik ohne React – gut einzeln nachvollziehbar und testbar.
import {
  APPLE_HIT_TOLERANCE_DEG,
  COLLISION_ANGLE_TOLERANCE_DEG,
  IMPACT_WORLD_ANGLE_DEG,
  MAX_AIM_SPREAD_DEG,
} from './constants';
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
 * Rechnet die Ziel-Eingabe des Spielers in den Welt-Winkel um, an dem die Axt einschlägt.
 * `aim` ist die Tippposition relativ zur Scheibenmitte: -1 = ganz links am Rand,
 * 0 = Mitte, +1 = ganz rechts. Werte darüber hinaus (Tippen neben der Scheibe) werden
 * abgeschnitten, damit auch ein Tap am Bildschirmrand noch einen sinnvollen Wurf ergibt.
 *
 * Rechts tippen = kleinerer Winkel (Richtung 90° = rechts), links tippen = größerer
 * (Richtung 270° = links), weil die Weltwinkel im Uhrzeigersinn laufen.
 */
export function aimToImpactWorldAngle(aim: number): number {
  const clamped = Math.min(1, Math.max(-1, aim));
  return normalizeAngle(IMPACT_WORLD_ANGLE_DEG - clamped * MAX_AIM_SPREAD_DEG);
}

/**
 * Winkel, an dem eine neue Axt in der (rotierenden) Scheibe "einwächst", im lokalen
 * Koordinatensystem der Scheibe. `impactWorldAngleDeg` kommt aus aimToImpactWorldAngle
 * und hängt davon ab, wohin der Spieler gezielt hat.
 */
export function computeBoardLocalAngle(worldBoardAngleDeg: number, impactWorldAngleDeg: number): number {
  return normalizeAngle(impactWorldAngleDeg - worldBoardAngleDeg);
}

/** true, wenn der neue Einschlagpunkt zu nah an einer bereits steckenden Axt liegt. */
export function collidesWithStuckAxe(candidateLocalAngle: number, stuckAxes: StuckAxe[]): boolean {
  return stuckAxes.some((axe) => angularDistance(candidateLocalAngle, axe.boardLocalAngleDeg) < COLLISION_ANGLE_TOLERANCE_DEG);
}

/** Gibt den Apfel zurück, der von einem Einschlag an diesem Winkel abgeworfen würde (falls vorhanden). */
export function findHitApple(candidateLocalAngle: number, apples: Apple[]): Apple | null {
  return (
    apples.find((apple) => !apple.collected && angularDistance(candidateLocalAngle, apple.boardLocalAngleDeg) < APPLE_HIT_TOLERANCE_DEG) ??
    null
  );
}
