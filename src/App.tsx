import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { AxeInventory } from './components/AxeInventory';
import { HUD } from './components/HUD';
import { AXE_STICK_RATIO, BOARD_SIZE, TargetBoard, type TargetBoardHandle } from './components/TargetBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { Shop } from './components/Shop';
import { StartScreen } from './components/StartScreen';
import { WorldDecor } from './components/WorldDecor';
import { WorldMap } from './components/WorldMap';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS, GAME_OVER_DELAY_MS, LEVEL_COMPLETE_DELAY_MS } from './game/constants';
import { worldForLevel, worldStyleVars } from './game/worlds';
import { EASTER_EGG_SKINS } from './game/shop';
import {
  playAppleSound,
  playBossSound,
  playBreakSound,
  playHitSound,
  playMissSound,
  unlockAudio,
  vibrate,
} from './game/sound';
import type { ThrowOutcome } from './game/types';
import './App.css';

const PARTICLE_ANGLES = [-70, -40, -15, 10, 35, 60, 90, -95, -120, 130];

/** Wie tief der Axtkopf über den Steck-Radius hinaus ins Holz fährt (px). */
const AXE_BITE_PX = 6;

/**
 * Lage der Scheibe innerhalb der Bühne, in Pixeln. Grundlage für die Flugbahn –
 * siehe ausführliche Begründung unten bei der Berechnung.
 */
interface BoardGeometry {
  /** Seitlicher Abstand der Scheibenmitte zur Bühnenmitte. */
  centerX: number;
  /** Abstand der Scheibenmitte zur Oberkante der Bühne. */
  centerY: number;
  radius: number;
  /** Höhe der Bühne – nötig, um von "Abstand oben" auf `bottom` umzurechnen. */
  height: number;
}

/**
 * Radius in Bildschirm-Pixeln, auf dem die Äxte tatsächlich stecken.
 *
 * Flugbahn und Späne-Burst müssen denselben Wert benutzen wie die steckenden Äxte.
 * Eine frühere Fassung rechnete mit dem gemessenen Scheiben-Radius (130) statt dem
 * Steck-Radius (120) – dadurch endete der Flug 10px weiter außen als die Axt danach
 * steckte, und der Späne-Burst saß sichtbar neben dem Einschlag.
 */
function stickRadiusPx(geom: BoardGeometry | null): number {
  return (geom?.radius ?? BOARD_SIZE / 2) * AXE_STICK_RATIO;
}

// Rein dekorativer Staub, der langsam nach oben treibt – für Atmosphäre.
const DUST_MOTES = [
  { left: '12%', delay: '0s', duration: '9s' },
  { left: '28%', delay: '2.5s', duration: '11s' },
  { left: '48%', delay: '1s', duration: '8s' },
  { left: '66%', delay: '4s', duration: '12s' },
  { left: '82%', delay: '1.8s', duration: '10s' },
  { left: '92%', delay: '3.4s', duration: '9.5s' },
];

/** Welcher Bildschirm gerade oben liegt. Rein visuell – der Spielzustand lebt in useAxeGame. */
type Screen = 'start' | 'game';

function App() {
  const boardHandleRef = useRef<TargetBoardHandle>(null);
  const getBoardAngleDeg = useCallback(() => boardHandleRef.current?.getAngleDeg() ?? 0, []);
  const game = useAxeGame(getBoardAngleDeg);

  const stageRef = useRef<HTMLDivElement>(null);
  const prevHitsRef = useRef(game.hits);
  const prevOutcomeRef = useRef<ThrowOutcome | null>(null);
  const prevApplesRef = useRef(game.applesCollectedThisRun);
  const prevCoinsRef = useRef(game.save.coins);
  const prevGemsRef = useRef(game.save.gems);
  const [burstId, setBurstId] = useState(0);
  const [clashId, setClashId] = useState(0);
  const [muzzleId, setMuzzleId] = useState(0);
  const prevFlightStartRef = useRef<number | null>(null);
  const [coinsFlash, setCoinsFlash] = useState(false);
  const [gemsFlash, setGemsFlash] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');
  const [boardGeom, setBoardGeom] = useState<BoardGeometry | null>(null);
  /**
   * Ob das große Ergebnis-Fenster schon sichtbar sein darf. Ohne diese Verzögerung
   * knallte das Menü im selben Moment hoch, in dem die letzte Axt einschlug – man
   * wurde davon regelrecht überrumpelt ("kommt so random das Menü, das erschreckt
   * einen"). Die Scheibe friert trotzdem SOFORT ein (siehe `paused` weiter unten),
   * nur das Fenster selbst wartet: erst zeigt die Bühne kurz ein großes "Geschafft!"
   * bzw. "Axt zersplittert" (`.outcome-banner`), danach erst fährt das Menü rein.
   */
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (game.phase !== 'levelComplete' && game.phase !== 'gameOver') {
      setModalVisible(false);
      return;
    }
    setModalVisible(false);
    const delay = game.phase === 'levelComplete' ? LEVEL_COMPLETE_DELAY_MS : GAME_OVER_DELAY_MS;
    const timeout = setTimeout(() => setModalVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [game.phase]);
  /*
   * Scheibenposition messen, sobald die Bühne steht – und bei jeder Größenänderung neu.
   * `useLayoutEffect`, damit der Wert vor dem ersten Zeichnen da ist und der allererste
   * Wurf nicht mit einer Notfall-Schätzung fliegt.
   *
   * Der ResizeObserver hängt an der Bühne, nicht am Fenster: auf dem Handy ändert sich
   * die nutzbare Höhe auch ohne Fenster-Resize, wenn die Browserleiste ein- und
   * ausfährt. Ein reiner `window.resize`-Listener würde das verpassen.
   */
  useLayoutEffect(() => {
    if (screen !== 'game') return;
    const stage = stageRef.current;
    if (!stage) return;

    const messen = () => {
      const board = boardHandleRef.current?.getGeometry();
      if (!board) return;
      const s = stage.getBoundingClientRect();
      setBoardGeom({
        centerX: board.centerX - (s.left + s.width / 2),
        centerY: board.centerY - s.top,
        radius: board.radius,
        height: s.height,
      });
    };

    messen();
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(stage);
    return () => beobachter.disconnect();
  }, [screen, game.levelIndex]);

  // Screen-Shake auf der Bühne – gemeinsam für Treffer UND Kollision genutzt.
  const shakeStage = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    el.classList.remove('stage--shake');
    void el.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
    el.classList.add('stage--shake');
  }, []);

  // Winziger, schneller Rückstoß-Ruck im Moment des ABSCHUSSES (nicht des Treffers) –
  // eigene, deutlich dezentere Animation als shakeStage. Zusammen mit dem Mündungsblitz
  // soll sich das Werfen selbst wie ein direkter Schuss anfühlen, nicht nur der Einschlag.
  const recoilStage = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    el.classList.remove('stage--recoil');
    void el.offsetWidth;
    el.classList.add('stage--recoil');
  }, []);

  // Mündungsblitz + Rückstoß GENAU im Moment, in dem eine neue Axt losfliegt –
  // erkannt an einem neuen `startedAt`-Zeitstempel (jeder Wurf bekommt einen eigenen).
  useEffect(() => {
    const started = game.flyingAxe?.startedAt ?? null;
    if (started !== null && started !== prevFlightStartRef.current) {
      setMuzzleId((id) => id + 1);
      recoilStage();
    }
    prevFlightStartRef.current = started;
  }, [game.flyingAxe, recoilStage]);

  // Juice: Screen-Shake + Holzspäne-Partikel + Schockwelle + kurzer Rums bei jedem Treffer.
  useEffect(() => {
    if (game.hits > prevHitsRef.current) {
      shakeStage();
      setBurstId((id) => id + 1);
      boardHandleRef.current?.punch(); // Hit-Stop + Zusammenzucken der Scheibe
      vibrate(18);
    }
    prevHitsRef.current = game.hits;
  }, [game.hits, shakeStage]);

  // Soundeffekte je nach Ausgang des Wurfs.
  useEffect(() => {
    if (game.lastOutcome && game.lastOutcome !== prevOutcomeRef.current) {
      if (game.phase === 'levelComplete' && game.lastOutcome === 'stuck') {
        if (game.bossFruit) playBossSound();
        else playBreakSound();
      } else if (game.lastOutcome === 'stuck') {
        playHitSound();
      } else {
        playMissSound();
        vibrate([40, 60, 90]); // Game Over darf sich anders anfühlen als ein Treffer
        /*
         * Trifft man die eigene Axt, steigt `hits` NICHT (die Axt prallt ab statt zu
         * stecken) – der Treffer-Effekt oben feuerte deshalb bisher gar nicht, und die
         * tödliche Kollision wirkte lahm: die Axt verschwand einfach. Ein eigener,
         * metallischer "Clash"-Effekt (Funken statt Holzspäne) plus Hit-Stop und Shake
         * geben genau diesem Moment das Gewicht, das er als Wendepunkt braucht.
         */
        shakeStage();
        setClashId((id) => id + 1);
        boardHandleRef.current?.punch();
      }
    }
    prevOutcomeRef.current = game.lastOutcome;
  }, [game.lastOutcome, game.phase, game.bossFruit, shakeStage]);

  // Eingesammelter Apfel: Ton. Das Fallen zeigt TargetBoard selbst an.
  useEffect(() => {
    if (game.applesCollectedThisRun > prevApplesRef.current) {
      playAppleSound();
      vibrate(12);
    }
    prevApplesRef.current = game.applesCollectedThisRun;
  }, [game.applesCollectedThisRun]);

  // Münz-Anzeige aufblitzen lassen, sobald sich der Kontostand erhöht.
  useEffect(() => {
    if (game.save.coins > prevCoinsRef.current) {
      setCoinsFlash(true);
      const timeout = setTimeout(() => setCoinsFlash(false), 700);
      prevCoinsRef.current = game.save.coins;
      return () => clearTimeout(timeout);
    }
    prevCoinsRef.current = game.save.coins;
  }, [game.save.coins]);

  // Diamant-Anzeige aufblitzen lassen, sobald sich der Bestand erhöht.
  useEffect(() => {
    if (game.save.gems > prevGemsRef.current) {
      setGemsFlash(true);
      const timeout = setTimeout(() => setGemsFlash(false), 700);
      prevGemsRef.current = game.save.gems;
      return () => clearTimeout(timeout);
    }
    prevGemsRef.current = game.save.gems;
  }, [game.save.gems]);

  const hint = game.phase === 'ready' ? 'Tippen zum Werfen – triff die Lücke' : '';

  const handlePointerDown = () => {
    unlockAudio(); // muss innerhalb der Nutzer-Interaktion passieren, sonst blockt der Browser Audio

    // WO man tippt, spielt keine Rolle – die Axt geht immer geradeaus nach oben,
    // wie beim Vorbild "Knife Hit". Es gab zwischendurch eine Ziel-Mechanik; die hat
    // das Spiel unnötig kompliziert gemacht und wurde wieder entfernt.
    game.throwAxe();
  };

  const startPlaying = () => {
    unlockAudio();
    game.markTutorialSeen();
    setScreen('game');
  };

  /*
   * Flugbahn der Axt: immer senkrecht nach oben durch die Scheibenmitte, bis zum
   * tiefsten Punkt des Steck-Radius. Es gibt keine Richtungsvariante mehr – der
   * Einschlagpunkt ist auf dem Bildschirm immer derselbe, nur die Scheibe dreht
   * sich darunter weg.
   *
   * Die Endhöhe wird aus der GEMESSENEN Scheibenposition gerechnet, nicht aus einem
   * festen Prozentwert: die Scheibe sitzt mittig in einer flexiblen Zone, ihre Lage
   * hängt also von der Bildschirmhöhe ab. Eine frühere Fassung endete fest bei
   * `bottom: 68%` und die Axt flog rund 300px zu weit, quer durch die Scheibe.
   */
  const flightX = boardGeom?.centerX ?? 0;
  const impactY = (boardGeom?.centerY ?? 0) + stickRadiusPx(boardGeom);
  // `bottom` misst vom unteren Bühnenrand nach oben, `impactY` von oben nach unten –
  // daher die Differenz. AXE_BITE_PX kommt DAZU, damit die Axt ins Holz fährt.
  const flightEndBottom = (boardGeom?.height ?? 0) - impactY + AXE_BITE_PX;

  const overlayOpen = shopOpen || settingsOpen || worldMapOpen;
  const world = worldForLevel(game.levelIndex);

  if (screen === 'start') {
    return (
      <div className="app">
        <StartScreen
          continueLevel={game.levelIndex + 1}
          bestLevel={game.save.bestLevel}
          coins={game.save.coins}
          gems={game.save.gems}
          axeSkin={game.save.equippedAxeSkin}
          showTutorial={!game.save.tutorialSeen}
          onPlay={startPlaying}
          onRestartFromOne={() => {
            game.goToLevel(0);
            startPlaying();
          }}
          onOpenShop={() => setShopOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          onSecretFound={() => game.unlockEasterEgg(EASTER_EGG_SKINS[0].id)}
        />

        {shopOpen && (
          <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onClose={() => setShopOpen(false)} />
        )}
        {settingsOpen && (
          <SettingsModal
            soundOn={game.save.soundOn}
            bestLevel={game.save.bestLevel}
            difficulty={game.save.difficulty}
            onToggleSound={game.setSoundOn}
            onSetDifficulty={game.setDifficulty}
            onResetProgress={game.resetProgress}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {worldMapOpen && (
          <WorldMap
            bestLevel={game.save.bestLevel}
            currentLevelIndex={game.levelIndex}
            onSelectLevel={(levelIndex) => {
              game.goToLevel(levelIndex);
              startPlaying();
            }}
            onClose={() => setWorldMapOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <HUD
        level={game.levelIndex + 1}
        levelInBlock={game.levelIndex - game.blockStart}
        coins={game.save.coins}
        coinsFlash={coinsFlash}
        gems={game.save.gems}
        gemsFlash={gemsFlash}
        streak={game.streak}
        isBoss={!!game.bossFruit}
        onOpenShop={() => setShopOpen(true)}
      />

      <div
        ref={stageRef}
        className={`stage ${game.bossFruit ? 'stage--boss' : ''}`}
        style={worldStyleVars(game.levelIndex) as React.CSSProperties}
        onPointerDown={handlePointerDown}
      >
        <WorldDecor decor={world.decor} />

        <AxeInventory total={game.axeCount} thrown={game.axesThrown} skin={game.save.equippedAxeSkin} />

        <div className="stage__dust">
          {DUST_MOTES.map((mote, i) => (
            <span key={i} style={{ left: mote.left, animationDelay: mote.delay, animationDuration: mote.duration }} />
          ))}
        </div>

        {/* Boss-Level bekommen ein eigenes Schild, damit der Moment klar erkennbar ist. */}
        {game.bossFruit && (
          <div className="stage__boss-tag">
            <span className="stage__boss-tag-label">Boss</span>
            <span className="stage__boss-tag-name">{game.bossFruit.name}</span>
          </div>
        )}

        <div className="stage__board-zone">
          <TargetBoard
            ref={boardHandleRef}
            speedDegPerSec={game.boardSpeedDegPerSec}
            spinPattern={game.spinPattern}
            paused={game.phase === 'levelComplete' || game.phase === 'gameOver' || overlayOpen}
            stuckAxes={game.stuckAxes}
            apples={game.apples}
            boardSkin={game.activeBoardSkin}
            axeSkin={game.save.equippedAxeSkin}
            broken={game.phase === 'levelComplete' && game.lastOutcome === 'stuck'}
          />

        </div>

        {/* Späne und Schockwelle liegen auf Bühnen-Ebene, damit sie dieselben
            Koordinaten wie der Axt-Flug nutzen können und genau am Treffpunkt sitzen. */}
        {burstId > 0 && (
          <div
            key={`burst-${burstId}`}
            className="hit-effect"
            style={{
              ['--flight-x' as string]: `${flightX}px`,
              ['--flight-end-bottom' as string]: `${flightEndBottom}px`,
            }}
          >
            <span className="hit-effect__shockwave" />
            {PARTICLE_ANGLES.map((angle, i) => (
              <span
                key={i}
                className={`hit-effect__chip hit-effect__chip--${i % 3}`}
                style={{ ['--angle' as string]: `${angle}deg` }}
              />
            ))}
          </div>
        )}

        {/* Kollision mit der eigenen Axt: Funken statt Holzspäne, damit sich Sieg und
            Niederlage nicht gleich anfühlen. */}
        {clashId > 0 && (
          <div
            key={`clash-${clashId}`}
            className="hit-effect hit-effect--clash"
            style={{
              ['--flight-x' as string]: `${flightX}px`,
              ['--flight-end-bottom' as string]: `${flightEndBottom}px`,
            }}
          >
            <span className="hit-effect__shockwave hit-effect__shockwave--clash" />
            {PARTICLE_ANGLES.map((angle, i) => (
              <span
                key={i}
                className="hit-effect__spark"
                style={{ ['--angle' as string]: `${angle}deg` }}
              />
            ))}
          </div>
        )}

        {/* Mündungsblitz am Absprungpunkt – feuert im selben Frame wie der Wurf, damit
            sich das Abtippen selbst wie ein Schuss anfühlt, nicht nur der Einschlag. */}
        {muzzleId > 0 && (
          <div
            key={`muzzle-${muzzleId}`}
            className="muzzle-flash"
            style={{ ['--flight-x' as string]: `${flightX}px` }}
          />
        )}

        {game.phase === 'flying' && game.flyingAxe && (
          <div
            key={game.flyingAxe.startedAt}
            className="axe-flying"
            style={{
              animationDuration: `${FLIGHT_DURATION_MS}ms`,
              ['--flight-x' as string]: `${flightX}px`,
              ['--flight-end-bottom' as string]: `${flightEndBottom}px`,
            }}
          >
            <span className="axe-flying__trail" />
            <Axe size={42} skin={game.save.equippedAxeSkin} />
          </div>
        )}

        <div className="stage__thrower-zone">
          {/* Die "bereitliegende" Axt zeigt, von wo geworfen wird. */}
          {game.phase !== 'flying' && game.axesThrown < game.axeCount && (
            <div className="stage__ready-axe">
              <Axe size={42} skin={game.save.equippedAxeSkin} />
            </div>
          )}
          <div className="stage__hint">{hint}</div>
        </div>

        {/*
         * Sofortige Rückmeldung, WÄHREND das Menü noch wartet (siehe modalVisible oben).
         * Ohne dieses Banner war die Pause bis zum Menü ein stummes Nichts – jetzt sieht
         * man sofort, was passiert ist, und das Menü kommt danach als bewusster zweiter
         * Schritt statt als Überraschung.
         */}
        {(game.phase === 'levelComplete' || game.phase === 'gameOver') && !modalVisible && (
          <div
            className={`outcome-banner outcome-banner--${
              game.phase === 'gameOver' ? 'fail' : game.bossFruit ? 'boss' : 'win'
            }`}
          >
            <span
              className="outcome-banner__title"
              style={{
                animationDuration: `${game.phase === 'gameOver' ? GAME_OVER_DELAY_MS : LEVEL_COMPLETE_DELAY_MS}ms`,
              }}
            >
              {game.phase === 'gameOver' ? 'Axt zersplittert!' : game.bossFruit ? 'Boss besiegt!' : 'Geschafft!'}
            </span>
          </div>
        )}
      </div>

      {shopOpen && (
        <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onClose={() => setShopOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsModal
          soundOn={game.save.soundOn}
          bestLevel={game.save.bestLevel}
          difficulty={game.save.difficulty}
          onToggleSound={game.setSoundOn}
          onSetDifficulty={game.setDifficulty}
          onResetProgress={() => {
            game.resetProgress();
            setScreen('start');
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!overlayOpen && modalVisible && game.phase === 'levelComplete' && game.reward && (
        <LevelCompleteModal
          level={game.levelIndex + 1}
          applesCollected={game.applesCollectedThisRun}
          appleCount={game.appleCount}
          reward={game.reward}
          totalCoins={game.save.coins}
          totalGems={game.save.gems}
          streak={game.streak}
          isCampaignComplete={game.isCampaignComplete}
          onNext={game.nextLevel}
          onOpenShop={() => setShopOpen(true)}
        />
      )}

      {!overlayOpen && modalVisible && game.phase === 'gameOver' && (
        <GameOverModal
          level={game.levelIndex + 1}
          restartLevel={game.blockStart + 1}
          bestLevel={game.save.bestLevel}
          coinsLost={game.applesCollectedThisRun}
          totalCoins={game.save.coins}
          axeSkin={game.save.equippedAxeSkin}
          onRestart={game.restartRun}
          onOpenShop={() => setShopOpen(true)}
          onBackToMenu={() => setScreen('start')}
        />
      )}
    </div>
  );
}

export default App;
