import { Coin } from './Coin';
import './LevelCompleteModal.css';

interface GameOverModalProps {
  level: number;
  /** Level, bei dem der neue Versuch startet: der Anfang des aktuellen 10er-Blocks. */
  restartLevel: number;
  /** Höchstes je erreichtes Level – bleibt als Bestmarke stehen. */
  bestLevel: number;
  /** Münzen, die dieser Lauf gekostet hat (gesammelte Äpfel des laufenden Levels). */
  coinsLost: number;
  totalCoins: number;
  onRestart: () => void;
  onOpenShop: () => void;
}

/**
 * Erscheint, wenn eine Axt eine bereits steckende Axt trifft. Das beendet den Lauf –
 * weiter geht es am Anfang des aktuellen 10er-Blocks. Die Münzen aus früher
 * abgeschlossenen Leveln bleiben erhalten, nur das angefangene Level bringt nichts ein.
 */
export function GameOverModal({
  level,
  restartLevel,
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
          Du hast deine eigene Axt getroffen – in Level {level}.
          {restartLevel === level
            ? ' Noch einmal von vorn.'
            : ` Weiter geht es bei Level ${restartLevel}.`}
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
          {restartLevel === level ? 'Neuer Versuch' : `Zurück zu Level ${restartLevel}`}
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onOpenShop}>
          Werkstatt öffnen
        </button>
      </div>
    </div>
  );
}
