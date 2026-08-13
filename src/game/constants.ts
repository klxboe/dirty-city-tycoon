// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import { BOSS_FRUITS, type BossFruit } from './shop';
import type { LevelConfig, SpinPattern } from './types';

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
 * 100 Level, alle per Formel aus der Levelnummer erzeugt (von Hand wären 100 Stück
 * unübersichtlich). Was sich womit ändert, steht weiter unten bei der Kurve.
 */
const DIFFICULTY_TIERS = 20;
const VARIATIONS_PER_TIER = 5;

/**
 * Die 100 Level sind in Blöcke zu 10 gruppiert. Ein Game Over wirft nicht bis Level 1
 * zurück, sondern nur an den Anfang des aktuellen Blocks – wer in Level 34 stirbt,
 * startet bei 31. So bleibt der Einsatz spürbar, ohne dass ein später Fehler den
 * ganzen Fortschritt kostet.
 */
export const LEVELS_PER_BLOCK = 10;

/** Erster Level-Index des Blocks, in dem `levelIndex` liegt (0-basiert). */
export function blockStartIndex(levelIndex: number): number {
  return Math.floor(levelIndex / LEVELS_PER_BLOCK) * LEVELS_PER_BLOCK;
}

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

/*
 * Schwierigkeits-Kurve. Bewusst über die LEVELNUMMER gesteuert und nicht über
 * "Stufen zu je 5 Leveln": eine frühere Version änderte in den ersten 16 Leveln
 * gar nichts außer +1.4°/Sek. Tempo – wer nach fünf Minuten aufhörte, hatte vom
 * Spiel nichts gesehen. Jetzt kommt jede neue Zutat innerhalb der ersten ~15 Level
 * mindestens einmal vor, danach wird nur noch nachgeschärft.
 */

/** Wie viele Äxte pro Level (mehr Äxte = voller wird das Brett = enger die Lücken). */
function axeCountFor(levelIndex: number): number {
  if (levelIndex < 10) return 5; // Level 1-10
  if (levelIndex < 20) return 6; // Level 11-20
  if (levelIndex < 30) return 7; // Level 21-30
  return 8; // ab Level 31
}

/** Von Anfang an steckende Äxte als Hindernisse. */
function obstacleCountFor(levelIndex: number): number {
  if (levelIndex < 3) return 0; // Level 1-3: erst mal die Grundmechanik lernen
  if (levelIndex < 13) return 1; // ab Level 4
  if (levelIndex < 25) return 2; // ab Level 14
  return 3; // ab Level 26
}

function appleCountFor(levelIndex: number): number {
  if (levelIndex < 20) return 2;
  if (levelIndex < 50) return 3;
  return 4;
}

/**
 * Dreh-Muster. Level 1-2 laufen gleichmäßig (Einstieg), ab Level 3 wechselt sich
 * Pulsieren ein, ab Level 8 kommt der Richtungswechsel dazu.
 */
function spinPatternFor(levelIndex: number): SpinPattern {
  if (levelIndex < 2) return 'steady';
  if (levelIndex < 7) return levelIndex % 2 === 0 ? 'steady' : 'pulse';
  const cycle: SpinPattern[] = ['steady', 'pulse', 'reverse', 'pulse'];
  return cycle[levelIndex % cycle.length];
}

/** Jedes BOSS_EVERY-te Level ist ein Boss-Level mit Frucht-Zielscheibe. */
export const BOSS_EVERY = 5;

export function isBossLevel(levelIndex: number): boolean {
  return (levelIndex + 1) % BOSS_EVERY === 0;
}

/** Welche Frucht der Boss bei diesem Level ist. Die Liste wiederholt sich. */
export function bossFruitForLevel(levelIndex: number): BossFruit | null {
  if (!isBossLevel(levelIndex)) return null;
  const bossNumber = Math.floor(levelIndex / BOSS_EVERY); // 0-basiert
  return BOSS_FRUITS[bossNumber % BOSS_FRUITS.length];
}

function generateLevel(levelIndex: number): LevelConfig {
  const boss = bossFruitForLevel(levelIndex);

  // Boss-Level: eine Axt mehr und etwas flotter – soll sich wie eine Prüfung anfühlen.
  const axeCount = axeCountFor(levelIndex) + (boss ? 1 : 0);
  const speedBonus = boss ? 12 : 0;
  const boardSpeedDegPerSec = Math.round(
    Math.min(MAX_SPEED_DEG_PER_SEC, BASE_SPEED_DEG_PER_SEC + levelIndex * SPEED_STEP_PER_LEVEL + speedBonus),
  );

  // Zwei teilerfremde Faktoren, damit sich Apfel- und Hindernis-Positionen über die
  // Level nicht in kurzen Zyklen wiederholen.
  const appleSeed = normalizeDeg(levelIndex * 47 + 31);
  const obstacleSeed = normalizeDeg(levelIndex * 79 + 113);

  const obstacleCount = obstacleCountFor(levelIndex);

  return {
    axeCount,
    boardSpeedDegPerSec,
    spinPattern: spinPatternFor(levelIndex),
    appleAngles: spreadAngles(appleCountFor(levelIndex), appleSeed),
    preplacedAxeAngles: obstacleCount > 0 ? spreadAngles(obstacleCount, obstacleSeed) : undefined,
    bossFruitId: boss?.id,
  };
}

export const LEVEL_COUNT = DIFFICULTY_TIERS * VARIATIONS_PER_TIER;

export const LEVELS: LevelConfig[] = Array.from({ length: LEVEL_COUNT }, (_, i) => generateLevel(i));

/** Alter Speicherstand (nur eine Apfel-Zahl). Wird beim ersten Start in Münzen migriert. */
export const CURRENCY_SAVE_KEY = 'axe-throw-currency-v1';
/** Aktueller Speicherstand: Münzen, Skins, bestes Level (JSON). */
export const SAVE_KEY = 'axe-throw-save-v2';

/**
 * Münz-Wirtschaft. Münzen gibt es NUR bei geschafftem Level – ein Game Over kostet
 * alles, was im laufenden Versuch gesammelt wurde. Das macht vorsichtiges Spielen
 * wertvoll und ist der Grund, überhaupt zu zielen statt zu spammen.
 */
export const COINS_PER_APPLE = 5;
/** Umrechnung beim Migrieren alter Spielstände (dort waren Äpfel die Währung). */
export const COINS_PER_LEGACY_APPLE = 5;

/**
 * Münz-Bonus fürs Abschließen eines Levels, steigt mit der Levelnummer.
 * Level 1 = 10, Level 50 = 59, Level 100 = 109 – zusammen mit den Äpfeln kommt man
 * so in einem guten Lauf zügig an den ersten Skin (150 Münzen).
 */
export function levelCompletionBonus(levelIndex: number): number {
  return 10 + levelIndex;
}

/** Zusatz, wenn ALLE Äpfel eines Levels eingesammelt wurden – belohnt genaues Zielen. */
export const PERFECT_APPLE_BONUS = 25;

/** Zusatz für den Abschluss eines 10er-Blocks, wächst mit der Blocknummer. */
export function blockCompletionBonus(levelIndex: number): number {
  return 100 * (Math.floor(levelIndex / LEVELS_PER_BLOCK) + 1);
}

/**
 * Münz-Multiplikator aus der Serie: je 5 Level ohne Game Over +25%, gedeckelt bei ×2.
 * Macht das Nicht-Sterben wertvoll, ohne dass ein langer Lauf ins Absurde skaliert.
 */
export function streakMultiplier(streak: number): number {
  return Math.min(2, 1 + Math.floor(streak / 5) * 0.25);
}

/** Boss-Level, dessen Axt man schon besitzt: gibt es stattdessen Münzen. */
export const BOSS_REPEAT_BONUS = 150;
