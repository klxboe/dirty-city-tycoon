import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Axe } from './Axe';
import { Apple } from './Apple';
import { normalizeAngle } from '../game/engine';
import { AXE_EMBED_DEPTH_PX, BASE_SPEED_DEG_PER_SEC, HIT_STOP_MS, MAX_SPEED_DEG_PER_SEC } from '../game/constants';
import { boardStyleVars } from '../game/shop';
import { getBoardImage } from '../game/boardImages';
import type { Apple as AppleData, SpinPattern, StuckAxe } from '../game/types';
import './TargetBoard.css';

export interface TargetBoardHandle {
  /** Aktueller Rotationswinkel der Scheibe (Grad). Live, ohne über React-State zu gehen. */
  getAngleDeg: () => number;
  /** Horizontale Bildschirm-Mitte der Scheibe (px). Basis fürs Zielen: Tippposition minus diesem Wert. */
  getCenterX: () => number;
  /**
   * Tatsächliche Lage und Größe der Scheibe auf dem Bildschirm (px).
   * Nötig, damit der Axt-Flug GENAU am Scheibenrand endet: eine feste Prozent-Höhe
   * im CSS kann das nicht, weil die Scheibe mittig in einer flexiblen Zone sitzt und
   * ihre Position deshalb von der Bildschirmhöhe abhängt.
   */
  getGeometry: () => { centerX: number; centerY: number; radius: number } | null;
  /**
   * "Hit-Stop": hält die Drehung für einen Sekundenbruchteil an und lässt die Scheibe
   * kurz zusammenzucken. Läuft bewusst über den Handle statt über eine Prop, damit der
   * Treffer keinen React-Re-Render der ganzen App auslöst – dieselbe Überlegung wie
   * bei der Rotation selbst (siehe Kommentar oben).
   */
  punch: () => void;
}

interface TargetBoardProps {
  speedDegPerSec: number;
  /** Dreh-Muster des Levels: gleichmäßig, pulsierend oder mit Richtungswechseln. */
  spinPattern: SpinPattern;
  /** Rotation anhalten (z.B. wenn das Level fertig ist). */
  paused: boolean;
  stuckAxes: StuckAxe[];
  apples: AppleData[];
  /** ID des ausgerüsteten Scheiben-Skins (siehe shop.ts), steuert nur die Optik. */
  boardSkin: string;
  /** ID des ausgerüsteten Axt-Skins, damit steckende Äxte wie die geworfene aussehen. */
  axeSkin: string;
  /** true, wenn die letzte Axt des Levels gerade sauber getroffen hat – zeigt einen Riss-Effekt. */
  broken?: boolean;
}

/** Anzahl der radialen Segmente auf der Scheibe (rein optisch, wie Stamm-Spalten). */
const WEDGE_COUNT = 16;

/** Winkel, an denen kleine Glanzpunkte um den Kern herum aufblitzen. */
const BULLSEYE_SPARKLE_ANGLES = [20, 130, 250];

/** Winkel für den kleinen Blatt-/Saft-Spritzer beim Apfel-Abwurf. */
const APPLE_BURST_ANGLES = [-60, -10, 40, 100, 160, 220];

/** Wie lange ein abgeworfener Apfel sichtbar herunterfällt (ms). Muss zur CSS-Animation passen. */
const APPLE_FALL_MS = 900;

/**
 * Ein Apfel, der gerade abfällt. Die Position wird EINMAL beim Abwerfen in
 * Bildschirm-Koordinaten (relativ zur Scheibenmitte) festgehalten. Würde er stattdessen
 * im rotierenden Brett hängen bleiben, würde er beim Fallen mitkreiseln statt nach unten
 * zu fallen – deshalb liegt er in einer eigenen, nicht rotierenden Ebene.
 */
interface FallingApple {
  key: number;
  x: number;
  y: number;
  golden: boolean;
  figurine: boolean;
}

/**
 * Wie lange ein voller Puls-Zyklus dauert (Sek.) bzw. wie lange bis zum Richtungswechsel –
 * bei Level 1-Tempo (`BASE_SPEED_DEG_PER_SEC`). Bei höherem Tempo wird daraus linear
 * interpoliert bis zu den `..._AT_MAX`-Werten bei `MAX_SPEED_DEG_PER_SEC` – eine schnell
 * drehende Scheibe pulsiert/wechselt also automatisch auch öfter, nicht nur schneller.
 * Genau das war Klaus' Wunsch nach mehr Härte in höheren Leveln ("Richtungswechsel,
 * schneller langsamer"): bisher blieben BEIDE Perioden über alle Level hinweg fest, nur
 * die Grundgeschwindigkeit stieg – die Muster selbst fühlten sich dadurch bei Level 100
 * genauso "gemächlich" an wie bei Level 10, nur eben schneller abgespult.
 */
/**
 * Zweiter Härte-Durchgang (Klaus: "immer noch zu einfach, deutlich schwerer"): alle
 * vier Perioden verkürzt, damit Pulsieren/Richtungswechsel öfter zuschlagen – sowohl
 * gleich zu Level-1-Tempo als auch am Tempo-Deckel. Die Fairness-Untergrenze
 * (Puls-Faktor nie unter 0.55, siehe currentSpeed()) bleibt davon unberührt – nur WIE
 * OFT gewechselt wird, nicht WIE TIEF.
 */
const PULSE_PERIOD_SEC = 2.2;
const PULSE_PERIOD_AT_MAX_SEC = 0.75;
const REVERSE_PERIOD_SEC = 2.9;
const REVERSE_PERIOD_AT_MAX_SEC = 1.0;

/** Linear zwischen dem Level-1-Wert und dem `..._AT_MAX`-Wert interpoliert, je nach
 *  aktuellem Grundtempo relativ zur Spanne aus BASE_SPEED_DEG_PER_SEC..MAX_SPEED_DEG_PER_SEC. */
function periodFor(baseSpeed: number, atRef: number, atMax: number): number {
  const t = Math.min(
    1,
    Math.max(0, (Math.abs(baseSpeed) - BASE_SPEED_DEG_PER_SEC) / (MAX_SPEED_DEG_PER_SEC - BASE_SPEED_DEG_PER_SEC)),
  );
  return atRef + (atMax - atRef) * t;
}

/**
 * Momentane Winkelgeschwindigkeit je nach Dreh-Muster.
 * `elapsed` ist die Laufzeit des Levels in Sekunden.
 *
 * WICHTIG fürs Balancing: kein Muster darf die Geschwindigkeit auf ~0 bringen. Steht die
 * Scheibe kurz still, landen zwei schnell hintereinander geworfene Äxte an derselben
 * Stelle – mit der Game-Over-Regel wäre das ein unfairer Instant-Tod. Deshalb liegt der
 * Puls-Faktor nie unter 0.55 und der Richtungswechsel springt hart statt weich durch null.
 * Das gilt unverändert auch mit den kürzeren Perioden oben – nur WIE OFT gewechselt wird
 * steigt mit dem Level, nie WIE TIEF der Puls-Faktor fällt.
 */
function currentSpeed(baseSpeed: number, pattern: SpinPattern, elapsed: number): number {
  switch (pattern) {
    case 'pulse': {
      const period = periodFor(baseSpeed, PULSE_PERIOD_SEC, PULSE_PERIOD_AT_MAX_SEC);
      const phase = (elapsed / period) * Math.PI * 2;
      return baseSpeed * (1.05 + 0.5 * Math.sin(phase));
    }
    case 'reverse': {
      const period = periodFor(baseSpeed, REVERSE_PERIOD_SEC, REVERSE_PERIOD_AT_MAX_SEC);
      const halfCycles = Math.floor(elapsed / period);
      return halfCycles % 2 === 0 ? baseSpeed : -baseSpeed;
    }
    default:
      return baseSpeed;
  }
}

export const BOARD_SIZE = 260;
/** Radius, auf dem die Äxte im Holz stecken – etwas INNERHALB des Rands (130), damit sie im Holz sitzen. */
export const BOARD_RADIUS = 120;
/**
 * Steck-Radius als Anteil des Scheiben-Radius (120 von 130).
 *
 * Nötig, weil Zielen und Flugbahn mit der GEMESSENEN Scheibengröße rechnen, die
 * Äxte aber auf dem festen Wert 120 stecken. Ohne diesen Faktor liefen beide
 * auseinander: der Flug endete auf Radius 130, die Axt steckte danach auf 120 –
 * ein sichtbarer Sprung von 10px, und der Späne-Burst saß daneben.
 */
export const AXE_STICK_RATIO = BOARD_RADIUS / (BOARD_SIZE / 2);
/**
 * Tatsächlicher Render-Radius für steckende Äxte – `BOARD_RADIUS` MINUS die
 * Einstecktiefe (`AXE_EMBED_DEPTH_PX`, `constants.ts`), damit diese Position exakt dort
 * landet, wo die Flugbahn in App.tsx bereits hinzielt (`stickRadiusPx() +
 * AXE_EMBED_DEPTH_PX`, dieselbe Zahl, nur an der Flugseite als Zuschlag statt als Abzug
 * formuliert). GEFUNDENER BUG (Mikro-Ruckler beim Einschlag + "Axt schwebt vor der
 * Scheibe"): vorher stand hier einfach `BOARD_RADIUS` ohne den Abzug – die fliegende Axt
 * landete sichtbar 6px weiter innen, als die Axt eine Render-Vorlage später als
 * "steckend" erschien, macht sich als kleiner Sprung GENAU im Einschlagmoment bemerkbar.
 * Siehe ausführliche Herleitung im Kommentar bei `AXE_EMBED_DEPTH_PX`.
 */
const STUCK_AXE_RADIUS = BOARD_RADIUS - AXE_EMBED_DEPTH_PX;
/** Bewusst GRÖSSER als der Board-Radius: die Äpfel hängen außen am Rand, nicht auf dem Holz. */
const APPLE_RADIUS = 152;
const APPLE_STEM_LENGTH = 20;
const APPLE_STEM_RADIUS = 128 + APPLE_STEM_LENGTH / 2;

/**
 * Die Zielscheibe dreht sich per eigenem requestAnimationFrame-Loop, der DIREKT das
 * DOM-Element schreibt (kein React-State pro Frame). So läuft die Drehung butterweich,
 * ohne dass bei jedem Frame die ganze App neu gerendert wird. Andere Komponenten
 * (useAxeGame) lesen den aktuellen Winkel bei Bedarf über `getAngleDeg()`.
 */
export const TargetBoard = forwardRef<TargetBoardHandle, TargetBoardProps>(function TargetBoard(
  { speedDegPerSec, spinPattern, paused, stuckAxes, apples, boardSkin, axeSkin, broken = false },
  ref,
) {
  const boardElRef = useRef<HTMLDivElement>(null);
  const mountElRef = useRef<HTMLDivElement>(null);
  /** Bis zu diesem Zeitpunkt steht die Drehung still (Hit-Stop beim Treffer). */
  const freezeUntilRef = useRef(0);
  const angleRef = useRef(0);
  const speedRef = useRef(speedDegPerSec);
  const patternRef = useRef(spinPattern);
  const pausedRef = useRef(paused);
  /** Laufzeit seit Level-Start (Sek.), Basis für Puls und Richtungswechsel. */
  const elapsedRef = useRef(0);

  const boardImage = getBoardImage(boardSkin);

  const [fallingApples, setFallingApples] = useState<FallingApple[]>([]);
  const collectedIdsRef = useRef<Set<number>>(new Set());
  const fallKeyRef = useRef(0);

  speedRef.current = speedDegPerSec;
  patternRef.current = spinPattern;
  pausedRef.current = paused;

  // Bei jedem neuen Level (= neues Dreh-Muster/Tempo) wieder bei Phase 0 anfangen,
  // damit ein Level nicht zufällig mitten in einer Rückwärtsphase startet.
  useEffect(() => {
    elapsedRef.current = 0;
  }, [spinPattern, speedDegPerSec]);

  // Neu abgeworfene Äpfel erkennen und an ihrer aktuellen Bildschirmposition fallen lassen.
  useEffect(() => {
    const collected = collectedIdsRef.current;
    const freshlyCollected = apples.filter((apple) => apple.collected && !collected.has(apple.id));

    // Level-Wechsel: die Merkliste enthält IDs, die es nicht mehr gibt -> zurücksetzen.
    const stillPresent = new Set(apples.map((a) => a.id));
    collected.forEach((id) => {
      if (!stillPresent.has(id)) collected.delete(id);
    });
    apples.forEach((apple) => {
      if (!apple.collected) collected.delete(apple.id);
    });

    if (freshlyCollected.length === 0) return;

    const neu = freshlyCollected.map((apple) => {
      collected.add(apple.id);
      // Weltwinkel des Apfels im Moment des Abwurfs -> Position relativ zur Scheibenmitte.
      const worldDeg = angleRef.current + apple.boardLocalAngleDeg;
      const rad = (worldDeg * Math.PI) / 180;
      return {
        key: fallKeyRef.current++,
        x: APPLE_RADIUS * Math.sin(rad),
        y: -APPLE_RADIUS * Math.cos(rad),
        golden: apple.golden,
        figurine: apple.figurine,
      };
    });

    setFallingApples((prev) => [...prev, ...neu]);
    const keys = new Set(neu.map((a) => a.key));
    const timeout = setTimeout(() => {
      setFallingApples((prev) => prev.filter((a) => !keys.has(a.key)));
    }, APPLE_FALL_MS);
    return () => clearTimeout(timeout);
  }, [apples]);

  useImperativeHandle(ref, () => ({
    getAngleDeg: () => angleRef.current,
    getCenterX: () => {
      const el = boardElRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.left + rect.width / 2;
    },
    getGeometry: () => {
      const el = boardElRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        radius: rect.width / 2,
      };
    },
    punch: () => {
      freezeUntilRef.current = performance.now() + HIT_STOP_MS;
      // Das Zusammenzucken läuft auf der HÜLLE, nicht auf der Scheibe selbst: die trägt
      // schon die Inline-Rotation aus dem rAF-Loop, eine CSS-Animation auf derselben
      // Eigenschaft würde die Drehung kurz überschreiben und sichtbar zurückspringen
      // lassen (derselbe Grund wie beim Riss-Effekt, siehe TargetBoard.css).
      const huelle = mountElRef.current;
      if (huelle) {
        huelle.classList.remove('target-mount--hit');
        void huelle.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
        huelle.classList.add('target-mount--hit');
      }
    },
  }));

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      // Zeitschritt deckeln. Ohne das springt die Scheibe nach jeder Pause im
      // Frame-Takt schlagartig weiter: der Browser hält requestAnimationFrame an,
      // solange der Tab im Hintergrund ist (auf dem Handy: sobald man die App
      // wegwischt). Beim Zurückkommen wäre der erste Zeitschritt die GESAMTE
      // Pausendauer – die Scheibe würde um hunderte Grad teleportieren, mitten in
      // ein Spiel, in dem die genaue Position über Sieg und Niederlage entscheidet.
      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Hit-Stop: Zeit läuft weiter (lastTime ist schon gesetzt), nur gedreht wird
      // nicht. Dadurch springt die Scheibe danach nicht nach, sondern macht einfach
      // dort weiter, wo sie stand.
      if (!pausedRef.current && now >= freezeUntilRef.current) {
        elapsedRef.current += deltaSeconds;
        const speed = currentSpeed(speedRef.current, patternRef.current, elapsedRef.current);
        angleRef.current = normalizeAngle(angleRef.current + speed * deltaSeconds);
        if (boardElRef.current) {
          boardElRef.current.style.transform = `rotate(${angleRef.current}deg)`;
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={mountElRef} className="target-mount">
      {/* Nicht rotierende Ebene für abgeworfene Äpfel – sie sollen senkrecht fallen,
          nicht mit der Scheibe mitkreiseln. */}
      <div className="target-mount__falling">
        {fallingApples.map((apple) => (
          <span
            key={apple.key}
            className="falling-apple"
            style={{ left: `calc(50% + ${apple.x}px)`, top: `calc(50% + ${apple.y}px)` }}
          >
            {/* Kleiner Blatt-/Saft-Spritzer im Moment des Abfallens – nur bei echten
                Früchten, eine Sammelfigur "spritzt" nicht. Läuft einmalig und kürzer
                als der Fall selbst, dieselbe Herkunfts-Koordinate wie der Apfel. */}
            {!apple.figurine && (
              <span className="falling-apple__burst">
                {APPLE_BURST_ANGLES.map((angle, i) => (
                  <span key={i} className="falling-apple__bit" style={{ ['--bit-angle' as string]: `${angle}deg` }} />
                ))}
              </span>
            )}
            <Apple size={30} golden={apple.golden} figurine={apple.figurine} />
          </span>
        ))}
      </div>

      <div
        ref={boardElRef}
        className="target-board"
        style={boardStyleVars(boardSkin) as React.CSSProperties}
      >
        {boardImage ? (
          /* Echter Bild-Skin (siehe game/boardImages.ts): ersetzt die komplette
             CSS-gezeichnete Fläche (Holz/Ringe/Kern) durch ein Bild. Rotation,
             steckende Äxte, hängende Äpfel und der Riss-Effekt sind eigene
             Ebenen darüber/danach und bleiben unverändert. */
          <img className="target-board__image" src={boardImage} alt="" draggable={false} />
        ) : (
          <>
            {/* Holzfläche mit radialen Segmenten – wie ein aufgeschnittener Stamm. */}
            <div className="target-board__face" />
            <div className="target-board__wedges">
              {Array.from({ length: WEDGE_COUNT }).map((_, i) => (
                <span key={i} style={{ transform: `rotate(${(360 / WEDGE_COUNT) * i}deg)` }} />
              ))}
            </div>
            {/* Zwei Muster-Ringe aus feinen/groben Strichen (per repeating-conic-gradient +
                Masken-Ring – kostet keine zusätzlichen DOM-Knoten pro Strich) für mehr
                Detail, wie Gradeinteilungen auf einer Zielscheibe/einem Kompass. */}
            <div className="target-board__ticks target-board__ticks--fine" />
            <div className="target-board__ring target-board__ring--outer" />
            <div className="target-board__ring target-board__ring--mid" />
            <div className="target-board__ticks target-board__ticks--rim" />
            {/* Glanzlicht: gibt der Fläche etwas Tiefe/Politur, ohne die Skin-Farben
                selbst anzufassen (sitzt als Blend-Layer oben drauf). */}
            <div className="target-board__sheen" />
            {/* Langsam wandernder Glanz-Streifen – eigenes Element mit EIGENER Rotation,
                damit es nicht mit der inline gesetzten Dreh-Animation der Scheibe selbst
                kollidiert (derselbe Trick wie beim Hit-Stop). Macht die Fläche auch dann
                lebendig, wenn die Scheibe zwischen Leveln kurz pausiert. */}
            <div className="target-board__shimmer" />
            <div className="target-board__bullseye">
              <div className="target-board__bullseye-ring" />
              {BULLSEYE_SPARKLE_ANGLES.map((angle, i) => (
                <span
                  key={i}
                  className="target-board__bullseye-sparkle"
                  style={{
                    ['--sparkle-angle' as string]: `${angle}deg`,
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {apples
          .filter((apple) => !apple.collected)
          .map((apple) => (
            <div key={apple.id}>
              <div
                className="target-board__apple-stem"
                style={{
                  transform: `translate(-50%, -50%) rotate(${apple.boardLocalAngleDeg}deg) translateY(-${APPLE_STEM_RADIUS}px)`,
                  height: APPLE_STEM_LENGTH,
                }}
              />
              <div
                className="target-board__apple-slot"
                style={{ transform: `translate(-50%, -50%) rotate(${apple.boardLocalAngleDeg}deg) translateY(-${APPLE_RADIUS}px)` }}
              >
                {/* Leichtes Pendeln am Stiel, mit Versatz je Apfel (aus der ID), damit
                    sie nicht alle im Gleichtakt schwingen – sonst wirkt das Brett
                    zwischen den Würfen komplett reglos. Eigenes Kind-Element, damit die
                    Animation NICHT mit dem inline gesetzten Positionierungs-Transform
                    oben kollidiert (derselbe Trick wie beim Axt-Zusammenzucken). */}
                <span
                  className="target-board__apple-sway"
                  style={{ animationDelay: `${(apple.id % 4) * 0.35}s` }}
                >
                  <Apple size={30} golden={apple.golden} figurine={apple.figurine} />
                </span>
              </div>
            </div>
          ))}

        {stuckAxes.map((axe) => (
          <div
            key={axe.id}
            className="target-board__axe-slot"
            style={{
              transform: `translate(-50%, -50%) rotate(${axe.boardLocalAngleDeg}deg) translateY(-${STUCK_AXE_RADIUS}px)`,
            }}
          >
            <div className="target-board__axe-flip target-board__axe-flip--landed">
              <Axe size={40} skin={axeSkin} />
            </div>
          </div>
        ))}

        {broken && <div className="target-board__flash" />}

        {broken && (
          <svg className="target-board__cracks" viewBox="0 0 260 260">
            <path
              d="M130 130 L88 48 M130 130 L186 36 M130 130 L24 110 M130 130 L38 186 M130 130 L124 242 M130 130 L224 148 M130 130 L204 216"
              stroke="#1b1206"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M130 130 L88 48 M130 130 L186 36 M130 130 L24 110 M130 130 L38 186 M130 130 L124 242 M130 130 L224 148 M130 130 L204 216"
              stroke="#8a6034"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
});
