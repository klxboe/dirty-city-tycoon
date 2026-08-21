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
  /** Seltene Variante: bringt Diamanten statt Münzen (siehe goldenAppleIndexFor in constants.ts). */
  golden: boolean;
  /** Heldenstadt-exklusiv: bringt eine Sammelfigur statt Münzen (siehe figurineIndexFor). */
  figurine: boolean;
}

/** Ergebnis eines einzelnen Wurfs, für kurzes Feedback nach der Flugphase. */
export type ThrowOutcome = 'stuck' | 'collided';

export interface FlyingAxe {
  startedAt: number;
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
  /** Gesetzt bei Boss-Leveln: welche Frucht die Zielscheibe ist (siehe shop.ts). */
  bossFruitId?: string;
  /**
   * Gesetzt GENAU am ersten Level einer Welt (außer Wald/Level 1, dem Tutorial-Einstieg
   * für neue Spieler) – der "Weltboss", eine deutlich härtere Prüfung als die normale
   * Kurve an dieser Stelle vorsähe. Siehe `isWorldBossLevel()`/`WORLD_BOSS_PHASE_SPEED_MULTIPLIER`
   * in constants.ts für die Umsetzung, `worlds.ts` für die betroffenen Level-Indizes.
   */
  worldBossId?: string;
  /** Index in appleAngles, falls dieses Level einen goldenen Apfel hat (selten). */
  goldenAppleIndex?: number;
  /** Index in appleAngles, falls dieses Level eine Sammelfigur hat (nur Heldenstadt). */
  figurineIndex?: number;
}

export interface GameState {
  phase: GamePhase;
  levelIndex: number;
  axesThrown: number;
  hits: number;
  stuckAxes: StuckAxe[];
  apples: Apple[];
  /** In diesem Level gesammelte Äpfel (golden + normal). Bei Game Over verfallen sie. */
  applesCollectedThisRun: number;
  /** Davon goldene Äpfel – zählen separat, weil sie Diamanten statt Münzen bringen. */
  gemsCollectedThisRun: number;
  /** Davon Sammelfiguren – zählen separat, landen im Figuren-Inventar statt in Münzen. */
  figurinesCollectedThisRun: number;
  /** Münzen aus dem gerade abgeschlossenen Level, aufgeschlüsselt für den Ergebnis-Screen. */
  reward: LevelReward | null;
  /** Level in Folge ohne Game Over. Treibt den Münz-Multiplikator. */
  streak: number;
  flyingAxe: FlyingAxe | null;
  lastOutcome: ThrowOutcome | null;
  /**
   * Ob die einmalige Video-Rettung in DIESEM Lauf (seit dem letzten Sprung zu Level 1)
   * schon verbraucht ist. Wie `streak` bewusst AUSSERHALB von `createLevelState()`
   * gepflegt (siehe useAxeGame.ts) – bleibt beim Levelaufstieg (`nextLevel`) erhalten,
   * wird nur bei einem echten Neustart (Level 0) wieder auf `false` gesetzt.
   */
  rescueUsedThisRun: boolean;
  /** Dauerhafter Spielstand: Münzen, Skins, bestes Level. */
  save: SaveData;
}

/** Aufschlüsselung der Belohnung eines geschafften Levels – so kann der Ergebnis-Screen zeigen, WOFÜR es Münzen gab. */
export interface LevelReward {
  /** Münzen für eingesammelte Äpfel. */
  apples: number;
  /** Grundbetrag fürs Schaffen des Levels. */
  base: number;
  /** Zusatz, wenn ALLE Äpfel des Levels eingesammelt wurden. */
  perfect: number;
  /** Zusatz für den Abschluss eines 10er-Blocks. */
  block: number;
  /** Multiplikator aus der Serie (1.0 = keine Serie). */
  streakMultiplier: number;
  /** Endsumme nach Multiplikator – das, was gutgeschrieben wurde. */
  total: number;
  /** Diamanten aus goldenen Äpfeln – eigene Währung, keine Münzen. */
  gems: number;
  /** Sammelfiguren aus Heldenstadt – landen im Inventar, keine Münzen. */
  figurines: number;
  /** XP – dauerhafte Ressource, schaltet Welten frei (siehe XP_PER_LEVEL in constants.ts). */
  xp: number;
  /** Bei Boss-Leveln: welche Frucht besiegt wurde. */
  bossFruitId?: string;
  /** Bei Boss-Leveln: Axt-Skin, der dadurch neu freigeschaltet wurde (null = hatte man schon). */
  unlockedAxeSkinId?: string;
}
