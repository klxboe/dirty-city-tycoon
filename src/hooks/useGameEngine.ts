// Verbindet die reine Spiellogik (game/engine.ts) mit React: hält den State,
// treibt die Tick-Schleife an und kümmert sich ums Speichern/Laden.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCityForIndex } from '../game/constants';
import {
  applyOfflineReport,
  applyTap,
  buyStorage,
  buyTransporter,
  buyWorker,
  bufferCapacity,
  collectRate,
  computeOfflineReport,
  dispatchRate,
  effectiveRate,
  isBottlenecked,
  prestige,
  starsForCurrentCity,
  storageCost,
  tick,
  transporterCost,
  workerCost,
} from '../game/engine';
import { createInitialState, loadState, saveState } from '../game/storage';
import type { GameState, OfflineReport } from '../game/types';
import { TAP_BASE_VALUE, TICK_MS } from '../game/constants';

const AUTOSAVE_MS = 5_000;

export function useGameEngine() {
  const [state, setState] = useState<GameState>(() => loadState() ?? createInitialState());
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);
  const hasAppliedOfflineReport = useRef(false);

  // Einmalig beim Start: Offline-Verdienst berechnen und gutschreiben.
  useEffect(() => {
    if (hasAppliedOfflineReport.current) return;
    hasAppliedOfflineReport.current = true;

    setState((prev) => {
      const report = computeOfflineReport(prev, Date.now());
      if (report.earned > 0) setOfflineReport(report);
      return applyOfflineReport(prev, report);
    });
  }, []);

  // Die Tick-Schleife: alle 100ms einen Simulationsschritt.
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => tick(prev));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Immer den aktuellsten State für die Speicher-Callbacks verfügbar halten,
  // ohne die Intervalle bei jeder Änderung neu aufzusetzen.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Regelmäßig speichern, außerdem beim Verlassen/Verstecken der Seite.
  useEffect(() => {
    const interval = setInterval(() => saveState(stateRef.current), AUTOSAVE_MS);

    const saveNow = () => saveState(stateRef.current);
    document.addEventListener('visibilitychange', saveNow);
    window.addEventListener('beforeunload', saveNow);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', saveNow);
      window.removeEventListener('beforeunload', saveNow);
      saveNow();
    };
  }, []);

  const tap = useCallback(() => setState((prev) => applyTap(prev, TAP_BASE_VALUE)), []);
  const purchaseWorker = useCallback(() => setState((prev) => buyWorker(prev)), []);
  const purchaseTransporter = useCallback(() => setState((prev) => buyTransporter(prev)), []);
  const purchaseStorage = useCallback(() => setState((prev) => buyStorage(prev)), []);
  const moveToNextCity = useCallback(() => setState((prev) => prestige(prev)), []);
  const dismissOfflineReport = useCallback(() => setOfflineReport(null), []);

  const cityDef = getCityForIndex(state.cityIndex);
  const cleanlinessProgress = Math.min(1, state.totalEarnedThisCity / cityDef.goal);
  const canMoveToNextCity = state.totalEarnedThisCity >= cityDef.goal;

  return {
    state,
    cityDef,
    cleanlinessProgress,
    canMoveToNextCity,
    projectedStars: starsForCurrentCity(state),
    collectRate: collectRate(state),
    dispatchRate: dispatchRate(state),
    effectiveRate: effectiveRate(state),
    bufferCapacity: bufferCapacity(state),
    bottlenecked: isBottlenecked(state),
    workerCost: workerCost(state),
    transporterCost: transporterCost(state),
    storageCost: storageCost(state),
    offlineReport,
    dismissOfflineReport,
    tap,
    buyWorker: purchaseWorker,
    buyTransporter: purchaseTransporter,
    buyStorage: purchaseStorage,
    moveToNextCity,
  };
}
