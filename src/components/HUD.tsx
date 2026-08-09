import './HUD.css';

interface HUDProps {
  score: number;
  highScore: number;
}

export function HUD({ score, highScore }: HUDProps) {
  return (
    <header className="hud">
      <div className="hud-pill hud-pill--score">
        <span className="hud-pill__label">Score</span>
        <span className="hud-pill__value">{score}</span>
      </div>
      <div className="hud-pill hud-pill--best">
        <span className="hud-pill__label">Bestwert</span>
        <span className="hud-pill__value">{highScore}</span>
      </div>
    </header>
  );
}
