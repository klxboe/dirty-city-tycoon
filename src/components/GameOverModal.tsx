import { Coin } from './Coin';
import './LevelCompleteModal.css';

interface GameOverModalProps {
  level: number;
  /** Höchstes je erreichtes Level – bleibt als Bestmarke stehen. */
  bestLevel: number;
  /** Münzen, die dieser Lauf gekostet hat (gesammelte Äpfel des laufenden Levels). */
  coinsLost: number;
  totalCoins: number;
  onRestart: () => void;
  onOpenShop: () => void;
}

/**
 * Erscheint, wenn eine Axt eine bereits steckende Axt trifft. Das beendet den ganzen
 * Lauf – weiter geht es wieder bei Level 1. Die Münzen aus früher abgeschlossenen
 * Leveln bleiben erhalten, nur das angefangene Level bringt nichts ein.
 */
export function GameOverModal({
  level,
  bestLevel,
  coinsLost,
  totalCoins,
  onRestart,
  onOpenShop,
}: GameOverModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title modal-card__title--fail">Axt zersplittert!</div>
        <div className="modal-card__body">
          Du hast deine eigene Axt getroffen – in Level {level}. Der Lauf startet wieder bei Level 1.
        </div>

        <div className="modal-card__record">
          Bestmarke: <strong>Level {bestLevel}</strong>
        </div>

        {coinsLost > 0 && (
          <div className="modal-card__sub modal-card__sub--warn">
            {coinsLost} {coinsLost === 1 ? 'Apfel' : 'Äpfel'} aus diesem Level verloren.
          </div>
        )}
        <div className="modal-card__sub">
          <Coin size={15} /> Münzen insgesamt: <strong>{totalCoins}</strong>
        </div>

        <button className="modal-card__button" onClick={onRestart}>
          Neuer Versuch
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onOpenShop}>
          Werkstatt öffnen
        </button>
      </div>
    </div>
  );
}
