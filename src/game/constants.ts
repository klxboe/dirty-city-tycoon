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
 * Level-Konfiguration: 10 Level mit steigender/wechselnder Schwierigkeit. Manche haben
 * schon Äxte im Brett stecken (Hindernisse von Anfang an), die Rotationsgeschwindigkeit
 * variiert bewusst (mal schneller, mal langsamer) statt nur stetig zu steigen.
 */
export const LEVELS: LevelConfig[] = [
  { name: 'Erste Würfe', axeCount: 5, boardSpeedDegPerSec: 70, appleAngles: [40, 150, 260] },
  { name: 'Klein, aber flott', axeCount: 5, boardSpeedDegPerSec: 95, appleAngles: [60, 200] },
  {
    name: 'Enge Lücke',
    axeCount: 6,
    boardSpeedDegPerSec: 65,
    appleAngles: [30, 120, 210, 300],
    preplacedAxeAngles: [75],
  },
  { name: 'Volles Rohr', axeCount: 6, boardSpeedDegPerSec: 115, appleAngles: [45, 225] },
  {
    name: 'Vierer-Ring',
    axeCount: 6,
    boardSpeedDegPerSec: 55,
    appleAngles: [70, 160, 250, 340],
    preplacedAxeAngles: [0, 180],
  },
  {
    name: 'Tempo hoch',
    axeCount: 7,
    boardSpeedDegPerSec: 130,
    appleAngles: [100, 280],
    preplacedAxeAngles: [40],
  },
  {
    name: 'Apfelernte',
    axeCount: 7,
    boardSpeedDegPerSec: 80,
    appleAngles: [20, 110, 200, 290],
    preplacedAxeAngles: [160, 340],
  },
  {
    name: 'Kaum Platz',
    axeCount: 7,
    boardSpeedDegPerSec: 150,
    appleAngles: [55, 200],
    preplacedAxeAngles: [0, 120, 240],
  },
  {
    name: 'Präzision',
    axeCount: 8,
    boardSpeedDegPerSec: 100,
    appleAngles: [15, 105, 195, 285],
    preplacedAxeAngles: [50, 140, 230, 320],
  },
  {
    name: 'Meisterschaft',
    axeCount: 8,
    boardSpeedDegPerSec: 170,
    appleAngles: [45, 225],
    preplacedAxeAngles: [0, 90, 180, 270],
  },
];

export const CURRENCY_SAVE_KEY = 'axe-throw-currency-v1';
