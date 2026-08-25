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
  BOARD_SPEED_MULTIPLIER,
  BOSS_REPEAT_BONUS,
  COINS_PER_APPLE,
  GEMS_PER_FIGURINE,
  GEMS_PER_GOLDEN_APPLE,
  LEVEL_COUNT,
  levelConfigAt,
  LEVEL_VARIANT_COUNT,
  LEVELS_PER_BLOCK,
  levelCompletionBonus,
  PERFECT_APPLE_BONUS,
  REWARD_MULTIPLIER,
  streakMultiplier,
  VIDEO_RESCUE_COINS,
  worldBossPhaseSpeedMultiplier,
  worldBossPhaseSpinPattern,
  XP_PER_LEVEL,
} from '../game/constants';
import { loadSave, saveSave, type SaveData } from '../game/storage';
import { pendingDailyReward, todayDateString } from '../game/daily';
import { getSkin, isFreeSkin } from '../game/shop';
import { WORLD_BOSSES } from '../game/worlds';
import { setMuted } from '../game/sound';
import type { GameState, LevelReward, StuckAxe } from '../game/types';

/**
 * Welche Level-Variante (0-4, siehe `LEVEL_VARIANT_COUNT`/`LEVEL_VARIANT_MAX_LEVEL_INDEX`
 * in constants.ts) beim Betreten eines Levels gilt. `Math.random()` ist hier bewusst
 * erlaubt (einziger Ort im gesamten Level-System, der NICHT rein aus der Levelnummer
 * hergeleitet wird): der gewürfelte Wert wird sofort in `SaveData.levelVariantSeed`
 * eingefroren und danach nur noch gelesen, nie im laufenden Level neu gewürfelt.
 *
 * GEFUNDENER BUG (Klaus: "die Level sind immer noch dieselben"): die erste Fassung
 * verglich `previousLevelIndex === newLevelIndex` und würfelte nur bei einer
 * tatsächlichen ÄNDERUNG des Level-Index neu. Stirbt man aber GENAU auf Level 1 und
 * startet neu, bleibt der Ziel-Index 0 -> 0 (unverändert) – die alte Prüfung hielt das
 * fälschlich für "derselbe Versuch, nicht neu würfeln" (gedacht für Boss-Retry/Video-
 * Rettung), obwohl `restartRun()` semantisch ein ECHTER Neustart ist. Jetzt entscheidet
 * jede Aufrufstelle explizit per `shouldReroll`, statt das aus einem Index-Vergleich
 * zu erraten: `nextLevel()`/`goToLevel()`/`restartRun()` würfeln IMMER neu (auch wenn
 * der Ziel-Index zufällig gleich bleibt), NUR `rescueRun()` (setzt exakt denselben
 * Versuch fort) lässt die Variante unangetastet.
 */
function rollLevelVariantSeed(shouldReroll: boolean, previousVariantSeed: number): number {
  if (!shouldReroll) return previousVariantSeed;
  return Math.floor(Math.random() * LEVEL_VARIANT_COUNT);
}

function createLevelState(
  levelIndex: number,
  runSeed: number,
  variantSeed: number,
  defeatedWorldBosses: string[],
): Omit<GameState, 'save' | 'streak' | 'rescueUsedThisRun'> {
  const level = levelConfigAt(levelIndex, runSeed, variantSeed, defeatedWorldBosses);
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
    apples: level.appleAngles.map((angle, i) => ({
      id: i,
      boardLocalAngleDeg: angle,
      collected: false,
      golden: i === level.goldenAppleIndex,
      figurine: i === level.figurineIndex,
    })),
    applesCollectedThisRun: 0,
    gemsCollectedThisRun: 0,
    figurinesCollectedThisRun: 0,
    reward: null,
    flyingAxe: null,
    lastOutcome: null,
  };
}

export function useAxeGame(getBoardAngleDeg: () => number) {
  const [state, setState] = useState<GameState>(() => {
    const save = loadSave();
    setMuted(!save.soundOn);
    return {
      ...createLevelState(Math.max(0, save.currentLevel), save.runSeed, save.levelVariantSeed, save.defeatedWorldBosses),
      streak: save.streak,
      rescueUsedThisRun: false,
      save,
    };
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

  /**
   * Löst den Wurf auf: Treffer (Axt steckt) oder Kollision (= Game Over).
   *
   * GEFUNDENER BUG (Klaus: "Axt stoppt kurz vor der Zielscheibe, bevor der Einschlag
   * passiert"): das lief hier früher über einen EIGENEN `setTimeout(..., FLIGHT_DURATION_MS)`
   * in einem `useEffect` – eine komplett UNABHÄNGIGE Uhr neben der CSS-Flug-Animation
   * (`.axe-flying` in App.tsx, dieselbe `FLIGHT_DURATION_MS`, aber als `animation-duration`).
   * Zwei Uhren für dieselbe Dauer sind KEINE Garantie für denselben Zeitpunkt: die CSS-
   * Animation läuft compositor-getrieben (bleibt exakt im Takt, auch wenn der Haupt-Thread
   * kurz beschäftigt ist), ein `setTimeout` läuft dagegen auf dem Haupt-Thread und kann
   * dort nachhinken (Timer-Drift, React-Re-Renders, Effekte). Ergebnis: die Axt "kam" (die
   * CSS-Animation war fertig und stand per `animation-fill-mode: forwards` exakt am Ziel),
   * aber der JS-Timer war noch nicht gefeuert – Einschlag-Effekte, Board-Zucken und die
   * "steckende" Axt blieben für ein paar Millisekunden aus. GENAU der gemeldete
   * "Mikro-Stopp kurz vor dem Einschlag", nur dass die Axt tatsächlich schon angekommen
   * war und auf das Spiel gewartet hat, nicht umgekehrt.
   *
   * FIX: keine zweite Uhr mehr. `App.tsx` ruft diese Funktion jetzt direkt aus dem
   * `onAnimationEnd`-Event der `.axe-flying`-Animation auf – demselben Ereignis, das der
   * Browser GENAU in dem Moment feuert, in dem die Animation tatsächlich fertig ist. Damit
   * gibt es nur noch EIN System, das über den Zeitpunkt des Einschlags entscheidet.
   *
   * Die Updater-Funktion bleibt bewusst REIN (keine Ref-Mutationen, keine
   * `performance.now()`-Aufrufe), damit sie den StrictMode-Doppelaufruf unbeschadet
   * übersteht – das war schon vorher so und ändert sich durch den neuen Aufrufer nicht.
   */
  const resolveThrow = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'flying' || !prev.flyingAxe) return prev;
      const level = levelConfigAt(prev.levelIndex, prev.save.runSeed, prev.save.levelVariantSeed, prev.save.defeatedWorldBosses);

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
      let gemsCollectedThisRun = prev.gemsCollectedThisRun;
      let figurinesCollectedThisRun = prev.figurinesCollectedThisRun;
      const hitApple = findHitApple(localAngle, prev.apples);
      if (hitApple) {
        apples = prev.apples.map((apple) => (apple.id === hitApple.id ? { ...apple, collected: true } : apple));
        applesCollectedThisRun = prev.applesCollectedThisRun + 1;
        // Golden statt normal -> Diamanten statt Münzen, siehe computeReward unten.
        if (hitApple.golden) gemsCollectedThisRun = prev.gemsCollectedThisRun + 1;
        // Sammelfigur (nur Heldenstadt) -> landet im Figuren-Inventar statt in Münzen.
        if (hitApple.figurine) figurinesCollectedThisRun = prev.figurinesCollectedThisRun + 1;
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
        gemsCollectedThisRun,
        figurinesCollectedThisRun,
        reward: levelDone
          ? computeReward(
              prev.levelIndex,
              applesCollectedThisRun,
              gemsCollectedThisRun,
              figurinesCollectedThisRun,
              prev.streak,
              prev.save,
            )
          : null,
      };
    });
  }, [getBoardAngleDeg]);

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
        gems: prev.save.gems + prev.reward.gems,
        xp: prev.save.xp + prev.reward.xp,
        figurines: prev.save.figurines + prev.reward.figurines,
        // Klaus: "wenn ich den Boss besiege, steigt nicht mein Highscore, der hat mit
        // dem Highscore absolut nichts zu tun" – ein Weltboss-Sieg lässt `bestLevel`
        // deshalb bewusst unangetastet, nur normale Level zählen dafür.
        bestLevel: prev.reward.worldBossId ? prev.save.bestLevel : Math.max(prev.save.bestLevel, prev.levelIndex + 2),
        streak,
        ownedSkins: prev.reward.unlockedAxeSkinId
          ? [...prev.save.ownedSkins, prev.reward.unlockedAxeSkinId]
          : prev.save.ownedSkins,
        // Weltboss dauerhaft als besiegt vermerken (Klaus: "Boss nur einmal besiegen
        // müssen, dann ist der Hintergrund beim normalen Spiel die Wüste zum
        // Beispiel") – dieser Level-Index erzeugt ab sofort (auch nach einem
        // späteren Game Over) nie wieder einen Weltboss, siehe generateLevel() in
        // constants.ts.
        defeatedWorldBosses:
          prev.reward.worldBossId && !prev.save.defeatedWorldBosses.includes(prev.reward.worldBossId)
            ? [...prev.save.defeatedWorldBosses, prev.reward.worldBossId]
            : prev.save.defeatedWorldBosses,
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave, streak };
    });
    // Absichtlich nur an der Phase hängen: der Effekt soll genau einmal pro Level-Abschluss
    // laufen, nicht erneut, wenn sich der Spielstand danach durch einen Shop-Kauf ändert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Bei Game Over die Serie reißen lassen und den Lauf-Stand auf Level 1 zurücksetzen,
  // damit auch ein Schließen der App genau dort wieder aufsetzt. Bewusst IMMER Level 1
  // (nicht mehr der Anfang des aktuellen 10er-Blocks): das Ziel ist jetzt ein möglichst
  // hoher Highscore (= bestLevel) in einem einzigen Lauf statt Kampagnen-Fortschritt –
  // ein Fehler irgendwo wirft konsequent auf Los zurück, dafür bleiben Münzen/XP/Skins
  // aus bereits geschafften Leveln erhalten (siehe oben, nur `currentLevel` resettet).
  //
  // `runSeed` steigt hier um genau 1 (Achter Härte-Durchgang – Boss-/Level-Rotation,
  // siehe `bossFruitForLevel`/`generateLevel` in constants.ts): DAS ist der Moment, in
  // dem ein Lauf endgültig vorbei ist, egal ob direkt danach neu gestartet wird oder die
  // App erst später wieder geöffnet wird. `restartRun()` (Button im Game-Over-Fenster)
  // erhöht NICHT nochmal – der Effekt hier ist schon gelaufen, bevor das Fenster
  // überhaupt angezeigt wird, ein zweiter Anhub dort wäre ein doppelter Sprung.
  useEffect(() => {
    if (state.phase !== 'gameOver') return;
    setState((prev) => {
      if (prev.phase !== 'gameOver') return prev;
      const nextSave: SaveData = { ...prev.save, streak: 0, currentLevel: 0, runSeed: prev.save.runSeed + 1 };
      saveSave(nextSave);
      return { ...prev, save: nextSave, streak: 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  /**
   * Springt zu einem Level – über die Weltkarte (beliebiges Ziel), das einzige verbliebene
   * Ziel-0 zu erreichen (Sprung auf die erste Welt "Wald" in der Weltkarte). Nur der Fall
   * "Ziel 0" zählt als Beginn einer neuen Runde und erhöht `runSeed` (Boss-/Level-Rotation,
   * siehe `bossFruitForLevel`/`generateLevel` in constants.ts) sowie setzt die einmalige
   * Video-Rettung (`rescueUsedThisRun`) zurück – ein Sprung zu einer bereits
   * freigeschalteten Welt mitten in einem laufenden Highscore-Versuch ist kein Neustart.
   */
  const goToLevel = useCallback((levelIndex: number) => {
    pendingThrowRef.current = false;
    setState((prev) => {
      const target = Math.max(0, levelIndex);
      const isNewRun = target === 0;
      const nextSave: SaveData = {
        ...prev.save,
        currentLevel: target,
        runSeed: isNewRun ? prev.save.runSeed + 1 : prev.save.runSeed,
        levelVariantSeed: rollLevelVariantSeed(true, prev.save.levelVariantSeed),
      };
      saveSave(nextSave);
      return {
        ...createLevelState(target, nextSave.runSeed, nextSave.levelVariantSeed, nextSave.defeatedWorldBosses),
        streak: prev.streak,
        rescueUsedThisRun: isNewRun ? false : prev.rescueUsedThisRun,
        save: nextSave,
      };
    });
  }, []);

  /**
   * Nach einem Game Over: normalerweise Neustart bei Level 1 (Highscore-Prinzip).
   * AUSNAHME NUR NOCH FÜR DEN WELTBOSS (Klaus, ursprünglich: "wenn man beim
   * Bosskampf verkackt und nochmal spielen klickt, kommt man wieder zum normalen und
   * bleibt nicht beim Bosskampf" – galt anfangs für Fruchtboss UND Weltboss). Klaus
   * später eingeschränkt: "wenn man den [Frucht-]Boss verkackt, darf man nicht
   * nochmal probieren, man wird wieder zu Level 1 zurückgeworfen" – ein Fruchtboss
   * (alle 5 Level) ist damit wieder ein normaler Level ohne Extra-Versuch, nur ein
   * Weltboss (Welt-Eingang, deutlich größere Prüfung) behält den Wiederholungs-
   * Mechanismus, damit man nicht bei jedem Fehlversuch den ganzen Lauf bis dahin
   * nochmal spielen muss. Münzen/XP/Skins bleiben in beiden Fällen erhalten.
   * `runSeed` ist an dieser Stelle schon erhöht (siehe Game-Over-Effekt oben) – hier
   * NICHT nochmal anfassen, sonst springt die Rotation bei jedem Tod um 2 statt 1.
   */
  const restartRun = useCallback(() => {
    setState((prev) => {
      const level = levelConfigAt(prev.levelIndex, prev.save.runSeed, prev.save.levelVariantSeed, prev.save.defeatedWorldBosses);
      const diedOnWorldBoss = Boolean(level.worldBossId);
      const target = diedOnWorldBoss ? prev.levelIndex : 0;
      pendingThrowRef.current = false;
      const nextSave: SaveData = {
        ...prev.save,
        currentLevel: target,
        streak: 0,
        levelVariantSeed: rollLevelVariantSeed(true, prev.save.levelVariantSeed),
      };
      saveSave(nextSave);
      return {
        ...createLevelState(target, nextSave.runSeed, nextSave.levelVariantSeed, nextSave.defeatedWorldBosses),
        streak: 0,
        rescueUsedThisRun: false,
        save: nextSave,
      };
    });
  }, []);

  /**
   * Einmalige Video-Rettung im Game-Over-Fenster (siehe GameOverModal.tsx): setzt den
   * Lauf GENAU im Level fort, in dem er geendet hat – anders als `restartRun()` bleibt
   * `currentLevel` also NICHT auf 0 zurückgesetzt. Nur einmal pro Lauf möglich
   * (`rescueUsedThisRun`), erst durch `goToLevel(0)`/`restartRun()` wieder freigeschaltet.
   * Bewusst kein Undo der Serie (`streak`) – die wird vom automatischen Game-Over-Effekt
   * oben schon auf 0 gesetzt, bevor das Fenster überhaupt erscheint, ein Rückgängigmachen
   * dafür bräuchte einen separaten "Serie vor dem Fehlwurf"-Zwischenspeicher, den es
   * (noch) nicht gibt – die Rettung bewahrt also Level-Fortschritt und Münzen, nicht die
   * Serie. Läuft rein clientseitig als Platzhalter für eine echte Rewarded-Video-Anzeige
   * (siehe `VideoRescueModal.tsx`) – hier wird nur der Spielzustand zurückgesetzt, das
   * eigentliche Video/Ad-SDK ist noch nicht angebunden.
   *
   * GIBT BEWUSST KEINE `VIDEO_RESCUE_COINS` mehr (Klaus: "wenn man verkackt, soll man
   * mit Video NUR Fortschritt nicht verlieren, nicht zusätzlich 350 bekommen") – diese
   * Münzbelohnung war ursprünglich hier eingebaut, ist inzwischen aber exklusiv dem
   * NEUEN, komplett unabhängigen Hauptmenü-Button vorbehalten (siehe `watchAdReward()`
   * unten). Die Rettung hier bewahrt ausschließlich den Lauf-Fortschritt.
   */
  const rescueRun = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'gameOver' || prev.rescueUsedThisRun) return prev;
      pendingThrowRef.current = false;
      const target = prev.levelIndex;
      const nextSave: SaveData = { ...prev.save, currentLevel: target };
      saveSave(nextSave);
      return {
        ...createLevelState(target, nextSave.runSeed, nextSave.levelVariantSeed, nextSave.defeatedWorldBosses),
        streak: prev.streak,
        rescueUsedThisRun: true,
        save: nextSave,
      };
    });
  }, []);

  /**
   * Werbevideo IM HAUPTMENÜ, unabhängig vom Game-Over-Rettungsvideo (`rescueRun`
   * oben): Klaus dazu ausdrücklich "wenn man verliert, kann man durch ein Video
   * seinen Fortschritt beibehalten, Punkt aus Ende" – DAS bleibt unangetastet.
   * Zusätzlich soll es im Hauptmenü (bei Highscore/Münzen/XP) einen eigenen,
   * jederzeit nutzbaren Button geben, der GENAU dieselbe Münzsumme
   * (`VIDEO_RESCUE_COINS`) fürs Anschauen gibt – aber OHNE jede Auswirkung auf
   * `currentLevel`/`phase`/`rescueUsedThisRun`, weil es hier keinen Lauf zu retten
   * gibt, nur eine Belohnung. Bewusst ohne Nutzungslimit (keine Vorgabe dazu) –
   * beliebig oft vom Startbildschirm aus nutzbar.
   */
  const watchAdReward = useCallback(() => {
    setState((prev) => {
      const nextSave: SaveData = { ...prev.save, coins: prev.save.coins + VIDEO_RESCUE_COINS };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /**
   * Nächstes Level. Bewusst OHNE Obergrenze: nach Level 100 (LEVEL_COUNT) läuft es
   * einfach als Endlos-Modus weiter – `levelConfigAt()` berechnet jede weitere
   * Levelnummer live, siehe constants.ts.
   *
   * AUSNAHME für einen gerade besiegten Weltboss (Klaus: "nach dem Boss soll man nur
   * die Welt geschafft haben, nicht zu Level 22 oder so kommen – der Boss ist separat
   * und hat kein Level"): `target` bleibt in diesem Fall auf demselben Level-Index
   * stehen statt weiterzuzählen. Das ist kein Bug, sondern Absicht – die Welt ist
   * jetzt in `SaveData.defeatedWorldBosses` vermerkt (siehe Belohnungs-Effekt oben),
   * `levelConfigAt()` erzeugt an GENAU diesem Index deshalb ab sofort einen ganz
   * normalen, thematisch passenden Level statt wieder den Weltboss – der nächste
   * Sprung dorthin (App.tsx schickt nach einem Weltboss-Sieg zurück zum
   * Hauptmenü statt direkt weiterzuspielen) landet also automatisch im "normalen
   * Spiel" dieser Welt, ohne dass hier ein zweiter Index nötig wäre. Erkannt über
   * `prev.reward?.worldBossId` statt eines erneuten `levelConfigAt()`-Aufrufs, weil
   * die Welt zu diesem Zeitpunkt schon als besiegt vermerkt ist – ein erneuter Aufruf
   * mit dem AKTUELLEN Spielstand würde fälschlich schon `undefined` liefern.
   */
  const nextLevel = useCallback(() => {
    setState((prev) => {
      const wasWorldBossVictory = Boolean(prev.reward?.worldBossId);
      const target = wasWorldBossVictory ? prev.levelIndex : prev.levelIndex + 1;
      pendingThrowRef.current = false;
      const nextSave: SaveData = {
        ...prev.save,
        currentLevel: target,
        levelVariantSeed: rollLevelVariantSeed(true, prev.save.levelVariantSeed),
      };
      saveSave(nextSave);
      return {
        ...createLevelState(target, nextSave.runSeed, nextSave.levelVariantSeed, nextSave.defeatedWorldBosses),
        streak: prev.streak,
        rescueUsedThisRun: prev.rescueUsedThisRun,
        save: nextSave,
      };
    });
  }, []);

  /** Skin kaufen, falls genug Münzen da sind. Rüstet ihn direkt aus. */
  /**
   * Skin kaufen. Zwei käufliche Quellen: 'shop' zieht Münzen ab, 'gem' Diamanten –
   * 'boss' und 'egg' sind nie käuflich (return früh). Welche Währung betroffen ist,
   * entscheidet allein `skin.source`, nicht irgendein UI-Zustand.
   */
  const buySkin = useCallback((skinId: string) => {
    setState((prev) => {
      const skin = getSkin(skinId);
      if (!skin || (skin.source !== 'shop' && skin.source !== 'gem')) return prev;
      if (prev.save.ownedSkins.includes(skinId) || isFreeSkin(skinId)) return prev;

      const useGems = skin.source === 'gem';
      const balance = useGems ? prev.save.gems : prev.save.coins;
      if (balance < skin.price) return prev;

      const nextSave: SaveData = {
        ...prev.save,
        coins: useGems ? prev.save.coins : prev.save.coins - skin.price,
        gems: useGems ? prev.save.gems - skin.price : prev.save.gems,
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

  /**
   * Oster-Ei: schaltet einen versteckten Skin frei, ausgelöst über ein Geheimnis in
   * der UI (siehe StartScreen.tsx – mehrfaches Antippen des Logos). Bewusst
   * eigenständig statt über buySkin: kein Preis, keine Quellen-Prüfung, einfach ein
   * Geschenk. Rennt gefahrlos mehrfach (z.B. wenn man die Sequenz zweimal schafft).
   */
  const unlockEasterEgg = useCallback((skinId: string) => {
    setState((prev) => {
      if (prev.save.ownedSkins.includes(skinId)) return prev;
      const skin = getSkin(skinId);
      if (!skin) return prev;
      const nextSave: SaveData = {
        ...prev.save,
        ownedSkins: [...prev.save.ownedSkins, skinId],
        ...(skin.kind === 'axe' ? { equippedAxeSkin: skinId } : { equippedBoardSkin: skinId }),
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /**
   * Schaltet eine Axt nach einem ECHTEN, vom Store bestätigten Kauf frei (siehe
   * `purchaseSkin()` in game/purchases.ts, aufgerufen aus Shop.tsx NACHDEM
   * RevenueCat/StoreKit den Kauf bestätigt hat – niemals vorher). Gleiche
   * Freischalt-Logik wie `unlockEasterEgg` (Ownership + Ausrüsten, keine
   * Währungsprüfung), aber bewusst ein eigener, klar benannter Pfad statt die
   * Oster-Ei-Funktion wiederzuverwenden – unterschiedliche Bedeutung (echtes Geld
   * vs. Geschenk), auch wenn der Code identisch ist.
   */
  const grantPurchasedSkin = useCallback((skinId: string) => {
    setState((prev) => {
      if (prev.save.ownedSkins.includes(skinId)) return prev;
      const skin = getSkin(skinId);
      if (!skin) return prev;
      const nextSave: SaveData = {
        ...prev.save,
        ownedSkins: [...prev.save.ownedSkins, skinId],
        ...(skin.kind === 'axe' ? { equippedAxeSkin: skinId } : { equippedBoardSkin: skinId }),
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /**
   * Alle gesammelten Figuren auf einmal gegen Diamanten eintauschen (siehe Shop,
   * Extras-Reiter). Bewusst ein simpler Gesamt-Eintausch statt Einzelauswahl – die
   * Figuren sind ein reiner Vorrat, keine Sammlung unterschiedlicher, eindeutiger
   * Exemplare, die einzeln verwaltet werden müssten.
   */
  const tradeFigurines = useCallback(() => {
    setState((prev) => {
      if (prev.save.figurines <= 0) return prev;
      const nextSave: SaveData = {
        ...prev.save,
        figurines: 0,
        gems: prev.save.gems + prev.save.figurines * GEMS_PER_FIGURINE,
      };
      saveSave(nextSave);
      return { ...prev, save: nextSave };
    });
  }, []);

  /**
   * Tägliche Belohnung abholen. Rechnet die Serie ganz bewusst NOCHMAL selbst aus
   * `prev.save` aus (statt den zuvor per `pendingDailyReward()` fürs Rendern
   * berechneten Wert reinzureichen) – das hält die Update-Funktion rein und
   * unabhängig vom Render-Zeitpunkt, falls z.B. die Mitternacht mitten in einer
   * offenen Session überschritten wird.
   */
  const claimDailyReward = useCallback(() => {
    setState((prev) => {
      const pending = pendingDailyReward(prev.save.lastDailyClaim, prev.save.dailyStreak);
      if (!pending) return prev;
      const nextSave: SaveData = {
        ...prev.save,
        coins: prev.save.coins + pending.reward.coins,
        gems: prev.save.gems + pending.reward.gems,
        dailyStreak: pending.streak,
        lastDailyClaim: todayDateString(),
      };
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

  const level = levelConfigAt(state.levelIndex, state.save.runSeed, state.save.levelVariantSeed, state.save.defeatedWorldBosses);
  // Genau EINMAL wahr: wenn gerade Level 100 (der letzte feste Kampagnen-Level)
  // abgeschlossen wurde. Nicht "letztes Level" im eigentlichen Sinn mehr – es gibt
  // keins, danach läuft es als Endlos-Modus weiter (siehe nextLevel oben). Der
  // Ergebnis-Screen nutzt dieses Flag nur für die einmalige Glückwunsch-Anzeige.
  const isCampaignComplete = state.phase === 'levelComplete' && state.levelIndex === LEVEL_COUNT - 1;
  const bossFruit = bossFruitForLevel(state.levelIndex, state.save.runSeed);
  // Weltboss-Phasen-Eskalation: das Tempo zieht WÄHREND des Kampfes an, je mehr Äxte
  // schon geworfen sind (siehe worldBossPhaseSpeedMultiplier() in constants.ts). Bei
  // normalen Leveln ist der Multiplikator schlicht 1 (kein Effekt).
  const worldBoss = level.worldBossId ? WORLD_BOSSES[level.worldBossId] : undefined;
  const worldBossProgress = state.axesThrown / level.axeCount;
  const worldBossPhaseMultiplier = worldBoss ? worldBossPhaseSpeedMultiplier(worldBossProgress) : 1;
  // Phasen-Eskalation Teil 2 (siehe worldBossPhaseSpinPattern in constants.ts): bei
  // Weltbossen wechselt das Dreh-Muster WÄHREND des Kampfes, nicht nur das Tempo.
  // Normale Level und Fruchtbosse behalten ihr festes `level.spinPattern`.
  const spinPattern = worldBoss ? worldBossPhaseSpinPattern(worldBossProgress) : level.spinPattern;

  return {
    ...state,
    levelCount: LEVEL_COUNT,
    isCampaignComplete,
    /** Erster Level-Index des aktuellen 10er-Blocks – dorthin geht es nach einem Game Over. */
    blockStart: blockStartIndex(state.levelIndex),
    levelsPerBlock: LEVELS_PER_BLOCK,
    boardSpeedDegPerSec: level.boardSpeedDegPerSec * BOARD_SPEED_MULTIPLIER * worldBossPhaseMultiplier,
    spinPattern,
    axeCount: level.axeCount,
    appleCount: level.appleAngles.length,
    axesRemaining: level.axeCount - state.axesThrown,
    bossFruit,
    /** Name des Weltbosses, falls dieses Level das "Tor" vor einer Welt ist (siehe
     *  isWorldBossLevel()/WORLD_BOSSES in worlds.ts), sonst `null`. */
    worldBossName: worldBoss?.name ?? null,
    /** Boss-Level (beide Arten) zeigen die Scheibe des Bosses statt des ausgerüsteten
     *  Designs – Weltboss hat dabei Vorrang, falls beide sich je theoretisch
     *  überschneiden sollten (kommt aktuell nicht vor, jeder Level-Index ist höchstens
     *  eine Boss-Art). */
    activeBoardSkin: worldBoss ? worldBoss.boardSkinId : bossFruit ? bossFruit.boardSkinId : state.save.equippedBoardSkin,
    /** Wartende tägliche Belohnung, `null` wenn heute schon abgeholt. Reine Ableitung
     *  aus dem Spielstand, kein eigener State – berechnet sich bei jedem Render neu
     *  aus der aktuellen Uhrzeit, damit ein Tageswechsel mitten in der Session sofort
     *  sichtbar wird. */
    dailyReward: pendingDailyReward(state.save.lastDailyClaim, state.save.dailyStreak),
    throwAxe,
    resolveThrow,
    restartRun,
    nextLevel,
    goToLevel,
    buySkin,
    equipSkin,
    unlockEasterEgg,
    grantPurchasedSkin,
    setSoundOn,
    tradeFigurines,
    claimDailyReward,
    markTutorialSeen,
    rescueRun,
    watchAdReward,
  };
}

/**
 * Rechnet die Belohnung eines geschafften Levels aus. Reine Funktion, damit sie
 * gefahrlos in der setState-Updater-Funktion laufen kann (StrictMode-Doppelaufruf).
 *
 * `applesCollected` zählt ALLE eingesammelten Äpfel (golden + normal + Sammelfigur) –
 * wichtig für den Perfekt-Bonus, der "alle Äpfel des Levels" prüft. Für die Münzen
 * zählen nur die GEWÖHNLICHEN; golden bringt Diamanten (`gemsCollected`), Sammelfigur
 * bringt eine Figur ins Inventar (`figurinesCollected`) – beide sind exklusiv,
 * ein Level hat nie beides gleichzeitig (siehe goldenAppleIndexFor/figurineIndexFor).
 */
function computeReward(
  levelIndex: number,
  applesCollected: number,
  gemsCollected: number,
  figurinesCollected: number,
  streak: number,
  save: SaveData,
): LevelReward {
  const level = levelConfigAt(levelIndex, save.runSeed, save.levelVariantSeed, save.defeatedWorldBosses);
  const boss = bossFruitForLevel(levelIndex, save.runSeed);

  const apples = (applesCollected - gemsCollected - figurinesCollected) * COINS_PER_APPLE;
  const gems = gemsCollected * GEMS_PER_GOLDEN_APPLE;
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
  // REWARD_MULTIPLIER (der frühere "Schwer"-Bonus, siehe constants.ts) multipliziert die
  // Endsumme zusätzlich zur Serie, taucht aber NICHT in `streakMultiplier` auf – dieses
  // Feld beschriftet im Ergebnis-Screen explizit "Serie ×N", ein zweiter Faktor darin
  // würde die Anzeige verfälschen.
  const total = Math.round(raw * multiplier * REWARD_MULTIPLIER);

  return {
    apples,
    base: base + bossCoins,
    perfect,
    block,
    streakMultiplier: multiplier,
    total,
    // Diamanten laufen bewusst NICHT durch den Serien-Multiplikator – der ist eine
    // Münzen-Belohnung fürs Nicht-Sterben, goldene Äpfel sind reines Fund-Glück.
    gems,
    // Sammelfiguren ebenso: 1:1 ohne Multiplikator, reines Fund-Glück wie die Diamanten.
    figurines: figurinesCollected,
    // XP ist bewusst FEST pro Level, ohne Serie/Perfekt-Bonus/Schwierigkeit – anders als
    // die Münzen soll sie nicht taktisch optimierbar sein, nur ein einfacher, verlässlicher
    // Fortschrittsbalken Richtung nächste Welt.
    xp: XP_PER_LEVEL,
    bossFruitId: boss?.id,
    worldBossId: level.worldBossId,
    unlockedAxeSkinId,
  };
}
