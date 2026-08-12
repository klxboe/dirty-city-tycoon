import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Axe } from './Axe';
import { Apple } from './Apple';
import { normalizeAngle } from '../game/engine';
import type { Apple as AppleData, SpinPattern, StuckAxe } from '../game/types';
import './TargetBoard.css';

export interface TargetBoardHandle {
  /** Aktueller Rotationswinkel der Scheibe (Grad). Live, ohne über React-State zu gehen. */
  getAngleDeg: () => number;
  /** Horizontale Bildschirm-Mitte der Scheibe (px). Basis fürs Zielen: Tippposition minus diesem Wert. */
  getCenterX: () => number;
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

/** Wie lange ein voller Puls-Zyklus dauert (Sek.) bzw. wie lange bis zum Richtungswechsel. */
const PULSE_PERIOD_SEC = 2.6;
const REVERSE_PERIOD_SEC = 3.4;

/**
 * Momentane Winkelgeschwindigkeit je nach Dreh-Muster.
 * `elapsed` ist die Laufzeit des Levels in Sekunden.
 *
 * WICHTIG fürs Balancing: kein Muster darf die Geschwindigkeit auf ~0 bringen. Steht die
 * Scheibe kurz still, landen zwei schnell hintereinander geworfene Äxte an derselben
 * Stelle – mit der Game-Over-Regel wäre das ein unfairer Instant-Tod. Deshalb liegt der
 * Puls-Faktor nie unter 0.55 und der Richtungswechsel springt hart statt weich durch null.
 */
function currentSpeed(baseSpeed: number, pattern: SpinPattern, elapsed: number): number {
  switch (pattern) {
    case 'pulse': {
      const phase = (elapsed / PULSE_PERIOD_SEC) * Math.PI * 2;
      return baseSpeed * (1.05 + 0.5 * Math.sin(phase));
    }
    case 'reverse': {
      const halfCycles = Math.floor(elapsed / REVERSE_PERIOD_SEC);
      return halfCycles % 2 === 0 ? baseSpeed : -baseSpeed;
    }
    default:
      return baseSpeed;
  }
}

export const BOARD_SIZE = 210;
/** Radius, auf dem die Äxte im Holz stecken. Auch die Bezugsgröße fürs Zielen und die Flugbahn. */
export const BOARD_RADIUS = 96;
/** Bewusst GRÖSSER als der Board-Radius: die Äpfel hängen außen am Rand, nicht auf dem Holz. */
const APPLE_RADIUS = 112;
const APPLE_STEM_LENGTH = 16;
const APPLE_STEM_RADIUS = 100 + APPLE_STEM_LENGTH / 2;

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
  const angleRef = useRef(0);
  const speedRef = useRef(speedDegPerSec);
  const patternRef = useRef(spinPattern);
  const pausedRef = useRef(paused);
  /** Laufzeit seit Level-Start (Sek.), Basis für Puls und Richtungswechsel. */
  const elapsedRef = useRef(0);

  speedRef.current = speedDegPerSec;
  patternRef.current = spinPattern;
  pausedRef.current = paused;

  // Bei jedem neuen Level (= neues Dreh-Muster/Tempo) wieder bei Phase 0 anfangen,
  // damit ein Level nicht zufällig mitten in einer Rückwärtsphase startet.
  useEffect(() => {
    elapsedRef.current = 0;
  }, [spinPattern, speedDegPerSec]);

  useImperativeHandle(ref, () => ({
    getAngleDeg: () => angleRef.current,
    getCenterX: () => {
      const el = boardElRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.left + rect.width / 2;
    },
  }));

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      if (!pausedRef.current) {
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
    <div className="target-mount">
      <div className="target-mount__chain">
        <span />
        <span />
        <span />
      </div>

      <div ref={boardElRef} className={`target-board board-skin board-skin--${boardSkin}`}>
        <div className="target-board__grain" />
        <div className="target-board__ring target-board__ring--outer" />
        <div className="target-board__ring target-board__ring--mid" />
        <div className="target-board__ring target-board__ring--inner" />
        <div className="target-board__bullseye" />

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
                <Apple size={22} />
              </div>
            </div>
          ))}

        {stuckAxes.map((axe) => (
          <div
            key={axe.id}
            className="target-board__axe-slot"
            style={{ transform: `translate(-50%, -50%) rotate(${axe.boardLocalAngleDeg}deg) translateY(-${BOARD_RADIUS}px)` }}
          >
            <div className="target-board__axe-flip target-board__axe-flip--landed">
              <Axe size={26} skin={axeSkin} />
            </div>
          </div>
        ))}

        {broken && <div className="target-board__flash" />}

        {broken && (
          <svg className="target-board__cracks" viewBox="0 0 210 210">
            <path
              d="M105 105 L70 40 M105 105 L150 30 M105 105 L20 90 M105 105 L30 150 M105 105 L100 195 M105 105 L180 120 M105 105 L165 175"
              stroke="#2a1c0e"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M105 105 L70 40 M105 105 L150 30 M105 105 L20 90 M105 105 L30 150 M105 105 L100 195 M105 105 L180 120 M105 105 L165 175"
              stroke="#6b4a2a"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
});
