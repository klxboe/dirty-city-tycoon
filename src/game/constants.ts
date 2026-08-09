// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.

/** Wie lange ein voller "Spin-Zyklus" beim Laden dauert (ms). Ein Release nahe 0/1 = sauberer Treffer. */
export const BASE_SPIN_PERIOD_MS = 850;
/** Zyklus wird mit steigendem Score etwas schneller (schwerer zu treffen). */
export const SPIN_PERIOD_MIN_MS = 480;
export const SPIN_PERIOD_SHRINK_PER_HIT = 12;

/** Toleranz um den Sweet Spot herum (Anteil des Zyklus, 0.1 = ±10%). Schrumpft mit dem Score. */
export const BASE_SWEET_SPOT_TOLERANCE = 0.16;
export const MIN_SWEET_SPOT_TOLERANCE = 0.07;
export const SWEET_SPOT_SHRINK_PER_HIT = 0.004;

/**
 * Rotationsgeschwindigkeit der Zielscheibe (Grad/Sekunde). Steigt mit dem Score.
 * WICHTIG: muss deutlich höher sein als COLLISION_ANGLE_TOLERANCE_DEG / (FLIGHT_DURATION_MS/1000),
 * sonst kollidieren selbst perfekt getimte Würfe im schnellstmöglichen Rhythmus unfair mit der
 * eigenen letzten Axt, weil sich die Scheibe zwischen zwei Würfen kaum weiterdreht.
 */
export const BASE_BOARD_SPEED_DEG_PER_SEC = 95;
export const BOARD_SPEED_INCREMENT_PER_HIT = 4;
export const MAX_BOARD_SPEED_DEG_PER_SEC = 220;

/** Ab welchem Winkel-Abstand zwei Äxte als "Kollision" gelten (Grad). */
export const COLLISION_ANGLE_TOLERANCE_DEG = 16;

/** Wie lange die Fluganimation der Axt dauert (ms). */
export const FLIGHT_DURATION_MS = 320;
/** Wie oft sich die Axt während des Flugs sichtbar dreht (rein optisch). */
export const FLIGHT_VISUAL_SPINS = 2.5;

/** Fester Aufprall-Punkt der Scheibe in Weltkoordinaten (0° = oben, im Uhrzeigersinn). */
export const IMPACT_WORLD_ANGLE_DEG = 180;

export const SAVE_KEY = 'axe-throw-high-score-v1';
