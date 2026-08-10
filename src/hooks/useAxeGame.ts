// Verbindet die reine Spiellogik (game/engine.ts) mit React: Werfen per Antippen,
// Zustandsmaschine ready -> flying -> ready/levelComplete.
//
// Wichtig: die Scheiben-ROTATION selbst lebt NICHT hier (siehe TargetBoard.tsx) –
// die dreht sich per eigenem rAF-Loop direkt im DOM, ohne React-State pro Frame,
// damit die Drehung flüssig bleibt und nicht 60x/Sekunde die ganze App neu rendert.
// Dieser Hook fragt den aktuellen Winkel nur bei Bedarf über `getBoardAngleDeg` ab.
import { useCallback, useEffect, useRef, useState } from 'react';
import { collidesWithStuckAxe, computeBoardLocalAngle, findHitApple } from '../game/engine';
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
  const nextAxeId = useRef(0);
  /**
   * Tippt man, während schon eine Axt fliegt, geht der Tap NICHT verloren, sondern wird hier
   * gemerkt und feuert automatisch, sobald die aktuelle Axt gelandet ist (siehe Resolve-Effekt
   * unten). Ohne das fühlte sich schnelles Antippen "kaputt" an, weil Taps mitten im kurzen
   * Flug (140ms) einfach ignoriert wurden, ohne dass etwas passierte.
   */
  const pendingThrowRef = useRef(false);

  /** Antippen wirft sofort eine Axt (kein Laden/Timing mehr, wie beim Vorbild). */
  const throwAxe = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'ready') {
        pendingThrowRef.current = true;
        return prev;
      }
      return { ...prev, phase: 'flying', flyingAxe: { startedAt: performance.now() }, lastOutcome: null };
    });
  }, []);

  // Löst den Wurf nach der Flugzeit auf: Treffer oder Kollision – und verbraucht eine Axt.
  //
  // WICHTIG: Abhängigkeit ist `state.flyingAxe` (nicht nur `state.phase`)! Wenn ein gepufferter
  // Tap direkt "fliegend -> fliegend" verkettet (siehe pendingThrowRef oben), bleibt state.phase
  // unverändert 'flying' - React würde den Effekt dann NICHT erneut ausführen und der Timer für
  // die zweite Axt würde nie starten, das Spiel bliebe für immer im "fliegend"-Zustand hängen.
  // `flyingAxe.startedAt` bekommt bei jeder neuen Axt einen frischen Wert und löst den Effekt
  // deshalb zuverlässig auch bei so einer Verkettung erneut aus.
  useEffect(() => {
    if (state.phase !== 'flying') return;

    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'flying' || !prev.flyingAxe) return prev;
        const level = LEVELS[prev.levelIndex];

        // Aufprall-Winkel anhand der AKTUELLEN Scheiben-Drehung (sie dreht sich während des Flugs weiter).
        const localAngle = computeBoardLocalAngle(getBoardAngleDeg());

        let outcome: NonNullable<GameState['lastOutcome']>;
        let stuckAxes = prev.stuckAxes;
        let apples = prev.apples;
        let hits = prev.hits;
        let applesCollectedThisRun = prev.applesCollectedThisRun;

        if (collidesWithStuckAxe(localAngle, prev.stuckAxes)) {
          outcome = 'collided';
        } else {
          outcome = 'stuck';
          stuckAxes = [...prev.stuckAxes, { id: nextAxeId.current++, boardLocalAngleDeg: localAngle }];
          hits = prev.hits + 1;

          const hitApple = findHitApple(localAngle, prev.apples);
          if (hitApple) {
            apples = prev.apples.map((apple) => (apple.id === hitApple.id ? { ...apple, collected: true } : apple));
            applesCollectedThisRun = prev.applesCollectedThisRun + 1;
          }
        }

        const axesThrown = prev.axesThrown + 1;
        const levelDone = axesThrown >= level.axeCount;

        // Wurde während des Fluges schon wieder getippt? Dann sofort die nächste Axt losschicken.
        if (!levelDone && pendingThrowRef.current) {
          pendingThrowRef.current = false;
          return {
            ...prev,
            phase: 'flying',
            flyingAxe: { startedAt: performance.now() },
            lastOutcome: outcome,
            axesThrown,
            hits,
            stuckAxes,
            apples,
            applesCollectedThisRun,
          };
        }

        pendingThrowRef.current = false;
        return {
          ...prev,
          phase: levelDone ? 'levelComplete' : 'ready',
          flyingAxe: null,
          lastOutcome: outcome,
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
    pendingThrowRef.current = false;
    setState((prev) => createInitialState(prev.levelIndex, prev.totalCurrency));
  }, []);

  const nextLevel = useCallback(() => {
    pendingThrowRef.current = false;
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
