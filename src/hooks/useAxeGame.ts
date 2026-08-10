// Verbindet die reine Spiellogik (game/engine.ts) mit React: Rotations-Loop,
// Werfen per Antippen, Zustandsmaschine ready -> flying -> ready/levelComplete.
import { useCallback, useEffect, useRef, useState } from 'react';
import { collidesWithStuckAxe, computeBoardLocalAngle, findHitApple, normalizeAngle } from '../game/engine';
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
    boardAngleDeg: 0,
    stuckAxes: preplacedAxes,
    apples: level.appleAngles.map((angle, i) => ({ id: i, boardLocalAngleDeg: angle, collected: false })),
    applesCollectedThisRun: 0,
    totalCurrency: totalCurrency ?? loadCurrency(),
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame() {
  const [state, setState] = useState<GameState>(() => createInitialState(0));
  const nextAxeId = useRef(0);

  // Rotations-Loop: dreht die Scheibe kontinuierlich, außer wenn das Level fertig ist.
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setState((prev) => {
        if (prev.phase === 'levelComplete') return prev;
        const speed = LEVELS[prev.levelIndex].boardSpeedDegPerSec;
        return { ...prev, boardAngleDeg: normalizeAngle(prev.boardAngleDeg + speed * deltaSeconds) };
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  /** Antippen wirft sofort eine Axt (kein Laden/Timing mehr, wie beim Vorbild). */
  const throwAxe = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'ready') return prev;
      return { ...prev, phase: 'flying', flyingAxe: { startedAt: performance.now() }, lastOutcome: null };
    });
  }, []);

  // Löst den Wurf nach der Flugzeit auf: Treffer oder Kollision – und verbraucht eine Axt.
  useEffect(() => {
    if (state.phase !== 'flying') return;

    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'flying' || !prev.flyingAxe) return prev;
        const level = LEVELS[prev.levelIndex];

        // Aufprall-Winkel anhand der AKTUELLEN Scheiben-Drehung (sie dreht sich während des Flugs weiter).
        const localAngle = computeBoardLocalAngle(prev.boardAngleDeg);

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
  }, [state.phase]);

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
    setState((prev) => createInitialState(prev.levelIndex, prev.totalCurrency));
  }, []);

  const nextLevel = useCallback(() => {
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
    levelName: level.name,
    isLastLevel,
    axeCount: level.axeCount,
    axesRemaining: level.axeCount - state.axesThrown,
    throwAxe,
    retryLevel,
    nextLevel,
  };
}
