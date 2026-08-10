import { useEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { HUD } from './components/HUD';
import { PowerDial } from './components/PowerDial';
import { TargetBoard } from './components/TargetBoard';
import { GameOverModal } from './components/GameOverModal';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS } from './game/constants';
import './App.css';

const PARTICLE_ANGLES = [-70, -40, -15, 10, 35, 60, 90, -95];

function App() {
  const game = useAxeGame();
  const stageRef = useRef<HTMLDivElement>(null);
  const prevScoreRef = useRef(game.score);
  const [burstId, setBurstId] = useState(0);

  // Juice: kurzer Screen-Shake + Holzspäne-Partikel bei jedem sauberen Treffer.
  useEffect(() => {
    if (game.score > prevScoreRef.current) {
      const el = stageRef.current;
      if (el) {
        el.classList.remove('stage--shake');
        void el.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
        el.classList.add('stage--shake');
      }
      setBurstId((id) => id + 1);
    }
    prevScoreRef.current = game.score;
  }, [game.score]);

  const hint =
    game.phase === 'charging'
      ? 'Loslassen, wenn der Punkt oben grün ist!'
      : game.phase === 'flying'
        ? ''
        : game.phase === 'gameover'
          ? ''
          : 'Halten zum Laden, loslassen zum Werfen';

  return (
    <div className="app">
      <HUD score={game.score} highScore={game.highScore} />

      <div
        ref={stageRef}
        className="stage"
        onPointerDown={game.startCharge}
        onPointerUp={game.release}
        onPointerLeave={game.release}
        onPointerCancel={game.release}
      >
        <div className="stage__board-zone">
          <TargetBoard angleDeg={game.boardAngleDeg} stuckAxes={game.stuckAxes} />

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
          <PowerDial
            chargeStartedAt={game.chargeStartedAt}
            spinPeriodMs={game.spinPeriodMs}
            tolerance={game.sweetSpotTolerance}
            active={game.phase === 'charging'}
          />
          <div className="stage__hint">{hint}</div>
        </div>
      </div>

      {game.phase === 'gameover' && (
        <GameOverModal score={game.score} highScore={game.highScore} outcome={game.lastOutcome} onRetry={game.reset} />
      )}
    </div>
  );
}

export default App;
