import { Axe } from './components/Axe';
import { HUD } from './components/HUD';
import { PowerDial } from './components/PowerDial';
import { TargetBoard } from './components/TargetBoard';
import { GameOverModal } from './components/GameOverModal';
import { useAxeGame } from './hooks/useAxeGame';
import { FLIGHT_DURATION_MS } from './game/constants';
import './App.css';

function App() {
  const game = useAxeGame();

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
        className="stage"
        onPointerDown={game.startCharge}
        onPointerUp={game.release}
        onPointerLeave={game.release}
        onPointerCancel={game.release}
      >
        <div className="stage__board-zone">
          <TargetBoard angleDeg={game.boardAngleDeg} stuckAxes={game.stuckAxes} />
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
