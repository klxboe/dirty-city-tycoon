import './LevelCompleteModal.css';

interface GameOverModalProps {
  level: number;
  hits: number;
  /** Äpfel, die in diesem Durchlauf gesammelt WAREN – gehen durch das Game Over verloren. */
  applesLost: number;
  totalCurrency: number;
  onRetry: () => void;
}

/** Erscheint, wenn eine Axt eine bereits steckende Axt trifft – das beendet den Durchlauf sofort. */
export function GameOverModal({ level, hits, applesLost, totalCurrency, onRetry }: GameOverModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title modal-card__title--fail">Axt zersplittert!</div>
        <div className="modal-card__body">
          Du hast deine eigene Axt getroffen. Level {level} endet nach {hits}{' '}
          {hits === 1 ? 'Treffer' : 'Treffern'}.
        </div>

        {applesLost > 0 && (
          <div className="modal-card__sub modal-card__sub--warn">
            {applesLost} {applesLost === 1 ? 'Apfel' : 'Äpfel'} aus diesem Versuch verloren.
          </div>
        )}
        <div className="modal-card__sub">
          Äpfel insgesamt: <strong>{totalCurrency}</strong>
        </div>

        <button className="modal-card__button" onClick={onRetry}>
          Nochmal versuchen
        </button>
      </div>
    </div>
  );
}
