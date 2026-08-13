import { useCallback, useEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { AxeInventory } from './components/AxeInventory';
import { HUD } from './components/HUD';
import { BOARD_RADIUS, TargetBoard, type TargetBoardHandle } from './components/TargetBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { Shop } from './components/Shop';
import { StartScreen } from './components/StartScreen';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS } from './game/constants';
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
  const [burstId, setBurstId] = useState(0);
  const [coinsFlash, setCoinsFlash] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');

  // Juice: Screen-Shake + Holzspäne-Partikel + Schockwelle + kurzer Rums bei jedem Treffer.
  useEffect(() => {
    if (game.hits > prevHitsRef.current) {
      const el = stageRef.current;
      if (el) {
        el.classList.remove('stage--shake');
        void el.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
        el.classList.add('stage--shake');
      }
      setBurstId((id) => id + 1);
      vibrate(18);
    }
    prevHitsRef.current = game.hits;
  }, [game.hits]);

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
      }
    }
    prevOutcomeRef.current = game.lastOutcome;
  }, [game.lastOutcome, game.phase, game.bossFruit]);

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

  const hint = game.phase === 'ready' ? 'Links, Mitte oder rechts tippen – dahin fliegt die Axt' : '';

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    unlockAudio(); // muss innerhalb der Nutzer-Interaktion passieren, sonst blockt der Browser Audio

    // Zielen: horizontaler Abstand der Tippposition zur Scheibenmitte, normiert auf den
    // Scheibenradius. -1 = linker Rand, 0 = Mitte, +1 = rechter Rand (Werte darüber hinaus
    // schneidet die Engine ab, damit auch ein Tap weit neben der Scheibe noch funktioniert).
    const centerX = boardHandleRef.current?.getCenterX() ?? event.clientX;
    game.throwAxe((event.clientX - centerX) / BOARD_RADIUS);
  };

  const startPlaying = () => {
    unlockAudio();
    game.markTutorialSeen();
    setScreen('game');
  };

  // Flugziel der Axt in Pixeln, relativ zum Einschlag eines Mittel-Wurfs (unten an der Scheibe).
  // Weltwinkel: 0° = oben, im Uhrzeigersinn -> Punkt auf dem Kreis ist (R·sin a) nach rechts
  // und (R·cos a) nach oben, gemessen von der Scheibenmitte.
  const flightAngleRad = ((game.flyingAxe?.impactWorldAngleDeg ?? 180) * Math.PI) / 180;
  const flightDx = BOARD_RADIUS * Math.sin(flightAngleRad);
  const flightDy = BOARD_RADIUS * (Math.cos(flightAngleRad) + 1);

  const overlayOpen = shopOpen || settingsOpen;

  if (screen === 'start') {
    return (
      <div className="app">
        <StartScreen
          continueLevel={game.levelIndex + 1}
          bestLevel={game.save.bestLevel}
          coins={game.save.coins}
          axeSkin={game.save.equippedAxeSkin}
          showTutorial={!game.save.tutorialSeen}
          onPlay={startPlaying}
          onRestartFromOne={() => {
            game.goToLevel(0);
            startPlaying();
          }}
          onOpenShop={() => setShopOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {shopOpen && (
          <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onClose={() => setShopOpen(false)} />
        )}
        {settingsOpen && (
          <SettingsModal
            soundOn={game.save.soundOn}
            bestLevel={game.save.bestLevel}
            onToggleSound={game.setSoundOn}
            onResetProgress={game.resetProgress}
            onClose={() => setSettingsOpen(false)}
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
        streak={game.streak}
        isBoss={!!game.bossFruit}
        onOpenShop={() => setShopOpen(true)}
      />

      <div ref={stageRef} className={`stage ${game.bossFruit ? 'stage--boss' : ''}`} onPointerDown={handlePointerDown}>
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

          {burstId > 0 && (
            <div key={burstId} className="hit-effect">
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
        </div>

        {game.phase === 'flying' && game.flyingAxe && (
          <div
            key={game.flyingAxe.startedAt}
            className="axe-flying"
            style={{
              animationDuration: `${FLIGHT_DURATION_MS}ms`,
              ['--flight-dx' as string]: `${flightDx}px`,
              ['--flight-dy' as string]: `${flightDy}px`,
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
      </div>

      {shopOpen && (
        <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onClose={() => setShopOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsModal
          soundOn={game.save.soundOn}
          bestLevel={game.save.bestLevel}
          onToggleSound={game.setSoundOn}
          onResetProgress={() => {
            game.resetProgress();
            setScreen('start');
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!overlayOpen && game.phase === 'levelComplete' && game.reward && (
        <LevelCompleteModal
          level={game.levelIndex + 1}
          applesCollected={game.applesCollectedThisRun}
          appleCount={game.appleCount}
          reward={game.reward}
          totalCoins={game.save.coins}
          streak={game.streak}
          isLastLevel={game.isLastLevel}
          onNext={game.nextLevel}
          onOpenShop={() => setShopOpen(true)}
        />
      )}

      {!overlayOpen && game.phase === 'gameOver' && (
        <GameOverModal
          level={game.levelIndex + 1}
          restartLevel={game.blockStart + 1}
          bestLevel={game.save.bestLevel}
          coinsLost={game.applesCollectedThisRun}
          totalCoins={game.save.coins}
          onRestart={game.restartRun}
          onOpenShop={() => setShopOpen(true)}
        />
      )}
    </div>
  );
}

export default App;
