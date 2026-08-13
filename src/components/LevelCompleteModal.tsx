import { Axe } from './Axe';
import { Coin } from './Coin';
import { useCountUp } from '../hooks/useCountUp';
import { getBossFruit, getSkin } from '../game/shop';
import type { LevelReward } from '../game/types';
import './LevelCompleteModal.css';

interface LevelCompleteModalProps {
  level: number;
  applesCollected: number;
  appleCount: number;
  reward: LevelReward;
  totalCoins: number;
  streak: number;
  isLastLevel: boolean;
  onNext: () => void;
  onOpenShop: () => void;
}

export function LevelCompleteModal({
  level,
  applesCollected,
  appleCount,
  reward,
  totalCoins,
  streak,
  isLastLevel,
  onNext,
  onOpenShop,
}: LevelCompleteModalProps) {
  // Zählt die verdienten Münzen hoch, statt sie fertig hinzuklatschen – fühlt sich
  // nach Belohnung an statt nach Zahl auf einem Zettel.
  const shownCoins = useCountUp(reward.total, 700);

  const boss = reward.bossFruitId ? getBossFruit(reward.bossFruitId) : undefined;
  const unlockedAxe = reward.unlockedAxeSkinId ? getSkin(reward.unlockedAxeSkinId) : undefined;

  return (
    <div className="modal-backdrop">
      <div className={`modal-card ${boss ? 'modal-card--boss' : ''}`}>
        {boss ? (
          <>
            <div className="modal-card__kicker">Boss besiegt</div>
            <div className="modal-card__title">{boss.name} geknackt!</div>
          </>
        ) : (
          <div className="modal-card__title">Level {level} geschafft!</div>
        )}

        <div className="modal-card__body">
          {applesCollected} von {appleCount} {appleCount === 1 ? 'Apfel' : 'Äpfeln'} eingesammelt.
        </div>

        {/* Frisch freigeschaltete Boss-Axt – der eigentliche Moment des Levels. */}
        {unlockedAxe && (
          <div className="modal-card__unlock">
            <div className="modal-card__unlock-axe">
              <Axe size={44} skin={unlockedAxe.id} />
            </div>
            <div className="modal-card__unlock-text">
              <span className="modal-card__unlock-label">Neue Axt</span>
              <span className="modal-card__unlock-name">{unlockedAxe.name}</span>
            </div>
          </div>
        )}

        <div className="modal-card__apples">
          <Coin size={34} className="modal-card__coin-spin" />
          <span className="modal-card__score">+{shownCoins}</span>
        </div>

        {/* Aufschlüsselung: zeigt, WOFÜR es Münzen gab – macht die Boni sichtbar. */}
        <div className="reward-breakdown">
          {reward.apples > 0 && (
            <span className="reward-breakdown__row">
              Äpfel <strong>+{reward.apples}</strong>
            </span>
          )}
          <span className="reward-breakdown__row">
            Level geschafft <strong>+{reward.base}</strong>
          </span>
          {reward.perfect > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Alle Äpfel! <strong>+{reward.perfect}</strong>
            </span>
          )}
          {reward.block > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Block geschafft <strong>+{reward.block}</strong>
            </span>
          )}
          {reward.streakMultiplier > 1 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Serie ×{streak} <strong>×{reward.streakMultiplier.toFixed(2)}</strong>
            </span>
          )}
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
