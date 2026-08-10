import { useEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { AxeInventory } from './components/AxeInventory';
import { HUD } from './components/HUD';
import { TargetBoard } from './components/TargetBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS, LEVELS } from './game/constants';
import { playAppleSound, playBreakSound, playHitSound, playMissSound, unlockAudio } from './game/sound';
import type { ThrowOutcome } from './game/types';
import './App.css';

const PARTICLE_ANGLES = [-70, -40, -15, 10, 35, 60, 90, -95];

function App() {
  const game = useAxeGame();
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
        <div className="stage__board-zone">
          <TargetBoard
            angleDeg={game.boardAngleDeg}
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
          levelName={game.levelName}
          nextLevelName={game.isLastLevel ? null : LEVELS[game.levelIndex + 1].name}
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
