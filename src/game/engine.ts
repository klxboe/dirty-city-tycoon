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

/** Wie weit ist der Lade-Zyklus gerade (0-1, wiederholt sich). Für die Anzeige des Drehreglers. */
export function spinProgress(holdMs: number, spinPeriodMs: number): number {
  return (holdMs % spinPeriodMs) / spinPeriodMs;
}

/**
 * true, wenn beim Loslassen genau jetzt die Axt sauber (mit der Klinge voran) treffen würde.
 * Der Sweet Spot liegt bewusst in der MITTE des Zyklus (progress ≈ 0.5), nicht am Anfang
 * (progress ≈ 0) – sonst wäre ein sofortiges Loslassen (0ms halten) immer ein Treffer, was
 * die ganze Lade-Mechanik überflüssig machen würde.
 */
export function isGoodTiming(holdMs: number, spinPeriodMs: number, tolerance: number): boolean {
  const progress = spinProgress(holdMs, spinPeriodMs);
  return Math.abs(progress - 0.5) <= tolerance;
}

/** Winkel, an dem eine neue Axt in der (rotierenden) Scheibe "einwächst", im lokalen Koordinatensystem der Scheibe. */
export function computeBoardLocalAngle(worldBoardAngleDeg: number): number {
  return normalizeAngle(IMPACT_WORLD_ANGLE_DEG - worldBoardAngleDeg);
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
