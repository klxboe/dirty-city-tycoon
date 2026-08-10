// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import type { LevelConfig } from './types';

/**
 * Wie lange die Fluganimation der Axt dauert (ms). Bewusst kurz: das ist auch die
 * kürzestmögliche Zeit zwischen zwei Würfen. Bei 70°/Sek. Board-Geschwindigkeit dreht
 * sich die Scheibe in 140ms nur um ~9.8° – WENIGER als die Kollisions-Toleranz (10°).
 * Wer also direkt hintereinander tippt (spammt), trifft garantiert die eigene vorherige
 * Axt und ist raus. Bewusst getimtes Werfen (mit Pause dazwischen) bleibt sicher.
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
 * Level-Konfiguration. Bewusst als Liste angelegt, auch wenn aktuell nur Level 1 existiert,
 * damit weitere Level später einfach ergänzt werden können.
 */
export const LEVELS: LevelConfig[] = [
  {
    axeCount: 5,
    boardSpeedDegPerSec: 70,
    appleAngles: [40, 150, 260],
  },
];

export const CURRENCY_SAVE_KEY = 'axe-throw-currency-v1';
