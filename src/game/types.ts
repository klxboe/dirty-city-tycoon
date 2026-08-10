// Alle Datentypen für den Spielzustand an einem Ort.

export type GamePhase = 'ready' | 'flying' | 'levelComplete';

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
}

/** Alle Balancing-Werte für ein Level. */
export interface LevelConfig {
  name: string;
  axeCount: number;
  boardSpeedDegPerSec: number;
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
  boardAngleDeg: number;
  stuckAxes: StuckAxe[];
  apples: Apple[];
  /** In diesem Level-Durchlauf gesammelte Äpfel (= Spielwährung). */
  applesCollectedThisRun: number;
  /** Dauerhaft gespeicherte Gesamt-Währung über alle Durchläufe hinweg. */
  totalCurrency: number;
  flyingAxe: FlyingAxe | null;
  lastOutcome: ThrowOutcome | null;
}
