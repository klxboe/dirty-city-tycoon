import { useCallback, useEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { AxeInventory } from './components/AxeInventory';
import { HUD } from './components/HUD';
import { TargetBoard, type TargetBoardHandle } from './components/TargetBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { VineDecoration } from './components/VineDecoration';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS } from './game/constants';
import { playAppleSound, playBreakSound, playHitSound, playMissSound, unlockAudio } from './game/sound';
import type { ThrowOutcome } from './game/types';
import './App.css';

const PARTICLE_ANGLES = [-70, -40, -15, 10, 35, 60, 90, -95];

// Rein dekorativer Staub, der langsam nach oben treibt – für Atmosphäre.
const DUST_MOTES = [
  { left: '12%', delay: '0s', duration: '9s' },
  { left: '28%', delay: '2.5s', duration: '11s' },
  { left: '48%', delay: '1s', duration: '8s' },
  { left: '66%', delay: '4s', duration: '12s' },
  { left: '82%', delay: '1.8s', duration: '10s' },
  { left: '92%', delay: '3.4s', duration: '9.5s' },
];

function App() {
  const boardHandleRef = useRef<TargetBoardHandle>(null);
  const getBoardAngleDeg = useCallback(() => boardHandleRef.current?.getAngleDeg() ?? 0, []);
  const game = useAxeGame(getBoardAngleDeg);

  const stageRef = useRef<HTMLDivElement>(null);
  const prevHitsRef = useRef(game.hits);
  const prevOutcomeRef = useRef<ThrowOutcome | null>(null);
  const prevApplesRef = useRef(game.applesCollectedThisRun);
  const [burstId, setBurstId] = useState(0);

  // Juice: kurzer Screen-Shake + Holzspäne-Partikel bei jedem sauberen Treffer.
  useEffect(() => {
    if (game.hits > prevHitsRef.current) {
      const el = stageRef.current;
      if (el) {
        el.classList.remove('stage--shake');
        void el.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
        el.classList.add('stage--shake');
      }
      setBurstId((id) => id + 1);
    }
    prevHitsRef.current = game.hits;
  }, [game.hits]);

  // Soundeffekte je nach Ausgang des Wurfs.
  useEffect(() => {
    if (game.lastOutcome && game.lastOutcome !== prevOutcomeRef.current) {
      if (game.phase === 'levelComplete' && game.lastOutcome === 'stuck') {
        playBreakSound();
      } else if (game.lastOutcome === 'stuck') {
        playHitSound();
      } else {
        playMissSound();
      }
    }
    prevOutcomeRef.current = game.lastOutcome;
  }, [game.lastOutcome, game.phase]);

  useEffect(() => {
    if (game.applesCollectedThisRun > prevApplesRef.current) {
      playAppleSound();
    }
    prevApplesRef.current = game.applesCollectedThisRun;
  }, [game.applesCollectedThisRun]);

  const hint =
    game.phase === 'flying'
      ? ''
      : game.phase === 'levelComplete'
        ? ''
        : 'Tippen zum Werfen';

  const handlePointerDown = () => {
    unlockAudio(); // muss innerhalb der Nutzer-Interaktion passieren, sonst blockt der Browser Audio
    game.throwAxe();
  };

  return (
    <div className="app">
      <HUD level={game.levelIndex + 1} hits={game.hits} axeCount={game.axeCount} totalCurrency={game.totalCurrency} />

      <div ref={stageRef} className="stage" onPointerDown={handlePointerDown}>
        <VineDecoration className="stage__vine stage__vine--left" />
        <VineDecoration flip className="stage__vine stage__vine--right" />

        <div className="stage__dust">
          {DUST_MOTES.map((mote, i) => (
            <span key={i} style={{ left: mote.left, animationDelay: mote.delay, animationDuration: mote.duration }} />
          ))}
        </div>

        <div className="stage__board-zone">
          <TargetBoard
            ref={boardHandleRef}
            speedDegPerSec={game.boardSpeedDegPerSec}
            paused={game.phase === 'levelComplete'}
            stuckAxes={game.stuckAxes}
            apples={game.apples}
            broken={game.phase === 'levelComplete' && game.lastOutcome === 'stuck'}
          />

          {burstId > 0 && (
            <div key={burstId} className="hit-particles">
              {PARTICLE_ANGLES.map((angle, i) => (
                <span
                  key={i}
                  className={`hit-particles__chip hit-particles__chip--${i % 3}`}
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
            style={{ animationDuration: `${FLIGHT_DURATION_MS}ms` }}
          >
            <Axe size={34} />
          </div>
        )}

        <div className="stage__thrower-zone">
          <AxeInventory total={game.axeCount} thrown={game.axesThrown} />
          <div className="stage__hint">{hint}</div>
        </div>
      </div>

      {game.phase === 'levelComplete' && (
        <LevelCompleteModal
          level={game.levelIndex + 1}
          hits={game.hits}
          axeCount={game.axeCount}
          applesCollected={game.applesCollectedThisRun}
          totalCurrency={game.totalCurrency}
          isLastLevel={game.isLastLevel}
          onRetry={game.retryLevel}
          onNext={game.nextLevel}
        />
      )}
    </div>
  );
}

export default App;
