import { Coin } from './Coin';
import { useCountUp } from '../hooks/useCountUp';
import './LevelCompleteModal.css';

interface LevelCompleteModalProps {
  level: number;
  applesCollected: number;
  appleCount: number;
  coinsEarned: number;
  totalCoins: number;
  isLastLevel: boolean;
  onNext: () => void;
  onOpenShop: () => void;
}

export function LevelCompleteModal({
  level,
  applesCollected,
  appleCount,
  coinsEarned,
  totalCoins,
  isLastLevel,
  onNext,
  onOpenShop,
}: LevelCompleteModalProps) {
  // Zählt die verdienten Münzen hoch, statt sie fertig hinzuklatschen – fühlt sich
  // nach Belohnung an statt nach Zahl auf einem Zettel.
  const shownCoins = useCountUp(coinsEarned, 700);

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">Level {level} geschafft!</div>
        <div className="modal-card__body">
          {applesCollected} von {appleCount} {appleCount === 1 ? 'Apfel' : 'Äpfeln'} eingesammelt.
        </div>

        <div className="modal-card__apples">
          <Coin size={34} className="modal-card__coin-spin" />
          <span className="modal-card__score">+{shownCoins}</span>
        </div>
        <div className="modal-card__sub">
          Münzen insgesamt: <strong>{totalCoins}</strong>
        </div>

        {isLastLevel ? (
          <div className="modal-card__badge">Alle Level gemeistert! 🎉</div>
        ) : (
          <button className="modal-card__button" onClick={onNext}>
            Weiter zu Level {level + 1}
          </button>
        )}
        <button className="modal-card__button modal-card__button--secondary" onClick={onOpenShop}>
          Werkstatt öffnen
        </button>
      </div>
    </div>
  );
}
