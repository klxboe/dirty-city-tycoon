// Alle Datentypen für den Spielzustand an einem Ort.
import type { SaveData } from './storage';

export type GamePhase = 'ready' | 'flying' | 'levelComplete' | 'gameOver';

/** Eine bereits in der Zielscheibe steckende Axt. Winkel ist im LOKALEN Koordinatensystem der Scheibe. */
export interface StuckAxe {
  id: number;
  boardLocalAngleDeg: number;
}

/** Ein Apfel am Brett, den man abwerfen kann. Winkel ist im LOKALEN Koordinatensystem der Scheibe. */
export interface Apple {
  id: number;
  boardLocalAngleDeg: number;
  collected: boolean;
}

/** Ergebnis eines einzelnen Wurfs, für kurzes Feedback nach der Flugphase. */
export type ThrowOutcome = 'stuck' | 'collided';

export interface FlyingAxe {
  startedAt: number;
  /**
   * Welt-Winkel, an dem diese Axt einschlägt – ergibt sich daraus, wohin der Spieler
   * getippt hat. Bestimmt sowohl die Trefferauswertung als auch die Flugrichtung
   * der Animation.
   */
  impactWorldAngleDeg: number;
}

/**
 * Wie sich die Scheibe dreht. Sorgt für Abwechslung, ohne an den Grundwerten zu drehen:
 * - `steady`  gleichmäßig, das klassische Muster
 * - `pulse`   Tempo schwankt weich zwischen langsam und schnell (Rhythmus finden)
 * - `reverse` dreht periodisch die Richtung um (kurz vor dem Wechsel wird es knifflig)
 */
export type SpinPattern = 'steady' | 'pulse' | 'reverse';

/** Alle Balancing-Werte für ein Level. */
export interface LevelConfig {
  axeCount: number;
  boardSpeedDegPerSec: number;
  spinPattern: SpinPattern;
  /** Feste Positionen (Grad, lokal am Brett) für die Äpfel in diesem Level. */
  appleAngles: number[];
  /** Äxte, die schon zu Levelbeginn im Brett stecken (Hindernisse). Optional. */
  preplacedAxeAngles?: number[];
}

export interface GameState {
  phase: GamePhase;
  levelIndex: number;
  axesThrown: number;
  hits: number;
  stuckAxes: StuckAxe[];
  apples: Apple[];
  /** In diesem Level gesammelte Äpfel. Bei Game Over verfallen sie. */
  applesCollectedThisRun: number;
  /** Münzen aus dem gerade abgeschlossenen Level (Äpfel + Abschluss-Bonus), für den Ergebnis-Screen. */
  coinsEarnedThisLevel: number;
  flyingAxe: FlyingAxe | null;
  lastOutcome: ThrowOutcome | null;
  /** Dauerhafter Spielstand: Münzen, Skins, bestes Level. */
  save: SaveData;
}
