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

/**
 * Aufprall-Punkt für einen Wurf GENAU IN DIE MITTE, in Weltkoordinaten
 * (0° = oben, im Uhrzeigersinn) – also unten an der Scheibe.
 * Zielt man daneben, verschiebt sich der Einschlag um bis zu MAX_AIM_SPREAD_DEG
 * (siehe aimToImpactWorldAngle in engine.ts).
 */
export const IMPACT_WORLD_ANGLE_DEG = 180;

/**
 * Wie weit man den Einschlag durch Zielen nach links/rechts verschieben kann (Grad).
 * Tippt man ganz am linken/rechten Rand der Scheibe, landet die Axt um diesen Winkel
 * neben dem Mittel-Einschlag. 75° deckt zusammen die gesamte untere Hälfte plus etwas
 * ab – genug Kontrolle zum gezielten Apfel-Treffen, ohne dass ein von unten geworfener
 * Wurf unglaubwürdig auf der Oberseite einschlägt.
 */
export const MAX_AIM_SPREAD_DEG = 75;

/**
 * 100 Level = 20 Schwierigkeitsstufen × 5 Varianten pro Stufe, per Formel erzeugt statt von
 * Hand aufgeschrieben (wäre bei 100 Stück unübersichtlich). Die Stufe bestimmt Axt-Anzahl,
 * Anzahl Hindernisse und Äpfel; innerhalb einer Stufe variiert nur die genaue Platzierung
 * von Äpfeln/vorplatzierten Äxten – für fünf spürbar unterschiedliche Level pro Stufe.
 * Die Drehgeschwindigkeit steigt davon unabhängig mit JEDEM einzelnen Level (siehe unten).
 */
const DIFFICULTY_TIERS = 20;
const VARIATIONS_PER_TIER = 5;

/**
 * Die Scheibe dreht sich mit JEDEM Level ein Stück schneller (streng steigend über alle
 * 100 Level, nicht nur pro Schwierigkeitsstufe). Je schneller sie dreht, desto kürzer ist
 * das Zeitfenster, in dem ein bestimmter Apfel am Einschlagpunkt vorbeikommt – genau das
 * macht das gezielte Apfel-Sammeln nach oben hin schwerer.
 * Level 1 = 55°/Sek., Level 100 = ~199°/Sek.
 */
const BASE_SPEED_DEG_PER_SEC = 55;
const SPEED_STEP_PER_LEVEL = 1.45;
const MAX_SPEED_DEG_PER_SEC = 200;

function normalizeDeg(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** N Winkel gleichmäßig auf dem Kreis verteilt, ab einem Start-Winkel. */
function spreadAngles(count: number, startDeg: number): number[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => normalizeDeg(startDeg + (360 / count) * i));
}

function generateLevel(tier: number, variation: number, levelIndex: number): LevelConfig {
  const axeCount = Math.min(8, 5 + Math.floor((tier - 1) / 5));
  const preplacedCount = Math.min(3, Math.floor((tier - 1) / 6));
  const appleCount = 2 + Math.floor((tier - 1) / 10);

  const boardSpeedDegPerSec = Math.round(
    Math.min(MAX_SPEED_DEG_PER_SEC, BASE_SPEED_DEG_PER_SEC + levelIndex * SPEED_STEP_PER_LEVEL),
  );

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
  Array.from({ length: VARIATIONS_PER_TIER }, (_, variationIndex) =>
    generateLevel(tierIndex + 1, variationIndex + 1, tierIndex * VARIATIONS_PER_TIER + variationIndex),
  ),
).flat();

export const CURRENCY_SAVE_KEY = 'axe-throw-currency-v1';
