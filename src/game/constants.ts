// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import { BOSS_FRUITS, HERO_BOSSES, type BossFruit } from './shop';
import { HERO_WORLD_START } from './worlds';
import type { Difficulty, LevelConfig, SpinPattern } from './types';

/**
 * Wie lange die Fluganimation der Axt dauert (ms). Das ist zugleich die kürzestmögliche
 * Zeit zwischen zwei Einschlägen.
 *
 * Stand früher auf 140ms, mit der Absicht: bei ~70°/Sek. dreht sich die Scheibe in
 * dieser Zeit nur ~9.8°, also WENIGER als die Kollisions-Toleranz (10°) – Dauertippen
 * traf damit garantiert die eigene vorherige Axt. Beim ersten echten Spielen auf dem
 * Handy war das aber unbrauchbar: die Axt legt die ganze Bildschirmhöhe in einer
 * Siebtelsekunde zurück, man sieht schlicht nicht, was passiert ("viel zu schnell,
 * fliegt einfach drüber").
 *
 * Lesbarkeit schlägt hier den Trick. 300ms waren gut zu verfolgen, fühlten sich beim
 * Spielen aber zäh an, 220ms danach immer noch "langweilig und zu langsam". Der nächste
 * Schritt war deshalb NICHT nur die Zahl weiter zu senken (die Dauer war nie das
 * Hauptproblem), sondern vor allem die Animation selbst mit mehr Energie zu versehen
 * (Squash-and-Stretch beim Abschuss, schärferes Easing, kräftigerer Trail – siehe
 * `axe-fly`-Keyframes in App.css). 190ms sind trotzdem spürbar knackiger als 220ms und
 * bei 55°/Sek. Grundtempo dreht sich die Scheibe in dieser Zeit um ~10.5°, knapp ÜBER
 * der 10°-Kollisions-Toleranz – Dauertippen bleibt also riskant, siehe unten.
 * Das ist verkraftbar, weil das Brett sich ohnehin füllt und ab Level 3 Hindernisse
 * dazukommen – wer stumpf spammt, läuft trotzdem in eine steckende Axt. Sollte es zu
 * leicht werden, sind die Stellschrauben COLLISION_ANGLE_TOLERANCE_DEG (größer =
 * strenger) oder ein langsamerer Levelstart.
 *
 * (Tippt man WÄHREND eine Axt fliegt, geht der Tap nicht verloren, sondern wird
 * gepuffert und feuert automatisch beim Landen – siehe useAxeGame.ts.)
 */
export const FLIGHT_DURATION_MS = 190;

/**
 * Wie lange die Scheibe beim Treffer stehen bleibt (ms). Ein sehr kurzer Stopp im
 * Moment des Einschlags – der klassische "Hit-Stop" aus Actionspielen. Er lässt den
 * Treffer schwer und getroffen wirken, ohne dass man ihn bewusst wahrnimmt.
 * Bewusst winzig: alles ab ~90ms fühlt sich nach Ruckeln statt nach Wucht an.
 */
export const HIT_STOP_MS = 55;

/**
 * Wie lange nach dem letzten Wurf gewartet wird, bevor das Ergebnis-Fenster kommt (ms).
 *
 * Ohne diese Pause knallte das Menü im selben Moment hoch, in dem die letzte Axt
 * einschlug – man sah den eigenen Treffer gar nicht mehr und wurde vom Fenster
 * überrumpelt ("kommt so random das Menü, das erschreckt einen"). In der Pause läuft
 * der Bruch-Effekt der Scheibe und ein kurzer "Geschafft"-Schriftzug, erst danach
 * fährt das Fenster ruhig herein.
 */
export const LEVEL_COMPLETE_DELAY_MS = 900;

/** Dasselbe fürs Game Over – etwas kürzer, weil man den Fehlschlag sofort begreift. */
export const GAME_OVER_DELAY_MS = 650;

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
 * Zielt man daneben, wandert der Einschlag auf den Punkt senkrecht über der
 * Tippposition (siehe aimToImpactWorldAngle in engine.ts).
 */
export const IMPACT_WORLD_ANGLE_DEG = 180;

/*
 * Es gibt bewusst KEINE einstellbare "Ziel-Spreizung" mehr. Wie weit der Einschlag
 * seitlich wandert, ergibt sich jetzt aus der Geometrie: der Punkt liegt immer
 * senkrecht über der Tippposition (siehe aimToImpactWorldAngle in engine.ts).
 * Erreichbar ist damit die gesamte untere Hälfte der Scheibe.
 */

/**
 * 120 Level, alle per Formel aus der Levelnummer erzeugt (von Hand wären 120 Stück
 * unübersichtlich). Was sich womit ändert, steht weiter unten bei der Kurve.
 * War lange 20 Stufen (100 Level) für die ersten 5 Welten; die 6. Welt
 * "Heldenstadt" kam als 4 weitere Stufen dazu (Level 101-120) – die Kurve
 * selbst brauchte dafür KEINE Änderung, weil Axt-/Hindernis-/Apfelzahl und
 * Tempo ab Level 31/26/50 ohnehin schon am Anschlag sind (siehe unten).
 */
const DIFFICULTY_TIERS = 24;
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
 * Ob (und welcher) Apfel eines Levels golden ist – seltene Variante, bringt Diamanten
 * statt Münzen (siehe GEMS_PER_GOLDEN_APPLE). Deterministisch aus der Levelnummer
 * berechnet statt mit `Math.random()`, damit ein Level bei jedem Versuch (auch nach
 * einem Game Over) denselben goldenen Apfel an derselben Stelle hat – passend zum Rest
 * der Level-Generierung, die komplett reine Funktionen der Levelnummer sind.
 * Trifft auf ungefähr jedes 7. Level zu (~14%).
 */
function goldenAppleIndexFor(levelIndex: number, appleCount: number): number | undefined {
  if (appleCount <= 0) return undefined;
  const hasGolden = (levelIndex * 131 + 41) % 7 === 0;
  if (!hasGolden) return undefined;
  return (levelIndex * 3) % appleCount;
}

/** Wie viele Diamanten ein goldener Apfel bringt. */
export const GEMS_PER_GOLDEN_APPLE = 3;

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

/**
 * Welcher Boss bei diesem Level ist. Die Heldenstadt-Welt (ab HERO_WORLD_START,
 * siehe worlds.ts) hat eine EIGENE Boss-Rotation (HERO_BOSSES) statt der
 * Boss-Früchte – beide Listen wiederholen sich, falls sie kürzer sind als die
 * Anzahl Boss-Level in ihrem jeweiligen Bereich.
 */
export function bossFruitForLevel(levelIndex: number): BossFruit | null {
  if (!isBossLevel(levelIndex)) return null;
  if (levelIndex >= HERO_WORLD_START) {
    const heroBossNumber = Math.floor((levelIndex - HERO_WORLD_START) / BOSS_EVERY);
    return HERO_BOSSES[heroBossNumber % HERO_BOSSES.length];
  }
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
  const appleCount = appleCountFor(levelIndex);

  return {
    axeCount,
    boardSpeedDegPerSec,
    spinPattern: spinPatternFor(levelIndex),
    appleAngles: spreadAngles(appleCount, appleSeed),
    preplacedAxeAngles: obstacleCount > 0 ? spreadAngles(obstacleCount, obstacleSeed) : undefined,
    bossFruitId: boss?.id,
    goldenAppleIndex: goldenAppleIndexFor(levelIndex, appleCount),
  };
}

export const LEVEL_COUNT = DIFFICULTY_TIERS * VARIATIONS_PER_TIER;

export const LEVELS: LevelConfig[] = Array.from({ length: LEVEL_COUNT }, (_, i) => generateLevel(i));

/**
 * Level-Konfiguration für einen BELIEBIGEN Index – auch jenseits der 100 fest
 * vorbereiteten Level. Trägt den Endlos-Modus: `generateLevel()` ist eine reine
 * Funktion der Levelnummer ohne eingebaute Obergrenze (Tempo deckelt sich selbst bei
 * MAX_SPEED_DEG_PER_SEC, Axt-/Hindernis-/Apfelzahl bei den letzten `if`-Stufen, der
 * Boss-Zyklus und die goldene-Apfel-Formel laufen über Modulo) – jenseits von Level
 * 100 musste dafür nichts Neues gebaut werden. Die ersten 100 kommen aus dem
 * vorberechneten Array (billiger), alles danach wird bei Bedarf einmalig berechnet.
 */
export function levelConfigAt(levelIndex: number): LevelConfig {
  return levelIndex < LEVEL_COUNT ? LEVELS[levelIndex] : generateLevel(levelIndex);
}

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

/**
 * Schwierigkeitsgrad (Einstellungen). Rührt bewusst NICHT an `generateLevel()` selbst –
 * die 100 Level bleiben eine einzige, für alle geltende Formel. Stattdessen skaliert der
 * Hook (`useAxeGame.ts`) zwei Werte nachträglich: wie schnell sich die Scheibe dreht und
 * wie viele Münzen ein geschafftes Level bringt. Schneller drehen UND mehr Münzen bei
 * "Schwer" hängen bewusst zusammen – das Risiko soll sich auch lohnen.
 */
export const DIFFICULTY_SPEED_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.8,
  normal: 1,
  hard: 1.25,
};

export const DIFFICULTY_REWARD_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.75,
  normal: 1,
  hard: 1.4,
};
