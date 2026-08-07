import { PartyPopper } from 'lucide-react';
import { formatNumber } from '../utils/format';
import './Modal.css';

interface OfflineModalProps {
  earned: number;
  elapsedMs: number;
  onClaim: () => void;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} Min.`;
  return `${hours} Std. ${minutes} Min.`;
}

export function OfflineModal({ earned, elapsedMs, onClaim }: OfflineModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <PartyPopper size={36} className="modal-card__icon" />
        <div className="modal-card__title">Willkommen zurück!</div>
        <div className="modal-card__body">
          Deine Teams haben während deiner Abwesenheit ({formatDuration(elapsedMs)}) fleißig weitergemacht.
        </div>
        <div className="modal-card__highlight">+{formatNumber(earned)} Geld</div>
        <button className="modal-card__button" onClick={onClaim}>
          Abholen
        </button>
      </div>
    </div>
  );
}
