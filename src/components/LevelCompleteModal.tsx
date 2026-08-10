import { Apple } from './Apple';
import './LevelCompleteModal.css';

interface LevelCompleteModalProps {
  level: number;
  levelName: string;
  nextLevelName: string | null;
  hits: number;
  axeCount: number;
  applesCollected: number;
  totalCurrency: number;
  isLastLevel: boolean;
  onRetry: () => void;
  onNext: () => void;
}

export function LevelCompleteModal({
  level,
  levelName,
  nextLevelName,
  hits,
  axeCount,
  applesCollected,
  totalCurrency,
  isLastLevel,
  onRetry,
  onNext,
}: LevelCompleteModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">
          Level {level} "{levelName}" geschafft!
        </div>
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

        {isLastLevel ? (
          <>
            <div className="modal-card__badge">Alle Level gemeistert! 🎉</div>
            <button className="modal-card__button" onClick={onRetry}>
              Nochmal spielen
            </button>
          </>
        ) : (
          <>
            <button className="modal-card__button" onClick={onNext}>
              Weiter zu "{nextLevelName}"
            </button>
            <button className="modal-card__button modal-card__button--secondary" onClick={onRetry}>
              Level nochmal spielen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
