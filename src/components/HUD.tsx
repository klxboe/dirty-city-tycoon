import { Coins, TrendingUp, Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/format';
import './HUD.css';

interface HUDProps {
  money: number;
  effectiveRate: number;
  cityName: string;
  cityTier: string;
  cityNumber: number;
  totalStars: number;
  prestigeMultiplier: number;
}

export function HUD({
  money,
  effectiveRate,
  cityName,
  cityTier,
  cityNumber,
  totalStars,
  prestigeMultiplier,
}: HUDProps) {
  return (
    <header className="hud">
      <div className="hud__pills">
        <div className="hud-pill hud-pill--money">
          <span className="hud-pill__badge">
            <Coins size={18} />
          </span>
          <span className="hud-pill__value">{formatNumber(money)}</span>
        </div>

        <div className="hud-pill hud-pill--rate">
          <span className="hud-pill__badge">
            <TrendingUp size={16} />
          </span>
          <span className="hud-pill__value">{formatNumber(effectiveRate)}/s</span>
        </div>

        {totalStars > 0 && (
          <div className="hud-pill hud-pill--stars">
            <span className="hud-pill__badge">
              <Sparkles size={16} />
            </span>
            <span className="hud-pill__value">
              {totalStars} · ×{prestigeMultiplier.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="hud__city-label">
        Stadt {cityNumber} · {cityTier} {cityName}
      </div>
    </header>
  );
}
