// Verbindet die reine Spiellogik (game/engine.ts) mit React: Werfen per Antippen,
// Zustandsmaschine ready -> flying -> ready/levelComplete/gameOver.
//
// Wichtig: die Scheiben-ROTATION selbst lebt NICHT hier (siehe TargetBoard.tsx) –
// die dreht sich per eigenem rAF-Loop direkt im DOM, ohne React-State pro Frame,
// damit die Drehung flüssig bleibt und nicht 60x/Sekunde die ganze App neu rendert.
// Dieser Hook fragt den aktuellen Winkel nur bei Bedarf über `getBoardAngleDeg` ab.
import { useCallback, useEffect, useRef, useState } from 'react';
import { collidesWithStuckAxe, computeBoardLocalAngle, findHitApple } from '../game/engine';
import {
  blockCompletionBonus,
  blockStartIndex,
  bossFruitForLevel,
  BOSS_REPEAT_BONUS,
  COINS_PER_APPLE,
  FLIGHT_DURATION_MS,
  LEVELS,
  LEVELS_PER_BLOCK,
  levelCompletionBonus,
  PERFECT_APPLE_BONUS,
  streakMultiplier,
} from '../game/constants';
import { loadSave, saveSave, type SaveData } from '../game/storage';
import { getSkin, isFreeSkin } from '../game/shop';
import { setMuted } from '../game/sound';
import type { GameState, LevelReward, StuckAxe } from '../game/types';

function createLevelState(levelIndex: number): Omit<GameState, 'save' | 'streak'> {
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
    reward: null,
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame(getBoardAngleDeg: () => number) {
  const [state, setState] = useState<GameState>(() => {
    const save = loadSave();
    setMuted(!save.soundOn);
    return { ...createLevelState(Math.min(save.currentLevel, LEVELS.length - 1)), streak: save.streak, save };
  });

  /**
   * Tippt man, während schon eine Axt fliegt, geht der Tap NICHT verloren, sondern wird
   * hier gemerkt und feuert automatisch, sobald die aktuelle Axt gelandet ist (siehe
   * Nachzieh-Effekt unten). Ohne das fühlte sich schnelles Antippen "kaputt" an, weil
   * Taps mitten im kurzen Flug einfach verschluckt wurden.
   *
   * WICHTIG: Dieser Puffer darf nur in Effekten/Event-Handlern gelesen und geleert werden,
   * NIEMALS in einer setState-Updater-Funktion. React ruft Updater im StrictMode (Dev) zur
   * Sicherheit doppelt auf und behält das Ergebnis des ZWEITEN Aufrufs. Ein "lies und leere"
   * im Updater sieht beim zweiten Durchlauf einen schon geleerten Puffer – der gepufferte
   * Wurf ging dadurch stillschweigend verloren (in genau diese Falle ist eine frühere
   * Version gelaufen: Doppel-Tippen löste nur einen einzigen Wurf aus).
   */
  const pendingThrowRef = useRef(false);

  /**
   * Antippen wirft sofort eine Axt – geradeaus nach oben. WO man tippt, spielt keine
   * Rolle (wie beim Vorbild "Knife Hit"); der einzige Skill ist das Timing.
   */
  const throwAxe = useCallback(() => {
    setState((prev) => {
      // Nach Level-Ende / Game Over wird nur noch über die Modal-Buttons weitergemacht.
      if (prev.phase === 'levelComplete' || prev.phase === 'gameOver') return prev;

      if (prev.phase !== 'ready') {
        pendingThrowRef.current = true;
        return prev;
      }
      return {
        ...prev,
        phase: 'flying',
        flyingAxe: { startedAt: performance.now() },
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

        // Aufprall-Winkel anhand der AKTUELLEN Scheiben-Drehung – sie dreht sich während
        // des Flugs weiter, genau darin liegt das Timing-Spiel.
        const localAngle = computeBoardLocalAngle(getBoardAngleDeg());

        // Eigene Axt getroffen -> Lauf vorbei. Die Münzen dieses Levels sind futsch.
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
          reward: levelDone ? computeReward(prev.levelIndex, applesCollectedThisRun, prev.streak, prev.save) : null,
        };
      });
    }, FLIGHT_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [state.phase, state.flyingAxe, getBoardAngleDeg]);

  // Zieht einen während des Fluges gepufferten Tap nach, sobald wieder geworfen werden darf.
  // Läuft zuverlässig erneut, weil die Phase dabei immer 'flying' -> 'ready' -> 'flying' wechselt.
  useEffect(() => {
    if (state.phase !== 'ready') return;
    if (!pendingThrowRef.current) return;
    pendingThrowRef.current = false;
    throwAxe();
  }, [state.phase, throwAxe]);

  // Belohnung gutschreiben, sobald ein Level geschafft ist. Läuft bewusst nur bei
  // 'levelComplete' – ein Game Over schreibt nichts gut.
  useEffect(() => {
    if (state.phase !== 'levelComplete') return;
    setState((prev) => {
      if (prev.phase !== 'levelComplete' || !prev.reward) return prev;
      const streak = prev.streak + 1;
      const nextSave: SaveData = {
        ...prev.save,
        coins: prev.save.coins + prev.reward.total,
        bestLevel: Math.max(prev.save.bestLevel, prev.levelIndex + 2),
        streak,
        ownedSkins: prev.reward.unlockedAxeSkinId
          ? [...prev.save.ownedSkins, prev.reward.unlockedAxeSkinId]
          : prev.save.ownedSkins,
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave, streak };
    });
    // Absichtlich nur an der Phase hängen: der Effekt soll genau einmal pro Level-Abschluss
    // laufen, nicht erneut, wenn sich der Spielstand danach durch einen Shop-Kauf ändert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Bei Game Over die Serie reißen lassen und den Lauf-Stand auf den Blockanfang setzen,
  // damit auch ein Schließen der App genau dort wieder aufsetzt.
  useEffect(() => {
    if (state.phase !== 'gameOver') return;
    setState((prev) => {
      if (prev.phase !== 'gameOver') return prev;
      const nextSave: SaveData = { ...prev.save, streak: 0, currentLevel: blockStartIndex(prev.levelIndex) };
      saveSave(nextSave);
      return { ...prev, save: nextSave, streak: 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const goToLevel = useCallback((levelIndex: number) => {
    pendingThrowRef.current = false;
    setState((prev) => {
      const target = Math.max(0, Math.min(levelIndex, LEVELS.length - 1));
      const nextSave: SaveData = { ...prev.save, currentLevel: target };
      saveSave(nextSave);
      return { ...createLevelState(target), streak: prev.streak, save: nextSave };
    });
  }, []);

  /** Nach einem Game Over: Neustart am Anfang des aktuellen 10er-Blocks. Münzen bleiben. */
  const restartRun = useCallback(() => {
    setState((prev) => {
      const target = blockStartIndex(prev.levelIndex);
      pendingThrowRef.current = false;
      const nextSave: SaveData = { ...prev.save, currentLevel: target, streak: 0 };
      saveSave(nextSave);
      return { ...createLevelState(target), streak: 0, save: nextSave };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setState((prev) => {
      const target = Math.min(prev.levelIndex + 1, LEVELS.length - 1);
      pendingThrowRef.current = false;
      const nextSave: SaveData = { ...prev.save, currentLevel: target };
      saveSave(nextSave);
      return { ...createLevelState(target), streak: prev.streak, save: nextSave };
    });
  }, []);

  /** Skin kaufen, falls genug Münzen da sind. Rüstet ihn direkt aus. */
  const buySkin = useCallback((skinId: string) => {
    setState((prev) => {
      const skin = getSkin(skinId);
      if (!skin || skin.source !== 'shop') return prev;
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

  const setSoundOn = useCallback((soundOn: boolean) => {
    setMuted(!soundOn);
    setState((prev) => {
      const nextSave: SaveData = { ...prev.save, soundOn };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  const markTutorialSeen = useCallback(() => {
    setState((prev) => {
      if (prev.save.tutorialSeen) return prev;
      const nextSave: SaveData = { ...prev.save, tutorialSeen: true };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /** Kompletter Neuanfang: Münzen, Skins und Fortschritt weg. Nur über die Einstellungen. */
  const resetProgress = useCallback(() => {
    pendingThrowRef.current = false;
    setState(() => {
      const fresh = loadSaveFresh();
      saveSave(fresh);
      setMuted(!fresh.soundOn);
      return { ...createLevelState(0), streak: 0, save: fresh };
    });
  }, []);

  const level = LEVELS[state.levelIndex];
  const isLastLevel = state.levelIndex >= LEVELS.length - 1;
  const bossFruit = bossFruitForLevel(state.levelIndex);

  return {
    ...state,
    levelCount: LEVELS.length,
    isLastLevel,
    /** Erster Level-Index des aktuellen 10er-Blocks – dorthin geht es nach einem Game Over. */
    blockStart: blockStartIndex(state.levelIndex),
    levelsPerBlock: LEVELS_PER_BLOCK,
    boardSpeedDegPerSec: level.boardSpeedDegPerSec,
    spinPattern: level.spinPattern,
    axeCount: level.axeCount,
    appleCount: level.appleAngles.length,
    axesRemaining: level.axeCount - state.axesThrown,
    bossFruit,
    /** Im Boss-Level zeigt die Scheibe die Frucht statt des ausgerüsteten Designs. */
    activeBoardSkin: bossFruit ? bossFruit.boardSkinId : state.save.equippedBoardSkin,
    throwAxe,
    restartRun,
    nextLevel,
    goToLevel,
    buySkin,
    equipSkin,
    setSoundOn,
    markTutorialSeen,
    resetProgress,
  };
}

/** Frischer Spielstand für "Fortschritt zurücksetzen". */
function loadSaveFresh(): SaveData {
  return {
    coins: 0,
    ownedSkins: [],
    equippedAxeSkin: 'axe-standard',
    equippedBoardSkin: 'board-oak',
    bestLevel: 1,
    currentLevel: 0,
    streak: 0,
    soundOn: true,
    tutorialSeen: true,
  };
}

/**
 * Rechnet die Belohnung eines geschafften Levels aus. Reine Funktion, damit sie
 * gefahrlos in der setState-Updater-Funktion laufen kann (StrictMode-Doppelaufruf).
 */
function computeReward(levelIndex: number, applesCollected: number, streak: number, save: SaveData): LevelReward {
  const level = LEVELS[levelIndex];
  const boss = bossFruitForLevel(levelIndex);

  const apples = applesCollected * COINS_PER_APPLE;
  const base = levelCompletionBonus(levelIndex);
  const perfect = applesCollected === level.appleAngles.length && applesCollected > 0 ? PERFECT_APPLE_BONUS : 0;
  const isBlockEnd = (levelIndex + 1) % LEVELS_PER_BLOCK === 0;
  const block = isBlockEnd ? blockCompletionBonus(levelIndex) : 0;

  // Boss: entweder die Frucht-Axt freischalten oder – falls schon vorhanden – Münzen.
  let unlockedAxeSkinId: string | undefined;
  let bossCoins = 0;
  if (boss) {
    if (save.ownedSkins.includes(boss.axeSkinId)) {
      bossCoins = BOSS_REPEAT_BONUS;
    } else {
      unlockedAxeSkinId = boss.axeSkinId;
    }
  }

  const multiplier = streakMultiplier(streak);
  const raw = apples + base + perfect + block + bossCoins;

  return {
    apples,
    base: base + bossCoins,
    perfect,
    block,
    streakMultiplier: multiplier,
    total: Math.round(raw * multiplier),
    bossFruitId: boss?.id,
    unlockedAxeSkinId,
  };
}
