// Verbindet die reine Spiellogik (game/engine.ts) mit React: Werfen per Antippen,
// Zustandsmaschine ready -> flying -> ready/levelComplete.
//
// Wichtig: die Scheiben-ROTATION selbst lebt NICHT hier (siehe TargetBoard.tsx) –
// die dreht sich per eigenem rAF-Loop direkt im DOM, ohne React-State pro Frame,
// damit die Drehung flüssig bleibt und nicht 60x/Sekunde die ganze App neu rendert.
// Dieser Hook fragt den aktuellen Winkel nur bei Bedarf über `getBoardAngleDeg` ab.
import { useCallback, useEffect, useRef, useState } from 'react';
import { aimToImpactWorldAngle, collidesWithStuckAxe, computeBoardLocalAngle, findHitApple } from '../game/engine';
import { FLIGHT_DURATION_MS, LEVELS } from '../game/constants';
import { loadCurrency, saveCurrency } from '../game/storage';
import type { GameState, StuckAxe } from '../game/types';

function createInitialState(levelIndex: number, totalCurrency?: number): GameState {
  const level = LEVELS[levelIndex];
  const preplacedAxes: StuckAxe[] = (level.preplacedAxeAngles ?? []).map((angle, i) => ({
    // Negative IDs, damit sie nie mit den später per Wurf hinzugefügten (nextAxeId, ab 0) kollidieren.
    id: -1 - i,
    boardLocalAngleDeg: angle,
  }));

  return {
    phase: 'ready',
    levelIndex,
    axesThrown: 0,
    hits: 0,
    stuckAxes: preplacedAxes,
    apples: level.appleAngles.map((angle, i) => ({ id: i, boardLocalAngleDeg: angle, collected: false })),
    applesCollectedThisRun: 0,
    totalCurrency: totalCurrency ?? loadCurrency(),
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame(getBoardAngleDeg: () => number) {
  const [state, setState] = useState<GameState>(() => createInitialState(0));
  /**
   * Tippt man, während schon eine Axt fliegt, geht der Tap NICHT verloren, sondern wird hier
   * (mitsamt der Zielrichtung) gemerkt und feuert automatisch, sobald die aktuelle Axt
   * gelandet ist (siehe Nachzieh-Effekt unten). Ohne das fühlte sich schnelles Antippen
   * "kaputt" an, weil Taps mitten im kurzen Flug (140ms) einfach ignoriert wurden, ohne dass
   * etwas passierte. `null` = kein gepufferter Tap.
   *
   * WICHTIG: Dieser Puffer darf nur in Effekten/Event-Handlern gelesen und geleert werden,
   * NIEMALS in einer setState-Updater-Funktion. React ruft Updater im StrictMode (Dev) zur
   * Sicherheit doppelt auf und behält das Ergebnis des ZWEITEN Aufrufs. Ein "lies und leere"
   * im Updater sieht beim zweiten Durchlauf einen schon geleerten Puffer – der gepufferte
   * Wurf ging dadurch stillschweigend verloren (in genau diese Falle ist eine frühere
   * Version gelaufen: Doppel-Tippen löste nur einen einzigen Wurf aus).
   */
  const pendingAimRef = useRef<number | null>(null);

  /**
   * Antippen wirft sofort eine Axt. `aim` ist die horizontale Tippposition relativ zur
   * Scheibenmitte (-1 = linker Rand, 0 = Mitte, +1 = rechter Rand) und bestimmt, wo die
   * Axt einschlägt.
   */
  const throwAxe = useCallback((aim: number) => {
    setState((prev) => {
      // Nach Level-Ende / Game Over wird nur noch über die Modal-Buttons weitergemacht.
      if (prev.phase === 'levelComplete' || prev.phase === 'gameOver') return prev;

      if (prev.phase !== 'ready') {
        pendingAimRef.current = aim;
        return prev;
      }
      return {
        ...prev,
        phase: 'flying',
        flyingAxe: { startedAt: performance.now(), impactWorldAngleDeg: aimToImpactWorldAngle(aim) },
        lastOutcome: null,
      };
    });
  }, []);

  // Löst den Wurf nach der Flugzeit auf: Treffer (Axt steckt) oder Kollision (= Game Over).
  // Die Updater-Funktion ist bewusst REIN (keine Ref-Mutationen, keine performance.now()-Aufrufe),
  // damit sie den StrictMode-Doppelaufruf unbeschadet übersteht. Das Nachziehen eines gepufferten
  // Taps passiert deshalb im separaten Effekt darunter, nicht hier.
  useEffect(() => {
    if (state.phase !== 'flying') return;

    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'flying' || !prev.flyingAxe) return prev;
        const level = LEVELS[prev.levelIndex];

        // Aufprall-Winkel anhand der AKTUELLEN Scheiben-Drehung (sie dreht sich während des
        // Flugs weiter) und der Zielrichtung, mit der diese Axt geworfen wurde.
        const localAngle = computeBoardLocalAngle(getBoardAngleDeg(), prev.flyingAxe.impactWorldAngleDeg);

        // Eigene Axt getroffen -> sofort vorbei.
        if (collidesWithStuckAxe(localAngle, prev.stuckAxes)) {
          return {
            ...prev,
            phase: 'gameOver',
            flyingAxe: null,
            lastOutcome: 'collided',
            axesThrown: prev.axesThrown + 1,
          };
        }

        // id = laufende Wurfnummer: pro Wurf entsteht genau eine Axt, also innerhalb eines
        // Levels eindeutig – und rein berechnet statt aus einem hochgezählten Ref.
        const stuckAxes = [...prev.stuckAxes, { id: prev.axesThrown, boardLocalAngleDeg: localAngle }];
        const hits = prev.hits + 1;

        let apples = prev.apples;
        let applesCollectedThisRun = prev.applesCollectedThisRun;
        const hitApple = findHitApple(localAngle, prev.apples);
        if (hitApple) {
          apples = prev.apples.map((apple) => (apple.id === hitApple.id ? { ...apple, collected: true } : apple));
          applesCollectedThisRun = prev.applesCollectedThisRun + 1;
        }

        const axesThrown = prev.axesThrown + 1;
        const levelDone = axesThrown >= level.axeCount;

        return {
          ...prev,
          phase: levelDone ? 'levelComplete' : 'ready',
          flyingAxe: null,
          lastOutcome: 'stuck',
          axesThrown,
          hits,
          stuckAxes,
          apples,
          applesCollectedThisRun,
        };
      });
    }, FLIGHT_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [state.phase, state.flyingAxe, getBoardAngleDeg]);

  // Zieht einen während des Fluges gepufferten Tap nach, sobald wieder geworfen werden darf.
  // Läuft zuverlässig erneut, weil die Phase dabei immer 'flying' -> 'ready' -> 'flying' wechselt.
  // Nach Level-Ende oder Game Over greift der Effekt nicht (Phase ist dann nicht 'ready'), ein
  // dort noch gepufferter Tap wird beim Level-Neustart verworfen.
  useEffect(() => {
    if (state.phase !== 'ready') return;
    const aim = pendingAimRef.current;
    if (aim === null) return;
    pendingAimRef.current = null;
    throwAxe(aim);
  }, [state.phase, throwAxe]);

  // Gesammelte Äpfel dauerhaft der Gesamt-Währung gutschreiben, sobald das Level fertig ist.
  useEffect(() => {
    if (state.phase === 'levelComplete' && state.applesCollectedThisRun > 0) {
      const newTotal = state.totalCurrency + state.applesCollectedThisRun;
      saveCurrency(newTotal);
      setState((prev) => (prev.phase === 'levelComplete' ? { ...prev, totalCurrency: newTotal } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const retryLevel = useCallback(() => {
    pendingAimRef.current = null;
    setState((prev) => createInitialState(prev.levelIndex, prev.totalCurrency));
  }, []);

  const nextLevel = useCallback(() => {
    pendingAimRef.current = null;
    setState((prev) => {
      const nextIndex = Math.min(prev.levelIndex + 1, LEVELS.length - 1);
      return createInitialState(nextIndex, prev.totalCurrency);
    });
  }, []);

  const level = LEVELS[state.levelIndex];
  const isLastLevel = state.levelIndex >= LEVELS.length - 1;

  return {
    ...state,
    levelCount: LEVELS.length,
    isLastLevel,
    boardSpeedDegPerSec: level.boardSpeedDegPerSec,
    axeCount: level.axeCount,
    axesRemaining: level.axeCount - state.axesThrown,
    throwAxe,
    retryLevel,
    nextLevel,
  };
}
