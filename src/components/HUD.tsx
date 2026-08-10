import { Apple } from './Apple';
import './HUD.css';

interface HUDProps {
  level: number;
  hits: number;
  axeCount: number;
  totalCurrency: number;
}

export function HUD({ level, hits, axeCount, totalCurrency }: HUDProps) {
  return (
    <header className="hud">
      <div className="hud-pill hud-pill--level">
        <span className="hud-pill__label">Level</span>
        <span className="hud-pill__value">{level}</span>
      </div>
      <div className="hud-pill hud-pill--hits">
        <span className="hud-pill__label">Treffer</span>
        <span className="hud-pill__value">
          {hits}/{axeCount}
        </span>
      </div>
      <div className="hud-pill hud-pill--currency">
        <span className="hud-pill__label">Äpfel</span>
        <span className="hud-pill__value hud-pill__value--currency">
          <Apple size={18} />
          {totalCurrency}
        </span>
      </div>
    </header>
  );
}
