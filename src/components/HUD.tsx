import { Coin } from './Coin';
import './HUD.css';

interface HUDProps {
  level: number;
  hits: number;
  axeCount: number;
  coins: number;
  /** Läuft kurz eine Aufblink-Animation, wenn gerade Münzen dazugekommen sind. */
  coinsFlash: boolean;
  onOpenShop: () => void;
}

export function HUD({ level, hits, axeCount, coins, coinsFlash, onOpenShop }: HUDProps) {
  return (
    <header className="hud">
      <div className="hud-pill hud-pill--level">
        <span className="hud-pill__label">Level</span>
        <span className="hud-pill__value">{level}</span>
      </div>
      <div className="hud-pill hud-pill--hits">
        <span className="hud-pill__label">Äxte</span>
        <span className="hud-pill__value">
          {hits}/{axeCount}
        </span>
      </div>
      <button
        className={`hud-pill hud-pill--currency ${coinsFlash ? 'hud-pill--flash' : ''}`}
        onClick={onOpenShop}
        aria-label="Werkstatt öffnen"
      >
        <span className="hud-pill__label">Werkstatt</span>
        <span className="hud-pill__value hud-pill__value--currency">
          <Coin size={17} />
          {coins}
        </span>
      </button>
    </header>
  );
}
