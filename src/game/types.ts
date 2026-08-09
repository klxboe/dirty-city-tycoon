// Alle Datentypen für den Spielzustand an einem Ort.

export type GamePhase = 'ready' | 'charging' | 'flying' | 'gameover';

/** Eine bereits in der Zielscheibe steckende Axt. Winkel ist im LOKALEN Koordinatensystem der Scheibe. */
export interface StuckAxe {
  id: number;
  boardLocalAngleDeg: number;
}

/** Ergebnis eines einzelnen Wurfs, für kurzes Feedback nach der Flugphase. */
export type ThrowOutcome = 'stuck' | 'bounced' | 'collided';

export interface FlyingAxe {
  /** Winkel der Scheibe (im Weltkoordinatensystem) im Moment des Loslassens. */
  releaseBoardAngleDeg: number;
  /** Ob der Wurf im "Sweet Spot" war, also sauber stecken bleiben würde. */
  wasGoodTiming: boolean;
  startedAt: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  streak: number;
  boardAngleDeg: number;
  boardSpeedDegPerSec: number;
  stuckAxes: StuckAxe[];
  chargeStartedAt: number | null;
  flyingAxe: FlyingAxe | null;
  lastOutcome: ThrowOutcome | null;
}
