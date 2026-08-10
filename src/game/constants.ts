// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import type { LevelConfig } from './types';

/**
 * Wie lange die Fluganimation der Axt dauert (ms). Bewusst kurz: das ist auch die
 * kürzestmögliche Zeit zwischen zwei Würfen. Bei 70°/Sek. Board-Geschwindigkeit dreht
 * sich die Scheibe in 140ms nur um ~9.8° – WENIGER als die Kollisions-Toleranz (10°).
 * Wer also direkt hintereinander tippt (spammt), trifft garantiert die eigene vorherige
 * Axt und ist raus. Bewusst getimtes Werfen (mit Pause dazwischen) bleibt sicher.
 * (Tippt man WÄHREND eine Axt fliegt, geht der Tap nicht verloren, sondern wird
 * gepuffert und feuert automatisch beim Landen – siehe useAxeGame.ts.)
 */
export const FLIGHT_DURATION_MS = 140;
/** Wie oft sich die Axt während des Flugs sichtbar dreht (rein optisch). */
export const FLIGHT_VISUAL_SPINS = 2.5;

/**
 * Ab welchem Winkel-Abstand zwei Äxte als "Kollision" gelten (Grad) – die "Hitbox" der Axt
 * in der Scheibe. Kleiner = leichter, weil weniger Stellen als "schon belegt" zählen.
 */
export const COLLISION_ANGLE_TOLERANCE_DEG = 10;

/** Wie nah eine Axt an einem Apfel landen muss, damit er abfällt (Grad). Großzügiger als die Kollisions-Hitbox. */
export const APPLE_HIT_TOLERANCE_DEG = 24;

/** Fester Aufprall-Punkt der Scheibe in Weltkoordinaten (0° = oben, im Uhrzeigersinn). */
export const IMPACT_WORLD_ANGLE_DEG = 180;

/**
 * 100 Level = 20 Schwierigkeitsstufen × 5 Varianten pro Stufe, per Formel erzeugt statt von
 * Hand aufgeschrieben (wäre bei 100 Stück unübersichtlich). Innerhalb einer Stufe ist die
 * Schwierigkeit gleich (Axt-Anzahl, ungefähres Tempo, Anzahl Hindernisse/Äpfel), nur die
 * genaue Platzierung von Äpfeln/vorplatzierten Äxten und das exakte Tempo variieren – für
 * fünf spürbar unterschiedliche, aber gleich schwere Level pro Stufe.
 */
const DIFFICULTY_TIERS = 20;
const VARIATIONS_PER_TIER = 5;
const SPEED_MULTIPLIERS = [0.85, 1.0, 1.15, 0.75, 1.05];

function normalizeDeg(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** N Winkel gleichmäßig auf dem Kreis verteilt, ab einem Start-Winkel. */
function spreadAngles(count: number, startDeg: number): number[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => normalizeDeg(startDeg + (360 / count) * i));
}

function generateLevel(tier: number, variation: number): LevelConfig {
  const axeCount = Math.min(8, 5 + Math.floor((tier - 1) / 5));
  const preplacedCount = Math.min(3, Math.floor((tier - 1) / 6));
  const appleCount = 2 + Math.floor((tier - 1) / 10);

  const baseSpeed = 55 + tier * 6;
  const speedMultiplier = SPEED_MULTIPLIERS[(variation - 1) % SPEED_MULTIPLIERS.length];
  const boardSpeedDegPerSec = Math.round(Math.min(200, Math.max(50, baseSpeed * speedMultiplier)));

  const appleSeed = normalizeDeg(tier * 47 + variation * 83);
  const preplacedSeed = normalizeDeg(tier * 29 + variation * 61 + 25);

  return {
    axeCount,
    boardSpeedDegPerSec,
    appleAngles: spreadAngles(appleCount, appleSeed),
    preplacedAxeAngles: preplacedCount > 0 ? spreadAngles(preplacedCount, preplacedSeed) : undefined,
  };
}

export const LEVELS: LevelConfig[] = Array.from({ length: DIFFICULTY_TIERS }, (_, tierIndex) =>
  Array.from({ length: VARIATIONS_PER_TIER }, (_, variationIndex) => generateLevel(tierIndex + 1, variationIndex + 1)),
).flat();

export const CURRENCY_SAVE_KEY = 'axe-throw-currency-v1';
