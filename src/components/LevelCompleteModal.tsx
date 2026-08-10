import { Apple } from './Apple';
import './LevelCompleteModal.css';

interface LevelCompleteModalProps {
  level: number;
  hits: number;
  axeCount: number;
  applesCollected: number;
  totalCurrency: number;
  onRetry: () => void;
}

export function LevelCompleteModal({ level, hits, axeCount, applesCollected, totalCurrency, onRetry }: LevelCompleteModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">Level {level} geschafft!</div>
        <div className="modal-card__body">
          {hits} von {axeCount} Äxten haben sauber getroffen.
        </div>

        <div className="modal-card__apples">
          <Apple size={30} />
          <span className="modal-card__score">+{applesCollected}</span>
        </div>
        <div className="modal-card__sub">
          Äpfel insgesamt: <strong>{totalCurrency}</strong>
        </div>

        <button className="modal-card__button" onClick={onRetry}>
          Nochmal spielen
        </button>
      </div>
    </div>
  );
}
