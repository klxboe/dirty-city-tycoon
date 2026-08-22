// Alle Balancing-Zahlen an einem Ort. Zum Testen/Tunen einfach hier ändern.
import { BOSS_FRUITS, HERO_BOSSES, type BossFruit } from './shop';
import { HERO_WORLD_START, isWorldBossLevel, worldForLevel, WORLDS_LEVEL_COUNT } from './worlds';
import type { LevelConfig, SpinPattern } from './types';

/**
 * Wie lange die Fluganimation der Axt dauert (ms). Das ist zugleich die kürzestmögliche
 * Zeit zwischen zwei Einschlägen.
 *
 * Stand früher schon einmal auf 140ms, mit der Absicht: bei ~70°/Sek. dreht sich die
 * Scheibe in dieser Zeit nur ~9.8°, also WENIGER als die Kollisions-Toleranz (10°) –
 * Dauertippen traf damit garantiert die eigene vorherige Axt. Beim ersten echten Spielen
 * auf dem Handy war das aber unbrauchbar: die Axt legte die ganze Bildschirmhöhe in einer
 * Siebtelsekunde zurück, man sah schlicht nicht, was passiert ("viel zu schnell, fliegt
 * einfach drüber"). Über 300ms und 220ms ("zäh"/"langweilig und zu langsam") landete der
 * Wert danach lange bei 190ms – DIESER Sprung war NICHT die Dauer allein, sondern vor
 * allem mehr Energie in der Animation selbst (Squash-and-Stretch, schärferes Easing,
 * kräftigerer Trail, siehe `axe-fly`-Keyframes in App.css).
 *
 * **Jetzt zurück auf 140ms (Klaus, nach dem Mikro-Stopp-Fix: "Axt jetzt flüssig, aber
 * Wurfzeit zu lang, bitte NUR die Geschwindigkeit erhöhen, Bewegungslogik unangetastet
 * lassen"):** diesmal OHNE die alten Lesbarkeits-Probleme, weil inzwischen drei Dinge
 * dazugekommen sind, die es damals noch nicht gab – die Positions-Animation läuft
 * über `translate` statt `bottom` (kein Reflow, butterweich statt ruckelig, siehe
 * `axe-fly-position` in App.css), UND die Treffer-Auswertung hängt jetzt am
 * `animationend`-Ereignis der Animation selbst statt an einem separaten `setTimeout`
 * (siehe `resolveThrow()` in useAxeGame.ts) – die kürzere Dauer betrifft dadurch BEIDE
 * Systeme automatisch synchron, kein neuer Mikro-Stopp möglich. Die Rotation/Squash-
 * Keyframes (`axe-fly-transform`) sind in PROZENT der Animationsdauer definiert (0%/12%/
 * 100%), laufen also automatisch proportional schneller mit – keine separate Anpassung
 * nötig, das Verhältnis Fluggeschwindigkeit↔Rotation bleibt unverändert dasselbe.
 * Kollisions-ERKENNUNG ist von der Dauer ohnehin komplett unabhängig (ein einziger,
 * diskreter Winkel-Vergleich bei Animationsende, kein Zeitschritt-basiertes Physik-
 * Tunneling möglich) – nichts an `collidesWithStuckAxe`/`COLLISION_ANGLE_TOLERANCE_DEG`
 * musste deshalb angefasst werden.
 *
 * Einzige bewusst NICHT kompensierte Nebenwirkung: bei `BASE_SPEED_DEG_PER_SEC` (70°/Sek.)
 * dreht sich die Scheibe in 140ms nur noch um ~9.8° – wieder UNTER der 10°-Toleranz, d.h.
 * Dauertippen in Level 1-5 wird dadurch wieder etwas riskanter als direkt nach dem
 * Tempo-Anhub (siehe eigener Abschnitt weiter oben). Bewusst nicht mit-gefixt, weil diese
 * Anfrage explizit NUR die Flugzeit betraf ("nicht wahllos mehrere Systeme gleichzeitig
 * verändern") – falls das als eigenes Feedback zurückkommt, ist `COLLISION_ANGLE_TOLERANCE_DEG`
 * oder erneut `FLIGHT_DURATION_MS` selbst die Stellschraube.
 *
 * (Tippt man WÄHREND eine Axt fliegt, geht der Tap nicht verloren, sondern wird
 * gepuffert und feuert automatisch beim Landen – siehe useAxeGame.ts.)
 */
export const FLIGHT_DURATION_MS = 140;

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

/**
 * Wie nah eine Axt an einem Apfel landen muss, damit er abfällt (Grad). Großzügiger
 * als die Kollisions-Hitbox. Stand lange bei 24° – nie wirklich durchgespielt
 * verifiziert, im offenen TODO als Verdacht vermerkt ("erwischt man oft nur 1 von 2").
 * Auf 30° angehoben: bei 2 Äpfeln (180° auseinander) bleibt zwischen den beiden
 * Fangfenstern noch reichlich Lücke (2×30° = 60° von 360°, keine Überlappung), bei
 * 4 Äpfeln (90° auseinander, ab Level 51) berühren sich die Fenster gerade eben nicht
 * (2×30° = 60° < 90°) – großzügiger, ohne dass sich Äpfel gegenseitig "stehlen" können.
 */
export const APPLE_HIT_TOLERANCE_DEG = 30;

/**
 * Wie tief die Axtspitze optisch ins Holz einsticht (px), gemessen vom Steck-Radius
 * (`BOARD_RADIUS` in TargetBoard.tsx) nach INNEN. Rein visuell, komplett unabhängig von
 * `COLLISION_ANGLE_TOLERANCE_DEG` (Winkel-Hitbox) – eine Änderung hier verschiebt nie
 * die Trefferlogik, nur wie tief die Axt aussieht.
 *
 * GEFUNDENER BUG (Klaus: "Mikro-Ruckler genau beim Aufkommen" + "Axt schwebt leicht vor
 * der Zielscheibe"): dieser Wert wurde bisher NUR beim Berechnen der Flugbahn-Endposition
 * verwendet (App.tsx, lokale Konstante `AXE_BITE_PX`), aber NICHT bei der Steck-Position
 * in `TargetBoard.tsx` (die renderte stur bei `BOARD_RADIUS`, ohne Abzug). Der fliegende
 * Axt-Kopf landete dadurch sichtbar 6px weiter innen (Radius 114) als die Axt eine
 * React-Render-Volage später als "stuckAxe" erschien (Radius 120) – ein exakter,
 * reproduzierbarer 6px-Sprung GENAU im Übergangsframe Flug→Steckend. Klassischer
 * "zwei Stellen, eine vergessen"-Fehler: dieselbe Fallart, die laut Kommentar bei
 * `stickRadiusPx()` (App.tsx) schon einmal mit 10px (gemessener Scheiben-Radius vs.
 * Steck-Radius) passiert war, hier nur kleiner und durch eine spätere Änderung wieder
 * eingeschleppt. Jetzt EIN gemeinsamer, benannter Parameter für BEIDE Stellen – siehe
 * `App.tsx` (Flugziel) und `TargetBoard.tsx` (Steck-Position, `BOARD_RADIUS -
 * AXE_EMBED_DEPTH_PX`).
 *
 * Wert klein gehalten (deutlich kleiner als der 10px-Sicherheitsabstand des Steck-Radius
 * zum sichtbaren Scheibenrand) – "nur so weit, dass die Axt sauber Kontakt hat", nicht
 * tief vergraben. Zum Nachjustieren ("etwas mehr/weniger drin") reicht es, NUR diese
 * eine Zahl zu ändern.
 */
export const AXE_EMBED_DEPTH_PX = 6;

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
 * Die Scheibe dreht sich mit JEDEM Level ein Stück schneller (streng steigend, nicht nur
 * pro Schwierigkeitsstufe). Je schneller sie dreht, desto kürzer ist das Zeitfenster, in
 * dem ein bestimmter Apfel am Einschlagpunkt vorbeikommt – genau das macht das gezielte
 * Apfel-Sammeln nach oben hin schwerer.
 * Level 1 = 70°/Sek., Level 100 = ~258°/Sek. (Werte nach dem Basis-Tempo-Anhub unten),
 * Deckel erst bei Level ~175 (400°/Sek.).
 *
 * Der Deckel lag früher bei 200°/Sek. (erreicht um Level 100) – seit dem Umstieg aufs
 * Highscore-Prinzip (Klaus' Wunsch: "je höher, desto schwerer", ein Lauf geht potenziell
 * lange über Level 120 in den Endlos-Modus hinein) wäre ein früher Deckel genau falsch:
 * ein guter Spieler hätte den harten Teil der Kurve schon lange hinter sich und der Rest
 * des Laufs würde sich nicht mehr steigern. Deckel deshalb deutlich höher UND weiter
 * hinten, damit die Schwierigkeit auch in einem sehr guten Lauf noch spürbar weiterwächst.
 */
/**
 * Von 55 auf 70°/Sek. angehoben (Klaus: "Level 1-5 sind nervig, weil sich das Brett so
 * langsam dreht – man schafft es eh, kann aber nicht schnell werfen"). Das eigentliche
 * Problem war nicht die Erfolgschance (die ist in den ersten Leveln absichtlich hoch,
 * 0-1 Hindernisse, siehe `obstacleBaseFor`), sondern das TEMPO-GEFÜHL: bei 55°/Sek.
 * dauert es lange, bis die Scheibe wieder an einer guten Lücke vorbeikommt, obwohl
 * praktisch jeder Treffer sitzt – das fühlt sich nach Warten an, nicht nach Spielen.
 * `FLIGHT_DURATION_MS` (190ms, siehe dort) bewusst NICHT angetastet – das ist die
 * separate, ausführlich hergeleitete Wurf-Fluganimation/Cooldown-Dauer. Netter
 * Nebeneffekt der höheren Basis: bei 70°/Sek. dreht sich die Scheibe in 190ms um
 * ~13,3° (vorher bei 55°/Sek. nur ~10,5°) – Dauertippen ist in den ersten Leveln damit
 * jetzt tatsächlich sicher möglich (kollidiert nicht mehr mit der eigenen letzten
 * Axt), passend dazu, dass man in Level 1-5 ohnehin kaum sterben kann.
 */
export const BASE_SPEED_DEG_PER_SEC = 70;
/**
 * Angehoben von 1.45 auf 1.9 (Klaus' Feedback: "immer noch zu einfach, deutlich
 * schwerer machen"). Level 50 lag vorher bei ~126°/Sek., jetzt bei ~150°/Sek.;
 * Level 100 vorher ~199°/Sek., jetzt ~245°/Sek. – spürbar schneller schon in der
 * Mitte eines Laufs, nicht erst ganz am Ende.
 */
const SPEED_STEP_PER_LEVEL = 1.9;
/** Von 320 auf 400 angehoben, damit der höhere Anstieg pro Level (siehe oben) den
 *  Deckel nicht spürbar früher erreicht als vorher (~Level 183) – bei 1.9°/Level
 *  liegt er jetzt bei Level ~182, also praktisch an derselben Stelle, nur auf
 *  höherem Niveau. */
export const MAX_SPEED_DEG_PER_SEC = 400;

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

/**
 * Wie viele Äxte pro Level (mehr Äxte = voller wird das Brett = enger die Lücken).
 *
 * Fünfter Härte-Durchgang (Klaus: "Durchschnitt Äxte-Anzahl deutlich höher, es ist
 * viel zu einfach die Level"): jede Stufe angehoben (Start 5→6, Deckel 12→19) UND die
 * Stufen erneut früher erreicht. Schnitt über alle 100 vorbereiteten Level springt von
 * ~8,7 auf ~12,7 Äxten – kein Sonderfall nötig, `axeCount` ist überall sonst nur eine
 * Zahl aus `level.axeCount` (siehe `useAxeGame.ts`), die Wurf-/Kollisionslogik selbst
 * bleibt unverändert. Bei sehr hohen Leveln (Deckel 19 + Boss-Bonus 1 = 20, auf ein
 * Brett mit COLLISION_ANGLE_TOLERANCE_DEG=10° pro Axt) wird eine Lücke irgendwann
 * rechnerisch unvermeidbar eng – genau das ist im Highscore-Prinzip (irgendwann
 * stirbt man garantiert) der gewünschte Effekt, kein Bug.
 *
 * Siebter Härte-Durchgang (Klaus: "es soll wirklich schwer sein, über Level 20-25 zu
 * kommen, sehr schwer"): bewusste WALL genau in diesem Fenster statt nur weiterer
 * gleichmäßiger Ramp – Level 20 UND Level 25 sind ohnehin schon Boss-Level
 * (`isBoss()`, `BOSS_EVERY=5`), die Lücke dazwischen war aber bisher nur eine normale
 * Zwischenstufe (9-11 Äxte). Jetzt springt der Wert dort auf 16 (sonst erst ab Level
 * ~43 erreicht), direkt gefolgt von einer kurzen Erholung auf die alte Stufe (11) für
 * Level 26-30, bevor die ursprüngliche Kurve unverändert weiterläuft – ein klar
 * spürbares Nadelöhr statt einer weiteren unauffälligen Zahl in einer langen Rampe.
 * Siehe `obstacleBaseFor` unten für dieselbe Behandlung der Hindernis-Kurve.
 */
function axeCountFor(levelIndex: number): number {
  if (levelIndex < 5) return 6; // Level 1-5
  if (levelIndex < 12) return 7; // Level 6-12
  if (levelIndex < 19) return 9; // Level 13-19
  if (levelIndex < 25) return 16; // Level 20-25 — WALL, direkt an Boss-Level 20 & 25
  if (levelIndex < 30) return 11; // Level 26-30 (kurze Erholung nach der Wall)
  if (levelIndex < 42) return 13; // Level 31-42
  if (levelIndex < 55) return 15; // Level 43-55
  if (levelIndex < 70) return 17; // Level 56-70
  return 19; // ab Level 71
}

/**
 * Grobe Trend-Kurve für Hindernisse – Basis für die tatsächliche Schwankung weiter
 * unten (`obstacleCountFor`), nicht mehr direkt die Ausgabe.
 *
 * Neunter Härte-Durchgang (Klaus, direkt nach dem achten: "die ersten 4 Level sind
 * leider deutlich zu einfach und zu langweilig"): die bisherige Regel "Level 1-3
 * bleiben hindernisfrei, reine Grundmechanik-Einführung" (siehe vorherige Fassung
 * dieses Kommentars) wird hiermit AUFGEHOBEN – Klaus' aktuelles Feedback wiegt
 * schwerer als die alte Design-Entscheidung. Nur noch Level 1 bleibt hindernisfrei
 * (ein einziger ruhiger Eintritts-Wurf, um den Tap-Mechanismus zu zeigen), ab Level 2
 * steht sofort ein Hindernis auf dem Brett.
 */
function obstacleBaseFor(levelIndex: number): number {
  if (levelIndex < 1) return 0; // Level 1: einziger ruhiger Eintritts-Wurf
  if (levelIndex < 4) return 1; // Level 2-4
  if (levelIndex < 6) return 2; // Level 5-6
  if (levelIndex < 10) return 3; // Level 7-10
  if (levelIndex < 19) return 4; // Level 11-19
  if (levelIndex < 25) return 8; // Level 20-25 — WALL, direkt an Boss-Level 20 & 25
  if (levelIndex < 34) return 5; // Level 26-34 (kurze Erholung nach der Wall)
  if (levelIndex < 46) return 6; // ab Level 35
  if (levelIndex < 60) return 7; // ab Level 47
  return 8; // ab Level 61
}

/**
 * Deckel für die tatsächliche (geschwankte) Hindernis-Zahl – höher als die Basis-Kurve
 * oben (8), weil die Schwankung unten gelegentlich darüber hinaus ausschlägt.
 */
export const OBSTACLE_COUNT_CAP = 10;

/**
 * Von Anfang an steckende Äxte als Hindernisse ("viele Messer drin").
 *
 * Dritter Härte-Durchgang (Klaus: "es müssen nicht immer 6 Messer sein, mache
 * unterschiedlich, aber Durchschnitt höher, damit es deutlich schwerer wird"): die
 * alte Fassung gab für einen ganzen Level-Bereich (z.B. Level 35-45) IMMER exakt
 * denselben Wert (6) – langweilig vorhersehbar UND ein Deckel nach oben. Jetzt
 * schwankt die tatsächliche Zahl deterministisch UM die Basis-Kurve
 * (`obstacleBaseFor`) herum: Level 36 kann z.B. 5 Hindernisse haben, Level 37
 * gleich 7 – bei GLEICHEM Level aber immer IDENTISCH (reine Funktion der
 * Levelnummer, kein `Math.random()`, reproduzierbar bei jedem Versuch wie der
 * Rest der Level-Generierung). Die Schwankung ist absichtlich nach OBEN verzerrt
 * (`[-1, 0, 1, 1, 2]` statt symmetrisch `[-2, -1, 0, 1, 2]`) – Schnitt liegt damit
 * bei Basis+0,6, spürbar höher als die alte starre Kurve, nicht nur "mal mehr, mal
 * weniger" bei gleichem Durchschnitt.
 */
function obstacleCountFor(levelIndex: number): number {
  const base = obstacleBaseFor(levelIndex);
  if (base === 0) return 0; // Level 1-3 bleiben bewusst hindernisfrei, keine Schwankung
  const wobbleRoll = (levelIndex * 41 + 17) % 5; // 0-4, deterministisch aus der Levelnummer
  const wobble = [-1, 0, 1, 1, 2][wobbleRoll];
  return Math.max(1, Math.min(OBSTACLE_COUNT_CAP, base + wobble));
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
  // In der Heldenstadt-Welt gibt es keine goldenen Äpfel – dort übernimmt die
  // Sammelfigur (figurineIndexFor) dieselbe Rolle als seltenes Extra-Fundstück.
  if (levelIndex >= HERO_WORLD_START) return undefined;
  const hasGolden = (levelIndex * 131 + 41) % 7 === 0;
  if (!hasGolden) return undefined;
  return (levelIndex * 3) % appleCount;
}

/** Wie viele Diamanten ein goldener Apfel bringt. */
export const GEMS_PER_GOLDEN_APPLE = 3;

/**
 * Ob (und welcher) Apfel eines Heldenstadt-Levels eine Sammelfigur ist – exklusiv für
 * diese Welt, spielt dieselbe Rolle wie der goldene Apfel anderswo (deterministisch
 * aus der Levelnummer, kein `Math.random()`, damit ein Level bei jedem Versuch dieselbe
 * Figur an derselben Stelle hat). Trifft auf jedes 4. Level der Welt zu (5 von 20).
 */
function figurineIndexFor(levelIndex: number, appleCount: number): number | undefined {
  if (appleCount <= 0) return undefined;
  if (levelIndex < HERO_WORLD_START || levelIndex >= HERO_WORLD_START + WORLDS_LEVEL_COUNT) return undefined;
  const withinWorld = levelIndex - HERO_WORLD_START;
  if (withinWorld % 4 !== 0) return undefined;
  return (levelIndex * 5) % appleCount;
}

/** Wie viele Diamanten eine eingetauschte Sammelfigur bringt (siehe Shop-Eintausch). */
export const GEMS_PER_FIGURINE = 2;

/**
 * Dreh-Muster. Nur Level 1 läuft gleichmäßig (Einstieg), ab Level 2 wechselt sich
 * Pulsieren ein. Ab Level 20 gibt es `steady` gar nicht mehr im Zyklus – ab dann ist
 * IMMER etwas in Bewegung (Pulsieren oder Richtungswechsel), nie mehr eine ruhige,
 * gleichmäßige Drehung. Wie erratisch sich Pulsieren/Richtungswechsel selbst anfühlen
 * (Tempo der Schwankung/wie oft die Richtung kippt), skaliert zusätzlich mit dem
 * Board-Tempo – siehe currentSpeed() in TargetBoard.tsx: eine schnellere Scheibe
 * wechselt automatisch auch öfter.
 *
 * Achter Härte-Durchgang (Klaus: "Level 1-10 noch ein Stück schwerer, aber nicht immer
 * mehr Äxte, einfach nur schwerer"): der Richtungswechsel (`reverse`) kam bisher erst
 * ab Level 8 vor UND `steady` blieb bis Level 19 im Zyklus vertreten. Jetzt verschwindet
 * `steady` schon ab Level 5 komplett (nicht erst ab 20) – Level 5-19 laufen jetzt
 * durchgehend mit Pulsieren/Richtungswechsel statt gelegentlich ruhig, ohne dass dafür
 * Axt- oder Hindernis-Zahl angefasst wurde.
 *
 * Neunter Härte-Durchgang (Klaus, direkt danach: "die ersten 4 Level sind zu einfach
 * und zu langweilig"): vorher liefen Level 1-3 (und, je nach Parität, auch Level 5)
 * komplett `steady` – drei bis vier fast identische, ruhige Level hintereinander.
 * Jetzt ist NUR noch Level 1 `steady` (der eine ruhige Eintritts-Wurf, siehe
 * `obstacleBaseFor`), ab Level 2 wechselt sich sofort Pulsieren ein.
 */
function spinPatternFor(levelIndex: number): SpinPattern {
  if (levelIndex < 1) return 'steady';
  if (levelIndex < 5) return levelIndex % 2 === 0 ? 'steady' : 'pulse';
  if (levelIndex < 20) {
    const cycle: SpinPattern[] = ['pulse', 'reverse', 'pulse'];
    return cycle[levelIndex % cycle.length];
  }
  const hardCycle: SpinPattern[] = ['pulse', 'reverse'];
  return hardCycle[levelIndex % hardCycle.length];
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
 *
 * `runSeed` (siehe `SaveData.runSeed` in storage.ts) verschiebt die Rotation UM
 * `runSeed`-viele Stellen (Achter Härte-Durchgang, Klaus: "die Bosse dürfen nicht
 * immer dieselben sein, rotiere sie durch"): Boss-Level 4 (0-basiert, = Level 5) zeigt
 * bei runSeed=0 z.B. `BOSS_FRUITS[0]`, bei runSeed=1 `BOSS_FRUITS[1]`, usw. – OHNE
 * `runSeed` (Standard 0) verhält sich alles exakt wie vorher, bewusst rückwärtskompatibel.
 * Die Shop-Anzeige ("schaltet frei bei Level X", siehe `Shop.tsx`) rechnet weiterhin mit
 * runSeed=0 – das bleibt eine grobe Erst-Runde-Orientierung, keine exakte Garantie mehr,
 * sobald ein Spielstand mehrfach neu gestartet hat.
 */
export function bossFruitForLevel(levelIndex: number, runSeed = 0): BossFruit | null {
  if (!isBossLevel(levelIndex)) return null;
  if (levelIndex >= HERO_WORLD_START) {
    const heroBossNumber = Math.floor((levelIndex - HERO_WORLD_START) / BOSS_EVERY);
    return HERO_BOSSES[(heroBossNumber + runSeed) % HERO_BOSSES.length];
  }
  const bossNumber = Math.floor(levelIndex / BOSS_EVERY); // 0-basiert
  return BOSS_FRUITS[(bossNumber + runSeed) % BOSS_FRUITS.length];
}

/**
 * `runSeed` verschiebt zusätzlich die Apfel-/Hindernis-Winkel-Seeds (Achter
 * Härte-Durchgang, Klaus: "die Level-Reihenfolge darf nicht dieselbe sein, mach ein
 * paar neue Level und rotiere sie durch"): eine komplett neue Level-Bibliothek zu
 * bauen hätte die ganze bisherige, sorgfältig austarierte Schwierigkeits-Kurve
 * (Axt-/Hindernis-Zahl, Tempo, Dreh-Muster – alles weiterhin NUR von `levelIndex`
 * abhängig) unnötig verdoppelt. Stattdessen bekommt jede Runde ihre eigene, aber
 * genauso deterministische Anordnung der Äpfel/Hindernisse auf der Scheibe – Level 12
 * sieht in Runde 3 anders aus als in Runde 1, bleibt aber INNERHALB einer Runde bei
 * jedem Versuch identisch (kein `Math.random()`, wie der Rest der Level-Generierung).
 */
function generateLevel(levelIndex: number, runSeed: number): LevelConfig {
  const boss = bossFruitForLevel(levelIndex, runSeed);
  // Weltboss: das "Tor" am ersten Level jeder Welt (außer Wald/Tutorial-Level 1,
  // siehe isWorldBossLevel()) – eine deutlich größere Prüfung als ein normaler
  // 5-Level-Boss. Die beiden schließen sich gegenseitig aus (kein Level-Index ist
  // gleichzeitig Vielfaches von BOSS_EVERY UND ein Welt-Start, außer Level 0 selbst,
  // das per isWorldBossLevel() ohnehin ausgeschlossen ist).
  const worldBoss = isWorldBossLevel(levelIndex) ? worldForLevel(levelIndex) : null;

  /*
   * Boss-Level sollen sich wie eine echte Prüfung anfühlen, nicht wie ein normales
   * Level mit anderer Farbe – aber NUR über TEMPO und Dreh-Muster, nicht über mehr
   * Äxte/Hindernisse. Frühere Fassungen gaben zusätzlich einen Axt-/Hindernis-Bonus
   * obendrauf (+1/+2 bei Fruchtbossen, +1/+1 bei Weltbossen) UND bei Weltbossen noch
   * Zacken-Hindernisse dazu – Klaus' Feedback danach: "die Bosse sind wieder deutlich
   * zu schwer, viel zu viele Äxte, die Zacken sind unnötig, lass die weg – Tempo und
   * Richtungswechsel passen aber". Beide Boni deshalb wieder entfernt: `axeCountFor`/
   * `obstacleCountFor` haben an GENAU diesen Level-Indizes (20/25, 40/45, ...) ohnehin
   * schon eine eigene, scharfe "Wall"-Stufe (siehe deren Kommentare, "direkt an
   * Boss-Level") – das allein macht ein Boss-Level schon voller als seine Nachbarn,
   * ein zusätzlicher Bonus obendrauf war zu viel. Übrig bleiben zwei Stellschrauben:
   *  - Tempo-Bonus (+28°/Sek. Fruchtboss, +45°/Sek. Weltboss).
   *  - Erzwungenes Dreh-Muster (`pulse` bzw. `reverse` – unvorhersehbarer als
   *    `spinPatternFor()` an genau dieser Stelle liefern würde).
   * Bei Weltbossen kommt zusätzlich die Phasen-Eskalation aus `worldBossPhaseSpeedMultiplier()`/
   * `worldBossPhaseSpinPattern()` weiter unten dazu (WÄHREND des Kampfes, nicht am
   * Levelstart) – die blieb unangetastet, genau die fand Klaus gut so.
   *
   * Nochmal nachgeschärft (Klaus, nach dem ersten echten Ausprobieren ohne Zacken/
   * Extra-Äxte: "Weltbosse noch einfacher, Fruchtbosse etwas schwerer"): der
   * Tempo-Sockel des Weltbosses (45°/Sek.) senkt sich auf 30°/Sek. – bleibt aber
   * unter der Phasen-Eskalation weiterhin bis auf das ×1,3-fache steigend (siehe
   * oben), ein Weltboss-Kampf wird also immer noch spürbar schwerer WÄHREND des
   * Kampfes, startet jetzt aber deutlich entspannter. Der Fruchtboss-Sockel steigt
   * im Gegenzug von 28 auf 38°/Sek. – dadurch liegt er jetzt sogar ÜBER dem
   * Weltboss-Basiswert, was auf den ersten Blick seltsam wirkt, aber Absicht ist:
   * ein Weltboss bleibt trotzdem insgesamt die größere Prüfung, weil NUR er die
   * Phasen-Eskalation UND das erzwungene `reverse`-Muster (unvorhersehbarer als
   * `pulse`) bekommt – ein Fruchtboss ist dafür von Anfang bis Ende gleichmäßig
   * etwas zackiger, ohne eigene Eskalation.
   *
   * Noch eine kleine Stufe leiser (Klaus: "besser, aber immer noch bisschen zu
   * schwer" – nach dem Hindernis-Deckel oben war Tempo der letzte verbliebene
   * Hebel): 30 -> 22°/Sek. Sockel. Siehe auch `worldBossPhaseSpeedMultiplier()`
   * weiter unten – die Phasen-Spitze wurde im selben Zug von ×1,3 auf ×1,2
   * abgeschwächt, damit sich die Eskalation zum Ende hin nicht mehr so extrem
   * anfühlt wie mit dem alten (höheren) Sockel.
   */
  const axeCount = axeCountFor(levelIndex);
  const speedBonus = worldBoss ? 22 : boss ? 38 : 0;
  const boardSpeedDegPerSec = Math.round(
    Math.min(MAX_SPEED_DEG_PER_SEC, BASE_SPEED_DEG_PER_SEC + levelIndex * SPEED_STEP_PER_LEVEL + speedBonus),
  );

  // Zwei teilerfremde Faktoren, damit sich Apfel- und Hindernis-Positionen über die
  // Level nicht in kurzen Zyklen wiederholen. `runSeed` mit EIGENEN, wieder teilerfremden
  // Faktoren (53, 97) verschoben, damit eine neue Runde eine spürbar andere Anordnung
  // bekommt statt nur alle Winkel um denselben Betrag zu drehen (das sähe bei gleicher
  // Apfel-/Hindernis-ZAHL optisch identisch aus, nur "gedreht").
  const appleSeed = normalizeDeg(levelIndex * 47 + 31 + runSeed * 53);
  const obstacleSeed = normalizeDeg(levelIndex * 79 + 113 + runSeed * 97);

  /*
   * Weltboss-Level liegen IMMER auf einem Welt-Start-Index (20/40/60/80/100) – bei
   * genau diesen Level-Indizes liefert `obstacleCountFor()` fast durchgehend einen
   * hohen Wert (8-10, siehe deren Kommentar zur "Wall"-Stufe bei 20-25 bzw. dem
   * Kurven-Ende ab Level 61), weil das rein zufällig mit der normalen
   * Schwierigkeits-Kurve zusammenfällt – NICHT, weil ein Weltboss das bräuchte.
   * Klaus nach erneutem Testen: "weniger Messer beim Weltboss, es ist zu schwer".
   * Deshalb ein fester, niedriger Deckel NUR für Weltboss-Level, unabhängig davon,
   * was die normale Kurve an dieser Stelle sonst liefern würde – die Schwierigkeit
   * eines Weltboss-Kampfes kommt jetzt (siehe oben) ohnehin fast komplett aus Tempo
   * und Dreh-Muster, nicht aus einem vollgestellten Brett.
   */
  const obstacleCount = worldBoss ? Math.min(obstacleCountFor(levelIndex), 4) : obstacleCountFor(levelIndex);
  const appleCount = appleCountFor(levelIndex);

  return {
    axeCount,
    boardSpeedDegPerSec,
    spinPattern: worldBoss ? 'reverse' : boss ? 'pulse' : spinPatternFor(levelIndex),
    appleAngles: spreadAngles(appleCount, appleSeed),
    preplacedAxeAngles: obstacleCount > 0 ? spreadAngles(obstacleCount, obstacleSeed) : undefined,
    bossFruitId: boss?.id,
    worldBossId: worldBoss?.id,
    goldenAppleIndex: goldenAppleIndexFor(levelIndex, appleCount),
    figurineIndex: figurineIndexFor(levelIndex, appleCount),
  };
}

/**
 * Phasen-Eskalation WÄHREND eines Weltboss-Kampfes: `progress` ist der Anteil bereits
 * geworfener Äxte (`axesThrown / axeCount`, 0 bis knapp unter 1). Die ersten ~40% laufen
 * beim regulären Weltboss-Tempo (siehe `speedBonus` oben, "Phase 1: Muster lernen"), die
 * mittleren ~35% ziehen deutlich an ("Phase 2: schneller, mehr Druck"), das letzte
 * knappe Viertel ist die Spitze ("Phase 3: hoher Druck, anspruchsvolles Timing"). Bewusst
 * eine reine Multiplikator-Funktion statt zusätzlicher Hindernisse – Hindernisse liegen
 * seit Levelstart fest, das Tempo lässt sich dagegen sauber ohne Struktur-Änderung pro
 * Wurf variieren (siehe `boardSpeedDegPerSec` in `useAxeGame.ts`).
 *
 * WICHTIG (beim Gegenlesen gefunden, bevor es zum Bug wurde): dieser Multiplikator
 * wirkt in `useAxeGame.ts` NACH `BOARD_SPEED_MULTIPLIER` (1,25, seit der entfernten
 * Schwierigkeitsgrad-Auswahl immer aktiv) UND nach dem `MAX_SPEED_DEG_PER_SEC`-Deckel
 * in `generateLevel()` – beide Deckel greifen hier also nicht mehr, die Werte
 * multiplizieren sich stattdessen. Beim schwersten Weltboss (Heldenstadt/Turmbrecher,
 * Level 101) wäre Phase 3 mit den ursprünglich geplanten ×1,7 auf über 600°/Sek.
 * gekommen (mehr als 90° Board-Drehung während einer einzelnen 140ms-Flugzeit) – das
 * hätte sich nicht mehr nach "schwer, aber lernbar" angefühlt, sondern nach reinem
 * Zufall. Deshalb bewusst konservativer: ×1 / ×1,15 / ×1,3 statt ×1 / ×1,35 / ×1,7.
 *
 * Nochmal leicht abgeschwächt auf ×1 / ×1,15 / ×1,2 (Klaus: "besser, aber immer noch
 * bisschen zu schwer", im selben Zug wie die Senkung des Tempo-Sockels oben) – die
 * Spitze in Phase 3 war zusammen mit dem alten Sockel spürbar zu hart.
 */
export function worldBossPhaseSpeedMultiplier(progress: number): number {
  if (progress < 0.4) return 1;
  if (progress < 0.75) return 1.15;
  return 1.2;
}

/**
 * Zweite Zutat der Phasen-Eskalation (Klaus: "mehrere Pflicht-Phasen, richtig schwer,
 * kein First-Try"): nicht nur schneller, das Dreh-MUSTER selbst wechselt mitten im
 * Kampf – dieselben `progress`-Schwellen wie oben, damit beide Eskalationen synchron
 * "einrasten". `generateLevel()` setzt für Weltboss-Level fest `'reverse'` als
 * Basis-Muster; das gilt nur für Phase 1 (Muster kennenlernen). Phase 2 wechselt hart
 * auf `'pulse'` – ein Spieler, der sich gerade an Richtungswechsel gewöhnt hat, muss
 * plötzlich auf schwankendes Tempo umschalten, nicht nur schneller vom Gleichen. Phase 3
 * geht zurück zu `'reverse'`, jetzt aber mit dem ×1.2-Tempo-Bonus von oben kombiniert –
 * die unvorhersehbarste Kombination kommt bewusst zuletzt, wenn der Spieler ohnehin
 * schon am wenigsten Puffer hat. Nur für Weltbosse relevant (siehe `useAxeGame.ts`,
 * angewendet anstelle von `level.spinPattern`) – normale Level und Fruchtbosse behalten
 * ihr festes, für die gesamte Levellänge gleichbleibendes Muster.
 */
export function worldBossPhaseSpinPattern(progress: number): SpinPattern {
  if (progress < 0.4) return 'reverse';
  if (progress < 0.75) return 'pulse';
  return 'reverse';
}

export const LEVEL_COUNT = DIFFICULTY_TIERS * VARIATIONS_PER_TIER;

/**
 * Level-Konfiguration für einen BELIEBIGEN Index – auch jenseits der 100 fest
 * vorbereiteten Level. Trägt den Endlos-Modus: `generateLevel()` ist eine reine
 * Funktion von Levelnummer UND `runSeed` ohne eingebaute Obergrenze (Tempo deckelt
 * sich selbst bei MAX_SPEED_DEG_PER_SEC, Axt-/Hindernis-/Apfelzahl bei den letzten
 * `if`-Stufen, der Boss-Zyklus und die goldene-Apfel-Formel laufen über Modulo) –
 * jenseits von Level 100 musste dafür nichts Neues gebaut werden.
 *
 * Früher gab es hier ein vorberechnetes Array für die ersten 100 Level (billiger als
 * jedes Mal neu rechnen). Seit `runSeed` mit reinspielt (Achter Härte-Durchgang,
 * Boss-/Level-Rotation) ist das Ergebnis nicht mehr nur von `levelIndex` allein
 * abhängig – ein statisches Array pro `levelIndex` hätte für jede neue Runde eine
 * eigene Cache-Invalidierung gebraucht. `generateLevel()` ist reine Arithmetik über
 * wenige Zahlen (kein Array-Scan, keine Rekursion), das direkte Neuberechnen bei jedem
 * Aufruf ist spürbar günstiger als die dafür nötige Cache-Verwaltung.
 */
export function levelConfigAt(levelIndex: number, runSeed = 0): LevelConfig {
  return generateLevel(levelIndex, runSeed);
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
/**
 * XP für ein geschafftes Level – fest, unabhängig von Levelnummer/Serie/Perfekt-Bonus
 * (bewusst simpel gehalten, im Gegensatz zu den Münzen). XP ist eine EIGENE, DAUERHAFTE
 * Ressource (übersteht ein Game Over, anders als der Lauf-Fortschritt selbst) und
 * schaltet Welten frei – siehe `worldForLevel`/`WORLDS` in `worlds.ts` für die
 * Level-Bereiche, aus denen sich die Schwellenwerte ableiten (`startLevelIndex *
 * XP_PER_LEVEL`), und `WorldMap.tsx` für die Freischalt-Prüfung selbst.
 */
export const XP_PER_LEVEL = 10;
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
 * Tägliche Belohnung: 7-Tage-Zyklus, der sich danach wiederholt (Tag 8 = wieder
 * Tag-1-Belohnung). Steigt bewusst nicht linear ins Unermessliche – am Wochenende
 * (Tag 4 und 6) gibt es schon mal einen Diamanten als kleinen Vorgeschmack, Tag 7
 * ist der große Abschluss. Siehe game/daily.ts für die Serien-Berechnung.
 */
export const DAILY_REWARDS: { coins: number; gems: number }[] = [
  { coins: 20, gems: 0 },
  { coins: 30, gems: 0 },
  { coins: 40, gems: 0 },
  { coins: 0, gems: 1 },
  { coins: 60, gems: 0 },
  { coins: 0, gems: 2 },
  { coins: 100, gems: 3 },
];

/**
 * Früher ein wählbarer Schwierigkeitsgrad (Leicht/Normal/Schwer) in den Einstellungen –
 * auf Klaus' Wunsch entfernt ("die Wahl soll weg, es soll automatisch immer nur eine
 * geben, und die soll schwer sein"). Übrig bleiben die beiden "Schwer"-Werte, jetzt
 * bedingungslos für JEDEN Lauf angewendet statt nur bei aktiver Auswahl. Rührt bewusst
 * NICHT an `generateLevel()` selbst – die Level-Formel bleibt eine einzige, für alle
 * geltende Kurve. Schneller drehen UND mehr Münzen hängen bewusst zusammen – das Risiko
 * soll sich auch lohnen.
 */
export const BOARD_SPEED_MULTIPLIER = 1.25;
export const REWARD_MULTIPLIER = 1.4;
