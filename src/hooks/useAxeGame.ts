// Verbindet die reine Spiellogik (game/engine.ts) mit React: Rotations-Loop,
// Laden/Werfen per Pointer-Events, Zustandsmaschine ready -> charging -> flying -> ready/gameover.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  boardSpeedForScore,
  collidesWithStuckAxe,
  computeBoardLocalAngle,
  isGoodTiming,
  normalizeAngle,
  spinPeriodForScore,
  sweetSpotToleranceForScore,
} from '../game/engine';
import { FLIGHT_DURATION_MS } from '../game/constants';
import { loadHighScore, saveHighScore } from '../game/storage';
import type { GameState } from '../game/types';

function createInitialState(): GameState {
  return {
    phase: 'ready',
    score: 0,
    highScore: loadHighScore(),
    streak: 0,
    boardAngleDeg: 0,
    boardSpeedDegPerSec: boardSpeedForScore(0),
    stuckAxes: [],
    chargeStartedAt: null,
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame() {
  const [state, setState] = useState<GameState>(createInitialState);
  const nextAxeId = useRef(0);

  // Rotations-Loop: dreht die Scheibe kontinuierlich, außer bei Game Over.
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setState((prev) => {
        if (prev.phase === 'gameover') return prev;
        return {
          ...prev,
          boardAngleDeg: normalizeAngle(prev.boardAngleDeg + prev.boardSpeedDegPerSec * deltaSeconds),
        };
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const startCharge = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'ready') return prev;
      return { ...prev, phase: 'charging', chargeStartedAt: performance.now(), lastOutcome: null };
    });
  }, []);

  const release = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'charging' || prev.chargeStartedAt === null) return prev;
      const holdMs = performance.now() - prev.chargeStartedAt;
      const spinPeriod = spinPeriodForScore(prev.score);
      const tolerance = sweetSpotToleranceForScore(prev.score);
      const wasGoodTiming = isGoodTiming(holdMs, spinPeriod, tolerance);

      return {
        ...prev,
        phase: 'flying',
        chargeStartedAt: null,
        flyingAxe: { releaseBoardAngleDeg: prev.boardAngleDeg, wasGoodTiming, startedAt: performance.now() },
      };
    });
  }, []);

  // Löst den Wurf nach der Flugzeit auf: Treffer, Abprall oder Kollision mit steckender Axt.
  useEffect(() => {
    if (state.phase !== 'flying') return;

    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'flying' || !prev.flyingAxe) return prev;

        if (!prev.flyingAxe.wasGoodTiming) {
          return { ...prev, phase: 'gameover', flyingAxe: null, lastOutcome: 'bounced' };
        }

        // Aufprall-Winkel anhand der AKTUELLEN Scheiben-Drehung (sie dreht sich während des Flugs weiter).
        const localAngle = computeBoardLocalAngle(prev.boardAngleDeg);
        if (collidesWithStuckAxe(localAngle, prev.stuckAxes)) {
          return { ...prev, phase: 'gameover', flyingAxe: null, lastOutcome: 'collided' };
        }

        const newScore = prev.score + 1;
        return {
          ...prev,
          phase: 'ready',
          flyingAxe: null,
          lastOutcome: 'stuck',
          score: newScore,
          streak: prev.streak + 1,
          boardSpeedDegPerSec: boardSpeedForScore(newScore),
          stuckAxes: [...prev.stuckAxes, { id: nextAxeId.current++, boardLocalAngleDeg: localAngle }],
        };
      });
    }, FLIGHT_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [state.phase]);

  // Highscore sichern, sobald eine Runde vorbei ist.
  useEffect(() => {
    if (state.phase === 'gameover' && state.score > state.highScore) {
      saveHighScore(state.score);
      setState((prev) => (prev.phase === 'gameover' ? { ...prev, highScore: state.score } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...createInitialState(),
      highScore: Math.max(prev.highScore, prev.score),
      boardAngleDeg: prev.boardAngleDeg,
    }));
  }, []);

  return {
    ...state,
    spinPeriodMs: spinPeriodForScore(state.score),
    sweetSpotTolerance: sweetSpotToleranceForScore(state.score),
    startCharge,
    release,
    reset,
  };
}
