import type { ThrowOutcome } from '../game/types';
import './GameOverModal.css';

interface GameOverModalProps {
  score: number;
  highScore: number;
  outcome: ThrowOutcome | null;
  onRetry: () => void;
}

const OUTCOME_TEXT: Record<ThrowOutcome, string> = {
  bounced: 'Die Axt ist abgeprallt – falscher Moment.',
  collided: 'Da steckte schon eine Axt!',
  stuck: 'Treffer!',
};

export function GameOverModal({ score, highScore, outcome, onRetry }: GameOverModalProps) {
  const isNewHighScore = score > 0 && score >= highScore;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">Game Over</div>
        <div className="modal-card__body">{outcome ? OUTCOME_TEXT[outcome] : ''}</div>
        <div className="modal-card__score">{score}</div>
        {isNewHighScore ? (
          <div className="modal-card__badge">Neuer Bestwert!</div>
        ) : (
          <div className="modal-card__sub">Bestwert: {highScore}</div>
        )}
        <button className="modal-card__button" onClick={onRetry}>
          Nochmal
        </button>
      </div>
    </div>
  );
}
