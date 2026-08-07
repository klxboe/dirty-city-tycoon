import { formatPercent } from '../utils/format';
import './CleanlinessBar.css';

interface CleanlinessBarProps {
  progress: number;
  cityTier: string;
  cityName: string;
  canMoveToNextCity: boolean;
  projectedStars: number;
  onRequestMove: () => void;
}

export function CleanlinessBar({
  progress,
  cityTier,
  cityName,
  canMoveToNextCity,
  projectedStars,
  onRequestMove,
}: CleanlinessBarProps) {
  return (
    <div className="cleanliness">
      <div className="cleanliness__label">
        <span>
          Sauberkeit von {cityTier} {cityName}
        </span>
        <span className="cleanliness__percent">{formatPercent(progress)}</span>
      </div>
      <div className="cleanliness__track">
        <div className="cleanliness__fill" style={{ width: `${progress * 100}%` }} />
      </div>
      {canMoveToNextCity && (
        <button className="cleanliness__move-button" onClick={onRequestMove}>
          🚚 Umziehen in die nächste Stadt (+{projectedStars} ⭐)
        </button>
      )}
    </div>
  );
}
