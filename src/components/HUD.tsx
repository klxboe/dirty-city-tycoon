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
      <div className="hud__row">
        <div className="hud__money">
          <Coins size={26} className="hud__icon hud__icon--money" />
          <span className="hud__money-value">{formatNumber(money)}</span>
        </div>
        <div className="hud__rate">
          <TrendingUp size={18} className="hud__icon" />
          <span>{formatNumber(effectiveRate)}/s</span>
        </div>
      </div>
      <div className="hud__row hud__row--sub">
        <span className="hud__city">
          Stadt {cityNumber} · {cityTier} {cityName}
        </span>
        {totalStars > 0 && (
          <span className="hud__prestige">
            <Sparkles size={14} className="hud__icon hud__icon--star" />
            {totalStars} · ×{prestigeMultiplier.toFixed(1)}
          </span>
        )}
      </div>
    </header>
  );
}
