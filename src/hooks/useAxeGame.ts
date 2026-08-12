// Verbindet die reine Spiellogik (game/engine.ts) mit React: Werfen per Antippen,
// Zustandsmaschine ready -> flying -> ready/levelComplete/gameOver.
//
// Wichtig: die Scheiben-ROTATION selbst lebt NICHT hier (siehe TargetBoard.tsx) –
// die dreht sich per eigenem rAF-Loop direkt im DOM, ohne React-State pro Frame,
// damit die Drehung flüssig bleibt und nicht 60x/Sekunde die ganze App neu rendert.
// Dieser Hook fragt den aktuellen Winkel nur bei Bedarf über `getBoardAngleDeg` ab.
import { useCallback, useEffect, useRef, useState } from 'react';
import { aimToImpactWorldAngle, collidesWithStuckAxe, computeBoardLocalAngle, findHitApple } from '../game/engine';
import { COINS_PER_APPLE, FLIGHT_DURATION_MS, LEVELS, levelCompletionBonus } from '../game/constants';
import { loadSave, saveSave, type SaveData } from '../game/storage';
import { getSkin, isFreeSkin } from '../game/shop';
import type { GameState, StuckAxe } from '../game/types';

function createLevelState(levelIndex: number): Omit<GameState, 'save'> {
  const level = LEVELS[levelIndex];
  const preplacedAxes: StuckAxe[] = (level.preplacedAxeAngles ?? []).map((angle, i) => ({
    // Negative IDs, damit sie nie mit den später per Wurf hinzugefügten (ab 0) kollidieren.
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
    coinsEarnedThisLevel: 0,
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame(getBoardAngleDeg: () => number) {
  const [state, setState] = useState<GameState>(() => ({ ...createLevelState(0), save: loadSave() }));
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

        // Eigene Axt getroffen -> Lauf vorbei. Die Münzen dieses Laufs sind futsch.
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
        const coinsEarnedThisLevel = levelDone
          ? applesCollectedThisRun * COINS_PER_APPLE + levelCompletionBonus(prev.levelIndex)
          : 0;

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
          coinsEarnedThisLevel,
        };
      });
    }, FLIGHT_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [state.phase, state.flyingAxe, getBoardAngleDeg]);

  // Zieht einen während des Fluges gepufferten Tap nach, sobald wieder geworfen werden darf.
  // Läuft zuverlässig erneut, weil die Phase dabei immer 'flying' -> 'ready' -> 'flying' wechselt.
  // Nach Level-Ende oder Game Over greift der Effekt nicht (Phase ist dann nicht 'ready'), ein
  // dort noch gepufferter Tap wird beim nächsten Level-Start verworfen.
  useEffect(() => {
    if (state.phase !== 'ready') return;
    const aim = pendingAimRef.current;
    if (aim === null) return;
    pendingAimRef.current = null;
    throwAxe(aim);
  }, [state.phase, throwAxe]);

  // Münzen und "bestes Level" gutschreiben, sobald ein Level geschafft ist.
  // Läuft bewusst nur bei 'levelComplete' – ein Game Over schreibt nichts gut.
  useEffect(() => {
    if (state.phase !== 'levelComplete') return;
    setState((prev) => {
      if (prev.phase !== 'levelComplete') return prev;
      const nextSave: SaveData = {
        ...prev.save,
        coins: prev.save.coins + prev.coinsEarnedThisLevel,
        bestLevel: Math.max(prev.save.bestLevel, prev.levelIndex + 2),
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
    // Absichtlich nur an der Phase hängen: der Effekt soll genau einmal pro Level-Abschluss
    // laufen, nicht erneut, wenn sich der Spielstand danach durch einen Shop-Kauf ändert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  /** Nach einem Game Over: kompletter Neustart des Laufs bei Level 1. Münzen bleiben. */
  const restartRun = useCallback(() => {
    pendingAimRef.current = null;
    setState((prev) => ({ ...createLevelState(0), save: prev.save }));
  }, []);

  const nextLevel = useCallback(() => {
    pendingAimRef.current = null;
    setState((prev) => ({
      ...createLevelState(Math.min(prev.levelIndex + 1, LEVELS.length - 1)),
      save: prev.save,
    }));
  }, []);

  /** Skin kaufen, falls genug Münzen da sind. Rüstet ihn direkt aus. */
  const buySkin = useCallback((skinId: string) => {
    setState((prev) => {
      const skin = getSkin(skinId);
      if (!skin) return prev;
      if (prev.save.ownedSkins.includes(skinId) || isFreeSkin(skinId)) return prev;
      if (prev.save.coins < skin.price) return prev;

      const nextSave: SaveData = {
        ...prev.save,
        coins: prev.save.coins - skin.price,
        ownedSkins: [...prev.save.ownedSkins, skinId],
        ...(skin.kind === 'axe' ? { equippedAxeSkin: skinId } : { equippedBoardSkin: skinId }),
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /** Bereits besessenen (oder kostenlosen) Skin ausrüsten. */
  const equipSkin = useCallback((skinId: string) => {
    setState((prev) => {
      const skin = getSkin(skinId);
      if (!skin) return prev;
      if (!isFreeSkin(skinId) && !prev.save.ownedSkins.includes(skinId)) return prev;

      const nextSave: SaveData = {
        ...prev.save,
        ...(skin.kind === 'axe' ? { equippedAxeSkin: skinId } : { equippedBoardSkin: skinId }),
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  const level = LEVELS[state.levelIndex];
  const isLastLevel = state.levelIndex >= LEVELS.length - 1;

  return {
    ...state,
    levelCount: LEVELS.length,
    isLastLevel,
    boardSpeedDegPerSec: level.boardSpeedDegPerSec,
    spinPattern: level.spinPattern,
    axeCount: level.axeCount,
    axesRemaining: level.axeCount - state.axesThrown,
    throwAxe,
    restartRun,
    nextLevel,
    buySkin,
    equipSkin,
  };
}
